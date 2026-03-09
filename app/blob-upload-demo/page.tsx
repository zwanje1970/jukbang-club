import BlobImageUpload from "@/components/BlobImageUpload";

export default function BlobUploadDemoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">Vercel Blob 이미지 업로드</h1>
      <BlobImageUpload />
    </div>
  );
}
