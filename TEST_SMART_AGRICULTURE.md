# Smart Agriculture API - Testing Guide

## ✅ Setup Complete

API Key configured: `d1fcda4879642ac49a91e3e04384ee77`

---

## Start Server

```bash
cd apps/backend
npm run dev
```

---

## Test APIs

### 1. Provinces (No API key needed)

```bash
curl http://localhost:3000/api/smart-agriculture/provinces
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "เชียงใหม่",
      "region": "north",
      "avgTemp": 25,
      "avgRainfall": 1200,
      "cannabisSuitability": 9,
      "tips": "เหมาะสำหรับปลูกกัญชาคุณภาพสูง"
    }
  ]
}
```

---

### 2. Weather (Chiang Mai)

```bash
curl http://localhost:3000/api/smart-agriculture/weather/18.7883/98.9853
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "temp": 28.5,
    "humidity": 65,
    "rainfall": 0,
    "description": "ท้องฟ้าแจ่มใส"
  }
}
```

---

### 3. Soil Recommendation

```bash
curl -X POST http://localhost:3000/api/smart-agriculture/soil/recommend \
  -H "Content-Type: application/json" \
  -d "{\"soilType\":\"clay\",\"pH\":6.5,\"crop\":\"cannabis\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "soilType": "clay",
    "characteristics": "ดินเหนียว มีการระบายน้ำช้า...",
    "suitableCrops": ["ข้าว", "กัญชา"],
    "improvements": ["เพิ่มทราย", "ใส่ปุ๋ยอินทรีย์"],
    "fertilizer": {
      "N": 15,
      "P": 10,
      "K": 10
    },
    "pHAdvice": "pH เหมาะสม ไม่ต้องปรับ"
  }
}
```

---

### 4. Irrigation Calculator

```bash
curl -X POST http://localhost:3000/api/smart-agriculture/irrigation/calculate \
  -H "Content-Type: application/json" \
  -d "{\"crop\":\"cannabis\",\"growthStage\":\"vegetative\",\"temperature\":28,\"humidity\":65,\"rainfall\":0,\"soilType\":\"loam\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "waterPerDay": 4.5,
    "frequency": "ทุกวัน",
    "tips": ["รดน้ำตอนเช้าหรือเย็น", "ตรวจสอบความชื้นดินก่อนรดน้ำ"]
  }
}
```

---

### 5. Crop Calendar

```bash
curl http://localhost:3000/api/smart-agriculture/calendar/cannabis/เชียงใหม่
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "crop": "cannabis",
    "province": "เชียงใหม่",
    "bestPlantingMonths": ["ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
    "duration": 90,
    "stages": [
      {
        "name": "งอก",
        "days": 7,
        "tips": "รักษาความชื้น 70-80%"
      }
    ],
    "regionalTips": "ภาคเหนือ: อากาศเย็น เหมาะสำหรับกัญชาคุณภาพสูง"
  }
}
```

---

## Troubleshooting

### Server not starting?

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

### API Key not working?

- Check `.env` file exists in `apps/backend/`
- Verify key: `d1fcda4879642ac49a91e3e04384ee77`
- Restart server after changing `.env`

---

## Next Steps

1. ✅ Server running
2. ✅ All 7 APIs tested
3. 🔄 Build Farmer Portal UI
4. 🔄 Expand provinces to 77
5. 🔄 Test with real farmers
