# 📋 ระบบปริ้นใบงาน

Web app สำหรับจัดการและปริ้นใบงาน ทำด้วย React + Vite + Supabase

---

## 🚀 Setup ทีละขั้น

### 1. Supabase — สร้าง Table + Storage

1. เข้า [supabase.com](https://supabase.com) → เลือก project ของคุณ
2. ไปที่ **SQL Editor** → วาง code ทั้งหมดจากไฟล์ `supabase_schema.sql` แล้วกด **Run**
3. ไปที่ **Storage** → ตรวจสอบว่ามี bucket ชื่อ `worksheets` และตั้ง **Public: true**

### 2. ตั้งค่า Environment Variables

```bash
# copy ไฟล์ตัวอย่าง
cp .env.example .env
```

เปิดไฟล์ `.env` แล้วใส่ค่าจาก Supabase Dashboard > Settings > API:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 3. ติดตั้งและรัน

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## ☁️ Deploy บน Vercel

1. Push โค้ดขึ้น GitHub repository
2. เข้า [vercel.com](https://vercel.com) → Import Git Repository
3. ไปที่ **Settings > Environment Variables** เพิ่ม:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. กด **Deploy** — เสร็จ!

> **หมายเหตุ:** ไฟล์ `.env` ไม่ได้ commit ขึ้น GitHub (อยู่ใน .gitignore)
> ต้องใส่ env vars ใน Vercel dashboard ทุกครั้ง

---

## 📁 โครงสร้างโปรเจกต์

```
worksheet-app/
├── src/
│   ├── components/
│   │   ├── PreviewModal.jsx   # ดู PDF/รูปแบบ modal
│   │   ├── EditModal.jsx      # แก้ไขชื่อใบงาน
│   │   └── DeleteModal.jsx    # ลบ (ต้องพิมพ์ยืนยัน)
│   ├── pages/
│   │   ├── WorksheetsPage.jsx # หน้าหลัก
│   │   ├── UploadPage.jsx     # อัปโหลด + แยกหน้า PDF
│   │   ├── HistoryPage.jsx    # ประวัติปริ้น
│   │   └── SubjectsPage.jsx   # จัดการวิชา
│   ├── lib/
│   │   ├── supabase.js        # Supabase client + helpers
│   │   └── pdf.js             # PDF.js page extractor
│   ├── hooks/
│   │   └── useToast.js
│   ├── App.jsx                # Global state + routing
│   ├── main.jsx
│   └── index.css
├── supabase_schema.sql        # SQL สำหรับ run ใน Supabase
├── .env.example
├── .gitignore
└── vite.config.js
```

---

## ✨ ฟีเจอร์

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| อัปโหลด PDF/JPG | แยกหน้าอัตโนมัติ เลือกหน้าที่ต้องการได้ |
| Preview | ดูรูป thumbnail ทุกหน้า หรือ embed PDF ต้นฉบับ |
| เลือกหลายใบ | คลิกเลือก ดับเบิลคลิก preview |
| ปริ้นพร้อมกัน | เลือกหลายวิชา หลายใบงาน |
| ประวัติปริ้น | เก็บไว้ใน Supabase ถาวร |
| แก้ไขชื่อ | เปลี่ยนชื่อและวิชาได้ |
| ลบพร้อมยืนยัน | ต้องพิมพ์ "จะลบแล้วนะ" |
| เพิ่มวิชา | เพิ่มได้ไม่จำกัด เลือกสีธีม |
| บันทึกถาวร | Supabase DB + Storage |
