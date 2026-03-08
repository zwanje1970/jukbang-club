import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Windows에서 .next 잠금(ERRNO -4094) 시 다른 폴더 사용
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
