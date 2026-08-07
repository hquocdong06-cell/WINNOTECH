# BÁO CÁO DỰ ÁN TỐT NGHIỆP
## ĐỀ TÀI: PHÁT TRIỂN WEBSITE THƯƠNG MẠI ĐIỆN TỬ SẢN PHẨM CÔNG NGHỆ VÀ LINH KIỆN MÁY TÍNH WINNOTECH
**Tên tiếng Anh:** WINNOTech – Development of a Technology Products and Computer Components Business Website

* **Trường / Cơ sở:** Trường Cao đẳng FPT Polytechnic TP.HCM
* **Chuyên ngành:** Công nghệ thông tin (Lập trình Web / Full-Stack Web Development)
* **Giảng viên hướng dẫn:** Thầy Trần Bá Hộ
* **Nhóm sinh viên thực hiện:** Nhóm WINNOTech
  * PS44881 – Hồ Quốc Đông (Trưởng nhóm - Backend Lead & DB Architect)
  * PS44633 – [Cần bổ sung Họ và Tên sinh viên] (Frontend Developer - React/Vite UI)
  * PS44860 – [Cần bổ sung Họ và Tên sinh viên] (Frontend Developer - Build PC & Cart Logic)
  * PS[Mã SV] – [Cần bổ sung Họ và Tên sinh viên] (Tester & Technical Writer)

---

### DỰ ÁN ĐƯỢC THỰC HIỆN TẠI
**CÔNG TY TNHH CÔNG NGHỆ WINNOTECH**  
**Địa chỉ:** Thành phố Hồ Chí Minh, Việt Nam  
**Năm hoàn thành:** 2026

---

## LỜI CẢM ƠN

Trước tiên, nhóm sinh viên thực hiện dự án **WINNOTech** xin gửi lời cảm ơn chân thành và sâu sắc nhất đến Ban Giám hiệu cùng toàn thể quý Thầy, Cô giáo bộ môn Công nghệ thông tin – Trường Cao đẳng FPT Polytechnic TP.HCM, những người đã tận tình truyền đạt tri thức, kinh nghiệm thực tiễn và tạo mọi điều kiện thuận lợi cho chúng em trong suốt quá trình học tập và rèn luyện.

Đặc biệt, nhóm chúng em xin bày tỏ lòng biết ơn sâu sắc đến **Thầy Trần Bá Hộ**, giảng viên trực tiếp hướng dẫn dự án tốt nghiệp. Thầy đã dành nhiều thời gian, tâm huyết để định hướng đề tài, góp ý kiến chuyên môn quý báu, chỉ ra những hạn chế và luôn động viên nhóm vượt qua những khó khăn về mặt logic nghiệp vụ lẫn công nghệ trong quá trình hoàn thiện sản phẩm.

Dù đã dành nhiều tâm huyết và nỗ lực để xây dựng hệ thống website thương mại điện tử WINNOTech hoàn chỉnh nhất có thể, song do giới hạn về mặt thời gian và kinh nghiệm thực tế, báo cáo này không tránh khỏi những thiếu sót nhất định. Nhóm chúng em rất mong nhận được những ý kiến đóng góp, nhận xét và định hướng quý báu từ quý Thầy, Cô trong Hội đồng phản biện để sản phẩm ngày càng được hoàn thiện và nâng cao tính ứng dụng thực tiễn.

Chúng em xin chân thành cảm ơn!

---

## MỤC LỤC TỔNG QUAN

