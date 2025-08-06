export function getTodayDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split("T")[0]; // dạng "2025-08-06"
}
