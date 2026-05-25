# 影片自動剪輯（雛形）

上傳一支影片，用文字描述你想怎麼剪，工具會：

1. **語音轉文字**（Whisper）— 取得逐字稿與時間軸
2. **偵測沉默 / 廢鏡頭**（ffmpeg）
3. **（可選）讓 AI 看畫面**— 抽出關鍵畫面交給 Claude，支援用「畫面長相」指認片段
4. **AI 規劃剪輯**（Claude）— 依你的指令 + 逐字稿 + 畫面，產生「保留哪些片段、順序」
5. **產生中英雙語字幕**並翻譯
6. **渲染輸出** — 裁成直式 9:16（1080×1920）、燒上字幕，可直接放 IG Reels / Story

> ⚠️ 這是**雛形（prototype）**。整段流程的程式碼已寫好；ffmpeg 的剪接 / 裁切 / 燒字幕部分已在開發環境實測過，但**呼叫 Whisper 與 Claude 的部分需要你自己的 API 金鑰才能跑**，作者尚無法在此環境用真實金鑰端到端驗證。

---

## 安裝

需要先裝好 **Node.js 18+** 和 **ffmpeg**。

```bash
# macOS
brew install node ffmpeg

# Ubuntu / Debian
sudo apt-get install -y nodejs npm ffmpeg
```

燒中文字幕需要系統有 CJK 字型（macOS 內建；Ubuntu 請裝 `fonts-noto-cjk`）。

```bash
cd video-editor
npm install
cp .env.example .env   # 然後填入你的金鑰
npm start
```

打開 http://localhost:8787 。

### 金鑰

`.env` 需要兩個金鑰：

| 變數 | 用途 | 取得 |
|------|------|------|
| `OPENAI_API_KEY` | Whisper 語音轉文字 | https://platform.openai.com/api-keys |
| `ANTHROPIC_API_KEY` | 剪輯決策 / 翻譯 / 看畫面 | https://console.anthropic.com/settings/keys |

---

## 用手機操作

這個工具是「電腦跑服務、手機開網頁」的模式。最簡單的方式：

1. 在你的電腦上 `npm start`
2. 查出電腦在區域網路的 IP（macOS：系統設定 → 網路；或 `ipconfig getifaddr en0`）
3. 手機連**同一個 WiFi**，瀏覽器開 `http://<電腦IP>:8787`

之後若要不開電腦也能用，需要把它部署到雲端主機（會有主機與頻寬成本）。

---

## 大概成本（按用量計費，僅供參考）

- **Whisper**：約 US$0.006 / 分鐘音訊
- **Claude**：取決於逐字稿長度與「看畫面」的張數；一支數分鐘的影片通常是幾美分到一兩角美元。關掉「讓 AI 看畫面」會更便宜。

實際金額以 OpenAI / Anthropic 帳單為準。

---

## 目前限制（雛形）

- 直式輸出是**置中裁切**到 9:16；橫向影片左右會被切掉（之後可加模糊背景留白）。
- 「用畫面指認片段」是抽樣關鍵畫面（預設最多 16 張）給 AI 看，不是逐格分析。
- 字幕為燒錄（burn-in），無法在成品中關閉。
- 單機、記憶體內排程；重啟服務後進行中的工作會遺失。
- 長影片處理較久（轉檔 + AI + 渲染）。

## 檔案結構

```
video-editor/
  server.js          流程編排 + API
  lib/
    ffmpeg.js        ffmpeg/ffprobe 封裝
    transcribe.js    Whisper 轉文字
    silence.js       偵測沉默
    keyframes.js     抽關鍵畫面
    editPlan.js      Claude 產生剪輯清單
    subtitles.js     翻譯 + 產生 .ass 雙語字幕
    render.js        ffmpeg 剪接 / 裁切 / 燒字幕
  public/            手機友善前端
```
