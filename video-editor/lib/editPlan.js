import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `You are a video editor's assistant. You receive:
- The user's editing instructions (free-form, may be in Chinese or English).
- A timestamped transcript of what is spoken in the video.
- A set of keyframe images, each labelled with its timestamp, showing what is on screen.
- A list of detected silent / dead-air ranges.

Your job: produce an ordered list of time ranges to KEEP in the final cut.

Rules:
- Honour the user's instructions first — they may ask to keep/cut by what was SAID (use the transcript) or by what is SHOWN (use the keyframes).
- Remove dead air, long pauses, filler, and obvious mistakes unless the user wants them.
- Keep cuts on natural boundaries (sentence ends / scene changes) so the result is coherent.
- Order the kept ranges as they should appear in the final video (usually chronological unless the user asks to reorder).
- Times are in seconds (decimals allowed) and must be within the video duration.
Respond with ONLY a JSON object, no prose, no markdown fences.`;

export async function buildEditPlan({
  apiKey,
  model = "claude-sonnet-4-6",
  instructions,
  transcript,
  silence,
  keyframes = [],
  duration,
}) {
  const anthropic = new Anthropic({ apiKey });

  const transcriptText = transcript.segments
    .map((s) => `[${s.start}-${s.end}] ${s.text}`)
    .join("\n");
  const silenceText = silence.length
    ? silence.map((r) => `[${r.start.toFixed(2)}-${r.end.toFixed(2)}]`).join(", ")
    : "(none detected)";

  const content = [
    {
      type: "text",
      text:
        `VIDEO DURATION: ${duration.toFixed(2)}s\n\n` +
        `USER INSTRUCTIONS:\n${instructions || "(none — just remove dead air and tighten it up)"}\n\n` +
        `TRANSCRIPT (timestamped):\n${transcriptText || "(no speech detected)"}\n\n` +
        `DETECTED SILENCE RANGES:\n${silenceText}\n\n` +
        `KEYFRAMES follow, each preceded by its timestamp.`,
    },
  ];
  for (const kf of keyframes) {
    content.push({ type: "text", text: `Keyframe at t=${kf.t}s:` });
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: kf.dataUrl },
    });
  }
  content.push({
    type: "text",
    text:
      `Return JSON shaped exactly like:\n` +
      `{"segments":[{"start":0.0,"end":4.2,"reason":"..."}],"summary":"one line on what you cut"}`,
  });

  const res = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });

  const raw = res.content.find((b) => b.type === "text")?.text ?? "{}";
  const json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());

  // Sanitise: clamp to duration, drop empty/inverted ranges.
  const segments = (json.segments || [])
    .map((s) => ({
      start: Math.max(0, Number(s.start)),
      end: Math.min(duration, Number(s.end)),
      reason: String(s.reason || ""),
    }))
    .filter((s) => s.end - s.start > 0.05);

  return { segments, summary: json.summary || "" };
}
