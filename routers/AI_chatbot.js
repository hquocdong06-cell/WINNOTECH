const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { ProductVariant } = require("../models/ProductVariant");

// Cố gắng import GoogleGenerativeAI
let GoogleGenerativeAI = null;
try {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
} catch {
  // Bỏ qua nếu module không có sẵn
}

/**
 * Trích xuất ngân sách (VNĐ) từ câu hỏi của người dùng
 * Ví dụ: "dưới 2 triệu", "tầm 15tr", "dưới 500k", "khoảng 20.000.000"
 */
function parseBudgetFromMessage(msg) {
  const text = msg.toLowerCase().replace(/,/g, "").replace(/\./g, "");
  
  // Trích xuất số triệu: "2 triệu", "2tr", "2.5 triệu", "2.5tr"
  const millionMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:triệu|trieu|tr|m\b)/i);
  if (millionMatch) {
    return parseFloat(millionMatch[1]) * 1000000;
  }
  
  // Trích xuất số nghìn: "500k", "800 k", "500 ngàn"
  const thousandMatch = text.match(/(\d+)\s*(?:k|ngàn|ngan|nghìn|nghin)/i);
  if (thousandMatch) {
    return parseInt(thousandMatch[1], 10) * 1000;
  }

  // Trích xuất số nguyên lớn: "2000000", "15000000"
  const rawNumberMatch = text.match(/(\d{6,10})/);
  if (rawNumberMatch) {
    return parseInt(rawNumberMatch[1], 10);
  }

  return null;
}

/**
 * Tìm kiếm sản phẩm thực tế từ Database dựa trên câu hỏi người dùng
 */
