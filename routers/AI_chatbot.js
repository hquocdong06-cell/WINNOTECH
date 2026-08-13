const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const handleChat = async (req, res) => {
  try {
    // FE sẽ gửi lên 2 thứ: message (câu hỏi mới) và history (lịch sử chat)
    const { message, history } = req.body; 

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung chat!" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "AIzaSy_Google_Gemini_Key_Here") {
      // Trả về câu trả lời hỗ trợ mẫu khi chưa cấu hình API Key trong .env
      let mockReply = "Chào bạn! Mình là Trợ lý Virtual AI của WINNOTech. 🤖\n";
      const q = message.toLowerCase();

      if (q.includes("15 triệu") || q.includes("15tr") || q.includes("tư vấn pc")) {
        mockReply += "Với ngân sách tầm 15 triệu, WINNOTech gợi ý cấu hình PC Gaming / Đồ họa tối ưu như sau:\n\n" +
          "• CPU: Intel Core i5-12400F / AMD Ryzen 5 5600\n" +
          "• Mainboard: B660M / B550M\n" +
          "• RAM: 16GB (2x8GB) DDR4 3200MHz\n" +
          "• VGA: NVIDIA RTX 3060 12GB / GTX 1660 Super\n" +
          "• SSD: 512GB NVMe M.2 PCIe\n" +
          "• Nguồn (PSU): 600W 80 Plus Bronze\n" +
          "• Case: Vỏ kính cường lực kèm 3 quạt ARGB\n\n" +
          "💡 Bạn có thể dùng tính năng 'Build PC' trên thanh điều hướng để chọn chính xác từng linh kiện nhé!";
      } else if (q.includes("cpu") || q.includes("chip")) {
        mockReply += "Dòng CPU phổ biến hiện tại tại WINNOTech:\n- Intel Gen 12/13/14 (Core i3, i5, i7, i9)\n- AMD Ryzen 5000 / 7000 / 9000 Series.\nNếu cần chiến Game tốt giá êm thì i5-12400F hoặc Ryzen 5 7600X là sự lựa chọn tuyệt vời!";
      } else if (q.includes("gpu") || q.includes("vga") || q.includes("card")) {
        mockReply += "Các dòng Card màn hình HOT nhất tại cửa hàng:\n- NVIDIA RTX 3060, RTX 4060, RTX 4070 Super\n- AMD RX 6600, RX 7600 XT\nBạn cần chơi game gì hoặc làm đồ họa phần mềm nào để mình tư vấn card chuẩn nhất?";
      } else {
        mockReply += `Cảm ơn câu hỏi của bạn: "${message}".\n` +
          "WINNOTech chuyên cung cấp các linh kiện máy tính CPU, GPU, Mainboard, RAM, SSD, PSU và Laptop chính hãng.\n" +
          "(Lưu ý: Để bật trí tuệ nhân tạo Gemini AI phản hồi tự do mọi câu hỏi, bạn hãy thêm `GEMINI_API_KEY` vào file `.env` nhé!)";
      }

      return res.status(200).json({
        success: true,
        reply: mockReply,
        isMock: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. Cấu hình nhân cách cho Bot
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Bạn là nhân viên tư vấn nhiệt tình và am hiểu kĩ thuật của WINNOTech (hệ thống siêu thị công nghệ và linh kiện máy tính). 
      Nhiệm vụ:
      - Xưng hô "mình" và gọi khách là "bạn".
      - Tư vấn ngắn gọn, lịch sự, gợi ý linh kiện máy tính, PC, Laptop và chốt sale khéo léo.
      - TUYỆT ĐỐI KHÔNG tư vấn các vấn đề nằm ngoài lĩnh vực thiết bị điện tử, máy tính, PC và laptop. Nếu khách hỏi ngoài lề, hãy từ chối khéo và lái về thiết bị công nghệ WINNOTech.`
    });

    // 2. Format lại lịch sử chat (Đảm bảo đúng chuẩn của Gemini)
    const chatHistory = Array.isArray(history) ? history.map(item => {
      if (item.parts && Array.isArray(item.parts)) return item;
      return {
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.text || item.content || "" }]
      };
    }) : [];

    // 3. Bắt đầu phiên chat
    const chat = model.startChat({
      history: chatHistory,
    });

    // 4. Gửi câu hỏi mới nhất của khách
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
      message: "Nhân viên tư vấn đang bận, vui lòng thử lại sau ít phút! (" + error.message + ")" 
    });
  }
};

router.post("/chat", handleChat);
router.post("/ask", handleChat);

module.exports = router;