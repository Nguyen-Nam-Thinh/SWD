// Vercel Serverless Function - API Proxy
export default async function handler(req, res) {
  const BACKEND_URL = 'http://51.210.176.94:5000/api';
  
  // Forward path from request
  const path = req.url.replace('/api/proxy', '');
  const targetUrl = `${BACKEND_URL}${path}`;
  
  try {
    // Forward request to backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { 
          'Authorization': req.headers.authorization 
        }),
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' && {
        body: JSON.stringify(req.body)
      }),
    });
    
    const data = await response.json();
    
    // Forward response
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
