# คู่มือแก้ปัญหา MongoDB - GACP Platform

## 🎯 แนะนำ: ใช้ MongoDB Atlas (ฟรี 512MB)

### ขั้นตอนที่ 1: สร้าง MongoDB Atlas Account (3 นาที)

1. ไปที่ https://www.mongodb.com/cloud/atlas/register
2. สมัครฟรี (ใช้ Google/Email)
3. เลือก **M0 Free Tier** (512MB ฟรีตลอดชีพ)
4. เลือก Region: **Singapore (ap-southeast-1)** ใกล้ไทยที่สุด

### ขั้นตอนที่ 2: สร้าง Database User

1. ไปที่ **Database Access** → **Add New Database User**
2. Username: `gacp_admin`
3. Password: สร้าง password แรง (เก็บไว้)
4. Database User Privileges: **Read and write to any database**
5. คลิก **Add User**

### ขั้นตอนที่ 3: เปิด Network Access

1. ไปที่ **Network Access** → **Add IP Address**
2. เลือก **Allow Access from Anywhere** (0.0.0.0/0)
3. คลิก **Confirm**

### ขั้นตอนที่ 4: Get Connection String

1. ไปที่ **Database** → คลิก **Connect**
2. เลือก **Connect your application**
3. Driver: **Node.js** version **5.5 or later**
4. คัดลอก Connection String:
   ```
   mongodb+srv://gacp_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. แทนที่ `<password>` ด้วย password จริง

### ขั้นตอนที่ 5: อัพเดท .env

แก้ไขไฟล์ `apps/backend/.env`:

```env
# เปลี่ยนจาก localhost เป็น MongoDB Atlas
MONGODB_URI=mongodb+srv://gacp_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gacp-platform?retryWrites=true&w=majority
```

**เสร็จแล้ว!** ไม่ต้องติดตั้ง MongoDB ในเครื่อง

---

## ตัวเลือกที่ 2: AWS DocumentDB (สำหรับ Production)

### ข้อดี
- ✅ Compatible กับ MongoDB API
- ✅ Fully managed by AWS
- ✅ Auto backup, scaling, monitoring
- ✅ VPC security

### ข้อเสีย
- ❌ ไม่มี Free Tier (ราคาเริ่ม ~$200/เดือน)
- ❌ ต้องอยู่ใน VPC (ไม่สามารถเข้าถึงจาก local ได้โดยตรง)

### Terraform Configuration (มีอยู่แล้ว)

ไฟล์: `infrastructure/terraform/documentdb.tf`

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

---

## ตัวเลือกที่ 3: AWS RDS for PostgreSQL (ทางเลือก)

ถ้าต้องการเปลี่ยนจาก MongoDB → PostgreSQL:

### ข้อดี
- ✅ AWS RDS มี Free Tier (750 ชม./เดือน, 12 เดือนแรก)
- ✅ Relational database (ACID compliance)
- ✅ ง่ายต่อการ backup/restore

### ข้อเสีย
- ❌ ต้องเขียน code ใหม่ทั้งหมด (Mongoose → Sequelize/Prisma)
- ❌ ใช้เวลา 2-3 สัปดาห์ในการ migrate

**ไม่แนะนำ** เพราะเสียเวลามาก

---

## ตัวเลือกที่ 4: Redis เป็น Primary Database

ถ้าไม่ต้องการ MongoDB เลย:

### ข้อดี
- ✅ เร็วมาก (in-memory)
- ✅ มีอยู่แล้วในระบบ (ใช้สำหรับ cache)

### ข้อเสีย
- ❌ ไม่เหมาะกับ complex queries
- ❌ ต้องเขียน code ใหม่ทั้งหมด
- ❌ ข้อมูลหายถ้า server restart (ถ้าไม่ใช้ persistence)

**ไม่แนะนำ** สำหรับระบบนี้

---

## 🎯 คำแนะนำสุดท้าย

### สำหรับ Development (ตอนนี้)
→ **ใช้ MongoDB Atlas Free Tier**
- ฟรี 512MB
- ไม่ต้องติดตั้งอะไร
- Setup 5 นาที

### สำหรับ Production (ในอนาคต)
→ **ใช้ AWS DocumentDB**
- Fully managed
- Auto scaling
- High availability
- Backup & monitoring

---

## 🚀 Quick Start (แนะนำ)

1. สร้าง MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. สร้าง Free Cluster (M0)
3. สร้าง Database User
4. เปิด Network Access (0.0.0.0/0)
5. คัดลอก Connection String
6. แก้ไข `apps/backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gacp-platform
   ```
7. เริ่ม server:
   ```bash
   cd apps/backend
   npm run dev
   ```

**เสร็จแล้ว!** ไม่ต้องติดตั้ง MongoDB ในเครื่อง

---

## ❓ คำถามที่พบบ่อย

**Q: MongoDB Atlas ฟรีจริงหรือ?**  
A: ใช่ M0 Free Tier ฟรีตลอดชีพ (512MB storage, shared CPU)

**Q: ถ้าข้อมูลเกิน 512MB?**  
A: Upgrade เป็น M10 ($0.08/ชม. ≈ $57/เดือน) หรือใช้ AWS DocumentDB

**Q: ปลอดภัยหรือไม่?**  
A: ปลอดภัย มี SSL/TLS encryption, IP whitelist, authentication

**Q: ต้องเปลี่ยน code หรือไม่?**  
A: ไม่ต้อง แค่เปลี่ยน connection string ใน .env

**Q: Redis ต้องใช้ AWS ElastiCache หรือไม่?**  
A: ไม่จำเป็น ใช้ Upstash Redis (ฟรี 10,000 commands/วัน) หรือ Redis Cloud (ฟรี 30MB)

---

## 📞 ต้องการความช่วยเหลือ?

บอกผมว่าเลือกใช้ตัวเลือกไหน แล้วผมจะช่วย setup ให้ครับ
