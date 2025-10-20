# 🚀 คู่มือการติดตั้งและใช้งาน Development Tools สำหรับทีม

คู่มือนี้จะแนะนำวิธีการติดตั้งและใช้งาน development tools ที่ได้ตั้งค่าไว้สำหรับโปรเจค GACP Platform

## 📋 สิ่งที่ได้ติดตั้งแล้ว

### 1. Code Quality Tools

- ✅ **ESLint** - ตรวจสอบคุณภาพโค้ด JavaScript/TypeScript
- ✅ **Prettier** - จัดรูปแบบโค้ดให้สวยงามและสม่ำเสมอ
- ✅ **Husky** - Pre-commit hooks เพื่อตรวจสอบก่อน commit
- ✅ **lint-staged** - รัน linting เฉพาะไฟล์ที่มีการเปลี่ยนแปลง

### 2. Templates & Guidelines

- ✅ **Pull Request Template** - เทมเพลตสำหรับการสร้าง PR
- ✅ **Commit Message Guidelines** - แนวทางการเขียน commit message
- ✅ **Development Guidelines** - แนวทางการพัฒนาสำหรับทีม

### 3. CI/CD Integration

- ✅ **GitHub Actions** - CI workflow ที่อัปเดตแล้วเพื่อใช้ tools ใหม่

## 🛠 การติดตั้งสำหรับสมาชิกใหม่

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/gacp-certify-flow-main.git
cd gacp-certify-flow-main
```

### Step 2: ติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies ทั้งหมด
npm install

# หรือถ้าใช้ pnpm
pnpm install
```

### Step 3: ตั้งค่า Git Hooks

```bash
# เปิดใช้งาน Husky hooks
npm run prepare
```

## 📝 คำสั่งใหม่ที่ใช้ได้

### Code Quality Commands

#### Linting

```bash
# ตรวจสอบ code quality
npm run lint:check

# แก้ไข code quality issues อัตโนมัติ
npm run lint:fix
```

#### Formatting

```bash
# ตรวจสอบ code formatting
npm run format:check

# จัดรูปแบบโค้ดทั้งหมด
npm run format
```

#### Quality Check (รวม)

```bash
# ตรวจสอบทั้ง linting และ formatting
npm run quality

# แก้ไขทั้ง linting และ formatting
npm run quality:fix
```

## 🔄 การทำงานของ Pre-commit Hooks

เมื่อคุณรัน `git commit` ระบบจะ:

1. **ตรวจสอบไฟล์ที่เปลี่ยนแปลง** - เฉพาะไฟล์ที่อยู่ใน staging area
2. **รัน ESLint** - ตรวจสอบและแก้ไข code quality issues
3. **รัน Prettier** - จัดรูปแบบโค้ดให้สวยงาม
4. **อัปเดต staged files** - เพิ่มการเปลี่ยนแปลงกลับเข้า staging

### ถ้าพบ Error จะเกิดอะไร?

- **Commit จะถูกยกเลิก** - คุณจะต้องแก้ไข issues ก่อน
- **ดูรายละเอียด error** - อ่านข้อความ error เพื่อทราบสิ่งที่ต้องแก้ไข
- **แก้ไขและ commit ใหม่** - หลังแก้ไขแล้วให้ commit ใหม่

## 📏 แนวทางการใช้งาน

### สำหรับการพัฒนาใหม่:

1. **อ่าน Development Guidelines** ในไฟล์ `DEVELOPMENT_GUIDELINES.md`
2. **ใช้ Commit Message Guidelines** ตาม `COMMIT_MESSAGE_GUIDELINES.md`
3. **รัน quality check ก่อน push:**
   ```bash
   npm run quality
   ```

### สำหรับการสร้าง Pull Request:

1. **ใช้ PR Template** - จะมีเทมเพลตให้กรอกข้อมูลอัตโนมัติ
2. **ตรวจสอบ CI checks** - รอให้ GitHub Actions ผ่านทั้งหมด
3. **ขอ Code Review** - ตาม checklist ใน PR template

