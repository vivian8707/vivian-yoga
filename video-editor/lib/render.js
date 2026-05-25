import path from "node:path";
import { ffmpeg } from "./ffmpeg.js";

// Render the final 9:16 video: trim kept segments, concat, center-crop to
// 1080x1920, optionally burn bilingual subtitles.
export async function render({
  input,
  segments,
  outPath,
  assFile = null, // filename relative to the work dir (e.g. "subs.ass")
  hasAudio = true,
  onProgress,
}) {
  if (!segments.length) throw new Error("No segments to render");

  const workDir = path.dirname(outPath);
  const parts = [];
  const concatInputs = [];

  segments.forEach((s, i) => {
    parts.push(`[0:v]trim=start=${s.start}:end=${s.end},setpts=PTS-STARTPTS[v${i}]`);
    concatInputs.push(`[v${i}]`);
    if (hasAudio) {
      parts.push(`[0:a]atrim=start=${s.start}:end=${s.end},asetpts=PTS-STARTPTS[a${i}]`);
      concatInputs.push(`[a${i}]`);
    }
  });

  const n = segments.length;
  const concat = hasAudio
    ? `${concatInputs.join("")}concat=n=${n}:v=1:a=1[cv][ca]`
    : `${concatInputs.join("")}concat=n=${n}:v=1:a=0[cv]`;

  let vchain = "[cv]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
  if (assFile) vchain += `,ass=${assFile}`;
  vchain += "[vout]";

  const filter = [...parts, concat, vchain].join(";");

  const args = [
    "-y",
    "-i", input,
    "-filter_complex", filter,
    "-map", "[vout]",
    ...(hasAudio ? ["-map", "[ca]"] : []),
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    ...(hasAudio ? ["-c:a", "aac", "-b:a", "128k"] : ["-an"]),
    outPath,
  ];

  await ffmpeg(args, {
    cwd: workDir,
    onStderr: (s) => {
      const m = s.match(/time=(\d+):(\d+):([\d.]+)/);
      if (m && onProgress) {
        onProgress(+m[1] * 3600 + +m[2] * 60 + parseFloat(m[3]));
      }
    },
  });

  return outPath;
}
