# -*- coding: utf-8 -*-
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

def create_document():
    doc = Document()

    # Bảng màu chuyên nghiệp (Professional Navy Theme)
    COLOR_PRIMARY = RGBColor(31, 78, 120)     # #1F4E78 - Navy Blue (H1, Title)
    COLOR_SECONDARY = RGBColor(46, 117, 182) # #2E75B6 - Sky Blue (H2)
    COLOR_ACCENT = RGBColor(192, 0, 0)       # #C00000 - Red Accent (Cảnh báo, Lưu ý)
    COLOR_DARK = RGBColor(38, 38, 38)        # #262626 - Text chính
    COLOR_MUTED = RGBColor(89, 89, 89)       # #595959 - Subtitle, ghi chú
    COLOR_SUCCESS = RGBColor(30, 126, 52)    # #1E7E34 - Green

    HEX_PRIMARY = "1F4E78"
    HEX_SECONDARY = "2E75B6"
    HEX_LIGHT_BG = "F4F6F9"
    HEX_CALLOUT_BG = "EBF1F5"
    HEX_TIP_BG = "E8F5E9"
    HEX_WARNING_BG = "FDF2E9"
    HEX_BORDER = "D3D3D3"
    HEX_CODE_BG = "F8F9FA"

    # Căn lề trang 2cm (0.8 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Helper format font
    def set_font(run, name="Calibri", size_pt=11, color=COLOR_DARK, bold=False, italic=False):
        run.font.name = name
        run.font.size = Pt(size_pt)
        run.font.color.rgb = color
        run.bold = bold
        run.italic = italic

    def set_spacing(p, before=0, after=5, line=1.15):
        p.paragraph_format.space_before = Pt(before)
        p.paragraph_format.space_after = Pt(after)
        p.paragraph_format.line_spacing = line

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_spacing(p, before=18, after=6)
        r = p.add_run(text)
        set_font(r, name="Calibri", size_pt=22, color=COLOR_PRIMARY, bold=True)
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_spacing(p, before=0, after=18)
        r = p.add_run(text)
        set_font(r, name="Calibri", size_pt=12, color=COLOR_MUTED, italic=True)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        set_spacing(p, before=18, after=6)
        r = p.add_run(text)
        set_font(r, name="Calibri", size_pt=15, color=COLOR_PRIMARY, bold=True)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        set_spacing(p, before=12, after=4)
        r = p.add_run(text)
        set_font(r, name="Calibri", size_pt=13, color=COLOR_SECONDARY, bold=True)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        set_spacing(p, before=8, after=3)
        r = p.add_run(text)
        set_font(r, name="Calibri", size_pt=11.5, color=COLOR_PRIMARY, bold=True)
        return p

    def add_body(text="", bold_prefix=""):
        p = doc.add_paragraph()
        set_spacing(p, before=0, after=4)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            set_font(r_pre, name="Calibri", size_pt=11, color=COLOR_DARK, bold=True)
        if text:
            r_txt = p.add_run(text)
            set_font(r_txt, name="Calibri", size_pt=11, color=COLOR_DARK)
        return p

    def add_bullet(text="", bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        set_spacing(p, before=0, after=3)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            set_font(r_pre, name="Calibri", size_pt=11, color=COLOR_DARK, bold=True)
        if text:
            r_txt = p.add_run(text)
            set_font(r_txt, name="Calibri", size_pt=11, color=COLOR_DARK)
        return p

    def add_callout(text, title="", callout_type="info"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False

        cell = tbl.cell(0, 0)
        cell.width = Inches(6.8)

        bg_color = HEX_CALLOUT_BG
        border_color = HEX_PRIMARY
        title_color = COLOR_PRIMARY
        if callout_type == "tip":
            bg_color = HEX_TIP_BG
            border_color = "28A745"
            title_color = COLOR_SUCCESS
        elif callout_type == "warning":
            bg_color = HEX_WARNING_BG
            border_color = "E65100"
            title_color = RGBColor(230, 81, 0)

        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_color}"/>')
        cell._tc.get_or_add_tcPr().append(shd)

        tcBorders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        cell._tc.get_or_add_tcPr().append(tcBorders)

        p = cell.paragraphs[0]
        set_spacing(p, before=4, after=4)
        if title:
            r_t = p.add_run(f"{title}\n")
            set_font(r_t, name="Calibri", size_pt=11, color=title_color, bold=True)
        r = p.add_run(text)
        set_font(r, name="Calibri", size_pt=10.5, color=COLOR_DARK, italic=(callout_type=="info"))
        doc.add_paragraph()

    def add_code(code_str):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.8)

        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{HEX_CODE_BG}"/>')
        cell._tc.get_or_add_tcPr().append(shd)

        tcBorders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
            </w:tcBorders>
        ''')
        cell._tc.get_or_add_tcPr().append(tcBorders)

        p = cell.paragraphs[0]
        set_spacing(p, before=3, after=3, line=1.0)
        r = p.add_run(code_str)
        set_font(r, name="Consolas", size_pt=9.5, color=RGBColor(30, 30, 30))
        doc.add_paragraph()

    def add_table_data(headers, rows, col_widths=None):
        table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        # Format header row
        hdr_cells = table.rows[0].cells
        for i, header_text in enumerate(headers):
            hdr_cells[i].text = header_text
            p = hdr_cells[i].paragraphs[0]
            set_spacing(p, before=4, after=4)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.runs[0]
            set_font(r, name="Calibri", size_pt=10.5, color=RGBColor(255, 255, 255), bold=True)
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{HEX_PRIMARY}"/>')
            hdr_cells[i]._tc.get_or_add_tcPr().append(shd)

        # Format body rows
        for row_idx, row_data in enumerate(rows):
            row_cells = table.rows[row_idx + 1].cells
            row_bg = "FFFFFF" if row_idx % 2 == 0 else "F8F9FA"
            for col_idx, cell_value in enumerate(row_data):
                row_cells[col_idx].text = str(cell_value)
                p = row_cells[col_idx].paragraphs[0]
                set_spacing(p, before=3, after=3)
                if len(p.runs) > 0:
                    set_font(p.runs[0], name="Calibri", size_pt=10, color=COLOR_DARK)
                shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{row_bg}"/>')
                row_cells[col_idx]._tc.get_or_add_tcPr().append(shd)

        # Apply borders
        for row in table.rows:
            for cell in row.cells:
                tcBorders = parse_xml(f'''
                    <w:tcBorders {nsdecls("w")}>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                    </w:tcBorders>
                ''')
                cell._tc.get_or_add_tcPr().append(tcBorders)

        # Set column widths
        if col_widths:
            for row in table.rows:
                for idx, width in enumerate(col_widths):
                    row.cells[idx].width = Inches(width)

        doc.add_paragraph()

    # =========================================================================
    # NỘI DUNG TÀI LIỆU
    # =========================================================================

    # TIÊU ĐỀ CHÍNH
    add_title("CẨM NANG TOÀN DIỆN BẢO VỆ DỰ ÁN WINNOTECH\n(CHỐNG TRƯỢT MÔN & ĐẠT ĐIỂM XUẤT SẮC 9.0 - 10.0)")
    add_subtitle("Hệ sinh thái E-Commerce Linh kiện Máy tính, Build PC & AI Chatbot Thông minh\nToàn bộ Kiến trúc, Nghiệp vụ, Bản đồ Code, Bản đồ Database, Kịch bản Thuyết trình & 25 Câu hỏi Phản biện")

    add_callout(
        "Tài liệu này được biên soạn độc quyền cho sinh viên/nhà phát triển dự án WINNOTech để bước vào phòng bảo vệ với sự tự tin 100%:\n"
        "1. Nắm trọn bản đồ Code: Thầy cô chỉ tay vào màn hình hỏi 'Code chức năng này nằm ở đâu?', bạn mở đúng file và dòng trong 3 giây.\n"
        "2. Nắm trọn bản đồ Database: Hiểu rõ từng Collection, từng trường dữ liệu, nguyên lý Snapshot giá đơn hàng, State Machine.\n"
        "3. Kịch bản Thuyết trình mẫu: Từng câu từng chữ thu hút Hội đồng, luồng Demo liền mạch, làm nổi bật điểm sáng kỹ thuật cao cấp.\n"
        "4. Bộ 25 Câu hỏi Phản biện 'Sát sườn': Tổng hợp các câu hỏi hóc búa nhất của Hội đồng phản biện kèm câu trả lời mẫu chuẩn chuyên gia.",
        "🎯 MỤC TIÊU TỐI THƯỢNG: TỰ TIN TUYỆT ĐỐI - KHÔNG SỢ BỊ BẮT BẺ - ĐẠT ĐIỂM A/A+",
        "tip"
    )

    # =========================================================================
    # PHẦN 1: TỔNG QUAN KIẾN TRÚC HỆ THỐNG (TECH STACK & ARCHITECTURE)
    # =========================================================================
    add_h1("PHẦN 1: TỔNG QUAN HỆ THỐNG & KIẾN TRÚC MÃ NGUỒN")
    
    add_h2("1.1 Bài toán nghiệp vụ của dự án WINNOTech")
    add_body("WINNOTech là một nền tảng Thương mại Điện tử chuyên sâu về Linh kiện máy tính, PC Gaming/Đồ hoạ, Phụ kiện Gear và Dịch vụ công nghệ cao. Khác với các web bán hàng quần áo hay đồ gia dụng thông thường, hệ thống linh kiện máy tính có độ phức tạp kỹ thuật rất cao:")
    add_bullet("Tính phụ thuộc & Tương thích: Mỗi linh kiện (CPU, Mainboard, RAM, Nguồn, Case) đều có chuẩn socket, bus, kích thước form factor chặt chẽ.", "• ")
    add_bullet("Đa biến thể sâu (Multi-variant): Một sản phẩm có nhiều cấu hình (Dung lượng, Màu sắc, Tần số quét, Xung nhịp), mỗi biến thể có mã SKU, giá bán, giá sale và số lượng tồn kho riêng biệt.", "• ")
    add_bullet("Tư vấn thông minh bằng AI (RAG Pipeline): Tích hợp Google Gemini AI kết hợp dữ liệu kho thực tế để tư vấn cấu hình theo ngân sách của khách hàng.", "• ")
    add_bullet("Thanh toán đa kênh bảo mật: Hỗ trợ tiền mặt (COD), số dư ví tài khoản nội bộ và Cổng thanh toán trực tuyến quốc gia VNPay (QR & Thẻ ATM/Visa).", "• ")
    add_bullet("Hệ thống kiểm toán đơn hàng (Audit Trail): Theo dõi vòng đời đơn hàng qua 5 bước nghiêm ngặt, tự động hoàn kho khi huỷ đơn.", "• ")

    add_h2("1.2 Công nghệ cốt lõi (Technology Stack) - Giải thích vì sao chọn?")
    
    tech_headers = ["Thành phần", "Công nghệ sử dụng", "Vai trò trong hệ thống", "Lý do lựa chọn kỹ thuật"]
    tech_rows = [
        ["Frontend UI", "React 18 + Vite", "Giao diện SPA (Single Page App) người dùng và Admin", "Tốc độ build cực nhanh nhờ Vite; cơ chế Virtual DOM tối ưu render giao diện mượt mà."],
        ["Styling", "TailwindCSS + Lucide", "Thiết kế giao diện hiện đại, responsive, Dark/Light Mode", "Utility-first CSS giúp tùy biến linh hoạt, kích thước bundle xuất xưởng cực nhẹ."],
        ["State Mgt", "Redux Toolkit", "Quản lý trạng thái Giỏ hàng (Cart) toàn cục", "Tránh prop-drilling, đồng bộ số lượng sản phẩm trên giỏ hàng và navbar tức thì."],
        ["Backend", "Node.js + Express 5", "Xây dựng RESTful API, Routing, Middleware xác thực", "Non-blocking I/O xử lý đồng thời hàng nghìn request, hỗ trợ Express 5 async error handling."],
        ["Database", "MongoDB + Mongoose 9", "Cơ sở dữ liệu NoSQL lưu trữ toàn bộ thực thể", "Linh hoạt cấu trúc JSON/BSON, tốc độ truy vấn cao, mở rộng Document dễ dàng."],
        ["Bảo mật Auth", "JWT + RSA (RS256) + Bcrypt", "Xác thực phiên đăng nhập, băm mật khẩu an toàn", "Dùng cặp khoá Asymmetric (Private key ký, Public key kiểm tra) bảo mật vượt trội so với HS256."],
        ["Thanh toán", "VNPay Sandbox + QR", "Cổng thanh toán thẻ ATM/Visa/QR ngân hàng", "Bảo mật HMAC-SHA512, tích hợp tiêu chuẩn thanh toán ngân hàng tại Việt Nam."],
        ["AI Chatbot", "Google Gemini AI + RAG", "Chatbot tư vấn PC thông minh theo ngân sách", "Trích xuất ngân sách, truy vấn DB nội bộ rồi mới đưa vào AI (Retrieval-Augmented Generation)."],
        ["Real-time", "Socket.IO", "Thông báo trạng thái đơn hàng và voucher tức thời", "Websocket 2 chiều giúp Khách hàng và Admin nhận cập nhật đơn hàng mà không cần F5."],
        ["Báo cáo", "ExcelJS + PDFKit", "Xuất file báo cáo doanh thu Excel và in hoá đơn PDF", "Tạo file trực tiếp từ server với style định dạng đẹp mắt, chuyên nghiệp."]
    ]
    add_table_data(tech_headers, tech_rows, [1.2, 1.4, 2.2, 2.0])

    add_h2("1.3 Luồng đi của dữ liệu (Request - Response Lifecycle)")
    add_callout(
        "Client (React/Redux) ➔ Gửi HTTP Request (kèm Bearer Token trong Header) ➔ Backend Express Middleware (CORS, JSON Parser, AuthMiddleware kiểm tra Token RSA) ➔ Router/Controller tiếp nhận tham số ➔ Mongoose ODM truy vấn MongoDB Engine ➔ Trả kết quả JSON về Client ➔ Redux/React State cập nhật ➔ Re-render UI.\n"
        "Nếu là sự kiện cập nhật trạng thái đơn: Socket.IO Server phát sự kiện 'order_status_updated' tới room của người dùng, giao diện đổi trạng thái ngay lập tức.",
        "🔄 VÒNG ĐỜI DỮ LIỆU END-TO-END",
        "info"
    )

    # =========================================================================
    # PHẦN 2: BẢN ĐỒ CƠ SỞ DỮ LIỆU (DATABASE Ở ĐÂU? CẤU TRÚC RA SAO?)
    # =========================================================================
    add_h1("PHẦN 2: BẢN ĐỒ CƠ SỞ DỮ LIỆU (DATABASE Ở ĐÂU? LƯU GÌ?)")
    
    add_callout(
        "• Đường dẫn kết nối CSDL: Cấu hình trong file .env tại dòng 11:\n"
        "  MONGODB_URI=mongodb://127.0.0.1:27017/WINNOTech\n"
        "• Tên Database: WINNOTech\n"
        "• Công cụ quản lý trực quan: MongoDB Compass (kết nối qua chuỗi: mongodb://localhost:27017)\n"
        "• Thư mục định nghĩa Schema: Toàn bộ model nằm tại thư mục /models/*.js",
        "📍 VỊ TRÍ LƯU TRỮ VẬT LÝ CỦA DATABASE",
        "tip"
    )

    add_h2("2.1 Chi tiết 14 Collections và Cấu trúc Bảng dữ liệu")

    add_h3("1. Collection 'User' (File: models/User.js)")
    add_body("Lưu trữ tài khoản người dùng và quản trị viên.")
    add_bullet("name (String): Tên hiển thị người dùng.", "- ")
    add_bullet("email (String, unique): Email đăng nhập duy nhất.", "- ")
    add_bullet("password (String): Mật khẩu đã băm bằng thuật toán Bcrypt (Salt rounds = 10).", "- ")
    add_bullet("phone (String): Số điện thoại liên hệ.", "- ")
    add_bullet("role (String, default: 'user'): Phân quyền hệ thống ('user' hoặc 'admin').", "- ")
    add_bullet("status (String, default: 'active'): Trạng thái hoạt động ('active' | 'blocked').", "- ")
    add_bullet("money (Number, default: 0): Số dư ví tài khoản WINNOTech (dùng mua hàng nội bộ).", "- ")
    add_bullet("resetPasswordOTP & resetPasswordExpires: Mã OTP 6 chữ số và thời gian hết hạn (10 phút) để khôi phục mật khẩu qua Email.", "- ")
    add_bullet("googleId (String): ID tài khoản Google nếu người dùng đăng nhập bằng Google OAuth 2.0.", "- ")

    add_h3("2. Collection 'Product' (File: models/Product.js) - Bảng Sản phẩm cha")
    add_bullet("name (String): Tên sản phẩm chính (Ví dụ: CPU Intel Core i7 14700K).", "- ")
    add_bullet("slug (String, unique): Đường dẫn thân thiện SEO (cpu-intel-core-i7-14700k).", "- ")
    add_bullet("sale (Number): % khuyến mãi của sản phẩm cha.", "- ")
    add_bullet("sold_count (Number): Số lượng đã bán ra (dùng sắp xếp bán chạy).", "- ")
    add_bullet("thumnail (String): URL ảnh đại diện sản phẩm.", "- ")
    add_bullet("cat_id (ObjectId, ref: 'Category'): Khoá ngoại tham chiếu đến danh mục.", "- ")
    add_bullet("brand_id (ObjectId, ref: 'Brand'): Khoá ngoại tham chiếu đến hãng sản xuất.", "- ")
    add_bullet("description & short_desc (String): Mô tả chi tiết và tóm tắt sản phẩm.", "- ")
    add_bullet("status (String, default: 'active'): Trạng thái hiển thị.", "- ")

    add_h3("3. Collection 'ProductVariant' (File: models/ProductVariant.js) - Bảng Biến thể con")
    add_callout(
        "Mô hình Multi-variant: Mỗi sản phẩm cha (Product) có nhiều biến thể con (ProductVariant). Khách hàng không mua trực tiếp 'Product' mà mua một 'ProductVariant' cụ thể (có SKU, giá tiền và tồn kho riêng).",
        "💡 NGUYÊN LÝ THIẾT KẾ ĐA BIẾN THỂ",
        "info"
    )
    add_bullet("variant_name (String): Tên biến thể (Ví dụ: Box Chính Hãng / Khay / 32GB / Đen).", "- ")
    add_bullet("sku (String, unique): Mã quản lý kho hàng độc nhất (Ví dụ: CPU-INTEL-14700K-BOX).", "- ")
    add_bullet("price (Number): Giá niêm yết gốc.", "- ")
    add_bullet("sale_price (Number): Giá bán thực tế sau giảm giá.", "- ")
    add_bullet("stock_quantity (Number): Số lượng tồn kho thực tế hiện tại.", "- ")
    add_bullet("p_id (ObjectId, ref: 'Product'): Khoá ngoại liên kết về sản phẩm cha.", "- ")

    add_h3("4. Collection 'variants_attributes' & 'Attribute' & 'AttributeValue' (models/Attribute.js)")
    add_body("Bảng nối liên kết giữa Biến thể sản phẩm và Thuộc tính (màu sắc, dung lượng):")
    add_bullet("Attribute: Lưu tên thuộc tính (Màu sắc, Dung lượng, Bộ nhớ).", "- ")
    add_bullet("AttributeValue: Lưu giá trị cụ thể (Đen, Trắng, 16GB, 1TB).", "- ")
    add_bullet("variants_attributes: Bảng junction nối id_variants ↔ id_attribute_value.", "- ")

    add_h3("5. Collection 'Specification' (File: models/Specification.js) - Thông số kỹ thuật")
    add_body("Lưu trữ thông số kỹ thuật chuyên biệt cho việc So sánh linh kiện và tra cứu cấu hình:")
    add_bullet("p_id (ObjectId, ref: 'Product'): Sản phẩm sở hữu thông số.", "- ")
    add_bullet("id_attribute_value: Giá trị thông số (Socket LGA1700, Bus 3200MHz, Công suất 750W...).", "- ")

    add_h3("6. Collection 'Order' (File: models/Order.js) - Đơn hàng chính")
    add_bullet("code (String, unique): Mã đơn hàng định dạng chuẩn (Ví dụ: ORD-1725400000000 hoặc WN...).", "- ")
    add_bullet("user_id (ObjectId, ref: 'User'): Người đặt hàng.", "- ")
    add_bullet("Name, Phone, Adress: Thông tin người nhận và địa chỉ giao hàng.", "- ")
    add_bullet("total_amount (Number): Tổng số tiền thanh toán cuối cùng của đơn hàng.", "- ")
    add_bullet("payment_method (ObjectId, ref: 'PaymentMethod'): Phương thức thanh toán (COD / Ví nội bộ / VNPay).", "- ")
    add_bullet("payment_status (String): Trạng thái thanh toán ('unpaid' | 'paid' | 'refund_pending' | 'refunded').", "- ")
    add_bullet("voucher_code & voucher_value: Mã voucher đã áp dụng và số tiền được chiết khấu.", "- ")
    add_bullet("status (String): Trạng thái đơn hàng qua State Machine:\n'pending' (Chờ duyệt) ➔ 'preparing' (Đang chuẩn bị) ➔ 'shipping' (Đang giao) ➔ 'delivered' (Đã giao) ➔ 'completed' (Hoàn thành) | 'cancelled' (Đã hủy).", "- ")
    add_bullet("statusHistory (Array Embedded): Vết kiểm toán tiến trình (Audit Trail) lưu mốc thời gian, người đổi, ghi chú.", "- ")
    add_bullet("tracking_code & shipping_carrier: Mã vận đơn và đơn vị vận chuyển (GHN, GHTK, ViettelPost).", "- ")

    add_h3("7. Collection 'OrderItem' (File: models/Order.js) - Chi tiết từng món trong đơn")
    add_callout(
        "KỸ THUẬT DATA SNAPSHOT PATTERN TỐI QUAN TRỌNG:\n"
        "Trường 'price' trong OrderItem lưu giá tại đúng thời điểm khách ấn đặt hàng. Nếu sau này Admin sửa giá sản phẩm từ 10 triệu thành 12 triệu hoặc xoá sản phẩm khỏi cơ sở dữ liệu, giá trong OrderItem vẫn là 10 triệu. Điều này đảm bảo tính toàn vẹn tài chính 100%!",
        "⭐ ĐIỂM SÁNG BẢO VỆ: DATA SNAPSHOT PATTERN",
        "tip"
    )
    add_bullet("order_id (ObjectId, ref: 'Order'): Đơn hàng cha.", "- ")
    add_bullet("variants_id (ObjectId, ref: 'ProductVariant'): Biến thể linh kiện được mua.", "- ")
    add_bullet("Quantity (Number): Số lượng sản phẩm mua.", "- ")
    add_bullet("price (Number): Giá mua thực tế tại thời điểm chốt đơn (Snapshot).", "- ")

    add_h3("8. Collection 'CartItem' (File: models/Cartitem.js) - Giỏ hàng người dùng")
    add_bullet("u_id (ObjectId/String): ID người dùng sở hữu giỏ hàng.", "- ")
    add_bullet("variants_id (ObjectId, ref: 'ProductVariant'): Biến thể chọn mua.", "- ")
    add_bullet("Quantity (Number): Số lượng trong giỏ.", "- ")

    add_h3("9. Collection 'Voucher' & 'UserVoucher' (File: models/Voucher.js)")
    add_bullet("code (String, unique): Mã khuyến mãi (Ví dụ: FRS50K, SHIP20, WINNO10).", "- ")
    add_bullet("discount_type (String): 'percent' (% giảm) hoặc 'fixed' (trừ số tiền cố định).", "- ")
    add_bullet("discount_value (Number): Giá trị giảm (10% hoặc 50,000đ).", "- ")
    add_bullet("min_order_value (Number): Giá trị đơn hàng tối thiểu để áp dụng.", "- ")
    add_bullet("quantity (Number): Lượt dùng tối đa còn lại.", "- ")
    add_bullet("start_date & end_date: Khoảng thời gian voucher có hiệu lực.", "- ")
    add_bullet("UserVoucher: Bảng ví voucher người dùng thu thập về tài khoản cá nhân.", "- ")

    add_h3("10. Các Collection phụ trợ khác")
    add_bullet("Favorite (models/FavoriteCompareReview.js): Danh sách sản phẩm yêu thích của khách hàng.", "• ")
    add_bullet("Compare (models/FavoriteCompareReview.js): Bảng tạm so sánh thông số kỹ thuật 2 linh kiện cùng loại.", "• ")
    add_bullet("Review (models/FavoriteCompareReview.js): Đánh giá 1-5 sao, bình luận và ảnh review kèm liên kết OrderItem.", "• ")
    add_bullet("Post & PostCategory (models/Post.js): Hệ thống bài viết công nghệ, tin tức linh kiện, mẹo thủ thuật máy tính.", "• ")
    add_bullet("Banner (models/BannerPaymentImage.js): Quản lý slider và banner quảng cáo trên trang chủ.", "• ")
    add_bullet("DeliveryAddress (models/DeliveryAddress.js): Sổ địa chỉ giao hàng mặc định của khách hàng.", "• ")

    # =========================================================================
    # PHẦN 3: BẢN ĐỒ MÃ NGUỒN - "CODE Ở ĐÂU? TRA CỨU TRONG 3 GIÂY"
    # =========================================================================
    add_h1("PHẦN 3: BẢN ĐỒ MÃ NGUỒN (TRA CỨU TRONG 3 GIÂY ĐỂ CHỈ FILE CHO GIẢNG VIÊN)")
    
    add_callout(
        "Khi giảng viên yêu cầu: 'Em mở code chức năng X ra và giải thích cho thầy/cô xem!', bạn hãy mở đúng các file và hàm được chỉ rõ trong bảng dưới đây.",
        "⚡ BẢNG TRA CỨU NHANH VỊ TRÍ CODE THEO TỪNG CHỨC NĂNG",
        "tip"
    )

    code_headers = ["Chức năng", "Frontend Component (Giao diện)", "Backend File & API Endpoint", "Logic xử lý chính"]
    code_rows = [
        [
            "Đăng ký, Đăng nhập, Quên mật khẩu",
            "frontend/src/pages/Auth.jsx\nGuestGuard.jsx",
            "server.js (dòng ~350 - ~600)\nPOST /api/register\nPOST /api/login\nPOST /api/forgot-password\nPOST /api/verify-otp\nPOST /api/reset-password",
            "Bcrypt băm mật khẩu, ký token JWT RS256 với private key (key/privatekey.pem). Gửi mã OTP xác thực qua Nodemailer."
        ],
        [
            "Đăng nhập bằng Google",
            "frontend/src/pages/Auth.jsx (GoogleLogin button)",
            "server.js (dòng ~610)\nPOST /api/google-login",
            "Google OAuth2Client verify id_token từ Google API. Tìm hoặc tự động tạo User mới, sinh JWT trả về client."
        ],
        [
            "Xem danh mục, Lọc đa biến thể, Chi tiết",
            "frontend/src/pages/CategoryPage.jsx\nProductDetail.jsx\nPriceRangeFilter.jsx",
            "server.js\nGET /api/products\nGET /api/product/:slug\nGET /api/categories\nGET /api/brands",
            "Query MongoDB lọc theo danh mục, mức giá, hãng sản xuất. Populate Category, Brand và ProductVariant lấy giá min/max."
        ],
        [
            "Giỏ hàng (Cart)",
            "frontend/src/pages/Cart.jsx\nCartDrawer.jsx\nredux/cartSlice.js",
            "server.js\nGET /api/cart\nPOST /api/cart/add\nPUT /api/cart/update\nDELETE /api/cart/remove",
            "Redux Toolkit quản lý state giỏ hàng phía Client. Server chuẩn hoá cleanUserId() tránh xung đột ObjectId/String."
        ],
        [
            "Áp dụng Voucher đa cấp (FRS / SHIP)",
            "frontend/src/pages/Checkout.jsx\nViVoucherCuaToi.jsx",
            "server.js (dòng 93 - 150)\nHàm calculateVoucherDiscount()",
            "Quy tắc FRS (Free Ship 100% + giảm giá SP), SHIP (chỉ trừ vào phí vận chuyển), Voucher thường (giảm trên subtotal)."
        ],
        [
            "Thanh toán VNPay (Tạo URL & Quét QR)",
            "frontend/src/pages/Checkout.jsx (Modal VNPay QR)\nPaymentResult.jsx",
            "routers/order.js\nPOST /order/create_payment_url\nGET /order/vnpay_return",
            "Sắp xếp tham số sortObject(), băm chữ ký HMAC-SHA512 với bí mật bí mật VNPay. Callback vnpay_return kiểm tra vnp_ResponseCode==='00'."
        ],
        [
            "Đặt hàng & Trừ tồn kho",
            "frontend/src/pages/Checkout.jsx",
            "server.js & routers/order.js\nPOST /api/create-order",
            "Tạo bản ghi Order, duyệt mảng OrderItem lưu snapshot giá. Thực thi $inc: { stock_quantity: -Quantity } để giữ hàng."
        ],
        [
            "Lịch sử Đơn hàng & Hủy đơn",
            "frontend/src/pages/Profile.jsx (Tab Đơn hàng)",
            "server.js & routers/order.js\nGET /api/my-orders\nPOST /api/order/:id/cancel",
            "Chỉ cho phép huỷ ở pending/preparing. Khi huỷ tự động hoàn kho: $inc: { stock_quantity: Quantity }. Ghi vết statusHistory."
        ],
        [
            "Chatbot AI tư vấn cấu hình (Gemini RAG)",
            "frontend/src/components/AIChatbot.jsx",
            "routers/AI_chatbot.js\nPOST /api/ai-chat (hoặc /api/chatbot)",
            "Trích xuất ngân sách (parseBudgetFromMessage), query MongoDB lấy sản phẩm thật (findRelevantProducts), đưa context vào Gemini."
        ],
        [
            "So sánh linh kiện (Compare)",
            "frontend/src/pages/Compare.jsx",
            "server.js\nGET /api/compare\nPOST /api/compare/add",
            "Lấy danh sách thông số kỹ thuật (Specification) của 2 linh kiện cùng danh mục, dựng bảng đối chiếu thông số song song."
        ],
        [
            "Đánh giá sản phẩm (Review)",
            "frontend/src/pages/ProductDetail.jsx (Tab Đánh giá)",
            "server.js\nGET /api/reviews\nPOST /api/reviews",
            "Liên kết đánh giá theo id_orderitems đảm bảo chỉ người đã mua hàng thành công mới được đánh giá sản phẩm."
        ],
        [
            "Admin Dashboard & Thống kê",
            "frontend/src/admin/pages/Dashboard.jsx\nreact-google-charts",
            "server.js\nGET /api/admin/dashboard-stats\nGET /api/admin/revenue-chart",
            "Dùng MongoDB Aggregation Pipeline ($group, $match, $sum) tính tổng doanh thu, số đơn thành công, khách mới, biểu đồ tuần/tháng."
        ],
        [
            "Quản lý đơn hàng Admin & Xuất Excel/PDF",
            "frontend/src/admin/pages/Orders.jsx",
            "server.js\nPUT /api/admin/order/:id/status\nGET /api/admin/order/:id/pdf\nGET /api/admin/orders/export-excel",
            "Đổi trạng thái đơn bắn Socket.IO qua emitOrderUpdate(). Thư viện ExcelJS tạo file bảng biểu; PDFKit vẽ hoá đơn giao hàng."
        ],
        [
            "Bảo vệ Route (Guards)",
            "frontend/src/components/GuestGuard.jsx\nfrontend/src/admin/components/AdminGuard.jsx",
            "middleware/AuthMiddleware.js (Backend)",
            "Frontend check role !== 'admin' điều hướng về trang chủ. Backend verify JWT bằng Public Key RS256, từ chối 401/403 nếu sai."
        ]
    ]
    add_table_data(code_headers, code_rows, [1.3, 1.6, 1.8, 2.1])

    # =========================================================================
    # PHẦN 4: CHI TIẾT NGHIỆP VỤ CỐT LÕI (BUSINESS LOGIC DEEP-DIVE)
    # =========================================================================
    add_h1("PHẦN 4: PHÂN TÍCH CHUYÊN SÂU CÁC NGHIỆP VỤ TRỌNG YẾU")

    add_h2("4.1 Thuật toán Tính toán Voucher đa cấp (Voucher Engine)")
    add_body("Hệ thống WINNOTech triển khai cơ chế tính voucher thông minh tại hàm calculateVoucherDiscount (server.js: L93):")
    add_bullet("Phí vận chuyển mặc định: 30,000 VNĐ. Nếu tổng tiền hàng (subtotal) >= 1,000,000 VNĐ ➔ Miễn phí ship tự động (baseShippingFee = 0).", "1. Miễn phí ship đơn lớn: ")
    add_bullet("Voucher có mã chứa 'FRS' (Free Shipping): Vừa miễn 100% phí ship (shippingDiscount = baseShippingFee), vừa giảm giá sản phẩm theo % hoặc số tiền mặt cố định.", "2. Voucher FRS: ")
    add_bullet("Voucher có mã chứa 'SHIP': Chỉ khấu trừ vào tiền ship, TUYỆT ĐỐI KHÔNG giảm vào giá trị sản phẩm. Giảm tối đa không vượt quá phí ship thực tế.", "3. Voucher SHIP: ")
    add_bullet("Voucher thông thường: Chỉ giảm giá sản phẩm, phí vận chuyển tính bình thường theo khoảng cách và đơn hàng.", "4. Voucher thường: ")

    add_h2("4.2 Luồng xử lý Cổng thanh toán VNPay (URL creation, Callback, IPN)")
    add_code(
'''1. KHÁCH CHỌN VNPAY: Client gửi POST /order/create_payment_url kèm mã đơn, số tiền.
2. BACKEND TẠO CHỮ KÝ: 
   - Lấy thông tin config: vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl.
   - Sắp xếp các tham số theo thứ tự alphabet bằng hàm sortObject().
   - Sử dụng crypto.createHmac("sha512", secretKey) để tạo chữ ký băm bảo mật vnp_SecureHash.