## 🚨 การแก้ไขปัญหาทั่วไป

### ปัญหา: Pre-commit hook ไม่ทำงาน

```bash
# ตรวจสอบว่า Husky ติดตั้งแล้ว
ls -la .husky/

# ติดตั้งใหม่ถ้าจำเป็น
npm run prepare
```

### ปัญหา: ESLint Error ที่แก้ไขไม่ได้

```bash
# ดู error รายละเอียด
npm run lint:check

# ลองแก้ไขอัตโนมัติ
npm run lint:fix

# ถ้ายังไม่ได้ให้แก้ไขด้วยมือตาม error message
```

### ปัญหา: Prettier Conflict

```bash
# รัน format ทั้งโปรเจค
npm run format

# ตรวจสอบว่าทุกไฟล์ผ่าน
npm run format:check
```

### ปัญหา: CI Workflow Failed

1. **ดู GitHub Actions** - ไปที่ Actions tab ใน GitHub
2. **อ่าน error logs** - คลิกเข้าไปดู job ที่ failed
3. **แก้ไข local** - แก้ไขปัญหาใน local machine
4. **ทดสอบ quality** - รัน `npm run quality` ก่อน push
5. **Push อีกครั้ง** - หลังแก้ไขแล้ว

## 📚 ไฟล์ที่เกี่ยวข้อง

### Configuration Files:

- `.eslintrc.json` - การตั้งค่า ESLint
- `.prettierrc.json` - การตั้งค่า Prettier
- `.prettierignore` - ไฟล์ที่ไม่ต้องจัดรูปแบบ
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - Scripts และ dependencies

### Documentation:

- `DEVELOPMENT_GUIDELINES.md` - แนวทางการพัฒนา
- `COMMIT_MESSAGE_GUIDELINES.md` - แนวทางการเขียน commit
- `.github/PULL_REQUEST_TEMPLATE.md` - เทมเพลต PR

### CI/CD:

- `.github/workflows/ci.yml` - GitHub Actions workflow

## 🎯 Benefits ที่ได้รับ

### สำหรับนักพัฒนา:

- ✅ **Code Quality สม่ำเสมอ** - ทุกคนเขียนโค้ดในมาตรฐานเดียวกัน
- ✅ **การแก้ไขน้อยลง** - Pre-commit hooks ช่วยจับปัญหาก่อน
- ✅ **Review ง่ายขึ้น** - โค้ดมี format เหมือนกันทุกครั้ง
- ✅ **การเรียนรู้เร็วขึ้น** - มี guidelines ชัดเจน

### สำหรับทีม:

- ✅ **Collaboration ดีขึ้น** - มี standard ชัดเจน
- ✅ **Bug น้อยลง** - ตรวจสอบคุณภาพอัตโนมัติ
- ✅ **Deployment เสถียร** - CI/CD pipeline ที่น่าเชื่อถือ
- ✅ **Knowledge Sharing** - การถ่ายทอดความรู้ผ่าน guidelines

## 🔧 การ Customize เพิ่มเติม

### เปลี่ยนการตั้งค่า ESLint:

แก้ไขไฟล์ `.eslintrc.json` ตามต้องการ

### เปลี่ยนการตั้งค่า Prettier:

แก้ไขไฟล์ `.prettierrc.json` ตามต้องการ

### เพิ่ม Pre-commit Checks:

แก้ไข `lint-staged` configuration ใน `package.json`

## 📞 การขอความช่วยเหลือ

หากพบปัญหาหรือมีคำถาม:

1. **อ่านไฟล์ documentation** ทั้งหมดก่อน
2. **ลองแก้ไขตาม troubleshooting guide**
3. **สร้าง Issue** ใน GitHub repository
4. **ติดต่อ Tech Lead** หรือ Senior Developer

---

**สำคัญ:** โปรดอ่าน `DEVELOPMENT_GUIDELINES.md` และ `COMMIT_MESSAGE_GUIDELINES.md` ให้ครบถ้วนก่อนเริ่มพัฒนา

Happy Coding! 🎉
