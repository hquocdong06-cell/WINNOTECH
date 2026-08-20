const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  ShadingType,
  VerticalAlign,
  BorderStyle,
} = docx;

// Read server.js
const serverJsPath = path.join(__dirname, '..', 'server.js');
const serverContent = fs.readFileSync(serverJsPath, 'utf8');
const lines = serverContent.split('\n');

// Standardized mapping of endpoints to details
const apiEntries = [];

// Helper to determine module and description based on line & context
function analyzeRoute(method, endpoint, lineIndex, lineStr) {
  const ep = endpoint.trim();
  
  // Search surrounding context (lines -10 to +10)
  const start = Math.max(0, lineIndex - 12);
  const end = Math.min(lines.length, lineIndex + 12);
  const contextText = lines.slice(start, end).join(' ');

  let moduleName = 'Hệ thống (System)';
  let description = 'Thao tác dữ liệu qua API';
  let auth = '❌';

  // Determine Auth status
  if (contextText.includes('checklogin') || contextText.includes('authMiddleware') || contextText.includes('checkLogin')) {
    if (ep.startsWith('/admin') || lineStr.includes('/admin') || contextText.includes('admin')) {
      auth = '✅ (Admin)';
    } else {
      auth = '✅';
    }
  } else if (ep.startsWith('/admin')) {
    auth = '✅ (Admin)';
  } else {
    auth = '❌';
  }

  // Determine Module & Detailed Function
  if (ep.includes('/auth') || ep.includes('/login') || ep.includes('/register') || ep.includes('/logout') || ep.includes('/user/profile') || ep.includes('/users')) {
    moduleName = 'Xác thực & Tài khoản (Auth & User)';
    if (ep.includes('login') && ep.includes('admin')) description = 'Đăng nhập trang quản trị Admin';
    else if (ep.includes('login')) description = 'Đăng nhập tài khoản người dùng / khách hàng';
    else if (ep.includes('register')) description = 'Đăng ký tài khoản người dùng mới';
    else if (ep.includes('logout')) description = 'Đăng xuất người dùng (Xóa phiên/Cookie làm việc)';
    else if (ep.includes('google')) description = 'Xác thực & Đăng nhập nhanh qua Google OAuth';
    else if (ep.includes('profile')) description = 'Lấy hoặc cập nhật thông tin cá nhân của người dùng';
    else if (ep.includes('/users') && method === 'GET') description = 'Lấy danh sách tất cả người dùng hệ thống (Admin)';
    else if (ep.includes('/users') && method === 'PUT') description = 'Cập nhật thông tin/quyền hạn người dùng (Admin)';
    else if (ep.includes('/users') && method === 'DELETE') description = 'Xóa người dùng khỏi hệ thống (Admin)';
    else description = 'Quản lý thông tin xác thực và tài khoản';
  }
  else if (ep.includes('/product') || ep.includes('/variant') || ep.includes('/gpu') || ep.includes('/cpu')) {
    moduleName = 'Sản phẩm & Biến thể (Products)';
    if (ep.includes('/search')) description = 'Tìm kiếm sản phẩm theo từ khóa (Fuse.js / Regex)';
    else if (ep.includes('/featured') || ep.includes('/hot')) description = 'Lấy danh sách sản phẩm nổi bật / bán chạy';
    else if (ep.includes('/:id/variants') || ep.includes('/variant')) description = 'Lấy hoặc cập nhật thông tin biến thể sản phẩm (Màu, Cấu hình)';
    else if (ep.includes('/:id') && method === 'GET') description = 'Lấy thông tin chi tiết 1 sản phẩm (kèm ảnh & biến thể)';
    else if (ep.includes('/:id') && method === 'PUT') description = 'Cập nhật thông tin sản phẩm (Admin)';
    else if (ep.includes('/:id') && method === 'DELETE') description = 'Xóa sản phẩm khỏi hệ thống (Admin)';
    else if (method === 'POST') description = 'Tạo sản phẩm mới (Admin)';
    else description = 'Lấy danh sách sản phẩm (Phân trang, lọc theo giá/danh mục)';
  }
  else if (ep.includes('/categor') || ep.includes('/brand')) {
    moduleName = 'Danh mục & Thương hiệu (Categories & Brands)';
    if (ep.includes('/categor') && method === 'GET' && !ep.includes(':id')) description = 'Lấy danh sách tất cả danh mục sản phẩm';
    else if (ep.includes('/categor') && method === 'POST') description = 'Thêm mới danh mục sản phẩm (Admin)';
    else if (ep.includes('/categor') && method === 'PUT') description = 'Cập nhật thông tin danh mục (Admin)';
    else if (ep.includes('/brand') && method === 'GET') description = 'Lấy danh sách thương hiệu (ASUS, MSI, Gigabyte...)';
    else if (ep.includes('/brand') && method === 'POST') description = 'Thêm mới thương hiệu sản phẩm (Admin)';
    else description = 'Quản lý danh mục sản phẩm và thương hiệu';
  }
  else if (ep.includes('/cart')) {
    moduleName = 'Giỏ hàng (Cart)';
    if (ep.includes('/add') || (method === 'POST' && ep === '/api/cart')) description = 'Thêm sản phẩm/biến thể vào giỏ hàng';
    else if (ep.includes('/update') || method === 'PUT') description = 'Cập nhật số lượng sản phẩm trong giỏ hàng';
    else if (ep.includes('/remove') || method === 'DELETE') description = 'Xóa sản phẩm khỏi giỏ hàng';
    else if (ep.includes('/clear')) description = 'Xóa toàn bộ sản phẩm trong giỏ hàng';
    else description = 'Lấy danh sách sản phẩm trong giỏ hàng của người dùng';
  }
  else if (ep.includes('/order') || ep.includes('/vnpay') || ep.includes('/payment')) {
    moduleName = 'Đơn hàng & Thanh toán (Orders & Payments)';
    if (ep.includes('/vnpay/create') || ep.includes('/vnpay_url')) description = 'Tạo liên kết thanh toán online qua cổng VNPAY';
    else if (ep.includes('/vnpay/return') || ep.includes('/vnpay_return')) description = 'Xử lý kết quả trả về từ VNPAY (IPN / Return)';
    else if (ep.includes('/payment-method')) description = 'Lấy danh sách phương thức thanh toán hỗ trợ (COD, VNPAY, QRCoder)';
    else if (ep.includes('/my-orders') || (ep.includes('/orders') && !ep.includes('/admin'))) description = 'Lấy lịch sử đơn hàng của người dùng đang đăng nhập';
    else if (ep.includes('/status') || method === 'PATCH') description = 'Cập nhật trạng thái đơn hàng (Chờ xác nhận, Đã giao, Hủy)';
    else if (ep.includes('/:id') && method === 'GET') description = 'Lấy chi tiết thông tin đơn hàng';
    else if (method === 'POST') description = 'Tạo đơn hàng mới (Đặt hàng)';
    else description = 'Quản lý toàn bộ danh sách đơn hàng hệ thống (Admin)';
  }
  else if (ep.includes('/voucher')) {
    moduleName = 'Voucher & Mã giảm giá (Vouchers)';
    if (ep.includes('/apply') || ep.includes('/check')) description = 'Kiểm tra và áp dụng mã giảm giá vào đơn hàng';
    else if (ep.includes('/user')) description = 'Lấy danh sách voucher trong kho của người dùng';
    else if (method === 'POST') description = 'Tạo mới mã giảm giá (Admin)';
    else if (method === 'PUT') description = 'Cập nhật thông tin mã giảm giá (Admin)';
    else if (method === 'DELETE') description = 'Xóa mã giảm giá (Admin)';
    else description = 'Lấy danh sách các mã giảm giá đang hoạt động';
  }
  else if (ep.includes('/favorite') || ep.includes('/compare') || ep.includes('/review')) {
    moduleName = 'Tương tác & Đánh giá (Interactions)';
    if (ep.includes('/favorite')) description = 'Thêm/Xóa sản phẩm yêu thích (Wishlist)';
    else if (ep.includes('/compare')) description = 'Thêm/Xóa sản phẩm vào danh sách so sánh cấu hình';
    else if (ep.includes('/review') && method === 'POST') description = 'Gửi đánh giá/bình luận cho sản phẩm';
    else description = 'Lấy danh sách đánh giá, yêu thích hoặc so sánh sản phẩm';
  }
  else if (ep.includes('/build-pc') || ep.includes('/pc')) {
    moduleName = 'Build PC (PC Builder)';
    if (ep.includes('/specs') || ep.includes('/components')) description = 'Lấy linh kiện PC theo chuẩn tương thích (Socket, RAM, PSU...)';
    else if (ep.includes('/save') || method === 'POST') description = 'Lưu cấu hình PC đã tự build vào tài khoản';
    else description = 'Lấy dữ liệu phục vụ công cụ Build PC chuyên nghiệp';
  }
  else if (ep.includes('/post') || ep.includes('/news') || ep.includes('/blog')) {
    moduleName = 'Bài viết & Tin tức (Posts & Blog)';
    if (ep.includes('/categor')) description = 'Quản lý danh mục bài viết / tin tức công nghệ';
    else if (ep.includes('/:slug') || ep.includes('/:id')) description = 'Xem chi tiết bài viết tin tức / hướng dẫn';
    else if (method === 'POST') description = 'Đăng bài viết mới (Admin)';
    else description = 'Lấy danh sách bài viết tin tức & đánh giá công nghệ';
  }
  else if (ep.includes('/banner')) {
    moduleName = 'Banner & Quảng cáo (Banners)';
    if (ep.includes('/status')) description = 'Bật/Tắt trạng thái hiển thị của Banner (Active/Hidden)';
    else if (ep.includes('/upload')) description = 'Upload hình ảnh Banner mới lên server';
    else if (method === 'POST') description = 'Tạo Banner mới (Admin)';
    else if (method === 'PUT') description = 'Cập nhật Banner & vị trí sắp xếp position (Admin)';
    else description = 'Lấy danh sách Banner hiển thị trang chủ (Sắp xếp theo position)';
  }
  else if (ep.includes('/report') || ep.includes('/dashboard') || ep.includes('/stats')) {
    moduleName = 'Báo cáo & Thống kê (Reports & Stats)';
    if (ep.includes('/excel')) description = 'Xuất báo cáo doanh thu & đơn hàng ra file Excel (.xlsx)';
    else if (ep.includes('/pdf')) description = 'Xuất hóa đơn / báo cáo ra file PDF';
    else description = 'Thống kê tổng quan doanh thu, đơn hàng, khách hàng (Admin Dashboard)';
  }
  else if (ep.includes('/address')) {
    moduleName = 'Địa chỉ giao hàng (Addresses)';
    if (method === 'POST') description = 'Thêm địa chỉ giao hàng mới cho người dùng';
    else if (method === 'PUT') description = 'Cập nhật địa chỉ giao hàng';
    else if (method === 'DELETE') description = 'Xóa địa chỉ giao hàng';
    else description = 'Lấy danh sách sổ địa chỉ của người dùng';
  }
  else if (ep.includes('/contact') || ep.includes('/mail') || ep.includes('/upload')) {
    moduleName = 'Hệ thống & Tiện ích (System)';
    if (ep.includes('/contact')) description = 'Gửi liên hệ / góp ý từ khách hàng tới Gmail quản trị';
    else if (ep.includes('/upload')) description = 'Upload hình ảnh tổng hợp lên hệ thống';
    else description = 'Dịch vụ hệ thống & gửi email thông báo';
  }

  return { moduleName, description, auth };
}

