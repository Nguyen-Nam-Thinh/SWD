// Vercel Serverless Function - API Proxy to HTTP Backend

// QUAN TRỌNG: Tắt bodyParser để hỗ trợ FormData upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const BACKEND_URL = 'http://51.210.176.94:5000/api';
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Extract path from query string (from vercel rewrite)
  // vercel.json rewrites /api/financial-reports?Status=Draft -> /api/proxy?path=financial-reports&Status=Draft
  const pathParam = req.query.path || '';
  const pathArray = Array.isArray(pathParam) ? pathParam : [pathParam];
  const path = '/' + pathArray.join('/');

  // Forward tất cả query params (trừ "path") về backend
  const queryParams = { ...req.query };
  delete queryParams.path;
  const queryString = new URLSearchParams(queryParams).toString();
  const targetUrl = `${BACKEND_URL}${path}${queryString ? '?' + queryString : ''}`;

  console.log(`[Proxy] ${req.method} ${targetUrl}`);
  
  try {
    // Đọc body từ stream (vì đã tắt bodyParser)
    let bodyData = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      bodyData = Buffer.concat(chunks);
    }
    
    // Prepare headers
    const headers = {};
    
    // Forward authorization header
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    // Forward content-type nếu có
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }
    
    // Forward content-length nếu có
    if (bodyData && bodyData.length > 0) {
      headers['Content-Length'] = bodyData.length;
    }
    
    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers,
    };
    
    // Add body nếu có
    if (bodyData && bodyData.length > 0) {
      fetchOptions.body = bodyData;
    }
    
    // Forward request to backend
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get response data based on content type
    const contentType = response.headers.get('content-type');
    
    // Copy important headers from backend
    response.headers.forEach((value, key) => {
      if (key !== 'content-encoding' && key !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });
    
    // Handle binary/blob responses (PDF, Excel, images, etc.)
    if (contentType && (
      contentType.includes('application/pdf') ||
      contentType.includes('application/vnd.openxmlformats') ||
      contentType.includes('application/vnd.ms-excel') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('image/')
    )) {
      // Stream binary data without parsing
      const buffer = await response.arrayBuffer();
      res.status(response.status).send(Buffer.from(buffer));
    }
    // Handle JSON responses
    else if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    }
    // Handle text responses
    else {
      const data = await response.text();
      res.status(response.status).send(data);
    }
    
  } catch (error) {
    console.error('[Proxy Error]:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      target: targetUrl 
    });
  }
}
