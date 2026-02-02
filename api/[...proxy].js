// Vercel Serverless Function - API Proxy to HTTP Backend
// Supports both JSON and multipart/form-data (file upload)
import formidable from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle multipart manually
  },
};

export default async function handler(req, res) {
  const BACKEND_URL = "http://51.210.176.94:5000/api";

  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Extract path from query params (Vercel catch-all route)
  const pathSegments = req.query.proxy || [];
  const path = "/" + pathSegments.join("/");
  const targetUrl = `${BACKEND_URL}${path}`;

  console.log(`[Proxy] ${req.method} ${targetUrl}`);
  console.log(`[Proxy] Content-Type: ${req.headers['content-type']}`);

  try {
    // Check if request is multipart/form-data (file upload)
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (isMultipart && (req.method === 'POST' || req.method === 'PUT')) {
      // Handle multipart form data
      await handleMultipartRequest(req, res, targetUrl);
    } else {
      // Handle JSON requests
      await handleJsonRequest(req, res, targetUrl);
    }
  } catch (error) {
    console.error("[Proxy Error]:", error);
    res.status(500).json({
      error: "Proxy error",
      message: error.message,
      target: targetUrl,
    });
  }
}

// Handle multipart/form-data requests
async function handleMultipartRequest(req, res, targetUrl) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Create FormData for backend
        const formData = new FormData();

        // Append fields
        Object.keys(fields).forEach((key) => {
          const value = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          formData.append(key, value);
        });

        // Append files
        Object.keys(files).forEach((key) => {
          const file = Array.isArray(files[key]) ? files[key][0] : files[key];
          formData.append(key, fs.createReadStream(file.filepath), {
            filename: file.originalFilename,
            contentType: file.mimetype,
          });
        });

        // Forward to backend
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            ...formData.getHeaders(),
            ...(req.headers.authorization && {
              Authorization: req.headers.authorization,
            }),
          },
          body: formData,
        });

        const data = await response.json();
        res.status(response.status).json(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Handle JSON requests
async function handleJsonRequest(req, res, targetUrl) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (req.headers.authorization) {
    headers["Authorization"] = req.headers.authorization;
  }

  const fetchOptions = {
    method: req.method,
    headers,
  };

  // Parse body for JSON requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    await new Promise((resolve) => {
      req.on('end', () => {
        if (body) {
          fetchOptions.body = body;
        }
        resolve();
      });
    });
  }

  const response = await fetch(targetUrl, fetchOptions);
  const responseContentType = response.headers.get("content-type");
  
  let data;
  if (responseContentType && responseContentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  res.status(response.status).json(data);
}
