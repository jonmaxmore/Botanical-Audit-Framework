# 🎭 GACP Platform Demo System

## ภาพรวม

ระบบ Demo ที่ครบวงจรสำหรับแพลตฟอร์ม GACP (Good Agricultural and Collection Practices) ที่แสดงการทำงานของระบบรับรองมาตรฐานทางการเกษตรแบบครบวงจร

## 🚀 คุณสมบัติที่สร้างเสร็จ

### ✅ สำเร็จแล้ว

1. **Demo Main Page** (`/demo/index/page.tsx`)
   - หน้าหลักสำหรับเลือกบทบาทผู้ใช้
   - การแสดงภาพรวมระบบและ workflow
   - สถิติการใช้งานแบบ real-time

2. **Farmer Portal Demo** (`/demo/farmer/page.tsx`)
   - Dashboard เกษตรกร
   - การจัดการคำขอใบรับรอง
   - ติดตามสถานะการตรวจสอบ
   - จัดการใบรับรองและเอกสาร

3. **Inspector Portal Demo** (`/demo/inspector/page.tsx`)
   - Dashboard ผู้ตรวจสอบ
   - งานที่ได้รับมอบหมาย
   - ปฏิทินการตรวจสอบ
   - จัดทำรายงานการตรวจสอบ

4. **Demo Components**
   - `DemoDashboard.tsx` - แสดงภาพรวมตามบทบาท
   - `DemoNavigation.tsx` - การนำทางและควบคุม workflow

5. **Demo Data Structure** (`lib/demoData.ts`)
   - ข้อมูลจำลองสำหรับทุกบทบาท
   - Applications, Inspections, Certificates
   - ข้อมูลผู้ใช้และฟาร์ม

6. **Demo Controller** (`lib/demoController.ts`)
   - จัดการ workflow scenarios
   - การสลับบทบาทผู้ใช้
   - การติดตาม session และ state

## 🛠️ การติดตั้งและใช้งาน

### Prerequisites

- Node.js 18+
- npm หรือ pnpm
- Next.js 14+

### เรียกใช้งาน Demo

```bash
# เข้าไปยัง farmer-portal
cd apps/farmer-portal

# ติดตั้ง dependencies
npm install

# รันแอพ
npm run dev
```

### เข้าถึง Demo System

- **Demo Main Page**: `http://localhost:3000/demo/index`
- **Farmer Portal**: `http://localhost:3000/demo/farmer`
- **Inspector Portal**: `http://localhost:3000/demo/inspector`

## 📱 User Roles & Features

### 🌾 Farmer Portal (เกษตรกร)

- **หน้าแรก**: ภาพรวมคำขอและใบรับรอง
- **คำขอของฉัน**: จัดการคำขอใหม่และติดตามสถานะ
- **การตรวจสอบ**: ดูกำหนดการตรวจสอบ
- **ใบรับรอง**: จัดการใบรับรองที่ได้รับ
- **ข้อมูลส่วนตัว**: จัดการข้อมูลเกษตรกรและฟาร์ม

### 🔍 Inspector Portal (ผู้ตรวจสอบ)

- **หน้าแรก**: ภาพรวมงานที่ได้รับมอบหมาย
- **งานที่ได้รับมอบหมาย**: รายการตรวจสอบที่ต้องทำ
- **ปฏิทิน**: กำหนดการตรวจสอบรายวัน/เดือน
- **รายงาน**: จัดทำและจัดการรายงานการตรวจสอบ
- **ข้อมูลส่วนตัว**: จัดการข้อมูลผู้ตรวจสอบ

## 🔧 โครงสร้างไฟล์

```
apps/farmer-portal/
├── app/demo/
│   ├── index/page.tsx          # หน้าหลัก Demo
│   ├── farmer/page.tsx         # Portal เกษตรกร
│   └── inspector/page.tsx      # Portal ผู้ตรวจสอบ
├── components/
│   ├── DemoDashboard.tsx       # Dashboard component
│   └── DemoNavigation.tsx      # Navigation component
└── lib/
    ├── demoData.ts             # ข้อมูลจำลอง
    └── demoController.ts       # Controller สำหรับ workflow
```

## 🎯 Demo Scenarios

### Scenario 1: เกษตรกรใหม่ยื่นคำขอครั้งแรก

1. สมัครสมาชิกในระบบ
2. กรอกข้อมูลฟาร์มและส่งเอกสาร
3. ยื่นคำขอรับรอง GACP
4. รอการตรวจสอบเอกสาร
5. นัดหมายการตรวจสอบในพื้นที่
6. รับผลการประเมิน

