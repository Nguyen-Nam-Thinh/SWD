import api from "./api";

const chatService = {
  // Gửi câu hỏi đến AI chatbot
  askQuestion: async (message, companyId = null) => {
    const payload = {
      message,
    };

    // Chỉ thêm companyId nếu có giá trị
    if (companyId) {
      payload.companyId = companyId;
    }

    // Chat AI cần thời gian phản hồi lâu hơn bình thường
    const response = await api.post("/Chat/messages", payload, {
      timeout: 120000, // 120 giây cho chat AI
    });
    return response.data;
  },
};

export default chatService;
