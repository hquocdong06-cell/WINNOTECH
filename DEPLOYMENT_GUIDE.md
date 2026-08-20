# 🚀 HƯỚNG DẪN DEPLOY DỰ ÁN WINNOTECH LÊN VPS

- **Server IP:** `103.106.104.186`
- **Domain:** `winnotech.io.vn`

---

## 🛠️ BƯỚC 1: UP CODE LÊN VPS
1. Upload toàn bộ thư mục dự án `WINNOTech` lên thư mục `/var/www/WINNOTech` trên VPS.
2. Tại thư mục `/var/www/WINNOTech/frontend`, chạy lệnh build sản phẩm:
   ```bash
   cd /var/www/WINNOTech/frontend
   npm install
   npm run build
   ```

---

## ⚙️ BƯỚC 2: KHỞI CHẠY BACKEND VỚI PM2
1. Tại thư mục gốc `/var/www/WINNOTech`, tạo file `.env`:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/WINNOTech
   CLIENT_URL=https://winnotech.io.vn
   SESSION_SECRET=winnotech_prod_secret_2026
   ```
2. Cài đặt và chạy PM2 để Backend ngầm 24/7:
   ```bash
   npm install -g pm2
   cd /var/www/WINNOTech
   pm2 start server.js --name "winnotech-backend"
   pm2 save
   pm2 startup
   ```

---

## 🌐 BƯỚC 3: CẤU HÌNH NGINX WEBSERVER
1. Copy file `nginx_winnotech.conf` vào Nginx:
   ```bash
   sudo cp /var/www/WINNOTech/nginx_winnotech.conf /etc/nginx/sites-available/winnotech
   sudo ln -s /etc/nginx/sites-available/winnotech /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 🔒 BƯỚC 4: KÍCH HOẠT SSL HTTPS MIỄN PHÍ (CERTBOT)
Chạy lệnh kích hoạt SSL chính thức cho domain `winnotech.io.vn`:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d winnotech.io.vn -d www.winnotech.io.vn
```

---

## 🎉 HOÀN TẤT
Truy cập ngay `https://winnotech.io.vn` để trải nghiệm hệ thống!
