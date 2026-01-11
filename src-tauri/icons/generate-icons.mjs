#!/usr/bin/env node
/**
 * Generate macOS .icns and Windows .ico from a source PNG.
 *
 * Requirements (all macOS built-ins, plus Node available in this project):
 *   - sips      : image resizing
 *   - iconutil  : .icns packaging
 *   - node      : .ico packing (PNG-embedded entries, works on Windows Vista+)
 *
 * Usage:
 *   node generate-icons.mjs [source.png]
 *
 * Default source is ./icon.png (256x256 RGBA). Outputs ./icon.icns and ./icon.ico.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const source = resolve(ICONS_DIR, process.argv[2] ?? "icon.png");
const icnsOut = join(ICONS_DIR, "icon.icns");
const icoOut = join(ICONS_DIR, "icon.ico");
const tmpDir = join(ICONS_DIR, ".icon-tmp");

// Standard macOS iconset labels → pixel size.
const ICONSET_SIZES = [
    ["icon_16x16.png", 16],
    ["icon_16x16@2x.png", 32],
    ["icon_32x32.png", 32],
    ["icon_32x32@2x.png", 64],
    ["icon_128x128.png", 128],
    ["icon_128x128@2x.png", 256],
    ["icon_256x256.png", 256],
    ["icon_256x256@2x.png", 512],
    ["icon_512x512.png", 512],
    ["icon_512x512@2x.png", 1024],
];

// Windows .ico resolutions. PNG-embedded entries (Vista+).
const ICO_SIZES = [256, 128, 64, 48, 32, 24, 16];

function resize(src, size, out) {
    execFileSync("sips", ["-z", String(size), String(size), src, "--out", out]);
}

function buildIco(pngPaths) {
    const count = pngPaths.length;
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type: icon
    header.writeUInt16LE(count, 4);

    const entries = [];
    const data = [];
    const dataOffset = 6 + 16 * count;
    let offset = dataOffset;
    for (const [i, p] of pngPaths.entries()) {
        const blob = readFileSync(p);
        const dim = ICO_SIZES[i];
        const entry = Buffer.alloc(16);
        entry.writeUInt8(dim >= 256 ? 0 : dim, 0); // width (0 = 256)
        entry.writeUInt8(dim >= 256 ? 0 : dim, 1); // height (0 = 256)
        entry.writeUInt8(0, 2); // color count
        entry.writeUInt8(0, 3); // reserved
        entry.writeUInt16LE(1, 4); // planes
        entry.writeUInt16LE(32, 6); // bit count
        entry.writeUInt32LE(blob.length, 8); // bytes in resource
        entry.writeUInt32LE(offset, 12); // image data offset
        offset += blob.length;
        entries.push(entry);
        data.push(blob);
    }

    return Buffer.concat([header, ...entries, ...data]);
}

function main() {
    rmSync(tmpDir, { recursive: true, force: true });
    mkdirSync(tmpDir, { recursive: true });

    try {
        // --- .icns ---
        const iconsetDir = join(tmpDir, "icon.iconset");
        mkdirSync(iconsetDir, { recursive: true });
        for (const [name, size] of ICONSET_SIZES) {
            resize(source, size, join(iconsetDir, name));
        }
        execFileSync("iconutil", ["-c", "icns", iconsetDir, "-o", icnsOut]);

        // --- .ico ---
        const icoPngs = [];
        for (const size of ICO_SIZES) {
            const p = join(tmpDir, `ico-${size}.png`);
            resize(source, size, p);
            icoPngs.push(p);
        }
        writeFileSync(icoOut, buildIco(icoPngs));

        console.log(`Generated ${icnsOut}`);
        console.log(`Generated ${icoOut}`);
    } finally {
        rmSync(tmpDir, { recursive: true, force: true });
    }
}

main();