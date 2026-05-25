import { spawn } from "node:child_process";

// Run ffmpeg/ffprobe, capturing stderr (ffmpeg logs progress there).
export function run(bin, args, { onStderr, cwd } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"], cwd });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => {
      const s = d.toString();
      stderr += s;
      if (onStderr) onStderr(s);
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${bin} exited ${code}\n${stderr.slice(-4000)}`));
    });
  });
}

export const ffmpeg = (args, opts) => run("ffmpeg", args, opts);
export const ffprobe = (args, opts) => run("ffprobe", args, opts);

// Probe duration (seconds) and primary video resolution.
export async function probe(file) {
  const { stdout } = await ffprobe([
    "-v", "error",
    "-print_format", "json",
    "-show_format",
    "-show_streams",
    file,
  ]);
  const info = JSON.parse(stdout);
  const v = (info.streams || []).find((s) => s.codec_type === "video");
  return {
    duration: parseFloat(info.format?.duration ?? "0") || 0,
    width: v?.width ?? 0,
    height: v?.height ?? 0,
    hasAudio: (info.streams || []).some((s) => s.codec_type === "audio"),
  };
}
