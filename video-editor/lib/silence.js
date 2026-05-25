import { ffmpeg } from "./ffmpeg.js";

// Detect silent ranges using ffmpeg's silencedetect filter.
// Returns [{ start, end }] in seconds — candidate "dead air" to trim.
export async function detectSilence(file, { noiseDb = -30, minDur = 0.6 } = {}) {
  let log = "";
  await ffmpeg(
    [
      "-i", file,
      "-af", `silencedetect=noise=${noiseDb}dB:d=${minDur}`,
      "-f", "null",
      "-",
    ],
    { onStderr: (s) => (log += s) }
  ).catch((e) => {
    // silencedetect still prints to stderr even if ffmpeg returns nonzero on
    // some edge cases; keep whatever we captured.
    log += String(e.message || "");
  });

  const ranges = [];
  let pendingStart = null;
  for (const line of log.split("\n")) {
    const mStart = line.match(/silence_start:\s*(-?[\d.]+)/);
    const mEnd = line.match(/silence_end:\s*(-?[\d.]+)/);
    if (mStart) pendingStart = Math.max(0, parseFloat(mStart[1]));
    if (mEnd && pendingStart != null) {
      ranges.push({ start: pendingStart, end: parseFloat(mEnd[1]) });
      pendingStart = null;
    }
  }
  return ranges;
}
