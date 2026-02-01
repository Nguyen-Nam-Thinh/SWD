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

    const response = await api.post("/Chat/ask", payload);
    return response.data;
  },
};

export default chatService;
