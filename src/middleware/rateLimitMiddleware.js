// Client-side rate limiting middleware
class RateLimitMiddleware {
  constructor() {
    this.requestCounts = new Map(); // url -> { count, resetTime }
    this.limits = {
      // Định nghĩa giới hạn cho từng endpoint
      default: { maxRequests: 100, windowMs: 60000 }, // 100 requests/phút
      "/financial-reports": { maxRequests: 1000, windowMs: 60000 }, // 10 uploads/phút
      "/financial-reports/.*/status": {
        maxRequests: 30,
        windowMs: 60000,
      }, // 30 status updates/phút
      "/Auth/login": { maxRequests: 5, windowMs: 60000 }, // 5 login attempts/phút
    };
  }

  // Kiểm tra rate limit trước khi gửi request
  checkRateLimit(config) {
    const url = this.normalizeUrl(config.url);
    const limit = this.getLimit(url);

    if (!limit) return config; // Không có giới hạn cho endpoint này

    const now = Date.now();
    const record = this.requestCounts.get(url);

    // Reset nếu đã hết thời gian window
    if (!record || now > record.resetTime) {
      this.requestCounts.set(url, {
        count: 1,
        resetTime: now + limit.windowMs,
      });
      return config;
    }

    // Kiểm tra có vượt giới hạn không
    if (record.count >= limit.maxRequests) {
      const waitTime = Math.ceil((record.resetTime - now) / 1000);
      const error = new Error(
        `Quá nhiều yêu cầu. Vui lòng thử lại sau ${waitTime} giây.`,
      );
      error.code = "RATE_LIMIT_EXCEEDED";
      error.retryAfter = waitTime;
      throw error;
    }

    // Tăng counter
    record.count++;
    this.requestCounts.set(url, record);

    // Attach rate limit info vào config
    config.metadata = {
      ...config.metadata,
      rateLimit: {
        remaining: limit.maxRequests - record.count,
        limit: limit.maxRequests,
        resetTime: record.resetTime,
      },
    };

    return config;
  }

  // Normalize URL để match với patterns
  normalizeUrl(url) {
    if (!url) return "";
    // Bỏ baseURL nếu có
    return url.replace(/^https?:\/\/[^\/]+/, "");
  }

  // Lấy limit configuration cho URL
  getLimit(url) {
    // Tìm matching pattern
    for (const [pattern, limit] of Object.entries(this.limits)) {
      if (pattern === "default") continue;

      const regex = new RegExp(pattern);
      if (regex.test(url)) {
        return limit;
      }
    }

    // Fallback to default
    return this.limits.default;
  }

  // Reset rate limit cho một URL
  reset(url) {
    this.requestCounts.delete(url);
  }

  // Reset tất cả rate limits
  resetAll() {
    this.requestCounts.clear();
  }

  // Lấy thông tin rate limit hiện tại
  getStatus(url) {
    const normalizedUrl = this.normalizeUrl(url);
    const record = this.requestCounts.get(normalizedUrl);
    const limit = this.getLimit(normalizedUrl);

    if (!record || !limit) {
      return null;
    }

    const now = Date.now();
    if (now > record.resetTime) {
      return null; // Đã reset
    }

    return {
      count: record.count,
      limit: limit.maxRequests,
      remaining: limit.maxRequests - record.count,
      resetTime: record.resetTime,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  // Cleanup expired records
  cleanup() {
    const now = Date.now();
    for (const [url, record] of this.requestCounts.entries()) {
      if (now > record.resetTime) {
        this.requestCounts.delete(url);
      }
    }
  }
}

export default new RateLimitMiddleware();