3. CHUYỂN HƯỚNG / HIỂN THỊ QR: 
   - Trả về link thanh toán VNPay và mã QR (tạo bởi thư viện qrcode).
4. KHÁCH QUÉT MÃ / NHẬP THẺ: VNPay xử lý giao dịch tại hệ thống ngân hàng.
5. VNPAY REDIRECT VỀ: /order/vnpay_return (Client điều hướng tới PaymentResult.jsx).
   - Kiểm tra mã phản hồi: Nếu vnp_ResponseCode === "00" ➔ Giao dịch THÀNH CÔNG.
   - Cập nhật Order.payment_status = "paid". Gửi email hóa đơn qua Nodemailer.'''
    )

    add_h2("4.3 Kiến trúc AI Chatbot RAG (Retrieval-Augmented Generation)")
    add_body("Điểm sáng công nghệ giúp WINNOTech vượt trội so với các đồ án thông thường:")
    add_bullet("Vấn đề của Chatbot thông thường: Nếu gọi trực tiếp OpenAI hay Gemini mà không có dữ liệu, AI sẽ bịa đặt sản phẩm không có thật trong cửa hàng hoặc báo sai giá.", "• ")
    add_bullet("Giải pháp RAG của WINNOTech (routers/AI_chatbot.js):", "• ")
    add_body("  Bước 1: Trích xuất ngân sách (Budget Parser): Hàm parseBudgetFromMessage() dùng Regex nhận diện các định dạng: 'dưới 15tr', 'khoảng 20 triệu', '500k' thành số nguyên VNĐ.")
    add_body("  Bước 2: Tìm kiếm kho hàng nội bộ (Database Retrieval): Hàm findRelevantProducts() query MongoDB tìm đúng các linh kiện đang bán (status='active'), khớp danh mục (CPU, VGA, RAM...) và nằm trong tầm giá.")
    add_body("  Bước 3: Ghép ngữ cảnh (Prompt Augmentation): Đưa danh sách sản phẩm thực tế vừa tìm được vào System Prompt cho Google Generative AI.")
    add_body("  Bước 4: Sinh câu trả lời & Trả JSON: Gemini đóng vai trò chuyên gia tư vấn máy tính WINNOTech, đưa ra cấu hình tối ưu kèm link sản phẩm thực tế để khách bấm mua ngay.")

    add_h2("4.4 Máy trạng thái Đơn hàng (Order State Machine) & Hoàn tồn kho")
    add_body("Vòng đời đơn hàng trải qua 5 trạng thái chuẩn và 1 nhánh huỷ/hoàn tiền:")
    add_bullet("pending (Chờ xác nhận) ➔ preparing (Đang đóng gói) ➔ shipping (Bàn giao vận chuyển) ➔ delivered (Đã giao hàng) ➔ completed (Hoàn thành giao dịch).", "• Chu kỳ chuẩn: ")
    add_bullet("Nhánh Hủy (cancelled): Chỉ cho phép khi đơn ở trạng thái pending hoặc preparing. Khách hoặc Admin ấn hủy ➔ Server chạy $inc hoàn lại số lượng tồn kho (stock_quantity += Quantity). Nếu đơn đã trả VNPay ➔ Chuyển trạng thái sang refund_pending để kế toán hoàn tiền.", "• Cơ chế Hoàn kho: ")
    add_bullet("Vết kiểm toán (statusHistory): Mỗi lần chuyển trạng thái, hệ thống push một object vào mảng statusHistory gồm { status, note, changedBy, changedAt } để không ai có thể chối bỏ trách nhiệm.", "• Audit Trail: ")

    # =========================================================================
    # PHẦN 5: KỊCH BẢN THUYẾT TRÌNH BẢO VỆ CHINH PHỤC HỘI ĐỒNG (10-15 PHÚT)
    # =========================================================================
    add_h1("PHẦN 5: KỊCH BẢN THUYẾT TRÌNH BẢO VỆ CHINH PHỤC HỘI ĐỒNG (10 - 15 PHÚT)")
    
    add_callout(
        "Kịch bản được thiết kế theo cấu trúc 'Mở đầu ấn tượng ➔ Báo cáo kiến trúc ➔ Trình diễn Live Demo luồng khách hàng & quản trị ➔ Chốt hạ điểm sáng công nghệ'.\n"
        "Hãy nói với giọng to rõ, tự tin, đĩnh đạc và mắt nhìn thẳng vào Hội đồng.",
        "🎤 NGUYÊN TẮC THUYẾT TRÌNH ĐỈNH CAO",
        "tip"
    )

    add_h2("5.1 Lời thoại Mở đầu (1.5 phút)")
    add_callout(
        "\"Kính thưa Thầy/Cô Chủ tịch Hội đồng và quý Thầy/Cô trong Hội đồng phản biện!\n"
        "Em tên là [Họ và Tên], mã số sinh viên [MSSV]. Hôm nay, em xin phép được đại diện nhóm báo cáo đề tài tốt nghiệp: 'Xây dựng Hệ thống Thương mại Điện tử Linh kiện Máy tính, Cấu hình PC & Tích hợp Trợ lý Trí tuệ Nhân tạo WINNOTech'.\n"
        "Thưa Thầy Cô, xuất phát từ thực trạng thị trường phần cứng máy tính tại Việt Nam có độ phân mảnh cao, người dùng khi tự build PC rất dễ gặp tình trạng không tương thích linh kiện hoặc bị quá ngân sách; đồng thời các doanh nghiệp bán lẻ cần một hệ thống quản trị chặt chẽ từ đa biến thể, kiểm soát vòng đời đơn hàng đến phân tích dữ liệu kinh doanh real-time. WINNOTech ra đời nhằm giải quyết triệt để những bài toán trên bằng mô hình kiến trúc hiện đại MERN Stack kết hợp Google Gemini AI và Cổng thanh toán quốc gia VNPay.\"",
        "Lời thoại mở đầu đề tài"
    )

    add_h2("5.2 Giới thiệu Kiến trúc & Điểm nhấn Kỹ thuật (2 phút)")
    add_callout(
        "\"Về mặt kỹ thuật, hệ thống WINNOTech được xây dựng dựa trên 4 trụ cột chính:\n"
        "1. Kiến trúc Đa biến thể (Multi-variant E-Commerce) tách bạch giữa Product cha và ProductVariant con, giúp quản lý hàng nghìn mã SKU linh kiện với các thông số kỹ thuật (Specification) phục vụ công cụ so sánh trực quan.\n"
        "2. Bảo mật Cấp cao với cơ chế JWT sử dụng thuật toán khóa bất đối xứng RSA-256 (Private Key ký tại Server và Public Key xác thực tại Middleware), kết hợp Bcrypt băm mật khẩu.\n"
        "3. Trợ lý Trí tuệ Nhân tạo áp dụng mô hình RAG (Retrieval-Augmented Generation) kết nối Google Gemini API với cơ sở dữ liệu MongoDB thực tế để tư vấn cấu hình chính xác theo ngân sách.\n"
        "4. Quản trị vòng đời đơn hàng với Data Snapshot Pattern bảo toàn giá trị lịch sử và Socket.IO đồng bộ dữ liệu thời gian thực.\"",
        "Lời thoại tóm tắt kỹ thuật"
    )

    add_h2("5.3 Kịch bản Live Demo các tính năng cốt lõi (7 phút)")
    
    add_h3("Bước 1: Trải nghiệm Khách hàng & Chatbot AI RAG (2.5 phút)")
    add_bullet("Mở trang chủ WINNOTech: Giới thiệu giao diện Responsive hiện đại, Dark/Light Mode, các danh mục linh kiện (CPU, GPU, RAM, Mainboard...).", "1. ")
    add_bullet("Bấm vào biểu tượng Chatbot AI ở góc màn hình: Gõ câu lệnh thực tế: 'Tôi có ngân sách 15 triệu, hãy tư vấn cho tôi một dàn PC chơi game mượt mà'.", "2. ")
    add_callout(
        "\"Thưa Thầy Cô, ngay khi em gửi tin nhắn, hệ thống backend không gọi bừa vào AI mà thực thi Pipeline RAG: trích xuất số tiền 15 triệu, truy vấn trong MongoDB kho linh kiện thực tế tại cửa hàng, sau đó nạp vào context của Gemini để AI đề xuất đúng các linh kiện đang có hàng tại WINNOTech kèm link mua trực tiếp!\"",
        "Thuyết minh khi Chatbot trả lời"
    )
    add_bullet("Bấm vào linh kiện được tư vấn: Xem trang Chi tiết sản phẩm (ProductDetail), chọn các biến thể cấu hình (Dung lượng, Màu sắc). Giá và số lượng tồn kho tự động nhảy theo từng biến thể.", "3. ")

    add_h3("Bước 2: So sánh linh kiện & Đặt hàng, Voucher, VNPay (2.5 phút)")
    add_bullet("Mở tính năng So sánh (Compare): Chọn 2 card màn hình (ví dụ RTX 4060 vs RTX 3060). Hệ thống hiển thị bảng đối chiếu thông số kỹ thuật (VRAM, Xung nhịp, Chuẩn PCIe, Cổng xuất hình).", "1. ")
    add_bullet("Thêm vào giỏ hàng (Cart) ➔ Tiến hành Đặt hàng (Checkout):", "2. ")
    add_bullet("Tại trang Checkout: Nhập mã voucher khuyến mãi 'FRS50K'. Chỉ cho Hội đồng thấy: Phí vận chuyển lập tức được miễn phí 100% và tổng tiền được giảm chính xác theo công thức nghiệp vụ.", "3. ")
    add_bullet("Chọn phương thức thanh toán VNPay: Ấn 'Đặt hàng' ➔ Modal mã QR VNPay xuất hiện cùng đường link thanh toán Sandbox. Giải thích cơ chế băm chữ ký HMAC-SHA512.", "4. ")

    add_h3("Bước 3: Quản trị Admin & Lịch sử Đơn hàng, Audit Trail (2 phút)")
    add_bullet("Mở giao diện Khách hàng ➔ Vào Profile ➔ Lịch sử Đơn hàng: Đơn vừa đặt ở trạng thái 'pending'.", "1. ")
    add_bullet("Mở giao diện Admin (mở 2 tab trình duyệt song song để phô diễn Socket.IO):", "2. ")
    add_bullet("Admin vào trang Quản lý đơn hàng (Orders) ➔ Đổi trạng thái từ 'pending' sang 'preparing' và 'shipping':", "3. ")
    add_callout(
        "\"Thưa Thầy Cô, khi Admin cập nhật trạng thái đơn, bên màn hình của Khách hàng lập tức nhảy trạng thái theo thời gian thực nhờ Socket.IO mà không cần ấn F5 tải lại trang. Đồng thời, toàn bộ mốc thời gian và người thay đổi đều được ghi vết vào mảng statusHistory để phục vụ kiểm toán!\"",
        "Thuyết minh Socket.IO Real-time"
    )
    add_bullet("Admin vào trang Dashboard: Xem biểu đồ doanh thu trực quan vẽ bằng React Google Charts, thống kê đơn hàng, top sản phẩm bán chạy, và ấn nút 'Xuất báo cáo Excel' (ExcelJS).", "4. ")

    add_h2("5.4 Lời thoại Kết luận (1 phút)")
    add_callout(
        "\"Kính thưa Hội đồng! Dự án WINNOTech đã hoàn thành đầy đủ 100% các mục tiêu nghiên cứu và phát triển đặt ra: từ việc chuẩn hoá mô hình dữ liệu đa biến thể, áp dụng các kỹ thuật bảo mật hiện đại như RSA-256 JWT, tích hợp Cổng thanh toán quốc gia VNPay đến việc ứng dụng AI Generative theo mô hình RAG vào thương mại điện tử thực tế. Hệ thống vận hành ổn định, sẵn sàng mở rộng và đóng gói triển khai production.\n"
        "Em xin chân thành cảm ơn quý Thầy Cô đã chú ý lắng nghe! Em xin phép được lắng nghe các câu hỏi nhận xét và phản biện từ Hội đồng ạ!\"",
        "Lời thoại kết thúc thuyết trình"
    )

    # =========================================================================
    # PHẦN 6: BỘ 25 CÂU HỎI & TRẢ LỜI PHẢN BIỆN "CHỐNG TRƯỢT - SĂN ĐIỂM 10"
    # =========================================================================
    add_h1("PHẦN 6: BỘ 25 CÂU HỎI & CÂU TRẢ LỜI PHẢN BIỆN (CHỐNG TRƯỢT MÔN & ĐIỂM CAO)")

    add_callout(
        "Dưới đây là 25 câu hỏi được đúc kết từ các câu hỏi 'tủ' mà các Giảng viên và Hội đồng chấm đồ án hay hỏi nhất. Mỗi câu hỏi đều có câu trả lời mẫu ngắn gọn, tự tin, đúng thuật ngữ chuyên ngành công nghệ.",
        "🔥 25 CÂU HỎI KINH ĐIỂN CỦA HỘI ĐỒNG PHẢN BIỆN",
        "tip"
    )

    qa_list = [
        # NHÓM 1: CƠ SỞ DỮ LIỆU & KIẾN TRÚC LƯU TRỮ
        (
            "Câu 1: Tại sao em lại chọn NoSQL MongoDB thay vì cơ sở dữ liệu quan hệ như MySQL hay PostgreSQL?",
            "Dạ thưa Thầy/Cô, hệ thống WINNOTech chọn MongoDB vì 3 lý do kỹ thuật:\n"
            "1. Đặc thù linh kiện máy tính có cấu trúc thông số kỹ thuật (Specification) rất đa dạng và biến đổi linh hoạt (RAM có bus, CPU có socket/số nhân, Nguồn có công suất). Cấu trúc BSON của MongoDB cho phép lưu trữ và mở rộng thuộc tính linh hoạt hơn bảng cố định của RDBMS.\n"
            "2. Hỗ trợ mô hình Document nhúng (Embedded Document) cực tốt, ví dụ mảng vết lịch sử đơn hàng 'statusHistory' hoặc 'admin_notes' được nhúng trực tiếp trong document Order, giúp lấy toàn bộ tiến trình đơn chỉ bằng 1 câu query duy nhất mà không cần JOIN nhiều bảng phức tạp.\n"
            "3. Tốc độ đọc ghi (Read/Write performance) cực cao, kết hợp hoàn hảo với môi trường Node.js qua định dạng JSON tự nhiên."
        ),
        (
            "Câu 2: Data Snapshot Pattern trong hệ thống của em là gì? Tại sao phải áp dụng?",
            "Dạ, Data Snapshot Pattern là kỹ thuật 'chụp lại dữ liệu tại thời điểm phát sinh giao dịch'.\n"
            "Cụ thể trong hệ thống của em: Khi khách đặt hàng, giá bán của sản phẩm tại thời điểm đó được copy và lưu cố định vào trường 'OrderItem.price', đồng thời địa chỉ, tên, SĐT của khách cũng được lưu thẳng vào document 'Order'.\n"
            "Tác dụng: Sau này nếu Admin có tăng giá sản phẩm, giảm giá, hoặc thậm chí xoá sản phẩm đó khỏi kho, thì lịch sử đơn hàng cũ vẫn hiển thị đúng số tiền mà khách đã trả. Nếu không dùng Snapshot mà chỉ lưu ID tham chiếu tới Product, khi Admin sửa giá thì toàn bộ đơn hàng trong quá khứ sẽ bị sai lệch doanh thu tài chính."
        ),
        (
            "Câu 3: Tại sao lại tách thành 2 collection 'orders' và 'orderitems' mà không nhúng thẳng các item vào trong Order?",
            "Dạ thưa Thầy Cô, việc tách 2 collection mang lại 2 lợi ích kiến trúc:\n"
            "1. Tối ưu kích thước Document: Khi Admin hoặc Khách hàng xem danh sách đơn hàng (Listing page), hệ thống chỉ cần query collection 'orders' gọn nhẹ để hiển thị mã đơn, tổng tiền, ngày đặt, trạng thái mà không phải tải toàn bộ chi tiết linh kiện nặng nề.\n"
            "2. Độc lập nghiệp vụ Đánh giá (Review): Trong hệ thống của em, mỗi đánh giá sản phẩm (Review) liên kết trực tiếp với từng 'order_item' riêng biệt để xác thực khách đã mua món đồ đó. Tách collection giúp tạo mối quan hệ tham chiếu rõ ràng và dễ dàng thực hiện Aggregation thống kê."
        ),
        (
            "Câu 4: Khi 2 người dùng cùng lúc bấm mua một sản phẩm chỉ còn tồn kho đúng 1 cái (Race condition / Concurrency), hệ thống xử lý thế nào?",
            "Dạ thưa Thầy Cô, trong MongoDB em sử dụng toán tử nguyên tử (Atomic Operator) '$inc' kết hợp với điều kiện kiểm tra tồn kho trực tiếp trong câu lệnh update:\n"
            "ProductVariant.findOneAndUpdate({ _id: variantId, stock_quantity: { $gte: quantity } }, { $inc: { stock_quantity: -quantity } })\n"
            "Vì MongoDB đảm bảo tính nguyên tử (Atomicity) ở cấp độ Document, nếu 2 request tới cùng lúc, câu lệnh đầu tiên sẽ trừ tồn kho về 0 thành công, câu lệnh thứ hai sẽ không thỏa mãn điều kiện 'stock_quantity >= 1' nên trả về null. Khi đó hệ thống bắt được lỗi và thông báo cho người thứ hai rằng: 'Sản phẩm vừa hết hàng'."
        ),
        (
            "Câu 5: Trong MongoDB em đánh chỉ mục (Index) ở những trường nào? Tại sao?",
            "Dạ, em đánh Index ở các trường thường xuyên dùng để tìm kiếm, lọc và sắp xếp:\n"
            "1. 'Product.slug' và 'Order.code': Đánh chỉ mục Unique Index để truy vấn chi tiết sản phẩm và đơn hàng đạt độ phức tạp O(1).\n"
            "2. 'Product.cat_id' và 'Product.brand_id': Đánh Index để tăng tốc độ lọc danh mục linh kiện.\n"
            "3. 'ProductVariant.p_id': Đánh Index để join nhanh giữa sản phẩm cha và các biến thể con.\n"
            "4. 'Order.user_id' và 'Order.status': Đánh Compound Index để trang Lịch sử đơn hàng của người dùng load tức thì."
        ),

        # NHÓM 2: BẢO MẬT & XÁC THỰC (AUTHENTICATION & SECURITY)
        (
            "Câu 6: Cơ chế đăng nhập và xác thực của hệ thống hoạt động như thế nào? JWT lưu ở đâu?",
            "Dạ thưa Thầy Cô, hệ thống sử dụng kiến trúc Token-based Authentication:\n"
            "1. Khi người dùng đăng nhập bằng email & password, server tìm User và dùng 'bcrypt.compare()' để kiểm tra mật khẩu đã băm.\n"
            "2. Nếu khớp, server sinh ra một chuỗi JSON Web Token (JWT) chứa payload: { _id, email, role }.\n"
            "3. Token này được ký bằng thuật toán RSA bất đối xứng RS256 và gửi về client. Client lưu vào localStorage hoặc HttpOnly Cookie.\n"
            "4. Trong mỗi request tiếp theo, client đính kèm token trong HTTP Header 'Authorization: Bearer <token>'.\n"
            "5. Middleware 'AuthMiddleware' ở backend sẽ giải mã token bằng Public Key để xác định danh tính và quyền hạn của người dùng."
        ),
        (
            "Câu 7: Tại sao dự án của em dùng JWT RS256 thay vì HS256 thông thường?",
            "Dạ thưa Thầy Cô, đây là một điểm nhấn bảo mật nâng cao của dự án:\n"
            "• HS256 là thuật toán đối xứng (Symmetric), chỉ dùng 1 chuỗi bí mật (Secret Key) cho cả việc ký và xác thực token. Nếu Secret Key bị lộ, bất kỳ ai cũng có thể giả mạo token.\n"
            "• RS256 là thuật toán bất đối xứng (Asymmetric), sử dụng một cặp khóa Private Key và Public Key. Server chỉ dùng Private Key (được bảo vệ tuyệt mật tại thư mục key/privatekey.pem) để ký token khi login, còn các microservice hoặc middleware xác thực chỉ cần đọc Public Key (publickey.crt) để kiểm tra. Cho dù Public Key có công khai thì kẻ tấn công cũng không thể tạo ra token giả mạo."
        ),
        (
            "Câu 8: Hệ thống của em phòng chống tấn công NoSQL Injection như thế nào?",
            "Dạ thưa Thầy Cô, em áp dụng 3 lớp bảo vệ:\n"
            "1. Sử dụng Mongoose Schema: Mongoose tự động ép kiểu (Type Casting) dữ liệu đầu vào theo Schema định sẵn. Nếu kẻ tấn công truyền object độc hại dạng { '$gt': '' } vào trường String, Mongoose sẽ tự động từ chối hoặc ép về chuỗi.\n"
            "2. Validate dữ liệu đầu vào chặt chẽ bằng middleware trước khi đưa vào câu truy vấn.\n"
            "3. Tránh hoàn toàn việc ghép chuỗi trực tiếp vào query MongoDB, luôn sử dụng Object Query chuẩn của Mongoose."
        ),
        (
            "Câu 9: Quá trình Quên mật khẩu qua OTP được bảo mật ra sao?",
            "Dạ, quy trình gồm 4 bước bảo mật:\n"
            "1. Khách gửi yêu cầu quên mật khẩu, server sinh mã OTP ngẫu nhiên 6 chữ số bằng hàm 'crypto.randomInt(100000, 999999)'.\n"
            "2. Lưu mã OTP này vào User cùng trường thời gian hết hạn 'resetPasswordExpires' (chỉ có hiệu lực trong đúng 10 phút).\n"
            "3. Gửi OTP qua email cá nhân của khách bằng Nodemailer.\n"
            "4. Khi khách nhập OTP để đặt mật khẩu mới, server kiểm tra: nếu đúng mã và thời gian chưa vượt quá 'resetPasswordExpires' thì mới cho phép đổi mật khẩu, đồng thời xóa ngay OTP trong DB để mã không thể tái sử dụng."
        ),

        # NHÓM 3: NGHIỆP VỤ E-COMMERCE & THANH TOÁN
        (
            "Câu 10: Trình bày chi tiết luồng thanh toán VNPay từ khi ấn Đặt hàng đến khi hoàn tất?",
            "Dạ thưa Thầy Cô, luồng thanh toán VNPay gồm các bước:\n"
            "1. Tại trang Checkout, khách chọn 'Thanh toán qua VNPay' và ấn Đặt hàng.\n"
            "2. Frontend gọi API POST /order/create_payment_url. Backend gom các tham số: mã đơn, số tiền * 100, mã cửa hàng vnp_TmnCode, IP, ngày tạo, URL trả về vnp_ReturnUrl.\n"
            "3. Backend sắp xếp tham số theo alphabet (sortObject) và dùng khóa vnp_HashSecret băm HMAC-SHA512 tạo ra chữ ký vnp_SecureHash.\n"
            "4. Backend trả về URL cổng VNPay và mã QR (thư viện qrcode). Khách dùng app ngân hàng quét mã.\n"
            "5. Khi khách thanh toán xong trên hệ sinh thái ngân hàng, VNPay redirect trình duyệt về 'vnp_ReturnUrl'. Frontend đón tham số tại PaymentResult.jsx.\n"
            "6. Backend kiểm tra chữ ký trả về xem có bị giả mạo không, nếu chữ ký hợp lệ và vnp_ResponseCode == '00', hệ thống cập nhật Order.payment_status = 'paid' và bắn thông báo Socket.IO thành công."
        ),
        (
            "Câu 11: Sự khác nhau giữa VNPay Return URL và VNPay IPN (Instant Payment Notification)?",
            "Dạ, đây là 2 cơ chế nhận kết quả thanh toán của VNPay:\n"
            "• Return URL: Là đường dẫn người dùng được trình duyệt điều hướng quay lại website sau khi thanh toán. Cơ chế này phụ thuộc vào người dùng (nếu người dùng thanh toán xong mà tắt trình duyệt luôn hoặc mất mạng thì website không nhận được kết quả).\n"
            "• IPN (Webhook): Là cơ chế Server-to-Server. Máy chủ của VNPay chủ động gọi ngầm một HTTP POST request trực tiếp đến API của server WINNOTech. Cơ chế này hoạt động độc lập với người dùng, đảm bảo 100% đơn hàng được cập nhật trạng thái thanh toán ngay cả khi khách đóng app."
        ),
        (
            "Câu 12: Khi người dùng bấm 'Hủy đơn hàng', hệ thống xử lý những gì ngầm bên dưới?",
            "Dạ thưa Thầy Cô, khi bấm Hủy đơn, backend thực hiện chuỗi xử lý nghiêm ngặt:\n"
            "1. Guard Check: Kiểm tra đơn hàng có đúng là của người dùng đó không, và trạng thái hiện tại bắt buộc phải là 'pending' hoặc 'preparing'. Nếu đơn đã 'shipping' thì từ chối hủy.\n"
            "2. Cập nhật trạng thái: Đổi Order.status = 'cancelled'.\n"
            "3. Hoàn tồn kho tự động: Query tất cả OrderItem của đơn hàng đó, duyệt qua từng món và thực thi toán tử: ProductVariant.findByIdAndUpdate(variants_id, { $inc: { stock_quantity: Quantity } }). Tồn kho được phục hồi ngay lập tức.\n"
            "4. Xử lý tài chính: Nếu đơn thanh toán COD ➔ chuyển payment_status = 'canceled'. Nếu đơn đã thanh toán VNPay ➔ chuyển payment_status = 'refund_pending' để kế toán hoàn tiền.\n"
            "5. Ghi vết kiểm toán: Push vào mảng statusHistory với ghi chú 'Khách hàng hủy đơn'."
        ),
        (
            "Câu 13: Giải thích logic phân biệt Voucher FRS và Voucher SHIP trong code của em?",
            "Dạ thưa Thầy Cô, logic này nằm tại hàm calculateVoucherDiscount trong server.js:\n"
            "• Nếu mã chứa 'FRS' (Freeship): Khách được miễn 100% phí ship (shippingDiscount = baseShippingFee), đồng thời phần giá trị voucher (% hoặc tiền cố định) vẫn được trừ tiếp vào giá sản phẩm.\n"
            "• Nếu mã chứa 'SHIP': Voucher này chỉ tài trợ tiền ship. Giá trị giảm giá chỉ được trừ tối đa bằng đúng tiền ship thực tế, TUYỆT ĐỐI KHÔNG trừ vào tiền sản phẩm.\n"
            "• Điều này giúp doanh nghiệp linh hoạt trong các chiến dịch marketing: tặng mã trợ giá ship riêng hoặc tặng mã giảm giá sản phẩm riêng."
        ),

        # NHÓM 4: TRÍ TUỆ NHÂN TẠO (AI CHATBOT) & TÍNH NĂNG NÂNG CAO
        (
            "Câu 14: Chatbot AI của em có phải là gọi API thuần túy của OpenAI/Gemini không? RAG là gì?",
            "Dạ thưa Thầy Cô, hoàn toàn KHÔNG PHẢI gọi API thuần túy ạ! Nếu chỉ gọi API thuần, AI sẽ không biết cửa hàng WINNOTech đang có những sản phẩm nào, giá bao nhiêu và sẽ tư vấn sai lệch.\n"
            "Hệ thống của em triển khai mô hình RAG (Retrieval-Augmented Generation) gồm 3 bước:\n"
            "1. Retrieval (Truy xuất): Khi khách hỏi 'Tư vấn PC 15 triệu', backend phân tích câu nói bằng hàm parseBudgetFromMessage() lấy ra 15,000,000đ. Sau đó backend truy vấn trực tiếp vào Database MongoDB của WINNOTech để tìm các linh kiện thật đang có sẵn trong kho thỏa mãn tiêu chí.\n"
            "2. Augmentation (Bổ sung ngữ cảnh): Backend nạp danh sách linh kiện vừa tìm được vào Prompt gửi cho Google Gemini AI với vai trò System Prompt: 'Bạn là chuyên gia máy tính WINNOTech, hãy dùng các sản phẩm sau đây để lên cấu hình cho khách...'.\n"
            "3. Generation (Sinh câu trả lời): Gemini tổng hợp thông tin và sinh ra lời tư vấn chuẩn xác kèm link sản phẩm thật của website để khách bấm mua."
        ),
        (
            "Câu 15: Nếu mất kết nối Internet hoặc hết hạn Gemini API Key thì Chatbot có bị crash không?",
            "Dạ hoàn toàn không bị crash ạ. Trong code routers/AI_chatbot.js em đã bọc toàn bộ khối gọi AI trong 'try...catch' và xây dựng cơ chế Fallback thông minh (Fallback Rule-based Engine):\n"
            "Nếu Gemini trả về lỗi (mất mạng, lỗi quota 429 hoặc sai key), hệ thống sẽ tự động chuyển sang bộ quy tắc dự phòng: Lấy danh sách sản phẩm tìm được trong MongoDB, tạo mẫu câu trả lời gợi ý mặc định và trả về cho client. Trải nghiệm người dùng vẫn mượt mà và server không bao giờ bị dừng đột ngột."
        ),
        (
            "Câu 16: Tính năng So sánh linh kiện (Compare) hoạt động như thế nào?",
            "Dạ, tính năng So sánh dựa trên Collection 'Specification':\n"
            "Mỗi sản phẩm linh kiện khi Admin nhập vào đều có bộ thông số kỹ thuật (Specification) liên kết với các AttributeValue (Ví dụ: Socket, Số nhân, Xung nhịp, Chuẩn RAM, Công suất tiêu thụ).\n"
            "Khi khách chọn 2 sản phẩm cùng danh mục đưa vào bảng so sánh (Compare), frontend gọi API lấy toàn bộ Specifications của cả 2 sản phẩm, sau đó sắp xếp thông số theo từng hàng tương ứng để người dùng đối chiếu trực quan điểm mạnh/yếu của từng linh kiện."
        ),
        (
            "Câu 17: Socket.IO được áp dụng ở những phân hệ nào trong dự án?",
            "Dạ, Socket.IO được áp dụng để đồng bộ Real-time 2 chiều:\n"
            "1. Khi khách đặt đơn mới hoặc hủy đơn: Server phát sự kiện 'order_status_updated' tới room của Admin, trang Quản lý đơn hàng của Admin lập tức cập nhật đơn mới mà không cần F5.\n"
            "2. Khi Admin đổi trạng thái đơn (duyệt đơn, giao hàng): Server phát sự kiện tới đúng socket client của khách hàng sở hữu đơn đó, thông báo trạng thái đơn hàng nhảy lập tức trên màn hình của khách.\n"
            "3. Cập nhật số lượng Voucher thời gian thực khi có người thu thập hoặc dùng hết."
        ),
        (
            "Câu 18: Thư viện nào được dùng để xuất file Báo cáo Excel và Hoá đơn PDF?",
            "Dạ thưa Thầy Cô:\n"
            "• Xuất Báo cáo Doanh thu Admin: Em sử dụng thư viện 'exceljs'. Server gom dữ liệu đơn hàng bằng Mongoose Aggregation, tạo workbook, định dạng cột, tiêu đề in đậm, tô màu header và streaming file binary về client tải xuống.\n"
            "• In Hoá đơn Giao hàng: Em sử dụng thư viện 'pdfkit'. Server vẽ cấu trúc hoá đơn gồm logo WINNOTech, thông tin khách hàng, bảng danh sách linh kiện và mã vạch/QR code theo toạ độ vector, sau đó xuất ra luồng PDF chuẩn để in nhiệt hoặc in A4."
        ),

        # NHÓM 5: FRONTEND, REDUX & QUẢN LÝ TRẠNG THÁI
        (
            "Câu 19: Tại sao giỏ hàng (Cart) lại vừa quản lý bằng Redux Toolkit ở Client vừa lưu trong MongoDB ở Backend?",
            "Dạ thưa Thầy Cô, đây là mô hình Hybrid Cart State:\n"
            "• Redux Toolkit ở Client: Đảm bảo giao diện người dùng phản hồi tức thì (Instant UI feedback). Khi khách bấm 'Thêm vào giỏ', icon giỏ hàng trên Header nhảy số lượng ngay mà không có độ trễ mạng.\n"
            "• Lưu trong MongoDB (Collection CartItem): Giúp duy trì giỏ hàng bền vững (Persistence). Khi khách tắt trình duyệt, đổi thiết bị từ điện thoại sang laptop hoặc đăng nhập lại sau vài ngày, các món đồ trong giỏ hàng vẫn còn nguyên vẹn."
        ),
        (
            "Câu 20: Em phân quyền giữa Khách vãng lai, Người dùng và Quản trị viên ở Frontend như thế nào?",
            "Dạ, em sử dụng cơ chế Route Guards của React Router DOM:\n"
            "1. 'GuestGuard': Dành cho trang Login/Register. Nếu người dùng đã có token trong localStorage thì tự động redirect về trang chủ, không cho vào lại trang login.\n"
            "2. 'AdminGuard': Bọc quanh toàn bộ các route '/admin/*'. Guard này giải mã token để kiểm tra: nếu không có token hoặc user.role !== 'admin' thì lập tức chặn lại và điều hướng về trang chủ.\n"
            "3. Đồng thời ở Backend, tất cả các API nhạy cảm của Admin đều được bọc bởi middleware kiểm tra quyền hạn, đảm bảo bảo mật 2 lớp từ giao diện tới server."
        ),
        (
            "Câu 21: React Google Charts trong trang Dashboard lấy dữ liệu từ đâu?",
            "Dạ, trong trang Admin Dashboard, frontend gọi API 'GET /api/admin/revenue-chart'.\n"
            "Backend sử dụng Aggregation Pipeline của MongoDB để gom nhóm ($group) đơn hàng theo ngày/tháng với điều kiện status = 'completed' và payment_status = 'paid', tính tổng tiền ($sum: '$total_amount'). Sau đó backend format dữ liệu thành mảng 2 chiều dạng: [['Ngày', 'Doanh thu'], ['2026-09-01', 15000000], ...] để React Google Charts render biểu đồ đường (LineChart) và biểu đồ cột (ColumnChart)."
        ),

        # NHÓM 6: TRIỂN KHAI, HIỆU NĂNG & HƯỚNG PHÁT TRIỂN
        (
            "Câu 22: Nếu hệ thống có 100,000 sản phẩm và hàng triệu đơn hàng, em sẽ tối ưu hiệu năng như thế nào?",
            "Dạ thưa Thầy Cô, em sẽ triển khai 4 giải pháp tối ưu:\n"
            "1. Áp dụng Phân trang (Pagination) triệt để với cursor-based pagination hoặc skip/limit có index.\n"
            "2. Caching với Redis: Các dữ liệu ít biến động như Danh mục, Hãng sản xuất, Cấu hình trang chủ sẽ được lưu vào bộ nhớ Redis Cache với TTL 1 giờ, giảm 80% tải truy vấn vào MongoDB.\n"
            "3. Tối ưu hình ảnh: Đưa ảnh lên Cloudinary hoặc AWS S3, áp dụng định dạng WebP và CDN (Cloudflare) để tải ảnh cực nhanh.\n"
            "4. Đọc ghi tách biệt (Read-Write Separation): Cấu hình MongoDB Replica Set, các thao tác đọc báo cáo/tìm kiếm sẽ đọc từ Secondary Node, chỉ thao tác đặt hàng mới ghi vào Primary Node."
        ),
        (
            "Câu 23: Làm thế nào em chứng minh toàn bộ mã nguồn này do chính em/nhóm em thực hiện?",
            "Dạ thưa Thầy Cô:\n"
            "1. Em nắm rõ từng file, từng dòng code và luồng dữ liệu từ React Component tới Model Mongoose.\n"
            "2. Thầy Cô có thể chỉ định bất kỳ chức năng nào, em sẵn sàng mở code, giải thích luồng biến, thêm một thuộc tính mới hoặc thay đổi logic nghiệp vụ trực tiếp và chạy demo lại ngay trước Hội đồng.\n"
            "3. Toàn bộ lịch sử commit trong kho Git của dự án đều thể hiện quá trình phát triển liên tục từng tính năng từ ngày đầu tiên đến khi hoàn thiện."
        ),
        (
            "Câu 24: Điểm hạn chế hiện tại của dự án là gì và hướng phát triển tiếp theo?",
            "Dạ thưa Thầy Cô:\n"
            "• Hạn chế hiện tại: Tính năng Build PC tự động kiểm tra tương thích phần cứng giữa Mainboard và CPU mới chỉ dựa trên một số thuộc tính cơ bản (Socket, Form factor), chưa tính toán được chi tiết xung đột chiều dài card đồ họa với kích thước vỏ case.\n"
            "• Hướng phát triển tiếp theo: Nâng cấp thuật toán kiểm tra tương thích phần cứng bằng Rule Engine chuyên sâu; tích hợp thêm hình thức thanh toán MoMo, ZaloPay; và huấn luyện riêng mô hình AI Chatbot Fine-tuning trên tập dữ liệu phần cứng chuyên sâu của WINNOTech."
        ),
        (
            "Câu 25: Em đã học được những kiến thức và kỹ năng gì quý giá nhất sau khi hoàn thành dự án này?",
            "Dạ thưa Thầy Cô, dự án WINNOTech đã giúp em trưởng thành vượt bậc về kỹ năng kỹ thuật và tư duy kiến trúc phần mềm:\n"
            "1. Tư duy thiết kế Cơ sở dữ liệu thực tế: Hiểu sâu sắc sự khác biệt giữa lý thuyết và thực chiến, biết cách dùng Data Snapshot Pattern để bảo toàn dữ liệu tài chính.\n"
            "2. Kỹ năng làm chủ Fullstack: Tự tin xây dựng một hệ thống hoàn chỉnh từ giao diện React, quản lý state Redux đến Backend Node.js bảo mật bằng RSA JWT.\n"
            "3. Kỹ năng tích hợp công nghệ mới: Biết cách đưa Trí tuệ Nhân tạo thế hệ mới (Gemini AI RAG) và Cổng thanh toán quốc gia VNPay vào giải quyết bài toán kinh doanh cụ thể."
        )
    ]

    for q, a in qa_list:
        add_h2(q)
        add_callout(a, "💡 Câu trả lời chuẩn mực trước Hội đồng", "info")

    # =========================================================================
    # PHẦN 7: CHIẾN THUẬT PHÒNG THI & KỸ NĂNG XỬ LÝ TÌNH HUỐNG
    # =========================================================================
    add_h1("PHẦN 7: CHIẾN THUẬT PHÒNG THI & TÂM LÝ CHIẾN (TRÁNH BỊ BẮT BẺ)")

    add_h2("7.1 Checklist chuẩn bị trước giờ G (Tuyệt đối không được quên)")
    add_bullet("Khởi động sẵn MongoDB Local: Mở Service MongoDB hoặc chạy lệnh mongod, bật MongoDB Compass kiểm tra đã thấy database WINNOTech chưa.", "1. Database: ")
    add_bullet("Bật Backend Server trước: Chạy 'npm run dev' hoặc 'node server.js' tại thư mục WINNOTech. Kiểm tra log hiển thị 'Server running on port 3000' và 'Connected to MongoDB'.", "2. Backend: ")
    add_bullet("Bật Frontend: Chạy 'npm run dev' tại thư mục frontend. Mở sẵn trình duyệt ở cổng 5173.", "3. Frontend: ")
    add_bullet("Mở sẵn 2 trình duyệt riêng biệt (hoặc 1 thường, 1 ẩn danh Incognito): Một bên đăng nhập tài khoản Khách hàng, một bên đăng nhập tài khoản Quản trị Admin để sẵn sàng demo Socket.IO đổi trạng thái đơn tức thời.", "4. Trình duyệt Demo: ")
    add_bullet("Mở sẵn VS Code: Mở sẵn 3 file quan trọng nhất: server.js, routers/AI_chatbot.js, và models/Order.js để khi thầy cô hỏi chỉ cần Alt+Tab qua chỉ đúng dòng code.", "5. Mã nguồn: ")

    add_h2("7.2 Chiến thuật trả lời khi gặp câu hỏi hóc búa hoặc chưa chuẩn bị")
    add_callout(
        "TUYỆT ĐỐI KHÔNG BAO GIỜ NÓI: 'Em không biết' hoặc im lặng quá 5 giây!\n"
        "HÃY ÁP DỤNG CÔNG THỨC 3 BƯỚC CHUYÊN NGHIỆP:\n"
        "• Bước 1 (Ghi nhận): 'Dạ, đây là một câu hỏi rất hay và mang tính thực tế rất cao của Thầy/Cô ạ.'\n"
        "• Bước 2 (Nêu hướng tiếp cận): 'Trong phạm vi phiên bản hiện tại của đồ án, nhóm em đang ưu tiên xử lý bài toán X bằng giải pháp Y để đảm bảo tính ổn định...'\n"
        "• Bước 3 (Mở rộng): 'Về vấn đề Thầy/Cô vừa chỉ ra, em nhận thấy hoàn toàn có thể tối ưu bằng cách [nêu hướng như dùng Redis, Queue BullMQ, Kafka...]. Em xin phép được tiếp thu ý kiến quý báu này của Thầy/Cô để nâng cấp hệ thống trong giai đoạn tiếp theo ạ!'",
        "🎯 NGHỆ THUẬT XỬ LÝ CÂU HỎI KHÓ TRƯỚC HỘI ĐỒNG",
        "warning"
    )

    add_h2("7.3 Lời chúc & Cam kết")
    add_callout(
        "Bạn đã nắm trong tay toàn bộ bản đồ kiến trúc, mã nguồn, cơ sở dữ liệu và 25 câu hỏi phản biện chi tiết nhất của dự án WINNOTech.\n"
        "Hãy bước vào phòng thi với tâm thế của một Kỹ sư Phần mềm thực thụ - người đã làm chủ toàn bộ sản phẩm của mình từ dòng code đầu tiên đến tính năng cuối cùng.\n"
        "CHÚC BẠN BẢO VỆ DỰ ÁN THÀNH CÔNG RỰC RỠ VÀ ĐẠT ĐIỂM SỐ XUẤT SẮC NHẤT!",
        "🏆 CHÚC BẠN ĐẠT ĐIỂM 10 TUYỆT ĐỐI!",
        "tip"
    )

    # Lưu tài liệu
    output_filename = "HUONG_DAN_THUYET_TRINH_VA_BAO_VE_DU_AN_WINNOTECH_DIEM_CAO.docx"
    output_path = os.path.join(os.path.dirname(__file__), output_filename)
    doc.save(output_path)
    print(f"Document created successfully at: {output_path}")

if __name__ == "__main__":
    create_document()
