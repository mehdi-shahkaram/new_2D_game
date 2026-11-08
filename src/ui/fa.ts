const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** تبدیل ارقام لاتین به فارسی (و نقطه‌ی اعشار به «٫») */
export function toFa(v: number | string): string {
  return String(v)
    .replace(/\d/g, (d) => FA_DIGITS[Number(d)])
    .replace(/\./g, '٫')
}
