import OutlineContent from "./OutlineContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OutlinePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">대회요강</h1>
      <OutlineContent />
    </div>
  );
}
