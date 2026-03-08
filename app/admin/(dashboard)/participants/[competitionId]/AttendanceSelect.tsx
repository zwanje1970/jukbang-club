"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { applicationId: string; attended: boolean };

export default function AttendanceSelect({ applicationId, attended: initialAttended }: Props) {
  const router = useRouter();
  const [attended, setAttended] = useState(initialAttended);
  const [loading, setLoading] = useState(false);

  async function handleChange(value: boolean) {
    setAttended(value);
    setLoading(true);
    try {
      await fetch("/api/admin/applications/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, attended: value }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={attended ? "출석" : "불참"}
      onChange={(e) => handleChange(e.target.value === "출석")}
      disabled={loading}
      className={`rounded border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
        attended ? "border-blue-400 bg-blue-50 text-blue-600" : "border-red-400 bg-red-50 text-red-600"
      }`}
    >
      <option value="출석">출석</option>
      <option value="불참">불참</option>
    </select>
  );
}
