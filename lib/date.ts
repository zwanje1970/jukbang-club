const KOREA = "Asia/Seoul";

/** 날짜만 한국시간 + 요일 (예: 2026. 3. 6. (금)) */
export function formatDateKR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const datePart = d.toLocaleDateString("ko-KR", { timeZone: KOREA, year: "numeric", month: "2-digit", day: "2-digit" });
  const weekday = d.toLocaleDateString("ko-KR", { timeZone: KOREA, weekday: "short" });
  return `${datePart} (${weekday})`;
}

/** 날짜+시간 한국시간 + 요일 (예: 2026. 3. 6. (금) 15:30) */
export function formatDateTimeKR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const datePart = d.toLocaleDateString("ko-KR", { timeZone: KOREA, year: "numeric", month: "2-digit", day: "2-digit" });
  const weekday = d.toLocaleDateString("ko-KR", { timeZone: KOREA, weekday: "short" });
  const timePart = d.toLocaleTimeString("ko-KR", { timeZone: KOREA, hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} (${weekday}) ${timePart}`;
}
