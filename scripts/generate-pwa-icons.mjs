/**
 * Generates PWA icons (192x192 and 512x512) as simple black squares.
 * Run: node scripts/generate-pwa-icons.mjs
 * Requires: npm install sharp (devDependency)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Run: npm install --save-dev sharp");
    process.exit(1);
  }

  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  for (const size of [192, 512]) {
    const buf = await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), buf);
    console.log(`Created public/icons/icon-${size}.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
