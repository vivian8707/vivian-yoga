// Smoke-test the ffmpeg-dependent parts (no API keys needed).
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { probe } from "./lib/ffmpeg.js";
import { detectSilence } from "./lib/silence.js";
import { extractKeyframes } from "./lib/keyframes.js";
import { mapLinesToOutput } from "./lib/subtitles.js";
import { render } from "./lib/render.js";

const dir = path.join(process.cwd(), "work");
const input = path.join(dir, "test.mp4");

const info = await probe(input);
console.log("probe:", info);

const silence = await detectSilence(input);
console.log("silence:", silence);

const kf = await extractKeyframes(input, info.duration, { max: 6, dir: path.join(dir, "kf") });
console.log("keyframes:", kf.length, "frames at", kf.map((k) => k.t));

// Pretend the editor kept two ranges; verify subtitle output-time mapping.
const segments = [
  { start: 0, end: 2.5, reason: "intro" },
  { start: 5, end: 8, reason: "second tone" },
];
const fakeTranscript = {
  segments: [
    { start: 0.2, end: 2.2, text: "你好 歡迎來上瑜伽課" },
    { start: 5.1, end: 7.8, text: "我們來做下犬式" },
  ],
};
const mapped = mapLinesToOutput(segments, fakeTranscript);
console.log("mapped subtitle lines:", mapped);

// Hand-built bilingual .ass (skips Claude translation) to test burn-in.
const ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV
Style: ZH,sans,58,&H00FFFFFF,&H00000000,&H64000000,1,1,3,1,2,80,80,260
Style: EN,sans,40,&H00DDF0FF,&H00000000,&H64000000,0,1,3,1,2,80,80,200

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${mapped
  .map(
    (l) =>
      `Dialogue: 0,${fmt(l.outStart)},${fmt(l.outEnd)},ZH,,0,0,0,,${l.text}\n` +
      `Dialogue: 0,${fmt(l.outStart)},${fmt(l.outEnd)},EN,,0,0,0,,Welcome to yoga class`
  )
  .join("\n")}
`;
function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = (s % 60).toFixed(2);
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(5, "0")}`;
}
await writeFile(path.join(dir, "subs.ass"), ass);

const out = path.join(dir, "result.mp4");
await render({ input, segments, outPath: out, assFile: "subs.ass", hasAudio: info.hasAudio });
const outInfo = await probe(out);
console.log("RESULT:", outInfo, "(expected ~5.5s, 1080x1920)");
console.log("\n✅ ffmpeg pipeline OK");
