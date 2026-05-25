const $ = (id) => document.getElementById(id);

$("video").addEventListener("change", (e) => {
  const f = e.target.files[0];
  $("fileLabel").textContent = f ? f.name : "選擇影片…";
});

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = $("video").files[0];
  if (!file) return;

  $("error").classList.add("hidden");
  $("result").classList.add("hidden");
  $("progress").classList.remove("hidden");
  $("go").disabled = true;
  setProgress(2, "上傳中…");

  const fd = new FormData();
  fd.append("video", file);
  fd.append("instructions", $("instructions").value);
  fd.append("useVision", $("useVision").checked ? "true" : "false");

  try {
    const res = await fetch("/api/process", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "上傳失敗");
    poll(data.jobId);
  } catch (err) {
    showError(err.message);
  }
});

function setProgress(pct, text) {
  $("barFill").style.width = `${pct}%`;
  if (text) $("step").textContent = text;
}

function showError(msg) {
  $("progress").classList.add("hidden");
  $("error").textContent = "出錯了：" + msg;
  $("error").classList.remove("hidden");
  $("go").disabled = false;
}

async function poll(jobId) {
  try {
    const res = await fetch(`/api/status/${jobId}`);
    const job = await res.json();
    if (!res.ok) throw new Error(job.error || "查詢失敗");

    setProgress(job.progress || 0, job.step);

    if (job.status === "done") {
      $("progress").classList.add("hidden");
      $("result").classList.remove("hidden");
      $("go").disabled = false;
      if (job.summary) $("summary").textContent = "AI 摘要：" + job.summary;
      $("player").src = job.resultUrl;
      $("download").href = job.resultUrl;
      return;
    }
    if (job.status === "error") return showError(job.error);

    setTimeout(() => poll(jobId), 1500);
  } catch (err) {
    showError(err.message);
  }
}
