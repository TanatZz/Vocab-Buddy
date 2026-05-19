# Firebase Realtime Database Rules

คัดลอกกฎด้านล่างนี้ไปวางในเมนู **Rules** ของ Firebase Realtime Database เพื่อให้แอปทำงานได้อย่างมีประสิทธิภาพและปลอดภัยครับ

```json
{
  "rules": {
    "decks": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["userId"]
    },
    "words": {
      "$deckId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".indexOn": ["difficulty"]
      }
    }
  }
}
```

### คำอธิบาย:
1.  **decks/.indexOn: ["userId"]**: ช่วยให้การค้นหา Deck ของผู้ใช้แต่ละคน (ที่คุณกำลังประสบปัญหาโหลดช้า) ทำงานได้รวดเร็วขึ้นมาก
2.  **words/.indexOn: ["difficulty"]**: ช่วยให้การดึงคำศัพท์แยกตามความยาก (สำหรับระบบ Spaced Repetition) ทำงานได้เร็วขึ้น
3.  **auth != null**: อนุญาตให้เฉพาะผู้ที่ Login แล้วเท่านั้นที่สามารถอ่านและเขียนข้อมูลได้
