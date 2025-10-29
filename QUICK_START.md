# 🚀 GACP Platform - Quick Start Guide

## สถานะปัจจุบัน

✅ **Backend Code:** 95% พร้อม (แก้ไข bugs แล้ว)  
✅ **MongoDB Atlas:** Connected  
✅ **Docker Config:** พร้อม  
✅ **Terraform Config:** พร้อม  
⏳ **AWS Deployment:** รอ prerequisites

---

## ขั้นตอนที่เหลือ

### 1. ติดตั้ง AWS CLI

**Download:**
```
https://awscli.amazonaws.com/AWSCLIV2.msi
```

**ติดตั้งแล้ว ทดสอบ:**
```powershell
aws --version
# Expected: aws-cli/2.x.x
```

**Configure:**
```powershell
aws configure
```

ใส่:
- AWS Access Key ID: `[จาก AWS Console]`
- AWS Secret Access Key: `[จาก AWS Console]`
- Region: `ap-southeast-1`
- Output: `json`

**ทดสอบ:**
```powershell
aws sts get-caller-identity
```

---

### 2. ติดตั้ง Terraform

**Download:**
```
https://www.terraform.io/downloads
```

**ทดสอบ:**
```powershell
terraform --version
```

---

### 3. ติดตั้ง Docker Desktop

**Download:**
```
https://www.docker.com/products/docker-desktop
```

**เปิด Docker Desktop แล้วทดสอบ:**
```powershell
docker --version
docker ps
```

---

### 4. Deploy to AWS

**เมื่อติดตั้งครบทั้ง 3 ตัว:**

```powershell
# Run deployment script
.\deploy.ps1
```

**หรือ Manual:**
```powershell
# 1. Get Account ID
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text

# 2. Generate secrets
$FARMER_SECRET = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
$DTAM_SECRET = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. Create ECR
aws ecr create-repository --repository-name gacp-backend --region ap-southeast-1

# 4. Build Docker
cd apps\backend
docker build -t gacp-backend .

# 5. Login to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com"

# 6. Push Docker
docker tag gacp-backend:latest "$ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest"
docker push "$ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest"

# 7. Deploy Terraform
cd ..\..\infrastructure\aws
terraform init
terraform plan
terraform apply
```

---

## ⏱️ เวลาที่ใช้

- Install prerequisites: 10 นาที
- Deploy to AWS: 20 นาที
- **รวม: 30 นาที**

---

## 💰 ค่าใช้จ่าย

- **ปีแรก:** $50-80/เดือน (Free Tier)
- **หลังปีแรก:** $107-127/เดือน

---

## 📞 ติดปัญหา?

**ถ้า AWS CLI ไม่ติดตั้ง:**
- Download: https://awscli.amazonaws.com/AWSCLIV2.msi
- Restart PowerShell หลังติดตั้ง

**ถ้าไม่มี AWS Account:**
- สมัครที่: https://aws.amazon.com/free/
- ใช้เวลา 5 นาที

**ถ้า Docker ไม่ทำงาน:**
- เปิด Docker Desktop
- รอจน status เป็น "Running"

---

## 🎯 Next Steps

1. ✅ ติดตั้ง AWS CLI
2. ✅ Configure AWS credentials
3. ✅ ติดตั้ง Terraform
4. ✅ ติดตั้ง Docker Desktop
5. 🚀 Run `.\deploy.ps1`

---

**พร้อมแล้ว?** รัน `.\deploy.ps1`