// Parse lines from server.js
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/app\.(get|post|put|delete|patch)\s*\(\s*(\[[^\]]+\]|"[^"]+"|'[^']+'|`[^`]+`)/i);
  if (match) {
    const method = match[1].toUpperCase();
    let rawEndpoint = match[2];
    
    let endpoints = [];
    try {
      if (rawEndpoint.startsWith('[')) {
        endpoints = JSON.parse(rawEndpoint.replace(/'/g, '"'));
      } else {
        endpoints = [rawEndpoint.replace(/['"`]/g, '')];
      }
    } catch (e) {
      endpoints = [rawEndpoint.replace(/['"`\[\]]/g, '').trim()];
    }

    endpoints.forEach(ep => {
      const { moduleName, description, auth } = analyzeRoute(method, ep, i, line);
      apiEntries.push({
        module: moduleName,
        method,
        endpoint: ep,
        description,
        auth
      });
    });
  }
}

console.log(`Prepared total ${apiEntries.length} API entries for Word generation.`);

// Create Word Document
const tableHeaderColor = "1E293B"; // Dark Slate Blue
const zebraBgColor = "F8FAFC"; // Light Grey-Blue

function getMethodBadge(method) {
  let color = "2563EB"; // Blue for GET
  if (method === "POST") color = "16A34A"; // Green
  else if (method === "PUT") color = "D97706"; // Amber/Orange
  else if (method === "DELETE") color = "DC2626"; // Red
  else if (method === "PATCH") color = "9333EA"; // Purple

  return new TextRun({
    text: method,
    bold: true,
    color: color,
    font: "Consolas",
    size: 20
  });
}

function getAuthText(auth) {
  let color = "000000";
  if (auth.includes('Admin')) color = "DC2626";
  else if (auth.includes('✅')) color = "16A34A";
  else color = "64748B";

  return new TextRun({
    text: auth,
    bold: auth !== '❌',
    color: color,
    size: 20
  });
}

// Group entries by module for better organization
const groupedModules = {};
apiEntries.forEach(entry => {
  if (!groupedModules[entry.module]) {
    groupedModules[entry.module] = [];
  }
  groupedModules[entry.module].push(entry);
});

const docChildren = [];

// Title & Header Information
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: "DANH MỤC CHI TIẾT TẤT CẢ API HỆ THỐNG - WINNOTECH",
        bold: true,
        size: 32,
        color: "0F172A",
        font: "Arial"
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: "Hệ thống Website Thương mại Điện tử Bán máy tính & Linh kiện PC (Backend Express.js / REST API)",
        italic: true,
        size: 22,
        color: "475569",
        font: "Arial"
      })
    ]
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: `📌 Tổng số API Endpoints: ${apiEntries.length} | 📌 Phân hệ: ${Object.keys(groupedModules).length} nhóm chức năng | 📌 Cập nhật: ${new Date().toLocaleDateString('vi-VN')}`,
        bold: true,
        size: 20,
        color: "2563EB",
        font: "Arial"
      })
    ]
  })
);

