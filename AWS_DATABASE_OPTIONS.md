# AWS Database Options - GACP Platform

## 🎯 สรุปเปรียบเทียบ

| Database | Free Tier | ราคา/เดือน | เปลี่ยน Code | แนะนำ |
|----------|-----------|-----------|-------------|-------|
| **MongoDB Atlas** | ✅ 512MB ฟรีตลอดชีพ | $0 | ❌ ไม่ต้อง | ⭐⭐⭐⭐⭐ |
| **AWS DynamoDB** | ✅ 25GB ฟรีตลอดชีพ | $0 | ✅ ต้อง (2 สัปดาห์) | ⭐⭐⭐⭐ |
| **AWS DocumentDB** | ❌ ไม่มี | ~$54+ | ❌ ไม่ต้อง | ⭐⭐⭐ |
| **AWS RDS PostgreSQL** | ✅ ฟรี 12 เดือน | $15-30 | ✅ ต้อง (3 สัปดาห์) | ⭐⭐ |

---

## ตัวเลือกที่ 1: MongoDB Atlas (แนะนำที่สุด) ⭐⭐⭐⭐⭐

### ข้อดี
- ✅ **ฟรี 512MB ตลอดชีพ** (ไม่มีค่าใช้จ่าย)
- ✅ ไม่ต้องเปลี่ยน code เลย (แค่เปลี่ยน connection string)
- ✅ Setup 5 นาที
- ✅ เชื่อมต่อจาก AWS EC2/ECS/Lambda ได้
- ✅ Auto backup, monitoring, scaling
- ✅ Region Singapore (ใกล้ไทย, latency ต่ำ)

### ข้อเสีย
- ❌ ไม่ใช่บริการของ AWS โดยตรง (แต่ใช้ร่วมกับ AWS ได้)

### ราคา
- **M0 (Free):** 512MB storage, shared CPU - **ฟรีตลอดชีพ**
- **M10:** 10GB storage, 2GB RAM - **$57/เดือน**
- **M20:** 20GB storage, 4GB RAM - **$140/เดือน**

### Setup (5 นาที)
```bash
# 1. สร้าง account: https://www.mongodb.com/cloud/atlas/register
# 2. เลือก M0 Free Tier
# 3. Region: Singapore (ap-southeast-1)
# 4. สร้าง Database User
# 5. Network Access: 0.0.0.0/0
# 6. Get Connection String
```