async function findRelevantProducts(message) {
  try {
    const q = message.toLowerCase();
    const budget = parseBudgetFromMessage(message);

    let searchRegex = null;
    let categoryName = "";

    // Lọc danh mục linh kiện / sản phẩm
    if (q.includes("ram") || q.includes("bộ nhớ")) {
      searchRegex = /\bram\b|ddr4|ddr5/i;
      categoryName = "RAM";
    } else if (q.includes("cpu") || q.includes("chip") || q.includes("vi xử lý") || q.includes("intel") || q.includes("ryzen")) {
      searchRegex = /\bintel\b|\bryzen\b|\bcore i\b|\bamd\b|\bcpu\b/i;
      categoryName = "CPU";
    } else if (q.includes("vga") || q.includes("gpu") || q.includes("card") || q.includes("rtx") || q.includes("gtx") || q.includes("radeon")) {
      searchRegex = /\brtx\b|\bgtx\b|\bvga\b|\bcard\b|rx\s*\d|\bradeon\b/i;
      categoryName = "VGA / Card màn hình";
    } else if (q.includes("ssd") || q.includes("ổ cứng") || q.includes("nvme") || q.includes("hdd")) {
      searchRegex = /\bssd\b|\bnvme\b|m\.2|\bhdd\b|ổ cứng/i;
      categoryName = "Ổ cứng SSD";
    } else if (q.includes("main") || q.includes("bo mạch") || q.includes("b760") || q.includes("b650") || q.includes("z790")) {
      searchRegex = /mainboard|bo mạch|\bb760\b|\bb650\b|\bz790\b|\bh610\b/i;
      categoryName = "Bo mạch chủ (Mainboard)";
    } else if (q.includes("nguồn") || q.includes("psu")) {
      searchRegex = /nguồn|\bpsu\b/i;
      categoryName = "Nguồn máy tính (PSU)";
    } else if (q.includes("case") || q.includes("vỏ")) {
      searchRegex = /\bcase\b|vỏ case|thùng máy/i;
      categoryName = "Vỏ Case";
    } else if (q.includes("màn hình") || q.includes("monitor")) {
      searchRegex = /màn hình|monitor/i;
      categoryName = "Màn hình";
    } else if (q.includes("laptop")) {
      searchRegex = /laptop/i;
      categoryName = "Laptop";
    } else if (q.includes("phím") || q.includes("chuột") || q.includes("tai nghe") || q.includes("gear")) {
      searchRegex = /bàn phím|chuột|tai nghe|\bmouse\b|\bkeyboard\b/i;
      categoryName = "Gaming Gear";
    } else if (/\bpc\b|máy tính/.test(q)) {
      searchRegex = /pc|máy tính/i;
      categoryName = "PC Máy tính";
    }

    let queryCondition = { status: "active" };
    if (searchRegex) {
      queryCondition.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    // Tìm kiếm trong MongoDB
    const dbProducts = await Product.find(queryCondition).limit(20).lean();

    const matchedList = [];
    for (const prod of dbProducts) {
      const variant = await ProductVariant.findOne({ p_id: prod._id }).lean();
      const currentPrice = (variant?.sale_price && variant.sale_price > 0) ? variant.sale_price : (variant?.price || 0);
      const originalPrice = variant?.price || 0;

      if (budget && currentPrice > 0) {
        if (currentPrice <= budget * 1.1) {
          matchedList.push({
            name: prod.name,
            price: currentPrice,
            originalPrice: originalPrice,
            hasSale: variant?.sale_price > 0 && variant.sale_price < variant.price,
            stock: variant?.stock_quantity || 0,
            slug: prod.slug
          });
        }
      } else if (currentPrice > 0) {
        matchedList.push({
          name: prod.name,
          price: currentPrice,
          originalPrice: originalPrice,
          hasSale: variant?.sale_price > 0 && variant.sale_price < variant.price,
          stock: variant?.stock_quantity || 0,
          slug: prod.slug
        });
      }
    }

    matchedList.sort((a, b) => b.price - a.price);

    return {
      categoryName,
      products: matchedList.slice(0, 6),
      budget
    };
  } catch (err) {
    console.error("Lỗi tìm kiếm sản phẩm cho chatbot:", err);
    return { categoryName: "", products: [], budget: null };
  }
}

/**
 * Fallback linh hoạt dựa trên Database và phân tích động khi API AI tạm thời không phản hồi
 */
function buildDynamicFallbackReply(message, searchData) {
  const { categoryName, products, budget } = searchData;
  const q = message.toLowerCase();

  if (products && products.length > 0) {
    const budgetStr = budget ? ` dưới ${budget.toLocaleString("vi-VN")}₫` : "";
    let reply = `Dạ chào bạn! Dưới đây là các sản phẩm **${categoryName || "công nghệ"}**${budgetStr} chất lượng cao đang có sẵn tại **WINNOTech**:\n\n`;

    products.forEach((p, index) => {
      const priceFormatted = `${p.price.toLocaleString("vi-VN")}₫`;
      const origFormatted = p.hasSale ? ` *(Giá gốc: ${p.originalPrice.toLocaleString("vi-VN")}₫)*` : "";
      reply += `**${index + 1}. ${p.name}**\n`;
      reply += `   • 💰 Giá ưu đãi: **${priceFormatted}**${origFormatted}\n`;
      reply += `   • 📦 Tình trạng: ${p.stock > 0 ? "Còn hàng sẵn tại showroom" : "Đặt hàng trước"}\n`;
      reply += `   • 🛡️ Bảo hành chính hãng 36 tháng, 1 đổi 1 trong 30 ngày.\n\n`;
    });

    reply += `👉 Bạn có thể tìm kiếm tên sản phẩm trên thanh tìm kiếm của **WINNOTech** để xem chi tiết và đặt hàng ngay nhé!`;
    return reply;
  }

  if (q.includes("bảo hành") || q.includes("đổi trả")) {
    return `🛡️ **Chính sách bảo hành tại WINNOTech**:\n\n` +
      `• 100% Linh kiện & PC chính hãng bảo hành từ 12 - 36 tháng.\n` +
      `• Đổi mới 1 đổi 1 trong 30 ngày đầu nếu phát sinh lỗi phần cứng từ nhà sản xuất.\n` +
      `• Vệ sinh PC & tra keo tản nhiệt miễn phí định kỳ tại showroom.`;
  }

  if (q.includes("vận chuyển") || q.includes("ship")) {
    return `🚚 **Chính sách Giao hàng của WINNOTech**:\n\n` +
      `• Nội thành TP.HCM: Giao hàng nhanh 2h - 4h.\n` +
      `• Toàn quốc: Giao hàng bảo đảm qua GHTK / Viettel Post (1 - 3 ngày).\n` +
      `• Miễn phí vận chuyển cho đơn hàng linh kiện và PC ráp sẵn từ 1.000.000₫!`;
  }

  return `Dạ chào bạn! AI Trợ lý WINNOTech đã ghi nhận câu hỏi: "${message}". 🤖\n\n` +
    `WINNOTech cung cấp đầy đủ các loại linh kiện máy tính (CPU, VGA, RAM, Mainboard, SSD, PSU) và PC Gaming / Laptop chính hãng.\n\n` +
    `💡 Bạn có thể cho mình biết thêm thông tin về **mức ngân sách** hoặc **mục đích sử dụng** (chơi game gì, làm phần mềm gì) để mình hỗ trợ tư vấn chi tiết nhất nhé!`;
}

/**
 * Xử lý API Chatbot
 */
const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung chat!" });
    }

    const trimmedMsg = message.trim();

    // 1. Tìm kiếm dữ liệu sản phẩm thực tế từ Database để làm ngữ cảnh cho AI
    const searchData = await findRelevantProducts(trimmedMsg);

    // 2. Lấy API Key Gemini từ process.env (tự động reload dotenv nếu cần)
    require("dotenv").config();
    const apiKey = (process.env.GEMINI_API_KEY || "AQ.Ab8RN6Lk-L9HjmWbc9rXQEJU2bWqKiwUN8_wVe4fypZxlMI0hw").trim();
    const hasValidKey = apiKey.length > 10 && apiKey !== "AIzaSy_Google_Gemini_Key_Here" && !apiKey.includes("YOUR_KEY");

    // 3. Nếu có GoogleGenerativeAI và API Key hợp lệ, gọi Gemini AI
    if (hasValidKey && GoogleGenerativeAI) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Chuẩn bị ngữ cảnh sản phẩm trong kho đính kèm vào System Instruction
        let productContext = "";
        if (searchData.products && searchData.products.length > 0) {
          productContext = "\n\nDANH SÁCH SẢN PHẨM THỰC TẾ TRONG KHO WINNOTECH PHÙ HỢP CẦN ƯU TIÊN GỢI Ý:\n" +
            searchData.products.map(p => `- ${p.name}: Giá ${p.price.toLocaleString("vi-VN")}đ${p.hasSale ? ` (Gốc ${p.originalPrice.toLocaleString("vi-VN")}đ)` : ""}, Tồn kho: ${p.stock}`).join("\n");
        } else {
          try {
            const featuredProds = await Product.find({ status: "active" }).limit(5).lean();
            if (featuredProds.length > 0) {
              const samples = [];
              for (const fp of featuredProds) {
                const variant = await ProductVariant.findOne({ p_id: fp._id }).lean();
                if (variant) {
                  const price = (variant.sale_price && variant.sale_price > 0) ? variant.sale_price : variant.price;
                  samples.push(`- ${fp.name}: Giá ${price.toLocaleString("vi-VN")}đ`);
                }
              }
              if (samples.length > 0) {
                productContext = "\n\nDANH SÁCH MỘT SỐ SẢN PHẨM NỔI BẬT ĐANG BÁN TẠI CỬA HÀNG WINNOTECH:\n" + samples.join("\n");
              }
            }
          } catch (e) {
            // ignore
          }
        }

        // Chuẩn hóa history tin nhắn cũ
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

        while (validHistory.length > 0 && validHistory[0].role !== "user") {
          validHistory.shift();
        }

        // Các mô hình Gemini được hỗ trợ mới nhất
        const candidateModels = [
          "gemini-3.5-flash-lite",
          "gemini-3.6-flash",
          "gemini-3.1-pro-preview",
          "gemini-2.5-flash"
        ];
        let aiReply = null;
        let lastError = null;

        for (const modelName of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              systemInstruction: `Bạn là Trợ lý AI chuyên gia tư vấn phần cứng PC & Siêu thị công nghệ WINNOTech.

NGUYÊN TẮC VÀ NĂNG LỰC CỦA BẠN:
1. TỰ SUY NGHĨ VÀ PHÂN TÍCH THÔNG MINH: Bạn là một trí tuệ nhân tạo thực sự. Hãy TỰ SUY NGHĨ, phân tích logic yêu cầu của khách hàng, suy luận về mục đích sử dụng (gaming, đồ họa 3D, lập trình, văn phòng, stream), tính toán ngân sách và giải thích lý do lựa chọn từng linh kiện. Tuyệt đối KHÔNG sử dụng câu trả lời mẫu hay kịch bản cố định.
2. XƯNG HÔ THÂN THIỆN: Xưng "mình" (hoặc "WINNOTech") và gọi khách hàng là "bạn".
3. TƯ VẤN KỸ THUẬT SÂU RỘNG: Am hiểu sự tương thích linh kiện (Socket CPU LGA1700/AM5, RAM DDR4/DDR5, công suất nguồn PSU, chuẩn SSD NVMe PCIe 4.0/5.0, kích thước VGA và vỏ case).
4. SỬ DỤNG DỮ LIỆU KHO HÀNG THỰC TẾ: Nếu có dữ liệu sản phẩm trong kho WINNOTech đính kèm dưới đây, hãy ưu tiên giới thiệu sản phẩm thật kèm giá chính xác.
5. TRÌNH BÀY ĐẸP MẮT: Trả lời tự nhiên, rõ ràng, trình bày Markdown sáng đẹp với icon, gạch đầu dòng, in đậm.${productContext}`
            });

            const chat = model.startChat({ history: validHistory });
            const result = await chat.sendMessage(trimmedMsg);
            aiReply = result.response.text();
            if (aiReply) break;
          } catch (modelErr) {
            lastError = modelErr;
            console.warn(`Thử model Gemini ${modelName} không thành công:`, modelErr.message);
          }
        }

        if (aiReply) {
          return res.status(200).json({
            success: true,
            reply: aiReply,
            source: "gemini"
          });
        }
      } catch (geminiError) {
        console.warn("Gemini AI API gặp sự cố:", geminiError.message);
      }
    }

    // 4. Nếu Gemini lỗi hoặc không cấu hình, dùng fallback linh hoạt
    const fallbackReply = buildDynamicFallbackReply(trimmedMsg, searchData);
    return res.status(200).json({
      success: true,
      reply: fallbackReply,
      source: "dynamic_fallback"
    });

  } catch (error) {
    console.error("Lỗi Chatbot:", error);
    return res.status(200).json({
      success: true,
      reply: "Chào bạn! Mình là Trợ lý AI của WINNOTech. Rất vui được hỗ trợ bạn tư vấn linh kiện máy tính, PC Gaming và Laptop chính hãng. Bạn cần tìm sản phẩm trong tầm giá bao nhiêu ạ? 🤖"
    });
  }
};

router.post("/chat", handleChat);
router.post("/ask", handleChat);

module.exports = router;