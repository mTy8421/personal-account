# 💰 เว็บแอป “บัญชีส่วนตัว” (Personal Expense Tracker)

เว็บแอปพลิเคชันบันทึกและติดตามรายรับ-รายจ่ายส่วนตัว ออกแบบตามสถาปัตยกรรม **Local-first** โดยจัดเก็บข้อมูลทั้งหมดไว้บนเครื่องของคุณเอง 100% ปราศจาก Third-party Cloud หรือ Tracking Analytics เพื่อความเป็นส่วนตัวสูงสุด และสามารถทำงานแบบ Offline ได้โดยสมบูรณ์

---

## ✨ ฟีเจอร์หลัก (Features)

* **ภาพรวมการเงิน (Dashboard):** แสดงยอดเงินทั้งหมด, รายรับเดือนนี้, รายจ่ายเดือนนี้, ยอดคงเหลือ, ชาร์ตสัดส่วนค่าใช้จ่ายตามหมวดหมู่ (Donut Chart) และแนวโน้มรายรับ-รายจ่ายย้อนหลัง (Bar Chart)
* **บันทึกรายการธุรกรรม (Transactions):** รองรับรายรับ, รายจ่าย และการโอนเงินระหว่างบัญชี (Transfer) พร้อมระบบค้นหา, ตัวกรอง (Filter), และแบ่งหน้า (Pagination)
* **การจัดการบัญชี (Accounts):** รองรับหลายบัญชี เช่น เงินสด, ธนาคาร, E-Wallet, บัตรเครดิต พร้อมปุ่ม Reconcile ยอดเงินเพื่อการันตีความถูกต้องของตัวเลข 100%
* **หมวดหมู่ (Categories):** จัดการหมวดหมู่รายรับและรายจ่าย พร้อมไอคอนและสีสัน
* **งบประมาณรายเดือน (Budgets):** กำหนดงบประมาณตามหมวดหมู่ พร้อมแถบ Progress Bar และการแจ้งเตือนเมื่อใช้เงินใกล้หรือเกินงบประมาณ
* **รายงานสรุป (Reports):** รายงานสรุปรายเดือนและรายปี พร้อมกราฟแสดงยอดรายจ่ายในแต่ละวัน
* **ค่าใช้จ่ายประจำ (Recurring Expenses):** บันทึกค่าบริการรายเดือน เช่น ค่าห้อง, บิลค่าไฟ, ค่าเน็ต, Netflix พร้อมปุ่ม "บันทึกรายการทันที"
* **การสำรองและกู้คืนข้อมูล (Backup & Restore):** ส่งออกและนำเข้าข้อมูลได้ 3 รูปแบบ (JSON, CSV, SQLite `.db`) พร้อมหน้าต่างยืนยันความปลอดภัย
* **ระบบความปลอดภัย (PIN Lock):** ล็อกการเข้าถึงด้วยรหัส PIN (เข้ารหัสด้วย PBKDF2 SHA-512 + Salt) และมีระบบรีเซ็ตรหัสผ่านฉุกเฉิน
* **UI/UX & Localization:** รองรับภาษาไทย, สกุลเงินบาท (THB), โหมดมืด/สว่าง (Dark Mode) และ Responsive พร้อมปุ่ม Floating Action Button (+) สำหรับมือถือ

---

## 🛠️ Technology Stack

* **Frontend:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts
* **Backend:** Next.js Server Actions & API Routes, Node.js
* **Database & ORM:** SQLite, Prisma ORM
* **Container:** Docker & Docker Compose

---

## 📁 ตำแหน่งฐานข้อมูล (Database Location)

ฐานข้อมูล SQLite จัดเก็บอยู่ที่:
```text
./data/database.db
```
*(โฟลเดอร์ `/data` และไฟล์ `.db` ถูกเพิ่มใน `.gitignore` เรียบร้อยแล้ว ข้อมูลการเงินจะไม่รั่วไหลไปยัง Git Repository)*

---