### แก้ไข .env
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gacp-platform?retryWrites=true&w=majority
```

**เสร็จแล้ว!** ไม่ต้องเปลี่ยน code

---

## ตัวเลือกที่ 2: AWS DynamoDB (ฟรีตลอดชีพ) ⭐⭐⭐⭐

### ข้อดี
- ✅ **AWS Free Tier: 25GB storage ฟรีตลอดชีพ**
- ✅ 25 WCU + 25 RCU ฟรี (เพียงพอสำหรับระบบเล็ก-กลาง)
- ✅ Serverless, auto-scaling
- ✅ Fully managed by AWS
- ✅ Single-digit millisecond latency

### ข้อเสีย
- ❌ ต้องเขียน code ใหม่ (Mongoose → AWS SDK)
- ❌ NoSQL แบบ Key-Value (ไม่มี complex queries)
- ❌ ใช้เวลา migrate 1-2 สัปดาห์

### ราคา
- **Free Tier:** 25GB storage + 25 WCU + 25 RCU - **ฟรีตลอดชีพ**
- **On-Demand:** $1.25/ล้าน write, $0.25/ล้าน read
- **Provisioned:** $0.00065/WCU/ชม., $0.00013/RCU/ชม.

### ตัวอย่าง Code Migration

**ก่อน (Mongoose):**
```javascript
const User = require('./models/User');
const user = await User.findOne({ email: 'test@example.com' });
```

**หลัง (DynamoDB):**
```javascript
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const result = await client.send(new GetItemCommand({
  TableName: 'Users',
  Key: { email: { S: 'test@example.com' } }
}));
```

### เวลาที่ใช้
- Migration code: 1-2 สัปดาห์
- Testing: 3-5 วัน
- **รวม: 2-3 สัปดาห์**

---

## ตัวเลือกที่ 3: AWS DocumentDB (Compatible กับ MongoDB) ⭐⭐⭐

### ข้อดี
- ✅ Compatible กับ MongoDB API (ไม่ต้องเปลี่ยน code มาก)
- ✅ Fully managed by AWS
- ✅ Auto backup, scaling, monitoring
- ✅ High availability (Multi-AZ)

### ข้อเสีย
- ❌ **ไม่มี Free Tier**
- ❌ ราคาแพง (เริ่ม $54/เดือน)
- ❌ ต้องอยู่ใน VPC (ไม่สามารถเข้าถึงจาก local ได้โดยตรง)

### ราคา (ap-southeast-1)
| Instance | vCPU | RAM | Storage | ราคา/เดือน |
|----------|------|-----|---------|-----------|
| db.t3.medium | 2 | 4GB | 10GB | ~$54 |
| db.r5.large | 2 | 16GB | 50GB | ~$207 |
| db.r5.xlarge | 4 | 32GB | 100GB | ~$419 |

**+ Storage:** $0.10/GB/เดือน  
**+ I/O:** $0.20/ล้าน requests  
**+ Backup:** $0.021/GB/เดือน

### Setup (Terraform)
```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### แก้ไข .env
```env
MONGODB_URI=mongodb://username:password@docdb-cluster.cluster-xxxxx.ap-southeast-1.docdb.amazonaws.com:27017/gacp-platform?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

---

## ตัวเลือกที่ 4: AWS RDS PostgreSQL (ฟรี 12 เดือน) ⭐⭐

### ข้อดี
- ✅ **Free Tier: 750 ชม./เดือน (12 เดือนแรก)**
- ✅ 20GB storage ฟรี
- ✅ Relational database (ACID compliance)
- ✅ Fully managed by AWS

### ข้อเสีย
- ❌ ต้องเขียน code ใหม่ทั้งหมด (Mongoose → Sequelize/Prisma)
- ❌ ฟรีแค่ 12 เดือน (หลังจากนั้น ~$15-30/เดือน)
- ❌ ใช้เวลา migrate 3-4 สัปดาห์

### ราคา (หลัง 12 เดือน)
- **db.t3.micro:** 1 vCPU, 1GB RAM - ~$15/เดือน
- **db.t3.small:** 2 vCPU, 2GB RAM - ~$30/เดือน

---

## 🎯 คำแนะนำสำหรับคุณ

### สำหรับ Development + Testing (ตอนนี้)
→ **ใช้ MongoDB Atlas Free Tier**
- ฟรี 512MB
- Setup 5 นาที
- ไม่ต้องเปลี่ยน code

### สำหรับ Production (ในอนาคต)

**ถ้าข้อมูลน้อย (<25GB):**
→ **AWS DynamoDB Free Tier**
- ฟรีตลอดชีพ
- Serverless, auto-scaling

**ถ้าข้อมูลเยอะ (>25GB):**
→ **AWS DocumentDB**
- Fully managed
- Compatible กับ MongoDB
- ~$54/เดือน

---

## 💡 แผนการใช้งานแนะนำ

### Phase 1: Development (0-3 เดือน)
```
MongoDB Atlas Free Tier (512MB)
↓
ฟรี, ไม่ต้องเปลี่ยน code
```

### Phase 2: Beta Testing (3-6 เดือน)
```
MongoDB Atlas M10 ($57/เดือน)
หรือ
AWS DynamoDB Free Tier (ฟรี)
↓
ถ้าข้อมูล <25GB ใช้ DynamoDB ฟรี
ถ้าข้อมูล >25GB ใช้ Atlas M10
```

### Phase 3: Production (6+ เดือน)
```
AWS DocumentDB (~$54/เดือน)
หรือ
MongoDB Atlas M20 ($140/เดือน)
↓
ขึ้นอยู่กับ traffic และ budget
```

---

## 📊 ตารางเปรียบเทียบราคา (1 ปี)

| Database | Setup Time | Year 1 Cost | Year 2+ Cost |
|----------|-----------|-------------|--------------|
| MongoDB Atlas Free | 5 นาที | $0 | $0 |
| MongoDB Atlas M10 | 5 นาที | $684 | $684 |
| AWS DynamoDB Free | 2 สัปดาห์ | $0 | $0 |
| AWS DocumentDB | 1 วัน | $648+ | $648+ |
| AWS RDS PostgreSQL | 3 สัปดาห์ | $0 (12 เดือน) | $180-360 |

---

## 🚀 Quick Decision

**คำถาม 1:** ต้องการใช้ฟรีตลอดชีพหรือไม่?
- ✅ ใช่ → **MongoDB Atlas Free** หรือ **AWS DynamoDB**
- ❌ ไม่ → **AWS DocumentDB**

**คำถาม 2:** ต้องการเปลี่ยน code หรือไม่?
- ❌ ไม่ต้องการ → **MongoDB Atlas**
- ✅ ยินดี → **AWS DynamoDB** (ฟรีตลอดชีพ)

**คำถาม 3:** ต้องการ AWS-native หรือไม่?
- ✅ ใช่ → **AWS DynamoDB** (ฟรี) หรือ **AWS DocumentDB** (เสียเงิน)
- ❌ ไม่ → **MongoDB Atlas** (ฟรี)

---

## 📞 คำแนะนำสุดท้าย

**สำหรับคุณ:**
1. **ตอนนี้:** ใช้ **MongoDB Atlas Free** (5 นาที, ฟรี, ไม่ต้องเปลี่ยน code)
2. **ในอนาคต:** Migrate ไป **AWS DynamoDB** (ฟรีตลอดชีพ, AWS-native)

หรือถ้ามี budget:
1. **ตอนนี้:** ใช้ **AWS DocumentDB** (~$54/เดือน, AWS-native, ไม่ต้องเปลี่ยน code)

**ต้องการให้ผมช่วย setup ตัวไหนครับ?**
