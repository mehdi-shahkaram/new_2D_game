# آرین و اژدهاک

بازی داستانیِ تعاملی (ویژوال‌ناول) به زبان فارسی، تحت وب.

```bash
npm install
npm run dev      # اجرای محلی
npm run build    # خروجی در dist/ — آماده‌ی Vercel یا itch.io (HTML5)
```

- **داستان:** همه‌ی متن‌ها، انتخاب‌ها و پایان‌ها در `src/story/script.ts`
- **موتور:** `src/engine/` — اجرای اسکریپت، ذخیره/بارگذاری، متن‌های دیده‌شده
- **تصویرها:** پس‌زمینه‌ها و شخصیت‌ها فعلاً SVG هستند (`src/art/`). هر تصویری در
  `public/images/bg/<id>.webp` یا `public/images/char/<id>.webp` بگذارید، خودکار جایگزین می‌شود.
- **پیش‌نمایش صحنه در حالت توسعه:** `http://localhost:5173/#bg=forest&char=wanderer:left`
