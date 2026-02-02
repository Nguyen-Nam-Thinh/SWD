// File: api/[...proxy].js
import { Readable } from "stream";

// 1. QUAN TRỌNG: Tắt bodyParser để giữ nguyên định dạng file khi upload/download
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const BACKEND_URL = "http://51.210.176.94:5000/api";

  // --- 2. Xử lý CORS (Bắt buộc) ---
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

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // --- 3. Xây dựng URL đích ---
  // req.query.proxy lấy từ tên file [...proxy].js
  const pathSegments = req.query.proxy || [];
  const path = "/" + pathSegments.join("/");
  const targetUrl = `${BACKEND_URL}${path}`;

  console.log(`[Proxy] ${req.method} ${targetUrl}`);

  try {
    // --- 4. Chuẩn bị Headers ---
    const headers = { ...req.headers };
    // Xóa header host để tránh lỗi conflict
    delete headers.host;
    // Xóa content-length để backend tự tính toán lại (tránh lỗi mismatch khi upload)
    delete headers["content-length"];

    // --- 5. Chuẩn bị Fetch Options ---
    const fetchOptions = {
      method: req.method,
      headers: headers,
      // QUAN TRỌNG: Truyền trực tiếp luồng (stream) request, KHÔNG parse JSON
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
      // Tắt nén để giữ nguyên binary
      compress: false,
      // Tắt cache để luôn lấy dữ liệu mới nhất
      cache: "no-store",
    };

    // --- 6. Gọi Backend ---
    const backendResponse = await fetch(targetUrl, fetchOptions);

    // --- 7. Trả Response về Client ---
    res.status(backendResponse.status);

    // Copy headers quan trọng từ backend trả về
    backendResponse.headers.forEach((value, key) => {
      // Bỏ qua encoding và length để tránh lỗi decode 2 lần
      if (key === "content-encoding" || key === "content-length") return;
      res.setHeader(key, value);
    });

    // --- 8. Stream dữ liệu trả về (Fix lỗi PDF corrupt) ---
    if (backendResponse.body) {
      // @ts-ignore
      const reader = backendResponse.body.getReader();
      const stream = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null);
          } else {
            this.push(Buffer.from(value));
          }
        },
      });
      stream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("[Proxy Error]:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Proxy Error", message: error.message });
    }
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
