import "dotenv/config";
import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { probe } from "./lib/ffmpeg.js";
import { transcribe } from "./lib/transcribe.js";
import { detectSilence } from "./lib/silence.js";
import { extractKeyframes } from "./lib/keyframes.js";
import { buildEditPlan } from "./lib/editPlan.js";
import { buildBilingualAss } from "./lib/subtitles.js";
import { render } from "./lib/render.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.join(__dirname, "work");

const PORT = process.env.PORT || 8787;
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 500);
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const WHISPER_MODEL = process.env.WHISPER_MODEL || "whisper-1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const jobs = new Map();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    req.jobId = req.jobId || randomUUID();
    const dir = path.join(WORK, req.jobId);
    await mkdir(dir, { recursive: true }).catch(() => {});
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, "source" + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 } });

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use("/files", express.static(WORK));

function setStep(job, step, progress) {
  job.step = step;
  if (progress != null) job.progress = progress;
}

async function processJob(job, opts) {
  const { videoPath, instructions, useVision } = opts;
  try {
    setStep(job, "正在分析影片…", 5);
    const info = await probe(videoPath);
    if (!info.duration) throw new Error("無法讀取影片，請換一個檔案試試");

    setStep(job, "語音轉文字中（Whisper）…", 15);
    const transcript = await transcribe(videoPath, { apiKey: OPENAI_API_KEY, model: WHISPER_MODEL });

    setStep(job, "偵測沉默/廢鏡頭…", 35);
    const silence = await detectSilence(videoPath);

    let keyframes = [];
    if (useVision) {
      setStep(job, "擷取畫面供 AI 觀看…", 45);
      keyframes = await extractKeyframes(videoPath, info.duration, { dir: path.join(path.dirname(videoPath), "keyframes") });
    }

    setStep(job, "AI 規劃剪輯（Claude）…", 60);
    const plan = await buildEditPlan({
      apiKey: ANTHROPIC_API_KEY,
      model: CLAUDE_MODEL,
      instructions,
      transcript,
      silence,
      keyframes,
      duration: info.duration,
    });
    if (!plan.segments.length) throw new Error("AI 沒有產生可用的片段，請調整你的指令再試一次");
    job.summary = plan.summary;

    setStep(job, "產生中英雙語字幕…", 75);
    const assPath = path.join(path.dirname(videoPath), "subs.ass");
    await buildBilingualAss(assPath, plan.segments, transcript, {
      apiKey: ANTHROPIC_API_KEY,
      model: CLAUDE_MODEL,
    });

    setStep(job, "渲染最終影片（ffmpeg）…", 85);
    const outPath = path.join(path.dirname(videoPath), "result.mp4");
    const keptDuration = plan.segments.reduce((a, s) => a + (s.end - s.start), 0);
    await render({
      input: videoPath,
      segments: plan.segments,
      outPath,
      assFile: "subs.ass",
      hasAudio: info.hasAudio,
      onProgress: (t) => setStep(job, "渲染最終影片（ffmpeg）…", 85 + Math.min(14, (t / keptDuration) * 14)),
    });

    job.status = "done";
    setStep(job, "完成！", 100);
    job.resultUrl = `/files/${job.id}/result.mp4`;
  } catch (err) {
    job.status = "error";
    job.error = err.message || String(err);
  }
}

app.post("/api/process", upload.single("video"), (req, res) => {
  if (!OPENAI_API_KEY || !ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "伺服器缺少 OPENAI_API_KEY 或 ANTHROPIC_API_KEY，請檢查 .env" });
  }
  if (!req.file) return res.status(400).json({ error: "沒有收到影片檔" });

  const job = { id: req.jobId, status: "processing", step: "排隊中…", progress: 0 };
  jobs.set(job.id, job);

  processJob(job, {
    videoPath: req.file.path,
    instructions: req.body.instructions || "",
    useVision: req.body.useVision !== "false",
  });

  res.json({ jobId: job.id });
});

app.get("/api/status/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "找不到這個工作" });
  res.json(job);
});

app.listen(PORT, () => {
  console.log(`\n  Vivian Video Editor  →  http://localhost:${PORT}`);
  if (!OPENAI_API_KEY || !ANTHROPIC_API_KEY) {
    console.log("  ⚠  尚未設定 API 金鑰：請複製 .env.example 成 .env 並填入金鑰\n");
  }
});