// Create Table
const tableRows = [];

// Header Row
tableRows.push(
  new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 2200, type: WidthType.DXA },
        shading: { fill: tableHeaderColor, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Phân hệ (Module)", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        width: { size: 1100, type: WidthType.DXA },
        shading: { fill: tableHeaderColor, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Method", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        width: { size: 3000, type: WidthType.DXA },
        shading: { fill: tableHeaderColor, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Endpoint", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        width: { size: 2900, type: WidthType.DXA },
        shading: { fill: tableHeaderColor, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Chức năng chính", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        width: { size: 1400, type: WidthType.DXA },
        shading: { fill: tableHeaderColor, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Xác thực (Auth)", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
    ]
  })
);

let rowIndex = 0;

Object.keys(groupedModules).forEach(moduleName => {
  const entries = groupedModules[moduleName];
  entries.forEach((item) => {
    rowIndex++;
    const isZebra = rowIndex % 2 === 0;
    const bgFill = isZebra ? zebraBgColor : "FFFFFF";

    tableRows.push(
      new TableRow({
        children: [
          // Module
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: item.module, size: 19, bold: true, color: "1E293B" })] })]
          }),
          // Method
          new TableCell({
            width: { size: 1100, type: WidthType.DXA },
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [getMethodBadge(item.method)] })]
          }),
          // Endpoint
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: item.endpoint, font: "Consolas", size: 19, color: "0F172A" })] })]
          }),
          // Description
          new TableCell({
            width: { size: 2900, type: WidthType.DXA },
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: item.description, size: 19, color: "334155" })] })]
          }),
          // Auth
          new TableCell({
            width: { size: 1400, type: WidthType.DXA },
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [getAuthText(item.auth)] })]
          }),
        ]
      })
    );
  });
});

docChildren.push(
  new Table({
    width: { size: 10600, type: WidthType.DXA },
    rows: tableRows,
  })
);

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 720,
            bottom: 720,
            left: 720,
            right: 720,
          },
        },
      },
      children: docChildren,
    },
  ],
});

const outputPath = path.join(__dirname, '..', 'WINNOTECH_Danh_Sach_Tat_Ca_API.docx');

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ File docx generated successfully at: ${outputPath}`);
});
