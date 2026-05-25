import { writeFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";

function assTime(sec) {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const cs = Math.round((s - Math.floor(s)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

// Map transcript lines onto the OUTPUT timeline defined by the kept segments.
export function mapLinesToOutput(keptSegments, transcript) {
  const lines = [];
  let offset = 0;
  for (const seg of keptSegments) {
    const segLen = seg.end - seg.start;
    for (const t of transcript.segments) {
      const os = Math.max(t.start, seg.start);
      const oe = Math.min(t.end, seg.end);
      if (oe - os > 0.1 && t.text) {
        lines.push({
          outStart: offset + (os - seg.start),
          outEnd: offset + (oe - seg.start),
          text: t.text,
        });
      }
    }
    offset += segLen;
  }
  return lines;
}

// Translate each line, returning [{ zh, en }] aligned to input order.
async function translateLines(lines, { apiKey, model }) {
  if (!lines.length) return [];
  const anthropic = new Anthropic({ apiKey });
  const numbered = lines.map((l, i) => `${i + 1}. ${l.text}`).join("\n");
  const res = await anthropic.messages.create({
    model,
    max_tokens: 4000,
    system:
      "You produce bilingual subtitles. For each numbered line give the Traditional Chinese (zh) and natural English (en) version. " +
      "If the source is already Chinese, keep it as zh and translate to en; if English, keep as en and translate to zh. " +
      "Keep each line short enough for an on-screen subtitle. Respond ONLY with a JSON array of objects {\"zh\":\"...\",\"en\":\"...\"} in the same order, no prose.",
    messages: [{ role: "user", content: numbered }],
  });
  const raw = res.content.find((b) => b.type === "text")?.text ?? "[]";
  const arr = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
  return lines.map((_, i) => arr[i] || { zh: lines[i].text, en: "" });
}

// Build a burnable .ass file (bilingual, lower third, sized for 9:16).
export async function buildBilingualAss(outPath, keptSegments, transcript, { apiKey, model, fontName = "Noto Sans CJK TC" }) {
  const lines = mapLinesToOutput(keptSegments, transcript);
  const tr = await translateLines(lines, { apiKey, model });

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV
Style: ZH,${fontName},58,&H00FFFFFF,&H00000000,&H64000000,1,1,3,1,2,80,80,260
Style: EN,${fontName},40,&H00DDF0FF,&H00000000,&H64000000,0,1,3,1,2,80,80,200

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = lines
    .map((l, i) => {
      const zh = (tr[i]?.zh || l.text).replace(/\n/g, " ");
      const en = (tr[i]?.en || "").replace(/\n/g, " ");
      const start = assTime(l.outStart);
      const end = assTime(l.outEnd);
      const zhEv = `Dialogue: 0,${start},${end},ZH,,0,0,0,,${zh}`;
      const enEv = en ? `\nDialogue: 0,${start},${end},EN,,0,0,0,,${en}` : "";
      return zhEv + enEv;
    })
    .join("\n");

  await writeFile(outPath, header + events + "\n", "utf8");
  return { path: outPath, lineCount: lines.length };
}
