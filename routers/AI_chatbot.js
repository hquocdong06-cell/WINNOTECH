const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    // FE sẽ gửi lên 2 thứ: message (câu hỏi mới) và history (lịch sử chat)
    const { message, history } = req.body; 

    if (!message) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung chat!" });
    }

    // 1. Cấu hình nhân cách cho Bot
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Bạn là nhân viên tư vấn nhiệt tình và am hiểu của WINNOTech. 
      Cửa hàng chuyên bán thiết bị điện tử cụ thể là PC và laptop. 
      Nhiệm vụ:
      - Xưng hô "mình" và gọi khách là "bạn".
      - Tư vấn ngắn gọn, chốt sale khéo léo.
      - TUYỆT ĐỐI KHÔNG tư vấn các vấn đề nằm ngoài lĩnh vực thiết bị điện tử cụ thể là PC và laptop. Nếu khách hỏi ngoài lề, hãy từ chối khéo và lái về PC và laptop.`
    });

    // 2. Format lại lịch sử chat (Đảm bảo đúng chuẩn của Gemini nếu FE truyền thiếu)
    // Cấu trúc chuẩn: [{ role: "user" | "model", parts: [{ text: "..." }] }]
    const chatHistory = history && Array.isArray(history) ? history : [];

    // 3. Bắt đầu phiên chat và nạp trí nhớ (history)
    const chat = model.startChat({
      history: chatHistory,
    });

    // 4. Gửi câu hỏi mới nhất của khách vào luồng chat
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return res.status(200).json({ 
      success: true, 
      reply: responseText 
    });

  } catch (error) {
    console.error("Lỗi Gemini Chat:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Nhân viên tư vấn đang bận, vui lòng thử lại sau ít phút!" 
    });
  }
});

module.exports = router;