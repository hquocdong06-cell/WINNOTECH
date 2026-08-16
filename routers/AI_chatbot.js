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

    // 2. Format & Sanitize Lịch sử chat theo đúng quy định của Google Gemini API:
    let validHistory = Array.isArray(history) ? history.map(item => {
      const role = (item.role === "user" || item.role === "human") ? "user" : "model";
      let text = "";
      if (item.parts && Array.isArray(item.parts) && item.parts[0]) {
        text = item.parts[0].text || "";
      } else {
        text = item.text || item.content || "";
      }
      return { role, parts: [{ text: String(text).trim() }] };
    }).filter(item => item.parts[0].text !== "") : [];

    // Loại bỏ tất cả tin nhắn ban đầu của 'model' cho đến khi gặp tin nhắn đầu tiên của 'user'
    while (validHistory.length > 0 && validHistory[0].role !== "user") {
      validHistory.shift();
    }

    // Đảm bảo tin nhắn xen kẽ user/model
    const sanitizedHistory = [];
    validHistory.forEach(item => {
      if (sanitizedHistory.length === 0) {
        if (item.role === "user") sanitizedHistory.push(item);
      } else {
        const lastRole = sanitizedHistory[sanitizedHistory.length - 1].role;
        if (item.role !== lastRole) {
          sanitizedHistory.push(item);
        }
      }
    });

    // Nếu phần tử cuối cùng của history là 'user', loại bỏ nó vì tin nhắn mới sẽ gửi qua sendMessage()
    if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === "user") {
      sanitizedHistory.pop();
    }

    // 3. Thử lần lượt các Model Gemini khả thi nhất
    const candidateModels = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let responseText = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: `Bạn là nhân viên tư vấn nhiệt tình và am hiểu kĩ thuật của WINNOTech (hệ thống siêu thị công nghệ và linh kiện máy tính). 
          Nhiệm vụ:
          - Xưng hô "mình" và gọi khách là "bạn".
          - Tư vấn ngắn gọn, lịch sự, gợi ý linh kiện máy tính, PC, Laptop và chốt sale khéo léo.
          - TUYỆT ĐỐI KHÔNG tư vấn các vấn đề nằm ngoài lĩnh vực thiết bị điện tử, máy tính, PC và laptop.`
        });

        const chat = model.startChat({
          history: sanitizedHistory,
        });

        const result = await chat.sendMessage(message);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err) {
        console.warn(`Model Gemini "${modelName}" không phản hồi:`, err.message);
      }
    }

    if (responseText) {
      return res.status(200).json({ 
        success: true, 
        reply: responseText 
      });
    }

    // 4. Fallback thông minh khi Gemini API quá tải hoặc tạm thời gián đoạn
    let fallbackReply = `Chào bạn! Cảm ơn bạn đã liên hệ WINNOTech. 🤖\n`;
    const q = message.toLowerCase();
    if (q.includes("pc") || q.includes("tư vấn") || q.includes("15")) {
      fallbackReply += "WINNOTech có rất nhiều cấu hình PC Gaming & Đồ họa giá tốt từ 10tr - 30tr. Bạn có thể trải nghiệm tính năng 'Build PC' trên thanh menu hoặc liên hệ kỹ thuật viên để tư vấn cấu hình mượt nhất nhé!";
    } else if (q.includes("cpu") || q.includes("vga") || q.includes("gpu") || q.includes("ram")) {
      fallbackReply += "Các linh kiện CPU, VGA, Mainboard, RAM, SSD tại WINNOTech đều là hàng chính hãng bảo hành 36 tháng. Bạn có thể chọn trực tiếp sản phẩm trên website!";
    } else {
      fallbackReply += `WINNOTech đã nhận được câu hỏi: "${message}". Bạn có thể xem thêm các sản phẩm công nghệ hot nhất trên website hoặc thử hỏi lại sau giây lát nhé!`;
    }

    return res.status(200).json({ 
      success: true, 
      reply: fallbackReply,
      isFallback: true 
    });

  } catch (error) {
    console.error("Lỗi Gemini Chat:", error);
    return res.status(200).json({ 
      success: true, 
      reply: "Chào bạn! WINNOTech chuyên tư vấn linh kiện PC, Laptop & thiết bị công nghệ chính hãng. Bạn cần hỗ trợ thêm thông tin gì nào? 🤖" 
    });
  }
};

router.post("/chat", handleChat);
router.post("/ask", handleChat);

module.exports = router;