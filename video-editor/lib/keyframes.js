import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { ffmpeg } from "./ffmpeg.js";

// Extract evenly-spaced keyframes for visual analysis.
// Returns [{ t, dataUrl }] capped at `max` frames so vision cost stays bounded.
export async function extractKeyframes(file, duration, { max = 16, dir } = {}) {
  const outDir = dir || path.join(path.dirname(file), "keyframes");
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const count = Math.max(1, Math.min(max, Math.round(duration / 4) || 1));
  const interval = duration > 0 ? duration / count : 1;

  // Sample one frame per interval, downscaled to keep tokens/cost low.
  await ffmpeg([
    "-i", file,
    "-vf", `fps=1/${interval.toFixed(3)},scale=512:-1`,
    "-frames:v", String(count),
    "-q:v", "5",
    path.join(outDir, "kf_%03d.jpg"),
  ]);

  const files = (await readdir(outDir)).filter((f) => f.endsWith(".jpg")).sort();
  const frames = [];
  for (let i = 0; i < files.length; i++) {
    const buf = await readFile(path.join(outDir, files[i]));
    frames.push({
      t: +(i * interval + interval / 2).toFixed(2),
      dataUrl: buf.toString("base64"),
    });
  }
  return frames;
}
