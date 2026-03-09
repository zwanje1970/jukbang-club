export default function Footer() {
  return (
    <footer className="bg-gray-700 text-gray-300 hidden md:block">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-center md:gap-8">
        <div className="flex items-center gap-1">
          <span className="h-4 w-4 shrink-0 rounded-full bg-yellow-400" aria-hidden />
          <span className="h-4 w-4 shrink-0 rounded-full bg-red-500" aria-hidden />
          <span className="h-4 w-4 shrink-0 rounded-full bg-white" aria-hidden />
          <p className="ml-1 text-sm">2026 JUKBANG.CLUB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
