"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerUser, type RegisterUserState } from "@/lib/actions/register-user";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "등록 중…" : "등록"}
    </button>
  );
}

export default function RegisterUserForm() {
  const [state, formAction] = useActionState<RegisterUserState | null, FormData>(
    registerUser,
    null
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">사용자 등록</h2>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800"
            placeholder="이름 입력"
          />
        </div>
        <div>
          <label htmlFor="score" className="mb-1 block text-sm font-medium text-gray-700">
            점수
          </label>
          <input
            id="score"
            name="score"
            type="number"
            min={0}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800"
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="photo" className="mb-1 block text-sm font-medium text-gray-700">
            사진
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            required
            className="block w-full text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-amber-800"
          />
        </div>
        <div className="flex items-center gap-3">
          <SubmitButton />
          {state?.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600" role="status">
              등록되었습니다.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
