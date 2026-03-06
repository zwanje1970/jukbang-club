"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-xl font-bold text-gray-800">일시적인 오류가 발생했습니다</h1>
      <p className="mt-2 text-gray-600">새로고침 하시거나 잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
      >
        다시 시도
      </button>
    </div>
  );
}
