// Vercel Serverless Function - API Proxy to HTTP Backend
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
  
  // Extract path from URL (remove /api/proxy prefix)
  const path = req.url.replace('/api/proxy', '');
  const targetUrl = `${BACKEND_URL}${path}`;
  
  console.log(`[Proxy] ${req.method} ${targetUrl}`);
  
  try {
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Forward authorization header
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers,
    };
    
    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
    }
    
    // Forward request to backend
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get response data
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Forward response status and data
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('[Proxy Error]:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      target: targetUrl 
    });
  }
}