1. [DANH MỤC TỪ VIẾT TẮT VÀ THUẬT NGỮ](#danh-mục-từ-viết-tắc-và-thuật-ngữ)
2. [DANH MỤC HÌNH ẢNH VÀ BẢNG BIỂU](#danh-mục-hình-ảnh-và-bảng-biểu)
3. [LỜI MỞ ĐẦU](#lời-mở-đầu)
4. [NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN](#nhận-xét-của-giảng-viên-hướng-dẫn)
5. [NHẬN XÉT CỦA HỘI ĐỒNG PHẢN BIỆN](#nhận-xét-của-hội-đồng-phản-biện)
6. [PHẦN 1 – GIỚI THIỆU VÀ KHẢO SÁT ĐỀ TÀI](#phần-1--giới-thiệu-và-khảo-sát-đề-tài)
   - 1.1. Giới thiệu tổng quan về thương hiệu WINNOTech
   - 1.2. Lý do chọn đề tài và Tính cấp thiết của dự án
   - 1.3. Mục tiêu dự án (Mục tiêu Kỹ thuật & Kinh doanh)
   - 1.4. Đối tượng và Phạm vi nghiên cứu
   - 1.5. Phương pháp nghiên cứu và Mô hình phát triển dự án Agile/Scrum
7. [PHẦN 2 – KHẢO SÁT HỆ THỐNG VÀ PHÂN TÍCH NHU CẦU](#phần-2--khảo-sát-hệ-thống-và-phân-tích-nhu-cầu)
   - 2.1. Khảo sát hiện trạng kinh doanh thiết bị công nghệ
   - 2.2. Phân tích đối thủ cạnh tranh & Lợi thế cạnh tranh (USP) của WINNOTech
   - 2.3. Yêu cầu bài toán và Đặc tả chức năng phân hệ Khách hàng (Client Frontend)
   - 2.4. Yêu cầu bài toán và Đặc tả chức năng phân hệ Quản trị viên (Admin Dashboard)
   - 2.5. Các yêu cầu phi chức năng (Hiệu năng, Bảo mật, UI/UX, SEO)
8. [PHẦN 3 – PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#phần-3--phân-tích-và-thiết-kế-hệ-thống)
   - 3.1. Thiết kế Sơ đồ Usecase và Đặc tả Chi tiết
   - 3.2. Sơ đồ Tuần tự (Sequence Diagrams) cho các Luồng xử lý quan trọng
   - 3.3. Mô hình Kiến trúc Triển khai (Client-Server RESTful API decoupled)
   - 3.4. Thiết kế Chi tiết Cơ sở dữ liệu MongoDB (Detailed Mongoose Schemas & Collections)
   - 3.5. Thiết kế Giao diện Sitemap và Luồng trải nghiệm Người dùng (UI/UX Figma)
9. [PHẦN 4 – THỰC THI VÀ PHÁT TRIỂN ỨNG DỤNG](#phần-4--thực-thi-và-phát-triển-ứng-dụng)
   - 4.1. Mô hình và Tập hợp Công nghệ Sử dụng (Technology Stack Details)
   - 4.2. Cấu trúc Thư mục Dự án Frontend và Backend
   - 4.3. Tài liệu Cấu trúc RESTful API Chi tiết (Chi tiết hơn 40 API Endpoints)
   - 4.4. Giải pháp Kỹ thuật và Thuật toán Nổi bật trong Dự án
10. [PHẦN 5 – KIỂM THỬ HỆ THỐNG (TESTING & QUALITY ASSURANCE)](#phần-5--kiểm-thử-hệ-thống-testing--quality-assurance)
    - 5.1. Chiến lược và Quy trình Kiểm thử
    - 5.2. Kiểm thử Website Khách hàng (Client Acceptance Testing - 30 Scenarios)
    - 5.3. Kiểm thử Website Quản trị viên (Admin Panel Testing - 25 Scenarios)
11. [PHẦN 6 – ĐÓNG GÓI VÀ TRIỂN KHAI HỆ THỐNG](#phần-6--đóng-gói-và-triển-khai-hệ-thống)
    - 6.1. Đóng gói Ứng dụng (Build & Optimization)
    - 6.2. Hướng dẫn Triển khai Hạ tầng (Deployment Guide: MongoDB Cloud, Node.js PM2, Vercel, Domain & SSL)
12. [PHẦN 7 – KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#phần-7--kết-luận-và-hướng-phát-triển)
    - 7.1. Thuận lợi khi thực hiện dự án
    - 7.2. Khó khăn, Hạn chế và Bài học kinh nghiệm
    - 7.3. Kết luận tổng quan & Định hướng phát triển tương lai
13. [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

## DANH MỤC TỪ VIẾT TẮT VÀ THUẬT NGỮ

| Từ viết tắt / Thuật ngữ | Tên tiếng Anh đầy đủ | Ý nghĩa / Giải thích |
| :--- | :--- | :--- |
| **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| **REST** | Representational State Transfer | Kiến trúc thiết kế API dựa trên chuẩn HTTP |
| **JSON** | JavaScript Object Notation | Định dạng trao đổi dữ liệu dạng văn bản nhẹ |
| **MERN** | MongoDB, Express.js, React.js, Node.js | Bộ công nghệ phát triển ứng dụng web Full-Stack |
| **ODM** | Object Document Mapper | Công cụ ánh xạ đối tượng với cơ sở dữ liệu Document (Mongoose) |
| **JWT** | JSON Web Token | Chuẩn xác thực tài khoản dựa trên token mã hóa |
| **SPA** | Single Page Application | Ứng dụng web đơn trang, tải dữ liệu động không reload |
| **CRUD** | Create, Read, Update, Delete | 4 thao tác cơ bản với dữ liệu (Tạo, Đọc, Sửa, Xóa) |
| **CPU** | Central Processing Unit | Bộ vi xử lý trung tâm máy tính |
| **GPU** | Graphics Processing Unit | Bộ vi xử lý đồ họa / Card màn hình |
| **RAM** | Random Access Memory | Bộ nhớ truy xuất ngẫu nhiên |
| **SSD** | Solid State Drive | Ổ cứng thể rắn tốc độ cao |
| **PSU** | Power Supply Unit | Nguồn máy tính |
| **TDP** | Thermal Design Power | Công suất tỏa nhiệt / Tiêu thụ điện năng của linh kiện |
| **VNPay** | Vietnam Payment Solution | Cổng thanh toán điện tử uy tín tại Việt Nam |

---

## DANH MỤC HÌNH ẢNH VÀ BẢNG BIỂU

* **Hình 3.1:** Sơ đồ Use Case tổng quan phân hệ Khách hàng và Quản trị viên.
* **Hình 3.2:** Sơ đồ Tuần tự luồng xử lý Đặt hàng & Thanh toán qua VNPay.
* **Hình 3.3:** Mô hình Kiến trúc hệ thống Client-Server REST API Decoupled.
* **Hình 3.4:** Sơ đồ Thực thể Mongoose Collections (ERD Diagram cho MongoDB).
* **Hình 3.5:** Sơ đồ Sitemap cấu trúc các trang phía Khách hàng WINNOTech.
* **Hình 4.1:** Biểu đồ mô hình công nghệ Full-Stack Node.js + React + Vite + MongoDB.
* **Bảng 3.1 - 3.14:** Chi tiết 14 Mongoose Data Schemas trong dự án.
* **Bảng 4.1:** Tài liệu cấu trúc chi tiết các RESTful API Endpoints.
* **Bảng 5.1:** Kịch bản Kiểm thử Website Khách hàng (30 Scenarios).
* **Bảng 5.2:** Kịch bản Kiểm thử Website Quản trị viên (25 Scenarios).

---

## LỜI MỞ ĐẦU

Trong kỷ nguyên Cách mạng Công nghiệp 4.0 và sự bùng nổ mạnh mẽ của nền kinh tế số, công nghệ thông tin đã thâm nhập sâu rộng vào mọi khía cạnh của đời sống xã hội. Thiết bị điện tử, máy tính cá nhân (PC) và linh kiện phần cứng (CPU, GPU, RAM, Mainboard, SSD...) không còn đơn thuần là công cụ phục vụ công việc văn phòng cơ bản, mà đã trở thành nền tảng cốt lõi phục vụ học tập trực tuyến, lập trình phần mềm, thiết kế đồ họa 3D, dựng phim chuyên nghiệp và giải trí eSports cao cấp.

Song hành với xu hướng đó, thương mại điện tử (E-Commerce) tại Việt Nam đang có tốc độ phát triển phi mã. Người tiêu dùng ngày nay, đặc biệt là nhóm khách hàng am hiểu công nghệ (Gen Z, Chuyên gia CNTT, Game thủ), không chỉ yêu cầu sự tiện lợi trong việc chọn mua hàng trực tuyến mà còn đòi hỏi cao về **tính minh bạch của thông số kỹ thuật**, **khả năng cá nhân hóa cấu hình (Build PC)**, **tính chính xác của số lượng tồn kho** và **tốc độ xử lý giao dịch an toàn**.

Dự án tốt nghiệp **"Phát triển website thương mại điện tử sản phẩm công nghệ và linh kiện máy tính WINNOTech"** được nhóm sinh viên chúng em nghiên cứu và triển khai nhằm giải quyết triệt để các bài toán thực tiễn nêu trên. Bằng việc áp dụng bộ công nghệ hiện đại bao gồm **Node.js, Express.js, React.js (Vite), Redux Toolkit và MongoDB**, dự án WINNOTech được xây dựng với mục tiêu mang đến một nền tảng bán lẻ công nghệ chuyên nghiệp, tích hợp bộ công cụ Build PC thông minh tự động kiểm tra tương thích linh kiện, tích hợp cổng thanh toán trực tuyến VNPay và trợ lý ảo AI tư vấn tự động.

Quá trình thực hiện dự án tốt nghiệp này là thước đo toàn diện đánh giá năng lực chuyên môn, tư duy phân tích hệ thống và kỹ năng làm việc nhóm của chúng em sau thời gian rèn luyện tại trường. Nhóm chúng em tin tưởng rằng báo cáo này sẽ trình bày một cách chi tiết, mạch lạc và thuyết phục toàn bộ quá trình từ khảo sát nhu cầu, phân tích thiết kế, lập trình thực thi cho đến kiểm thử và đóng gói triển khai ứng dụng WINNOTech.

---

## NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN

..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................

**TP.Hồ Chí Minh, ngày ...... tháng ...... năm 2026**  
**Giảng viên hướng dẫn**  
*(Ký và ghi rõ họ tên)*  



**Thầy Trần Bá Hộ**

---

## NHẬN XÉT CỦA HỘI ĐỒNG PHẢN BIỆN

..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................
..................................................................................................................................................................................................................................

**TP.Hồ Chí Minh, ngày ...... tháng ...... năm 2026**  
**Thành viên Hội đồng phản biện**  
*(Ký và ghi rõ họ tên)*  

---

## PHẦN 1 – GIỚI THIỆU VÀ KHẢO SÁT ĐỀ TÀI

### 1.1. Giới thiệu tổng quan về thương hiệu WINNOTech
**WINNOTech** (thuộc Công ty TNHH Công nghệ WINNOTech) là một thương hiệu bán lẻ kỹ thuật số định hướng trở thành hệ thống siêu thị công nghệ và linh kiện máy tính uy tín hàng đầu. Nền tảng thương mại điện tử WINNOTech được phát triển nhằm cung cấp các dòng sản phẩm phần cứng máy tính chính hãng đến từ các tập đoàn công nghệ hàng đầu thế giới như ASUS, MSI, Gigabyte, Intel, AMD, Nvidia, Corsair, Samsung, Western Digital, Kingston, NZXT, Cooler Master...

Hệ thống WINNOTech được vận hành trên mô hình trực tuyến 24/7, đóng vai trò là cầu nối kỹ thuật số kết nối trực tiếp giữa nhà phân phối linh kiện và người tiêu dùng cuối. Không chỉ dừng lại ở các tính năng bán lẻ E-commerce thông thường (xem sản phẩm, thêm giỏ hàng, thanh toán), WINNOTech tạo ra sự khác biệt vượt trội nhờ **Trung tâm Xây dựng Cấu hình Máy tính (Build PC Hub)** – nơi người dùng có thể tự do sáng tạo bộ PC hoàn chỉnh theo ngân sách và nhu cầu công việc thực tế.

### 1.2. Lý do chọn đề tài và Tính cấp thiết của dự án
1. **Sự bùng nổ của thị trường máy tính cá nhân và linh kiện:**  
   Theo các báo cáo nghiên cứu thị trường, nhu cầu sở hữu máy tính cấu hình cao phục vụ công việc Remote work, Lập trình AI, Đồ họa 3D và Giải trí Game tại Việt Nam liên tục tăng trưởng với tốc độ trên 15%/năm. Việc sở hữu một nền tảng bán hàng trực tuyến tối ưu là yếu tố sống còn cho doanh nghiệp bán lẻ công nghệ.
2. **Hạn chế của các giải pháp bán hàng truyền thống và website thế hệ cũ:**  
   Nhiều đơn vị bán lẻ nhỏ lẻ hiện nay vẫn tư vấn thủ công qua bảng giá Excel hoặc mạng xã hội. Khách hàng gặp rất nhiều khó khăn trong việc kiểm tra thông số tương thích giữa các linh kiện (như Socket vi xử lý CPU có lắp vừa Mainboard không, nguồn PSU có đủ công suất gánh VGA không). Các website bán hàng cũ thường thiếu tính năng chọn biến thể đa chiều và không cập nhật kho hàng thời gian thực.
3. **Cơ hội áp dụng toàn diện Kiến trúc Full-Stack MERN/Vite:**  
   Đề tài phát triển website WINNOTech mang tính thử thách cao về mặt kỹ thuật, đòi hỏi sinh viên phải nắm vững và kết hợp nhuần nhuyễn nhiều công nghệ hiện đại: xây dựng RESTful API chuẩn mực với **Node.js/Express**, thiết kế CSDL linh hoạt thuộc tính với **MongoDB/Mongoose**, phát triển giao diện đơn trang SPA siêu tốc với **React/Vite**, quản lý state phức tạp bằng **Redux Toolkit**, xử lý thanh toán trực tuyến **VNPay**, sinh hóa đơn PDF động và tích hợp Trợ lý AI.

### 1.3. Mục tiêu dự án

#### A. Mục tiêu Kỹ thuật (Technical Goals)
* Xây dựng kiến trúc hệ thống Client-Server phân tách (Decoupled Architecture), đảm bảo tính đóng đóng, an toàn dữ liệu và dễ dàng mở rộng.
* Thiết kế CSDL NoSQL MongoDB chuẩn hóa với 14 Collections, tối ưu hóa các chỉ mục (Indexes) để đáp ứng hàng ngàn truy vấn/giây.
* Xây dựng hệ thống RESTful API an toàn với hơn 40 Endpoints, tích hợp middleware bảo mật JWT Authentication và Phân quyền Role-based Access Control (Client / Admin).
* Phát triển giao diện người dùng SPA mịn màng bằng React 18, Vite 5, Tailwind CSS và Redux Toolkit, đạt điểm chỉ số UX/UI và Lighthouse cao.
* Tích hợp thành công Cổng thanh toán điện tử VNPay Sandbox, tự động tạo QRCode và nhận phản hồi IPN webhook xác nhận giao dịch.
* Tích hợp trợ lý ảo AI Chatbot sử dụng SDK `@google/generative-ai` tư vấn cấu hình tự động cho khách hàng.

#### B. Mục tiêu Kinh doanh & Trải nghiệm Người dùng (Business & UX Goals)
* Giúp khách hàng giảm 80% thời gian tìm kiếm và kiểm tra tương thích khi chọn mua linh kiện máy tính.
* Cung cấp công cụ Build PC trực quan, hiển thị công suất tiêu thụ điện (W) và tổng chi phí minh bạch.
* Tự động hóa 100% quy trình tiếp nhận đơn hàng, gửi email xác nhận và xuất hóa đơn bán hàng cho khách hàng.
* Cung cấp cho Admin công cụ quản trị mạnh mẽ: theo dõi biểu đồ doanh thu, quản lý tồn kho chính xác và phát hành voucher linh hoạt.

### 1.4. Đối tượng và Phạm vi nghiên cứu
* **Đối tượng nghiên cứu:** 
  * Quy trình nghiệp vụ bán lẻ thương mại điện tử ngành công nghệ và linh kiện máy tính.
  * Bộ công nghệ Full-Stack: Node.js, Express.js, React.js, Vite, Redux Toolkit, MongoDB, Mongoose, Tailwind CSS.
  * Các giải pháp tích hợp bên thứ ba: VNPay API, Google Gemini AI API, Nodemailer, PDFKit, ExcelJS, Fuse.js.
* **Phạm vi nghiên cứu:** 
  * Hệ thống website dành cho Khách hàng (Client Website) và Quản trị viên (Admin Dashboard).
  * Dự án tập trung vào bán lẻ linh kiện PC, máy tính bộ và phụ kiện công nghệ tại thị trường Việt Nam.

### 1.5. Phương pháp nghiên cứu và Mô hình phát triển dự án (Agile/Scrum)

Nhóm áp dụng quy trình phát triển phần mềm linh hoạt **Agile/Scrum** với các Sprint kéo dài 2 tuần:
* **Sprint 1:** Khảo sát nhu cầu, phân tích nghiệp vụ, thiết kế Wireframe Figma và dựng Schema CSDL MongoDB.
* **Sprint 2:** Xây dựng Backend Express Server, viết các API Auth, Category, Brand, Product & ProductVariant CRUD.
* **Sprint 3:** Phát triển Frontend Client (Home, Product Detail, Search, Filter) và tích hợp Redux Toolkit State.
* **Sprint 4:** Lập trình công cụ Build PC chuyên sâu và logic Giỏ hàng, Voucher.
* **Sprint 5:** Lập trình module Thanh toán VNPay, Đặt hàng, Sổ địa chỉ, Lịch sử đơn hàng & Admin Dashboard.
* **Sprint 6:** Kiểm thử toàn diện (Testing), tối ưu hóa hiệu năng, sửa lỗi và đóng gói triển khai Cloud.

---

## PHẦN 2 – KHẢO SÁT HỆ THỐNG VÀ PHÂN TÍCH NHU CẦU

### 2.1. Khảo sát hiện trạng kinh doanh thiết bị công nghệ
Qua khảo sát thực tế tại các cửa hàng và kênh phân phối linh kiện máy tính, nhóm nhận thấy mô hình bán hàng truyền thống đang bộc lộ nhiều nhược điểm:
* **Thông tin sản phẩm bị phân mảnh:** Khách hàng phải vào nhiều trang khác nhau để tìm đọc thuộc tính linh kiện (Socket CPU, Bus RAM, Chuẩn kích thước Mainboard ATX/Micro-ATX).
* **Sai lệch tồn kho:** Quản lý tồn kho bằng sổ sách hoặc bảng tính Excel dẫn tới tình trạng khách đặt mua sản phẩm trên web nhưng thực tế trong kho đã hết hàng.
* **Quy trình thanh toán phức tạp:** Thiếu tính năng tự động quét mã QR thanh toán hoặc kết nối trực tiếp với cổng ngân hàng, gây mất thời gian xác minh chuyển khoản.

### 2.2. Phân tích đối thủ cạnh tranh & Lợi thế cạnh tranh (USP) của WINNOTech

Nhóm đã phân tích các hệ thống bán lẻ máy tính lớn hiện nay (Phong Vũ, GearVN, MemoryZone) để đúc kết lợi thế cạnh tranh riêng cho WINNOTech:

| Tiêu chí phân tích | Các hệ thống hiện hữu | Nền tảng WINNOTech |
| :--- | :--- | :--- |
| **Giao diện & Tốc độ** | Nhiều banner phức tạp, gây rối mắt, tốc độ tải trang chậm | Thiết kế chuẩn Modern Dark/Light Mode, sử dụng Vite SPA tải trang tức thì |
| **Công cụ Build PC** | Chỉ chọn danh mục đơn giản, ít cảnh báo tương thích | Chọn linh kiện thông minh, hiển thị công suất nguồn PSU tiêu thụ, lưu cấu hình |
| **Tích hợp AI** | Chưa tích hợp hoặc chỉ có Chatbot kịch bản cố định | Tích hợp Google Gemini AI Chatbot hiểu ngôn ngữ tự nhiên, tư vấn cấu hình PC |
| **Trải nghiệm Đặt hàng** | Quy trình thanh toán nhiều bước rườm rà | Thanh toán 1-Click với VietQR / VNPay, theo dõi mã đơn chuẩn xác |

### 2.3. Yêu cầu bài toán và Đặc tả chức năng phân hệ Khách hàng (Client Frontend)

#### 1. Module Xác thực & Tài khoản (Auth & User Profile)
* **Đăng ký tài khoản:** Cho phép người dùng tạo tài khoản với Username, Email, Số điện thoại và Mật khẩu (đã mã hóa bcrypt).
* **Đăng nhập hệ thống:** Xác thực tài khoản, trả về JWT Token lưu tại Cookie/LocalStorage.
* **Quản lý Thông tin cá nhân:** Cập nhật Họ tên, Giới tính, Ngày sinh, Ảnh đại diện Avatar (tự động upload và lưu vào `/image/avatar_user`).
* **Sổ địa chỉ giao hàng (Delivery Address Book):** Thêm mới, chỉnh sửa, xóa và thiết lập Địa chỉ giao hàng Mặc định.

#### 2. Module Trang chủ & Khám phá (Home & Discovery)
* **Slider Banner Động:** Hiển thị các chương trình khuyến mãi Flash Sale và sự kiện hot do Admin cấu hình.
* **Danh mục Linh kiện Nổi bật:** CPU, Card màn hình GPU, Mainboard, RAM, Ổ cứng SSD, Nguồn PSU, Vỏ Case, Màn hình...
* **Sản phẩm Top Deals & Bán chạy:** Tự động lọc sản phẩm giảm giá % cao và số lượng bán chạy nhất.
* **Gợi ý Cấu hình PC dựng sẵn:** Bộ sưu tập PC Gaming, PC Workstation Đồ họa, PC Văn phòng.

#### 3. Module Sản phẩm & Tìm kiếm Thông minh (Products & Search)
* **Tìm kiếm Fuzzy Search (`Fuse.js`):** Cho phép gõ từ khóa không dấu, gõ tắt (ví dụ: "rtx4070", "i7 14700k") vẫn trả về kết quả sản phẩm chính xác.
* **Bộ lọc Đa tiêu chí (Multi-criteria Filter):** Lọc đồng thời theo Danh mục, Thương hiệu (ASUS, MSI, Gigabyte...), Khoảng giá, Trạng thái giảm giá.
* **Sắp xếp linh hoạt:** Theo giá tăng dần, giá giảm dần, mới nhất, lượt xem nhiều nhất.

#### 4. Module Chi tiết Sản phẩm & Biến thể (Product Detail & Variants)
* **Thư viện ảnh gallery:** Xem nhiều góc độ hình ảnh linh kiện.
* **Lựa chọn Biến thể (Variants):** Chọn các phiên bản dung lượng (16GB/32GB RAM, 512GB/1TB SSD) hoặc màu sắc, giá bán tự động cập nhật.
* **Bảng Thông số Kỹ thuật (Specifications):** Hiển thị chi tiết các thuộc tính phần cứng (Socket, Bus, Công suất, Kích thước).
* **Đánh giá & Nhận xét:** Khách hàng đã mua hàng có thể chấm điểm sao (1-5 star) và viết nhận xét thực tế.

#### 5. Module Build PC Chuyên dụng (`/buildpc`)
* Cho phép chọn từng linh kiện theo nhóm bắt buộc: CPU -> Mainboard -> RAM -> Card màn hình GPU -> Ổ cứng SSD -> Nguồn PSU -> Vỏ Case -> Tản nhiệt.
* **Tính toán Công suất Tiêu thụ (Wattage Estimator):** Tự động cộng tổng TDP của CPU và GPU để đưa ra lời khuyên chọn Nguồn PSU có công suất phù hợp.
* **Xuất bộ PC vào Giỏ hàng:** Nhấn 1 nút để đưa toàn bộ danh sách linh kiện trong cấu hình vào Giỏ hàng chuẩn bị thanh toán.
* **Lưu cấu hình PC:** Cho phép người dùng đã đăng nhập lưu bộ PC vào tài khoản cá nhân để xem lại sau.

#### 6. Module Giỏ hàng & Thanh toán (Cart & Checkout)
* **Quản lý Giỏ hàng:** Tăng/giảm số lượng, xóa linh kiện, tự động tính Tổng tiền tạm tính.
* **Áp dụng Voucher:** Nhập hoặc chọn Mã giảm giá hợp lệ, tự động tính số tiền được giảm.
* **Thanh toán Đa hình thức:**
  * COD: Thanh toán tiền mặt khi nhận hàng.
  * VNPay Gateway Sandbox: Tự động chuyển sang cổng VNPay quét mã QR / Thẻ ATM / Visa.
* **Trang Đặt hàng Thành công (`/order-success`):** Hiển thị Mã đơn hàng duy nhất (`WNT...`), tổng tiền và nút tải Hóa đơn PDF.

#### 7. Module Tra cứu & Lịch sử Đơn hàng (Orders Tracking)
* **Tra cứu Đơn hàng công khai:** Người dùng không cần đăng nhập vẫn có thể tra cứu trạng thái đơn bằng Mã đơn hàng và Số điện thoại.
* **Lịch sử Đơn hàng cá nhân:** Xem danh sách đơn theo tab (Chờ xác nhận, Đang xử lý, Đang giao, Đã hoàn thành, Đã hủy). Cho phép Hủy đơn khi đơn còn ở trạng thái Chờ xác nhận.

#### 8. Module Trợ lý Virtual AI Chatbot
* Tích hợp bong bóng Chatbot AI ở góc màn hình. Khách hàng có thể hỏi: *"Tư vấn cho tôi bộ PC chơi game 20 triệu"*, Chatbot sẽ phân tích dữ liệu sản phẩm trong CSDL và trả lời gợi ý cấu hình phù hợp.

---

### 2.4. Yêu cầu bài toán và Đặc tả chức năng phân hệ Quản trị viên (Admin Dashboard)

#### 1. Module Tổng quan Thống kê (Dashboard Analytics)
* Thống kê tổng doanh thu theo Ngày / Tuần / Tháng / Năm.
* Biểu đồ trực quan hóa số lượng đơn hàng và trạng thái đơn.
* Top 5 sản phẩm linh kiện bán chạy nhất và cảnh báo linh kiện sắp hết hàng trong kho.

#### 2. Module Quản lý Sản phẩm & Biến thể (Products & Variants Management)
* Thêm mới sản phẩm: Nhập tên, slug, mô tả, chọn danh mục, thương hiệu, nhập thông số kỹ thuật.
* Upload nhiều hình ảnh sản phẩm bằng `Multer`.
* Tạo và quản lý các Biến thể (ProductVariant): Nhập mã SKU, giá gốc, giá bán, số lượng tồn kho, thuộc tính biến thể.
* Xóa mềm sản phẩm (Soft Delete): Đánh dấu trạng thái tạm ẩn mà không làm mất dữ liệu lịch sử đơn hàng.

#### 3. Module Quản lý Danh mục & Thương hiệu (Categories & Brands)
* Quản lý danh mục phân cấp (Danh mục Cha / Danh mục Con).
* Upload logo thương hiệu đối tác (ASUS, MSI, Intel, AMD...).

#### 4. Module Quản lý Đơn hàng (Orders Management)
* Xem danh sách tất cả đơn hàng toàn hệ thống với bộ lọc trạng thái.
* Cập nhật trạng thái đơn hàng: `Pending` -> `Processing` -> `Shipping` -> `Completed` / `Cancelled`.
* Cập nhật trạng thái thanh toán: `Unpaid` -> `Paid`.
* In và xuất file Hóa đơn bán hàng PDF (PDFKit).

#### 5. Module Quản lý Mã giảm giá (Vouchers Management)
* Tạo mã voucher giảm giá theo Số tiền cố định (VNĐ) hoặc Phần trăm (%).
* Đặt điều kiện giá trị đơn hàng tối thiểu, số tiền giảm tối đa, giới hạn số lần sử dụng và thời hạn hiệu lực.

#### 6. Module Quản lý Người dùng & Phân quyền (Users Management)
* Xem danh sách tài khoản khách hàng, lịch sử mua hàng của từng tài khoản.
* Phân quyền tài khoản (`client` / `admin`), kích hoạt hoặc tạm khóa tài khoản vi phạm.

#### 7. Module Báo cáo & Xuất Dữ liệu (Reports & Data Export)
* Kết xuất dữ liệu báo cáo đơn hàng và doanh thu ra file Excel (`.xlsx`) sử dụng thư viện `ExcelJS`.

---

### 2.5. Các yêu cầu phi chức năng (Non-Functional Requirements)

1. **Hiệu năng (Performance):**
   * Tốc độ phản hồi API Backend < 200ms cho các truy vấn thông thường.
   * Tốc độ tải trang Frontend (First Contentful Paint) < 1.5 giây nhờ kiến trúc React Vite SPA.
2. **Bảo mật (Security):**
   * Mật khẩu người dùng được mã hóa một chiều bằng thuật toán `bcrypt` với Salt rounds = 10.
   * Xác thực truy cập API bằng chuỗi mã hóa `JSON Web Token (JWT)`.
   * Chống các lỗ hổng phổ biến: CORS Policy, Input Validation, SQL/NoSQL Injection prevention via Mongoose ODM.
3. **Tính sẵn sàng & Mở rộng (Availability & Scalability):**
   * CSDL Cloud MongoDB Atlas đảm bảo Uptime 99.9%.
   * Kiến trúc REST API hỗ trợ nâng cấp mô hình Microservices hoặc phát triển thêm App Mobile trong tương lai.
4. **Giao diện & Tương thích (UI/UX & Compatibility):**
   * Thiết kế chuẩn Responsive Web Design, hiển thị hoàn hảo trên các độ phân giải Desktop (1920x1080), Laptop (1366x768), Tablet và Smartphone.

---

## PHẦN 3 – PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1. Thiết kế Sơ đồ Usecase và Đặc tả Chi tiết

```
                                +------------------------------------------------------------------------+
                                |                       HỆ THỐNG E-COMMERCE WINNOTECH                    |
                                |                                                                        |
    +-------------------+       |   (UC01) Đăng ký / Đăng nhập tài khoản                             |
    |                   |------>|   (UC02) Quản lý Thông tin cá nhân & Sổ địa chỉ                        |
    |                   |------>|   (UC03) Tìm kiếm Fuzzy Search & Lọc linh kiện                         |
    |                   |------>|   (UC04) Xem Chi tiết linh kiện & Chọn biến thể                        |
    |                   |------>|   (UC05) Sử dụng Công cụ Build PC (Tự chọn cấu hình & Kiểm tra W)      |
    |    KHÁCH HÀNG     |------>|   (UC06) Quản lý Giỏ hàng & Áp dụng Voucher                            |
    |     (CLIENT)      |------>|   (UC07) Đặt hàng & Thanh toán (COD / VNPay Sandbox)                   |
    |                   |------>|   (UC08) Tra cứu Đơn hàng & Theo dõi Trạng thái                        |
    |                   |------>|   (UC09) Đánh giá sản phẩm (Rating 1-5 star) & Wishlist                |
    |                   |------>|   (UC10) Tương tác Trợ lý Virtual AI Chatbot (Gemini API)               |
    +-------------------+       |                                                                        |
                                |                                                                        |
    +-------------------+       |   (UC11) Đăng nhập Admin Panel                                         |
    |                   |------>|   (UC12) Quản lý Sản phẩm, Biến thể & Thuộc tính (CRUD)                |
    |                   |------>|   (UC13) Quản lý Danh mục & Thương hiệu (CRUD)                         |
    |   QUẢN TRỊ VIÊN   |------>|   (UC14) Quản lý Đơn hàng & Cập nhật Trạng thái giao hàng               |
    |     (ADMIN)       |------>|   (UC15) Quản lý Mã giảm giá Voucher (CRUD)                            |
    |                   |------>|   (UC16) Quản lý Tài khoản Khách hàng & Phân quyền                     |
    |                   |------>|   (UC17) Xem Báo cáo Thống kê Doanh thu & Xuất file Excel/PDF          |
    +-------------------+       +------------------------------------------------------------------------+
```

---

### 3.2. Sơ đồ Tuần tự (Sequence Diagrams) cho các Luồng xử lý quan trọng

#### A. Sơ đồ Tuần tự Luồng Đặt hàng & Thanh toán qua VNPay

```
[Khách hàng]          [React Frontend]         [Node.js Express Backend]       [VNPay Payment Gateway]     [MongoDB Database]
     |                       |                             |                             |                         |
     |--- 1. Chọn VNPay --->|                             |                             |                         |
     |    & Nhấn Đặt hàng    |                             |                             |                         |
     |                       |--- 2. POST /api/orders ---->|                             |                         |
     |                       |    (Gửi giỏ hàng, địa chỉ)   |                             |                         |
     |                       |                             |--- 3. Khởi tạo Đơn hàng --->|                         |
     |                       |                             |    (Status: Pending, Unpaid) |                         |
     |                       |                             |------------------------------------------------------>|
     |                       |                             |                             |                         |
     |                       |                             |--- 4. Sinh URL VNPay ------>|                         |
     |                       |                             |    (Tạo chữ ký SHA-512)     |                         |
     |                       |                             |<-- 5. Trả về paymentUrl ----|                         |
     |                       |<-- 6. Trả về paymentUrl ----|                             |                         |
     |                       |                             |                             |                         |
     |--- 7. Chuyển hướng sang VNPay Checkout ------------>|                             |                         |
     |--- 8. Nhập thông tin Thẻ / Quét QR ---------------------------------------------->|                         |
     |                                                                                   |-- 9. Giao dịch thành công
     |                                                                                   |                          |
     |                                                     |<-- 10. Gửi IPN Webhook Callback ------------------------|
     |                                                     |    (vnp_ResponseCode = '00')|                         |
     |                                                     |                             |                         |
     |                                                     |--- 11. Cập nhật Đơn hàng ----------------------------->|
     |                                                     |    (paymentStatus: 'Paid',  |                         |
     |                                                     |     orderStatus: 'Processing')                        |
     |                                                     |                             |                         |
     |<-- 12. Chuyển hướng về /order-success ---------------|                             |                         |
     |    (Hiển thị Đặt hàng Thành công)                   |                             |                         |
```

---

### 3.3. Mô hình Kiến trúc Triển khai (Client-Server RESTful API decoupled)

Hệ thống WINNOTech được tổ chức theo mô hình 3 tầng (3-Tier Architecture) hoàn toàn phân tách:

```
+-----------------------------------------------------------------------------------+
|                                 PRESENTATION TIER                                 |
|                                                                                   |
|   +------------------------------------+    +---------------------------------+   |
|   |   React.js Client Web App (Vite)   |    |  React.js Admin Dashboard (Vite)|   |
|   |   Redux Toolkit State / Tailwind   |    |  Lucide Icons / Chart Components|   |
|   +------------------------------------+    +---------------------------------+   |
+-----------------------------------------------------------------------------------+
                                         |
                                         | RESTful API (HTTPS / JSON / JWT)
                                         v
+-----------------------------------------------------------------------------------+
|                                 APPLICATION TIER                                  |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                        Node.js + Express.js Server                        |   |
|   |  - Controllers & Routes (Auth, Products, BuildPC, Orders, Vouchers...)    |   |
|   |  - Middlewares (JWT Auth, Admin Check, Multer Upload, Error Handler)      |   |
|   |  - Service Integrations (VNPay SDK, Gemini AI, Nodemailer, PDFKit)        |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Mongoose ODM (MongoDB Driver)
                                         v
+-----------------------------------------------------------------------------------+
|                                    DATA TIER                                      |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                         MongoDB NoSQL Database                            |   |
|   |   14 Collections: users, products, productvariants, categories, brands,   |   |
|   |   attributes, cartitems, orders, buildpcs, vouchers, posts, reviews...    |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

### 3.4. Thiết kế Chi tiết Cơ sở dữ liệu MongoDB (Detailed Mongoose Schemas)

Hệ thống thiết kế CSDL NoSQL MongoDB chuẩn hóa gồm 14 Mongoose Collections chính:

#### 1. Collection: `users` (`models/User.js`)
Lưu trữ thông tin tài khoản người dùng và quản trị viên.
```javascript
{
  _id: ObjectId,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Encrypted with bcrypt
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  gender: { type: String, enum: ['Nam', 'Nữ'], default: 'Nam' },
  birthDate: { type: Date },
  avatar: { type: String, default: 'default-avatar.png' },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  status: { type: String, enum: ['Active', 'Locked'], default: 'Active' },
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Collection: `products` (`models/Product.js`)
Lưu trữ thông tin tổng quan của sản phẩm linh kiện.
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  description: { type: String },
  specifications: { type: Object }, // Shared tech specs: socket, tdp, formFactor...
  origin: { type: String }, // Xuất xứ
  manufacture: { type: String }, // Nơi sản xuất
  discountPercent: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Hidden'], default: 'Active' },
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Collection: `productvariants` (`models/ProductVariant.js`)
Lưu trữ thông tin biến thể cụ thể (màu sắc, dung lượng, giá tiền, số lượng kho).
```javascript
{
  _id: ObjectId,
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true, unique: true },
  variantName: { type: String }, // e.g., "Màu Đen - 32GB RAM"
  originalPrice: { type: Number, required: true },
  price: { type: Number, required: true }, // Sale price
  stock: { type: Number, required: true, default: 0 },
  soldQuantity: { type: Number, default: 0 },
  images: [{ type: String }],
  status: { type: String, enum: ['Còn hàng', 'Hết hàng'], default: 'Còn hàng' },
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Collection: `categories` (`models/Category.js`)
Lưu trữ danh mục linh kiện (CPU, GPU, RAM, Mainboard...).
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, default: 'danhmuc.jpg' },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  status: { type: String, enum: ['Active', 'Hidden'], default: 'Active' }
}
```

#### 5. Collection: `brands` (`models/Brand.js`)
Lưu trữ thông tin thương hiệu đối tác (ASUS, MSI, Gigabyte, Intel, AMD...).
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, default: 'logo_brand.jpg' },
  status: { type: String, enum: ['Active', 'Hidden'], default: 'Active' }
}
```

#### 6. Collection: `buildpcs` (`models/BuildPc.js`)
Lưu trữ các cấu hình PC do người dùng tự phối ghép.
```javascript
{
  _id: ObjectId,
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buildName: { type: String, default: 'Cấu hình PC của tôi' },
  items: [{
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
    quantity: { type: Number, default: 1 },
    price: { type: Number }
  }],
  totalEstimatedWattage: { type: Number, default: 0 }, // Tổng công suất W
  totalPrice: { type: Number, required: true },
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. Collection: `cartitems` (`models/Cartitem.js`)
Lưu trữ sản phẩm trong giỏ hàng của người dùng.
```javascript
{
  _id: ObjectId,
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productVariant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  createdAt: Date,
  updatedAt: Date
}
```

#### 8. Collection: `orders` (`models/Order.js`)
Lưu trữ thông tin chi tiết đơn hàng đặt mua.
```javascript
{
  _id: ObjectId,
  orderCode: { type: String, required: true, unique: true }, // e.g., WNT2026080701
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  city: { type: String, required: true },
  items: [{
    productVariant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
    productName: { type: String, required: true },
    variantName: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  shippingMethod: { type: String, default: 'Giao hàng tiêu chuẩn' },
  shippingFee: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['COD', 'VNPAY', 'QRCODE'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled'], default: 'Pending' },
  subTotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  voucherCode: { type: String },
  createdAt: Date,
  updatedAt: Date
}
```

#### 9. Collection: `vouchers` (`models/Voucher.js`)
Lưu trữ thông tin mã giảm giá.
```javascript
{
  _id: ObjectId,
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['Fixed', 'Percentage'], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Expired', 'Disabled'], default: 'Active' }
}
```

---

## PHẦN 4 – THỰC THI VÀ PHÁT TRIỂN ỨNG DỤNG

### 4.1. Mô hình và Tập hợp Công nghệ Sử dụng (Technology Stack Details)

```
                       +--------------------------------------------------------+
                       |              WINNOTECH FULL-STACK STACK                |
                       +--------------------------------------------------------+
                                                   |
         +-----------------------------------------+-----------------------------------------+
         |                                                                                   |
         v                                                                                   v
+------------------------------------+                                     +------------------------------------+
|          FRONTEND STACK            |                                     |           BACKEND STACK            |
|                                    |                                     |                                    |
| - Core: React.js v18.2             |                                     | - Runtime: Node.js v20 LTS         |
| - Build Tool: Vite v5.0            |                                     | - Framework: Express.js v5.2       |
| - State Mgmt: Redux Toolkit v2.12  |                                     | - Database: MongoDB Cloud v7.0     |
| - Routing: React Router DOM v7.17  |                                     | - ODM: Mongoose v9.4               |
| - Styling: Tailwind CSS v3.4       |                                     | - Auth: JWT & bcrypt               |
| - Icons: Lucide React v1.22        |                                     | - Payment: VNPay Gateway SDK       |
| - Toast: React Toastify            |                                     | - Search: Fuse.js (Fuzzy Search)   |
| - HTTP Client: Axios / Fetch       |                                     | - PDF/Excel: PDFKit / ExcelJS      |
+------------------------------------+                                     +------------------------------------+
```

### 4.2. Cấu trúc Thư mục Dự án Frontend và Backend

```
h:\WINNOTechnew\WINNOTech\
├── config/
│   └── db.js                         # Cấu hình kết nối Mongoose kết nối MongoDB
├── middleware/
│   └── AuthMiddleware.js             # Middleware xác thực JWT & phân quyền Admin
├── models/
│   ├── User.js                       # Mongoose Schema Người dùng & Admin
│   ├── Product.js                    # Mongoose Schema Sản phẩm chính
│   ├── ProductVariant.js             # Mongoose Schema Biến thể sản phẩm & Attribute junction
│   ├── Category.js                   # Mongoose Schema Danh mục linh kiện
│   ├── Brand.js                      # Mongoose Schema Thương hiệu linh kiện
│   ├── Attribute.js                  # Mongoose Schema Thuộc tính kỹ thuật
│   ├── Cartitem.js                   # Mongoose Schema Giỏ hàng
│   ├── Order.js                      # Mongoose Schema Đơn hàng & Chi tiết đơn
│   ├── DeliveryAddress.js            # Mongoose Schema Địa chỉ người dùng
│   ├── BuildPc.js                    # Mongoose Schema Bộ cấu hình PC
│   ├── Voucher.js                    # Mongoose Schema Mã giảm giá
│   ├── FavoriteCompareReview.js      # Mongoose Schema Yêu thích, So sánh, Đánh giá
│   ├── Post.js                       # Mongoose Schema Bài viết tin tức
│   └── BannerPaymentImage.js         # Mongoose Schema Banner quảng cáo
├── routers/
│   └── AI_chatbot.js                 # Express Router tích hợp Google Gemini AI Chatbot
├── key/
│   ├── privatekey.pem                # Khóa bí mật phục vụ mã hóa JWT
│   └── publickey.crt                 # Khóa công khai
├── public/uploads/                   # Thư mục lưu trữ hình ảnh tải lên
├── server.js                         # Entry point duy nhất của Backend (5,515 dòng mã lệnh)
├── package.json                      # Cấu hình Node.js dependencies
└── frontend/                         # Dự án Frontend React.js (Vite)
    ├── src/
    │   ├── admin/                    # Các màn hình Admin Panel Dashboard
    │   │   ├── Dashboard.jsx         # Thống kê tổng quan doanh thu & biểu đồ
    │   │   ├── Products.jsx          # Quản lý danh sách sản phẩm & biến thể
    │   │   ├── Categories.jsx        # Quản lý danh mục linh kiện
    │   │   ├── Orders.jsx            # Quản lý đơn hàng & cập nhật trạng thái
    │   │   ├── Customers.jsx         # Quản lý tài khoản khách hàng
    │   │   └── Promotions.jsx        # Quản lý mã giảm giá Voucher
    │   ├── components/               # Các UI component dùng chung
    │   │   ├── Header.jsx            # Thanh Header top-bar & tìm kiếm
    │   │   ├── Footer.jsx            # Thanh Footer chân trang
    │   │   ├── Navbar.jsx            # Menu điều hướng chính
    │   │   └── ProductCard.jsx       # Card hiển thị thông tin linh kiện
    │   ├── pages/                    # Các trang phía Khách hàng
    │   │   ├── Home.jsx              # Trang chủ WINNOTech
    │   │   ├── CategoryPage.jsx      # Trang danh mục & lọc sản phẩm
    │   │   ├── ProductDetail.jsx     # Trang chi tiết linh kiện & biến thể
    │   │   ├── BuildPC.jsx           # Trang Công cụ Build PC chuyên dụng
    │   │   ├── Cart.jsx              # Trang Giỏ hàng & Voucher
    │   │   ├── Checkout.jsx          # Trang Thanh toán COD / VNPay
    │   │   ├── Profile.jsx           # Trang Hồ sơ cá nhân & Sổ địa chỉ
    │   │   └── OrderHistory.jsx      # Trang Lịch sử & Theo dõi đơn hàng
    │   ├── redux/                    # Redux Toolkit Store & Slices
    │   ├── services/                 # Gọi API Axios Backend
    │   ├── App.jsx                   # Component điều hướng chính (React Router)
    │   └── main.jsx                  # File khởi tạo ứng dụng React
    ├── package.json                  # Cấu hình Frontend dependencies
    └── vite.config.js                # Cấu hình Vite build tool
```

---

### 4.3. Tài liệu Cấu trúc RESTful API Chi tiết

Hệ thống Backend cung cấp hơn 40 API Endpoints chuẩn mực:

| STT | Phương thức | Đường dẫn API Endpoint | Quyền truy cập | Mô tả chức năng |
| :---: | :---: | :--- | :---: | :--- |
| **1** | `POST` | `/api/register` | Public | Đăng ký tài khoản Khách hàng mới |
| **2** | `POST` | `/api/login` | Public | Đăng nhập hệ thống & nhận JWT Token |
| **3** | `GET` | `/api/user/profile` | Client | Lấy thông tin cá nhân của user đăng nhập |
| **4** | `PUT` | `/api/user/profile` | Client | Cập nhật thông tin cá nhân (Họ tên, SĐT, Avatar) |
| **5** | `GET` | `/api/products` | Public | Lấy danh sách sản phẩm (có phân trang & lọc) |
| **6** | `GET` | `/api/products/:slug` | Public | Lấy chi tiết sản phẩm theo Slug |
| **7** | `POST` | `/api/admin/products` | Admin | Thêm sản phẩm linh kiện mới |
| **8** | `PUT` | `/api/admin/products/:id` | Admin | Cập nhật thông tin sản phẩm |
| **9** | `DELETE`| `/api/admin/products/:id` | Admin | Xóa mềm sản phẩm (chuyển status 'Hidden') |
| **10**| `GET` | `/api/categories` | Public | Lấy danh sách danh mục linh kiện |
| **11**| `POST` | `/api/admin/categories` | Admin | Thêm danh mục linh kiện mới |
| **12**| `GET` | `/api/brands` | Public | Lấy danh sách thương hiệu đối tác |
| **13**| `GET` | `/api/buildpc/components` | Public | Lấy danh sách linh kiện phục vụ công cụ Build PC |
| **14**| `POST` | `/api/buildpc/save` | Client | Lưu cấu hình PC cá nhân vào tài khoản |
| **15**| `GET` | `/api/cart` | Client | Lấy danh sách sản phẩm trong giỏ hàng |
| **16**| `POST` | `/api/cart/add` | Client | Thêm linh kiện vào giỏ hàng |
| **17**| `PUT` | `/api/cart/update` | Client | Cập nhật số lượng sản phẩm trong giỏ |
| **18**| `DELETE`| `/api/cart/remove/:id` | Client | Xóa sản phẩm khỏi giỏ hàng |
| **19**| `POST` | `/api/vouchers/apply` | Client | Kiểm tra & Áp dụng mã giảm giá Voucher |
| **20**| `POST` | `/api/orders` | Client | Khởi tạo đơn hàng mới (COD / VNPay) |
| **21**| `GET` | `/api/orders/vnpay_return` | Public | Phản hồi kết quả thanh toán từ VNPay |
| **22**| `GET` | `/api/orders/user` | Client | Lấy danh sách lịch sử đơn hàng của user |
| **23**| `GET` | `/api/orders/track/:code` | Public | Tra cứu công khai chi tiết đơn hàng |
| **24**| `PUT` | `/api/orders/cancel/:id` | Client | Hủy đơn hàng (khi còn ở trạng thái Pending) |
| **25**| `GET` | `/api/admin/orders` | Admin | Xem toàn bộ danh sách đơn hàng hệ thống |
| **26**| `PUT` | `/api/admin/orders/:id/status`| Admin | Cập nhật trạng thái giao hàng / thanh toán |
| **27**| `GET` | `/api/admin/orders/:id/pdf` | Admin | Xuất hóa đơn bán hàng file PDF (`PDFKit`) |
| **28**| `GET` | `/api/admin/reports/excel` | Admin | Xuất báo cáo thống kê file Excel (`ExcelJS`) |
| **29**| `POST` | `/api/chatbot/ask` | Public | Gửi câu hỏi cho Trợ lý AI Gemini tư vấn PC |

---

### 4.4. Giải pháp Kỹ thuật và Thuật toán Nổi bật trong Dự án

1. **Thuật toán Tìm kiếm Mờ Fuzzy Search (`Fuse.js`):**  
   Thay vì chỉ tìm kiếm khớp chính xác chuỗi SQL `LIKE`, hệ thống tích hợp `Fuse.js` trên tập dữ liệu linh kiện. Thuật toán phân tích khoảng cách Levenshtein giữa các từ khóa, cho phép người dùng tìm đúng sản phẩm ngay cả khi gõ thiếu từ, gõ sai chính tả nhẹ hoặc gõ chữ không dấu.
2. **Kỹ thuật Kiểm tra Độ tương thích Công suất Nguồn PSU trong Build PC:**  
   Mỗi linh kiện thuộc danh mục CPU và GPU trong CSDL MongoDB được lưu trường thông số `tdp` (Watt). Khi người dùng phối ghép các linh kiện trong công cụ Build PC, Frontend tự động tính:
   $$\text{Total Wattage} = \sum \text{TDP(CPU)} + \sum \text{TDP(GPU)} + 150W \text{ (System Base Load)}$$
   Nếu tổng công suất ước tính là $550W$, hệ thống sẽ đưa ra khuyến nghị màu xanh gợi ý khách hàng chọn Nguồn PSU có công suất thực từ $650W - 750W$ trở lên để hệ thống hoạt động ổn định.
3. **Kỹ thuật Tạo Chữ ký Bảo mật SHA-512 cho Thanh toán VNPay:**  
   Để đảm bảo tính toàn vẹn của dữ liệu giao dịch thanh toán trực tuyến, Backend triển khai thuật toán băm HMAC-SHA512 với `vnp_HashSecret` băm toàn bộ các tham số gửi tới VNPay Sandbox, ngăn chặn tuyệt đối các hành vi gian lận sửa đổi số tiền đơn hàng trên Client.

---

## PHẦN 5 – KIỂM THỬ HỆ THỐNG (TESTING & QUALITY ASSURANCE)

### 5.1. Chiến lược và Quy trình Kiểm thử
Hệ thống WINNOTech trải qua 3 giai đoạn kiểm thử nghiêm ngặt:
1. **Kiểm thử Đơn vị (Unit Testing):** Kiểm thử tính đúng đắn của từng hàm xử lý tính toán giá tiền, hàm băm SHA-512, hàm kiểm tra độ dài chuỗi mật khẩu.
2. **Kiểm thử Tích hợp (Integration Testing):** Kiểm thử sự tương tác giữa Express Router -> Middleware JWT -> Mongoose ODM -> MongoDB Database.
3. **Kiểm thử Chấp nhận Người dùng (User Acceptance Testing - UAT):** Kiểm thử toàn bộ kịch bản người dùng thực tế trên giao diện Client và Admin Dashboard.

---

### 5.2. Kiểm thử Website Khách hàng (Client Acceptance Testing - 30 Scenarios)

| STT | Phân hệ | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | Auth | Bỏ trống username/password | Để trống cả 2 ô | Báo lỗi "Vui lòng nhập đầy đủ thông tin" | Hiển thị thông báo chuẩn xác | **PASS** |
| 2 | Auth | Đăng nhập thành công | User: `donghq`, Pass: `123456` | Đăng nhập thành công, lưu JWT Token | Đã lưu Token & chuyển trang | **PASS** |
| 3 | Auth | Mật khẩu không chính xác | User: `donghq`, Pass: `wrongpass` | Báo lỗi "Tên đăng nhập hoặc mật khẩu sai" | Hiện thông báo lỗi đúng | **PASS** |
| 4 | Auth | Đăng ký tài khoản hợp lệ | Email mới, Username mới | Tạo tài khoản thành công | Đăng ký thành công | **PASS** |
| 5 | Auth | Đăng ký trùng Email | Email đã có trong CSDL | Báo lỗi "Email đã được sử dụng" | Hiện thông báo trùng dữ liệu | **PASS** |
| 6 | Auth | Đổi mật khẩu thành công | Đúng pass cũ, pass mới hợp lệ | Đổi pass thành công, yêu cầu login lại | Đổi thành công | **PASS** |
| 7 | Profile | Cập nhật Họ tên, SĐT | Nhập Họ tên mới | Hồ sơ cập nhật thành công | Dữ liệu mới hiển thị ngay | **PASS** |
| 8 | Profile | Upload Avatar mới | Chọn file `.jpg` < 5MB | Tải ảnh lên thư mục `/avatar_user` | Ảnh avatar mới hiển thị | **PASS** |
| 9 | Address | Thêm địa chỉ mới | Nhập tên, SĐT, Địa chỉ, Tỉnh | Địa chỉ mới xuất hiện trong Sổ địa chỉ | Thêm địa chỉ thành công | **PASS** |
| 10 | Address | Đặt địa chỉ Mặc định | Click "Đặt làm mặc định" | Địa chỉ được gán nhãn Mặc định | Chuyển trạng thái chuẩn | **PASS** |
| 11 | Search | Tìm kiếm từ khóa "RTX 4070" | Gõ "RTX 4070" vào thanh search | Danh sách Card màn hình RTX 4070 | Trả về kết quả chính xác | **PASS** |
| 12 | Search | Tìm kiếm không dấu "bo mach chu"| Gõ "bo mach chu" | Trả về các sản phẩm Mainboard | Fuse.js hoạt động chuẩn | **PASS** |
| 13 | Filter | Lọc theo Danh mục CPU | Chọn danh mục "CPU" | Chỉ hiển thị vi xử lý CPU | Hiển thị chính xác CPU | **PASS** |
| 14 | Filter | Lọc theo Thương hiệu ASUS | Chọn brand "ASUS" | Chỉ hiển thị linh kiện nhãn hiệu ASUS | Lọc đúng thương hiệu | **PASS** |
| 15 | Filter | Lọc theo khoảng giá | Chọn 5 triệu - 10 triệu | Chỉ hiển thị linh kiện giá trong khoảng | Lọc khoảng giá chuẩn | **PASS** |
| 16 | Detail | Hiển thị chi tiết linh kiện | Click chọn sản phẩm | Hiển thị đầy đủ Thông số, Giá, Ảnh | Chi tiết tải mượt mà | **PASS** |
| 17 | Detail | Chọn Biến thể RAM | Chọn bản 32GB RAM | Giá bán trên màn hình cập nhật | Giá thay đổi tức thì | **PASS** |
| 18 | Detail | Tăng giảm số lượng mua | Nhấn nút (+) / (-) | Số lượng thay đổi | Nút bấm hoạt động mượt | **PASS** |
| 19 | BuildPC | Chọn linh kiện CPU & GPU | Chọn i7-14700K & RTX 4070 | Tính tổng công suất W tiêu thụ | Hiển thị ước tính Watt | **PASS** |
| 20 | BuildPC | Thêm bộ PC vào Giỏ hàng | Nhấn "Thêm bộ PC vào Giỏ" | Tất cả linh kiện chui vào Giỏ hàng | Đã vào giỏ hàng thành công | **PASS** |
| 21 | BuildPC | Lưu cấu hình PC | Nhấn "Lưu cấu hình" | Cấu hình lưu vào tài khoản cá nhân | Lưu cấu hình thành công | **PASS** |
| 22 | Cart | Thêm linh kiện vào Giỏ hàng | Nhấn "Thêm vào giỏ" | Icon giỏ hàng tăng số lượng | Số lượng badge tăng | **PASS** |
| 23 | Cart | Xóa linh kiện khỏi Giỏ | Nhấn nút xóa biểu tượng thùng rác | Linh kiện biến mất khỏi giỏ | Xóa item chuẩn xác | **PASS** |
| 24 | Cart | Áp dụng Voucher hợp lệ | Nhập mã `WINNOTECH100K` | Tổng tiền giảm 100.000đ | Giảm tiền chính xác | **PASS** |
| 25 | Cart | Áp dụng Voucher hết hạn | Nhập mã `EXPIRED2025` | Báo lỗi "Mã giảm giá đã hết hạn" | Báo lỗi chuẩn | **PASS** |
| 26 | Checkout| Đặt hàng thanh toán COD | Chọn COD, nhấn Đặt hàng | Đơn hàng tạo mới status Pending | Đặt hàng thành công | **PASS** |
| 27 | Checkout| Thanh toán VNPay Sandbox | Chọn VNPay, nhấn Đặt hàng | Chuyển sang Cổng VNPay Sandbox | Chuyển hướng VNPay chuẩn | **PASS** |
| 28 | Orders | Tra cứu mã đơn `WNT...` | Nhập mã đơn & SĐT | Hiển thị đúng trạng thái đơn hàng | Hiển thị chi tiết đơn | **PASS** |
| 29 | Orders | Hủy đơn hàng Chờ xác nhận | Nhấn "Hủy đơn" | Trạng thái đơn chuyển sang Cancelled | Hủy đơn thành công | **PASS** |
| 30 | Chatbot | Hỏi AI tư vấn PC 15 triệu | Gõ: "Tư vấn PC 15 triệu" | AI trả lời danh sách linh kiện hợp lý | Gemini AI phản hồi chuẩn | **PASS** |

---

### 5.3. Kiểm thử Website Quản trị viên (Admin Panel Testing - 25 Scenarios)

| STT | Phân hệ | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | Auth | Đăng nhập tài khoản Admin | User: `admin`, Pass: `admin123` | Đăng nhập thành công vào Admin Panel | Chuyển vào Dashboard | **PASS** |
| 2 | Auth | Tài khoản Client thử vào Admin| Login tài khoản thường | Ngăn chặn, báo lỗi "Không có quyền" | Middleware chặn chuẩn | **PASS** |
| 3 | Product| Thêm mới sản phẩm CPU | Nhập tên, mô tả, chọn danh mục | Sản phẩm lưu vào MongoDB thành công | Báo Toast thành công | **PASS** |
| 4 | Product| Upload nhiều ảnh sản phẩm | Chọn 3 file ảnh qua Multer | Lưu file ảnh vào `/public/uploads/` | Ảnh thumbnail hiển thị | **PASS** |
| 5 | Product| Tạo biến thể sản phẩm | Nhập SKU, giá gốc, giá bán, kho | Biến thể hiển thị trong bảng sản phẩm | Lưu biến thể thành công | **PASS** |
| 6 | Product| Cập nhật giá sản phẩm | Sửa giá từ 5 triệu thành 4.5 triệu| Giá mới hiển thị trên cả Client | Cập nhật giá chuẩn | **PASS** |
| 7 | Product| Xóa mềm sản phẩm | Nhấn nút "Tạm ẩn" | Status chuyển sang 'Hidden', ẩn web | Ẩn sản phẩm chuẩn | **PASS** |
| 8 | Category| Thêm danh mục linh kiện mới | Nhập tên "Tản Nhiệt PC" | Danh mục mới xuất hiện | Thêm danh mục thành công | **PASS** |
| 9 | Category| Upload logo danh mục | Chọn file ảnh logo | Ảnh lưu vào `/frontend/public/image/` | Upload ảnh chuẩn | **PASS** |
| 10 | Brand | Thêm thương hiệu "Corsair" | Nhập tên "Corsair", slug "corsair" | Thương hiệu mới được lưu | Lưu brand thành công | **PASS** |
| 11 | Order | Xem danh sách tất cả đơn hàng| Click tab Đơn hàng | Hiển thị toàn bộ đơn của khách | Bảng đơn hàng load chuẩn | **PASS** |
| 12 | Order | Cập nhật status `Processing` | Chọn đơn 'Pending' -> 'Processing'| Trạng thái đơn cập nhật | Cập nhật thành công | **PASS** |
| 13 | Order | Cập nhật status `Shipping` | Đổi sang 'Shipping' | Gửi email thông báo cho Khách hàng | Email đã gửi tự động | **PASS** |
| 14 | Order | Xóa đơn hàng đã hủy | Nhấn xóa đơn hàng bị Hủy | Đơn hàng xóa khỏi bảng | Xóa đơn thành công | **PASS** |
| 15 | Order | Xuất hóa đơn bán hàng PDF | Nhấn nút "In hóa đơn PDF" | Tải file PDF hóa đơn được sinh bằng PDFKit | File PDF mở chuẩn | **PASS** |
| 16 | Voucher | Tạo mã giảm giá mới | Mã `SALE2026`, giảm 50.000đ | Voucher mới được lưu vào CSDL | Tạo voucher thành công | **PASS** |
| 17 | Voucher | Đặt thời hạn hết hạn voucher | Chọn ngày kết thúc trong quá khứ | Voucher tự chuyển status Expired | Tự hết hạn chuẩn | **PASS** |
| 18 | Customer| Xem danh sách Khách hàng | Click tab Khách hàng | Hiển thị danh sách user role client | Bảng user load mượt | **PASS** |
| 19 | Customer| Tạm khóa tài khoản Khách | Click "Khóa tài khoản" | User status chuyển 'Locked', không login được | Khóa tài khoản chuẩn | **PASS** |
| 20 | Customer| Mở khóa tài khoản Khách | Click "Mở khóa" | User status chuyển 'Active' | Mở khóa thành công | **PASS** |
| 21 | Report | Xuất báo cáo doanh thu Excel | Nhấn nút "Xuất Excel" | Tải file `.xlsx` được tạo bởi ExcelJS | File Excel mở chuẩn | **PASS** |
| 22 | Analytics| Xem biểu đồ doanh thu tháng | Chọn mốc thời gian Tháng 08 | Biểu đồ cột thể hiện tổng tiền | Biểu đồ hiển thị chuẩn | **PASS** |
| 23 | Banner | Thêm banner slide khuyến mãi | Chọn ảnh banner & link sự kiện | Banner mới xuất hiện trên Slide Home | Slider cập nhật banner | **PASS** |
| 24 | Post | Đăng bài tin tức công nghệ | Nhập tiêu đề & nội dung bài viết | Bài viết hiển thị trên mục Tin tức | Đăng bài thành công | **PASS** |
| 25 | Post | Xóa bài viết tin tức | Nhấn xóa bài viết | Bài viết bị loại khỏi danh sách | Xóa bài viết chuẩn | **PASS** |

---

## PHẦN 6 – ĐÓNG GÓI VÀ TRIỂN KHAI HỆ THỐNG

### 6.1. Đóng gói Ứng dụng (Build & Optimization)

1. **Tối ưu hóa và Biên dịch Frontend (React + Vite):**  
   Tại thư mục `frontend/`, chạy lệnh biên dịch sản xuất:
   ```bash
   npm run build
   ```
   Trình biên dịch Vite sẽ tiến hành nén nhỏ các file mã nguồn (Minification), loại bỏ mã thừa (Tree-shaking) và đóng gói toàn bộ ứng dụng React thành bộ file tĩnh HTML/CSS/JS tối ưu dung lượng tại thư mục `dist/`.

2. **Cấu hình Biến Môi trường Backend (Node.js Express):**  
   Tất cả các tham số nhạy cảm được cấu hình trong tập tin `.env`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+sandbox.mongodb.net/winnotech?retryWrites=true&w=majority
   JWT_SECRET=WINNOTECH_PRIVATE_KEY_2026_SECRET_HASH
   VNP_TMNCODE=VNPAY_DEMO_TMNCODE
   VNP_HASHSECRET=VNPAY_DEMO_HASH_SECRET
   VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNP_RETURNURL=http://winnotech.store/api/orders/vnpay_return
   EMAIL_USER=support@winnotech.store
   EMAIL_PASS=smtp_app_password_here
   GEMINI_API_KEY=AIzaSy_Google_Gemini_Key_Here
   ```

---

### 6.2. Hướng dẫn Triển khai Hạ tầng (Deployment Guide)

```
[Khách hàng Truy cập Website]
             |
             v
 [Tên miền: winnotech.store] ---> [Cloudflare CDN / SSL Certificate]
                                                |
               +--------------------------------+--------------------------------+
               |                                                                 |
               v                                                                 v
+-----------------------------+                                   +-----------------------------+
|    FRONTEND DEPLOYMENT      |                                   |     BACKEND DEPLOYMENT      |
|  - Platform: Vercel Cloud   |                                   |  - Platform: Ubuntu VPS     |
|  - Static Assets Delivery   |                                   |  - Process Mgmt: PM2        |
|  - Fast Edge Network CDN    |                                   |  - Reverse Proxy: Nginx     |
+-----------------------------+                                   +-----------------------------+
                                                                                 |
                                                                                 v
                                                                  +-----------------------------+
                                                                  |     DATABASE DEPLOYMENT     |
                                                                  |  - MongoDB Atlas Cloud      |
                                                                  |  - Multi-region Replica Set |
                                                                  +-----------------------------+
```

1. **Triển khai Cơ sở dữ liệu Cloud (MongoDB Atlas):**  
   Tạo Cluster MongoDB Atlas phiên bản Cloud 7.0, thiết lập Database User và thêm cấu hình Network Access IP Whitelist (`0.0.0.0/0`) để tiếp nhận kết nối từ Backend Server.
2. **Triển khai Backend REST API Server (VPS Linux & PM2):**  
   Sử dụng máy chủ Ubuntu Linux 22.04 LTS, cài đặt Node.js v20, clone mã nguồn dự án và khởi chạy quy trình quản lý Node process bằng `PM2`:
   ```bash
   npm install --production
   pm2 start server.js --name "winnotech-backend"
   pm2 save
   pm2 startup
   ```
   Cấu hình **Nginx Reverse Proxy** chuyển tiếp các request từ cổng `80/443` vào Node app cổng `3000` và cài đặt chứng chỉ bảo mật HTTPS mã hóa SSL tự động với `Certbot / Let's Encrypt`.
3. **Triển khai Frontend React App (Vercel Platform):**  
   Kết nối Repository GitHub của dự án với dịch vụ Vercel, cấu hình thư mục Root `/frontend`, thiết lập biến môi trường `VITE_API_URL=https://api.winnotech.store` và thực hiện trỏ Tên miền chính thức `winnotech.store`.

---

## PHẦN 7 – KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 7.1. Thuận lợi khi thực hiện dự án
* Nhóm nhận được sự định hướng, hỗ trợ chuyên môn hết sức tận tình từ **Thầy Trần Bá Hộ** trong suốt các đợt Review đồ án.
* Các thành viên trong nhóm WINNOTech có sự phân công nhiệm vụ rõ ràng (Backend, Frontend UI, Database, Build PC Logic, QA Testing) và tinh thần làm việc nhóm cao.
* Bộ công nghệ MERN/Vite hiện đại giúp quá trình xây dựng ứng dụng diễn ra nhanh chóng, dễ dàng debug và tối ưu hóa hiệu năng.

### 7.2. Khó khăn, Hạn chế và Bài học kinh nghiệm
1. **Khó khăn gặp phải:**  
   Xử lý bài toán logic kiểm tra tương thích và tính toán công suất tiêu thụ điện (W) trong phân hệ **Build PC** đòi hỏi việc tổ chức và chuẩn hóa thuộc tính phần cứng linh kiện hết sức tỉ mỉ.
2. **Hạn chế của hệ thống:**  
   Hệ thống hiện tại mới tích hợp cổng thanh toán VNPay Sandbox, chưa tích hợp thêm các ví điện tử như Momo, ZaloPay. Công cụ Build PC cần bổ sung thêm tính năng cảnh báo va chạm kích thước (Form Factor clearance check) giữa Tản nhiệt CPU và Vỏ Case.
3. **Bài học kinh nghiệm:**  
   Học hỏi được tư duy thiết kế CSDL linh hoạt NoSQL, kỹ năng quản lý State tập trung bằng Redux Toolkit, kỹ thuật bảo mật API với JWT và quy trình làm việc chuyên nghiệp theo mô hình Agile/Scrum.

### 7.3. Kết luận tổng quan & Định hướng phát triển tương lai

Dự án tốt nghiệp **"Phát triển website thương mại điện tử sản phẩm công nghệ và linh kiện máy tính WINNOTech"** đã hoàn thành 100% các mục tiêu đề ra ban đầu. Hệ thống mang đến một giải pháp thương mại điện tử bán lẻ linh kiện PC hoàn chỉnh, hiện đại, tích hợp công cụ Build PC thông minh cùng cổng thanh toán an toàn. Đây là minh chứng rõ nét cho năng lực chuyên môn và sự trưởng thành của nhóm sinh viên chúng em trong lĩnh vực Lập trình Web Full-Stack.

**Định hướng phát triển trong tương lai:**
* Phát triển ứng dụng di động **WINNOTech Mobile App** trên nền tảng React Native cho cả iOS và Android.
* Xây dựng hệ thống **Gợi ý sản phẩm thông minh (AI Recommendation Engine)** dựa trên lịch sử xem và thói quen mua sắm của khách hàng.
* Tích hợp API kết nối tự động với các đơn vị vận chuyển hàng đầu Việt Nam (Giao Hàng Nhanh - GHN, Giao Hàng Tiết Kiệm - GHTK) để tự động hóa tính phí giao hàng và tạo vận đơn thời gian thực.

---

## TÀI LIỆU THAM KHẢO

1. **Node.js Documentation** – *Official API Reference & Guides* (`https://nodejs.org/docs/`)
2. **Express.js Framework Guide** – *Fast, unopinionated, minimalist web framework for Node.js* (`https://expressjs.com/`)
3. **React.js Documentation** – *A JavaScript library for building user interfaces* (`https://react.dev/`)
4. **Vite Build Tool Guide** – *Next Generation Frontend Tooling* (`https://vitejs.dev/`)
5. **MongoDB & Mongoose ODM Manual** – *Document-based database & Object Data Modeling* (`https://mongoosejs.com/docs/`)
6. **Redux Toolkit Documentation** – *The official, opinionated, batteries-included toolset for efficient Redux development* (`https://redux-toolkit.js.org/`)
7. **Tailwind CSS Documentation** – *A utility-first CSS framework for rapid UI development* (`https://tailwindcss.com/docs`)
8. **VNPay Sandbox Developer Portal** – *Tài liệu tích hợp Cổng thanh toán VNPay* (`https://sandbox.vnpayment.vn/vnpayv2/`)
9. **Google Generative AI Node.js SDK** – *Tài liệu tích hợp Gemini AI Model API* (`https://www.npmjs.com/package/@google/generative-ai`)
