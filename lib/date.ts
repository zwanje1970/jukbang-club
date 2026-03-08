const KOREA = "Asia/Seoul";
const WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

function getWeekdayKR(date: Date): string {
  const d = new Date(date.toLocaleString("en-US", { timeZone: KOREA }));
  return WEEKDAY_KR[d.getDay()];
}

/** 날짜만 한국시간 + 요일 (예: 2026. 3. 6. (금)) */
export function formatDateKR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const datePart = d.toLocaleDateString("ko-KR", { timeZone: KOREA, year: "numeric", month: "2-digit", day: "2-digit" });
  const weekday = getWeekdayKR(d);
  return `${datePart} (${weekday})`;
}

/** 짧은 날짜 + 요일 (예: 3/7(일)) */
export function formatDateShortKR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const local = new Date(d.toLocaleString("en-US", { timeZone: KOREA }));
  const m = local.getMonth() + 1;
  const day = local.getDate();
  const weekday = WEEKDAY_KR[local.getDay()];
  return `${m}/${day}(${weekday})`;
}

/** 날짜+시간 한국시간 + 요일 (예: 2026. 3. 6. (금) 15:30) */
export function formatDateTimeKR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const datePart = d.toLocaleDateString("ko-KR", { timeZone: KOREA, year: "numeric", month: "2-digit", day: "2-digit" });
  const weekday = getWeekdayKR(d);
  const timePart = d.toLocaleTimeString("ko-KR", { timeZone: KOREA, hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} (${weekday}) ${timePart}`;
}
