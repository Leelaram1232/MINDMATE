export function digitsOnly(phone = '') {
  return String(phone).replace(/\D/g, '');
}

export function isValidPhone(phone = '') {
  const digits = digitsOnly(phone);
  return digits.length >= 10 && digits.length <= 15;
}

export function normalizePhone(phone = '') {
  const trimmed = String(phone).trim();
  const digits = digitsOnly(trimmed);
  if (trimmed.startsWith('+')) return `+${digits}`;
  return digits;
}

// Opens the device dialer for the caregiver's saved number.
export function callPhone(phone) {
  const value = normalizePhone(phone);
  if (!value) return false;
  window.location.href = `tel:${value}`;
  return true;
}
