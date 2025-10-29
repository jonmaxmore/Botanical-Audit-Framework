# AWS Deployment Strategy - GACP Platform

## 📊 ประเมินสถานการณ์ปัจจุบัน

### โครงสร้างที่มีอยู่
- ✅ **MongoDB** - ใช้ Mongoose, มี indexes, ออกแบบดีแล้ว
- ✅ **Redis** - สำหรับ cache และ Socket.IO
- ✅ **Express.js** - Backend API
- ✅ **Next.js** - 3 portals (Farmer, Admin, Certificate)

---

## 💰 ค่าใช้จ่าย AWS (ประมาณการ)

### ตัวเลือก 1: MongoDB Atlas (แนะนำ) ⭐
**ไม่ต้องจัดการเอง, ปลอดภัย, มี backup อัตโนมัติ**

| Tier | RAM | Storage | Price/Month | เหมาะกับ |
|------|-----|---------|-------------|----------|
| M0 (Free) | 512MB | 512MB | **ฟรี** | Development/Testing |
| M10 | 2GB | 10GB | **$57** (~2,000฿) | Production (100-1000 users) |
| M20 | 4GB | 20GB | **$140** (~4,900฿) | Production (1000-5000 users) |
| M30 | 8GB | 40GB | **$280** (~9,800฿) | Production (5000+ users) |

**คำแนะนำ:**
- เริ่มด้วย **M0 (ฟรี)** สำหรับ 3-6 เดือนแรก
- อัพเกรดเป็น **M10** เมื่อมีผู้ใช้จริง 100+ คน
- MongoDB Atlas มี **backup อัตโนมัติ**, **monitoring**, **auto-scaling**

---

### ตัวเลือก 2: AWS DocumentDB (ไม่แนะนำ)
**เหมือน MongoDB แต่แพงกว่า**

| Instance | RAM | Price/Month | หมายเหตุ |
|----------|-----|-------------|----------|
| db.t3.medium | 4GB | **$100** (~3,500฿) | ราคาเริ่มต้น |
| + Storage | 10GB | **$10** (~350฿) | เพิ่มตาม GB |
| + Backup | 10GB | **$10** (~350฿) | เพิ่มตาม GB |
| **รวม** | | **$120+** (~4,200฿+) | แพงกว่า Atlas |

**ข้อเสีย:**
- ❌ แพงกว่า MongoDB Atlas
- ❌ ต้องจัดการ VPC, Security Groups เอง
- ❌ ไม่รองรับ MongoDB features บางอย่าง

---

### ตัวเลือก 3: EC2 + MongoDB (ไม่แนะนำ)
**ต้องจัดการทุกอย่างเอง**

| Resource | Spec | Price/Month | หมายเหตุ |
|----------|------|-------------|----------|
| EC2 t3.small | 2GB RAM | **$15** (~525฿) | สำหรับ MongoDB |
| EBS Storage | 20GB | **$2** (~70฿) | SSD |
| Backup (S3) | 20GB | **$0.50** (~18฿) | Manual backup |
| **รวม** | | **$17.50** (~613฿) | ถูกแต่เสี่ยง |

**ข้อเสีย:**
- ❌ ต้องจัดการ backup เอง
- ❌ ไม่มี auto-scaling
- ❌ ต้องดูแล security patches เอง
- ❌ ถ้า server ล่ม ข้อมูลหายได้

---

## 🏗️ สถาปัตยกรรม AWS ที่แนะนำ

### Phase 1: MVP (0-6 เดือน) - ฟรี/ถูก
```
┌─────────────────────────────────────────────────┐
│ AWS Free Tier                                   │
├─────────────────────────────────────────────────┤
│ • EC2 t3.micro (1 instance) - ฟรี 12 เดือน     │
│ • S3 (5GB) - ฟรี 12 เดือน                      │
│ • CloudFront (50GB) - ฟรีตลอด                  │
│ • MongoDB Atlas M0 - ฟรีตลอด                   │
│ • Redis (ElastiCache t3.micro) - $13/เดือน     │
├─────────────────────────────────────────────────┤
│ รวม: ~$13/เดือน (~455฿/เดือน)                  │
└─────────────────────────────────────────────────┘
```

### Phase 2: Production (6+ เดือน) - ปกติ
```
┌─────────────────────────────────────────────────┐
│ AWS Production                                  │
├─────────────────────────────────────────────────┤
│ • EC2 t3.small (2 instances) - $30/เดือน       │
│ • Application Load Balancer - $16/เดือน        │
│ • S3 (50GB) - $1/เดือน                         │
│ • CloudFront (500GB) - $42/เดือน               │
│ • MongoDB Atlas M10 - $57/เดือน                │
│ • Redis (ElastiCache t3.small) - $26/เดือน     │
│ • Route 53 (DNS) - $1/เดือน                    │
├─────────────────────────────────────────────────┤
│ รวม: ~$173/เดือน (~6,055฿/เดือน)               │
└─────────────────────────────────────────────────┘
```

---

