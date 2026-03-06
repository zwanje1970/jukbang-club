export type { RoundConfig } from "@/lib/bracket";

export const COMPETITION_TYPES = [
  { value: "UNDER_06", label: "0.6 미만자" },
  { value: "UNDER_07", label: "0.7 미만자" },
  { value: "UNDER_08", label: "0.8 미만자" },
  { value: "UNDER_09", label: "0.9 미만자" },
  { value: "UNDER_10", label: "1.0 미만자" },
  { value: "EVER", label: "에버 무제한" },
] as const;

export const ROUND_LABELS: Record<string, string> = {
  PRELIMINARY: "예선",
  SEMI: "준결승",
  FINAL: "결승",
};