### Scenario 2: การตรวจประเมินในพื้นที่

1. ผู้ตรวจสอบรับงานที่มอบหมาย
2. เตรียมเอกสารและอุปกรณ์
3. เดินทางไปตรวจสอบในฟาร์ม
4. บันทึกผลการตรวจสอบ
5. จัดทำรายงานประเมิน
6. ส่งรายงานให้ผู้ประเมิน

### Scenario 3: การบริหารจัดการระบบ

1. ภาพรวมสถิติการใช้งาน
2. จัดการผู้ใช้และสิทธิ์
3. ตรวจสอบคุณภาพการประเมิน
4. จัดทำรายงานสรุป

## 📊 ข้อมูลจำลอง (Mock Data)

### ผู้ใช้งาน

- **เกษตรกร**: สมชาย ใจดี (somchai.farmer@email.com)
- **ผู้ตรวจสอบ**: วิชัย รักษาทรัพย์ (vichai.inspector@gacp.go.th)
- **ผู้ประเมิน**: สุทธิ รักแผ่นดิน (suthi.reviewer@gacp.go.th)
- **ผู้บริหาร**: ประยุทธ์ บริหารงาน (prayuth.admin@gacp.go.th)

### ข้อมูลฟาร์ม

- ฟาร์มผักออร์แกนิก สมชาย (5 ไร่, ผักใบเขียว)
- แปลงข้าวอินทรีย์ สมชาย (10 ไร่, ข้าว)

### สถิติระบบ

- คำขอทั้งหมด: 2,547 รายการ
- ใบรับรองที่ออกแล้ว: 1,892 ใบ
- อยู่ระหว่างดำเนินการ: 325 รายการ
- ผู้ใช้งานทั้งหมด: 1,247 คน

## 🚨 ปัญหาที่ยังต้องแก้ไข

### TypeScript Issues

1. **Data Structure Mismatch**: โครงสร้างข้อมูลใน `demoData.ts` ไม่ตรงกับการใช้งานใน components
2. **Property Mapping**: หาคุณสมบัติ `farmerId` ไม่เจอในข้อมูล applications และ inspections
3. **Type Safety**: การใช้ `any` type ที่ควรเปลี่ยนเป็น specific interfaces

### Missing Features

1. **Reviewer Portal**: ยังไม่ได้สร้างหน้า demo สำหรับผู้ประเมิน
2. **Admin Portal**: ยังไม่ได้สร้างหน้า demo สำหรับผู้บริหาร
3. **Interactive Workflow**: ยังไม่ได้เชื่อมโยง demo navigation ให้ทำงานเต็มที่

## 📝 Todo List

- [ ] แก้ไข data structure และ property mapping
- [ ] สร้าง Reviewer Portal Demo
- [ ] สร้าง Admin Portal Demo
- [ ] ปรับปรุง demo navigation ให้ทำงานได้
- [ ] ทดสอบ demo workflows ทั้งหมด
- [ ] ปรับปรุง UI และ user experience

## 🎨 การออกแบบ UI

### Color Scheme

- **เกษตรกร**: เขียว (#22c55e)
- **ผู้ตรวจสอบ**: น้ำเงิน (#3b82f6)
- **ผู้ประเมิน**: ม่วง (#8b5cf6)
- **ผู้บริหาร**: แดง (#ef4444)

### Icons

- 🌾 เกษตรกร (Farmer)
- 🔍 ผู้ตรวจสอบ (Inspector)
- 📋 ผู้ประเมิน (Reviewer)
- ⚙️ ผู้บริหาร (Admin)

## 📖 การใช้งาน Demo

1. **เริ่มต้น**: เข้า `/demo/index` เลือกบทบาทที่ต้องการ
2. **Navigation**: ใช้ Demo Navigation Component เพื่อควบคุม scenario
3. **Role Switching**: สลับบทบาทได้ผ่าน dropdown ใน navigation
4. **Reset**: รีเซ็ต demo ได้ตลอดเวลา

## 🔗 เอกสารที่เกี่ยวข้อง

- [GACP Platform Overview](../README.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)
- [Clean Architecture Guide](../docs/CLEAN_ARCHITECTURE_TECHNICAL_DOCUMENTATION.md)
- [Enterprise Infrastructure](../ENTERPRISE_DEPLOYMENT_SUMMARY.md)

---

**สถานะ**: Demo System พื้นฐานสร้างเสร็จ ✅  
**เวอร์ชัน**: 1.0.0  
**อัปเดตล่าสุด**: มีนาคม 2567  
**ผู้พัฒนา**: GACP Development Team