## ✅ คำแนะนำสำหรับโครงการคุณ

### 1. Database: ใช้ MongoDB Atlas ⭐⭐⭐⭐⭐
**เหตุผล:**
- ✅ **ฟรี 512MB** (พอสำหรับ 3-6 เดือนแรก)
- ✅ **Backup อัตโนมัติ** (ไม่ต้องกังวลข้อมูลหาย)
- ✅ **Monitoring** (ดูสถิติการใช้งาน)
- ✅ **Auto-scaling** (ขยายตัวอัตโนมัติ)
- ✅ **ไม่ต้องจัดการ** (ประหยัดเวลา)
- ✅ **รองรับ MongoDB 100%** (ไม่ต้องแก้โค้ด)

**ขั้นตอน:**
```bash
1. สมัคร MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
2. สร้าง Cluster (เลือก M0 - ฟรี)
3. เลือก Region: Singapore (ap-southeast-1)
4. คัดลอก Connection String
5. ใส่ใน .env: MONGODB_URI=mongodb+srv://...
```

---

### 2. โครงสร้างโค้ด: ไม่ต้องปรับ ✅
**โค้ดปัจจุบันพร้อม deploy แล้ว!**

✅ **ที่ดีอยู่แล้ว:**
- Mongoose models มี indexes
- Connection pooling
- Error handling
- Environment variables
- Health check endpoints
- Graceful shutdown

❌ **ไม่ต้องแก้:**
- ไม่ต้องเปลี่ยน database
- ไม่ต้องเขียนโค้ดใหม่
- ไม่ต้องปรับ schema

---

### 3. Redis: ใช้ ElastiCache หรือ Upstash

#### ตัวเลือก A: AWS ElastiCache
- **ราคา:** $13-26/เดือน
- **ข้อดี:** อยู่ใน AWS, เร็ว
- **ข้อเสีย:** ต้องตั้งค่า VPC

#### ตัวเลือก B: Upstash Redis (แนะนำ) ⭐
- **ราคา:** ฟรี 10,000 requests/วัน
- **ข้อดี:** ไม่ต้องตั้งค่า, มี REST API
- **ข้อเสีย:** อาจช้ากว่า ElastiCache เล็กน้อย

---

## 📋 Deployment Checklist

### ก่อน Deploy
- [ ] สมัคร MongoDB Atlas (M0 - ฟรี)
- [ ] สมัคร AWS Account
- [ ] เตรียม Domain name
- [ ] สร้าง S3 bucket สำหรับ documents
- [ ] ตั้งค่า Environment variables

### Deploy Backend
- [ ] สร้าง EC2 instance (t3.micro - ฟรี 12 เดือน)
- [ ] ติดตั้ง Node.js 18+
- [ ] Clone repository
- [ ] ตั้งค่า .env
- [ ] ติดตั้ง PM2
- [ ] เริ่ม server: `pm2 start ecosystem.config.js`

### Deploy Frontend
- [ ] Build Next.js apps: `npm run build`
- [ ] Upload to S3
- [ ] ตั้งค่า CloudFront
- [ ] ชี้ Domain name

### Security
- [ ] ตั้งค่า Security Groups
- [ ] เปิดเฉพาะ port 80, 443
- [ ] ติดตั้ง SSL certificate (Let's Encrypt - ฟรี)
- [ ] ตั้งค่า CORS
- [ ] เปิด Rate limiting

---

## 💡 สรุปคำแนะนำ

### ✅ ทำ
1. **MongoDB Atlas M0** (ฟรี) - ไม่ต้องปรับโค้ด
2. **AWS EC2 t3.micro** (ฟรี 12 เดือน) - สำหรับ backend
3. **S3 + CloudFront** (ฟรี 12 เดือน) - สำหรับ frontend
4. **Upstash Redis** (ฟรี) - สำหรับ cache

**ค่าใช้จ่าย 6 เดือนแรก: ~0-500฿/เดือน**

### ❌ ไม่ทำ
1. ❌ AWS DocumentDB (แพง, ไม่คุ้ม)
2. ❌ ติดตั้ง MongoDB บน EC2 (เสี่ยง)
3. ❌ ปรับโครงสร้างโค้ด (ไม่จำเป็น)

---

## 🚀 ขั้นตอนถัดไป

1. สมัคร MongoDB Atlas (5 นาที)
2. สมัคร AWS Account (10 นาที)
3. Deploy backend บน EC2 (30 นาที)
4. Deploy frontend บน S3 (20 นาที)
5. ทดสอบ (1 ชั่วโมง)

**รวมเวลา: ~2 ชั่วโมง**

---

## 📞 ต้องการความช่วยเหลือ?

บอกได้เลยว่าต้องการ:
1. คู่มือ deploy ทีละขั้นตอน
2. สคริปต์ deploy อัตโนมัติ
3. ตั้งค่า MongoDB Atlas
4. ตั้งค่า AWS EC2

**พร้อม deploy เมื่อไหร่ก็ได้!** 🚀
