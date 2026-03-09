import RegisterUserForm from "@/components/RegisterUserForm";

export default function RegisterUserPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">사용자 등록</h1>
      <p className="mb-6 text-sm text-gray-600">
        이름, 점수, 사진을 입력한 뒤 등록하면 사진은 Blob에 저장되고, URL과 함께 Postgres
        users 테이블에 저장됩니다.
      </p>
      <RegisterUserForm />
    </div>
  );
}
