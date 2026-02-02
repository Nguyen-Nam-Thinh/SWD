import formidable from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const BACKEND_URL = "http://51.210.176.94:5000/api";

  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const pathSegments = req.query.proxy || [];
  const path = "/" + pathSegments.join("/");
  const targetUrl = `${BACKEND_URL}${path}`;

  console.log(`[Proxy] ${req.method} ${targetUrl}`);
  console.log(`[Proxy] Content-Type: ${req.headers['content-type']}`);

  try {
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (isMultipart) {
      // Handle file upload
      await handleFileUpload(req, res, targetUrl);
    } else {
      // Handle JSON/regular requests
      await handleJsonRequest(req, res, targetUrl);
    }
  } catch (error) {
    console.error("[Proxy Error]:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Proxy Error", message: error.message });
    }
  }
}

async function handleFileUpload(req, res, targetUrl) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('[Formidable Error]:', err);
        reject(err);
        return;
      }

      console.log('[Proxy] Fields:', fields);
      console.log('[Proxy] Files:', Object.keys(files));

      try {
        const formData = new FormData();

        // Append fields
        Object.keys(fields).forEach((key) => {
          const value = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          formData.append(key, value);
          console.log(`[Proxy] Field ${key}:`, value);
        });

        // Append files
        Object.keys(files).forEach((key) => {
          const file = Array.isArray(files[key]) ? files[key][0] : files[key];
          console.log(`[Proxy] File ${key}:`, file.originalFilename, file.size, 'bytes');
          formData.append(key, fs.createReadStream(file.filepath), {
            filename: file.originalFilename || file.newFilename,
            contentType: file.mimetype,
          });
        });

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

        const responseContentType = response.headers.get('content-type');
        let data;

        if (responseContentType && responseContentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        console.log('[Proxy] Backend response:', response.status);
        res.status(response.status).json(data);
        resolve();
      } catch (error) {
        console.error('[Proxy] Forward error:', error);
        reject(error);
      }
    });
  });
}

async function handleJsonRequest(req, res, targetUrl) {
  const headers = {
    ...(req.headers.authorization && { Authorization: req.headers.authorization }),
  };

  const fetchOptions = {
    method: req.method,
    headers,
  };

  // Read body for non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    
    if (body.length > 0) {
      headers['Content-Type'] = req.headers['content-type'] || 'application/json';
      fetchOptions.body = body;
    }
  }

  const response = await fetch(targetUrl, fetchOptions);
  const responseContentType = response.headers.get('content-type');

  // Handle binary responses (PDF, images)
  const isBinary = responseContentType && (
    responseContentType.includes('application/pdf') ||
    responseContentType.includes('application/octet-stream') ||
    responseContentType.includes('image/')
  );

  if (isBinary) {
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', responseContentType);
    res.setHeader('Content-Disposition', response.headers.get('content-disposition') || 'inline');
    res.status(response.status).send(Buffer.from(buffer));
  } else {
    let data;
    if (responseContentType && responseContentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    res.status(response.status).json(data);
  }
}
