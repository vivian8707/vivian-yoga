import { createReadStream } from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { ffmpeg } from "./ffmpeg.js";

// Extract a compact mono audio track for transcription (smaller upload).
async function extractAudio(file) {
  const out = path.join(path.dirname(file), "audio.mp3");
  await ffmpeg([
    "-i", file,
    "-vn",
    "-ac", "1",
    "-ar", "16000",
    "-b:a", "64k",
    "-y", out,
  ]);
  return out;
}

// Transcribe with Whisper, returning segments [{ start, end, text }].
export async function transcribe(file, { apiKey, model = "whisper-1" } = {}) {
  const openai = new OpenAI({ apiKey });
  const audio = await extractAudio(file);
  const res = await openai.audio.transcriptions.create({
    file: createReadStream(audio),
    model,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });
  const segments = (res.segments || []).map((s) => ({
    start: +Number(s.start).toFixed(2),
    end: +Number(s.end).toFixed(2),
    text: (s.text || "").trim(),
  }));
  return { language: res.language, text: res.text, segments };
}