## 🚀 วิธีติดตั้งและรันในเครื่อง (Local Setup)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. กำหนดค่า Environment Variables
ตรวจสอบไฟล์ `.env` ที่โฟลเดอร์ราก (Root Directory):
```env
DATABASE_URL="file:../data/database.db"
APP_SECRET="local-expense-tracker-secret-key-change-if-needed-67890"
```

### 3. เตรียมฐานข้อมูลและ Migration
สร้างตารางในฐานข้อมูล SQLite:
```bash
npx prisma db push
```
หรือหากต้องการใช้ Migration:
```bash
npx prisma migrate dev --name init
```

### 4. สร้างข้อมูลเริ่มต้นสำหรับการทดสอบ (Seed Data)
รันคำสั่ง Seed เพื่อสร้างบัญชี, หมวดหมู่, และรายการตัวอย่าง:
```bash
npx prisma db seed
```

### 5. เริ่มต้นรันแอปพลิเคชัน
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่: [http://localhost:3000](http://localhost:3000)

---

## 🐳 วิธีรันด้วย Docker (Docker & Docker Compose)

ระบบรองรับ Docker โดยข้อมูล SQLite จะถูกจัดเก็บในโฟลเดอร์ `./data` ภายนอก Container ผ่าน Volume Mount ทำให้ข้อมูลไม่สูญหายเมื่อหยุดหรือลบ Container

### สั่ง Build และรัน Container ในพื้นหลัง:
```bash
docker compose up -d --build
```

### ตรวจสอบสถานะการทำงาน:
```bash
docker compose ps
```

### หยุดการทำงาน:
```bash
docker compose down
```

---

## 💾 วิธีสำรองและกู้คืนข้อมูล (Backup & Restore)

เข้าเมนู **"สำรอง & กู้คืน" (Settings → Backup & Restore)**

### 1. การส่งออกข้อมูล (Export)
* **JSON:** ดาวน์โหลด Snapshot ข้อมูลทั้งหมดของระบบ (บัญชี, หมวดหมู่, ธุรกรรม, งบประมาณ, รายจ่ายประจำ)
* **CSV:** ดาวน์โหลดรายการธุรกรรมทั้งหมดเพื่อเปิดใช้งานใน Excel หรือ Google Sheets
* **SQLite:** ดาวน์โหลดไฟล์ `database.db` ฉบับเต็ม

### 2. การกู้คืนข้อมูล (Restore)
1. เลือกไฟล์สำรองข้อมูลที่เป็น `.json` หรือ `.db`
2. คลิกปุ่ม **"ดำเนินการกู้คืนข้อมูล (Restore)"**
3. ระบบจะแสดงหน้าต่างยืนยันคำเตือน (การกู้คืนจะเขียนทับข้อมูลปัจจุบัน)
4. กดยืนยัน ระบบจะนำเข้าข้อมูลและ Reconcile ยอดเงินให้อัตโนมัติ

---

## 🔄 วิธีรีเซ็ตฐานข้อมูล (Reset Database)

หากต้องการล้างข้อมูลทั้งหมดแล้วเริ่มต้นใหม่:

### วิธีที่ 1: ผ่าน Prisma CLI
```bash
npx prisma migrate reset
```
*(คำสั่งนี้จะลบตารางทั้งหมด สร้างใหม่ และรัน Seed อัตโนมัติ)*

### วิธีที่ 2: ลบไฟล์ Database โดยตรง
ลบไฟล์:
```text
./data/database.db
```
จากนั้นสั่ง:
```bash
npx prisma db push
npx prisma db seed
```

---

## 🔒 นโยบายความเป็นส่วนตัว (Privacy First)

* ไม่มีการใช้งาน Google Analytics, Meta Pixel หรือ External Telemetry ใดๆ
* ไม่มีการเชื่อมต่อกับ Cloud Database ภายนอก
* ฟอนต์และ Dependencies ทั้งหมดทำงานแบบ Self-contained ภายในเครื่อง
* ระบบสามารถตัดการเชื่อมต่ออินเทอร์เน็ตแล้วใช้งานแบบ Offline ได้อย่างต่อเนื่อง 100%
