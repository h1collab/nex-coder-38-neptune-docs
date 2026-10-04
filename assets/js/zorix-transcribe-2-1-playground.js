(() => {
  const API_URL = "https://chat.zorix.it/v1/audio/transcriptions";
  const API_MODEL = "Gpt6.1sol";
  const DISPLAY_MODEL = "Zorix Transcribe 2.1";

  const $ = (s) => document.querySelector(s);

  const state = {
    file: null,
    recorder: null,
    stream: null,
    chunks: [],
    recordingStartedAt: 0,
    recordingTimer: null,
    audioUrl: "",
    controller: null
  };

  const el = {
    file: $("#audioFile"),
    drop: $("#audioDrop"),
    fileName: $("#fileName"),
    fileMeta: $("#fileMeta"),
    record: $("#recordAudio"),
    stopRecord: $("#stopRecord"),
    recordStatus: $("#recordStatus"),
    timer: $("#recordTimer"),
    preview: $("#audioPreview"),
    format: $("#responseFormat"),
    transcribe: $("#transcribeAudio"),
    cancel: $("#cancelTranscription"),
    clear: $("#clearTranscription"),
    output: $("#transcriptOutput"),
    raw: $("#transcriptRaw"),
    status: $("#transcriptStatus"),
    latency: $("#transcriptLatency"),
    chars: $("#transcriptChars"),
    formatShown: $("#transcriptFormat"),
    copy: $("#copyTranscript")
  };

  const now = () => performance.now();
  const fmtMs = (v) => v < 1000 ? Math.round(v) + " ms" : (v / 1000).toFixed(2) + " s";

  function setStatus(kind, text) {
    el.status.className = ("cp-status " + (kind || "")).trim();
    el.status.querySelector("span:last-child").textContent = text;
  }

  function setOutput(text, placeholder = false) {
    el.output.textContent = text || "";
    el.output.classList.toggle("cp-placeholder", placeholder);
  }

  function setRaw(value) {
    try {
      el.raw.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    } catch {
      el.raw.textContent = String(value ?? "");
    }
  }

  function humanBytes(bytes) {
    if (!Number.isFinite(bytes)) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  function extensionFor(type) {
    if (type.includes("ogg")) return "ogg";
    if (type.includes("mp4")) return "m4a";
    return "webm";
  }

  function revokePreview() {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
      state.audioUrl = "";
    }
  }

  function useFile(file) {
    if (!file) return;

    state.file = file;
    revokePreview();
    state.audioUrl = URL.createObjectURL(file);

    el.preview.src = state.audioUrl;
    el.preview.hidden = false;
    el.fileName.textContent = file.name || "record.webm";
    el.fileMeta.textContent =
      (file.type || "audio") + " · " + humanBytes(file.size);
    el.drop.classList.add("has-file");
    el.transcribe.disabled = false;
  }

  function resetResult() {
    setStatus("", "Idle");
    setOutput("Upload or record audio to begin.", true);
    setRaw({});
    el.latency.textContent = "-";
    el.chars.textContent = "0";
    el.formatShown.textContent = el.format.value;
  }

  function resetFile() {
    state.file = null;
    el.file.value = "";
    revokePreview();
    el.preview.removeAttribute("src");
    el.preview.hidden = true;
    el.fileName.textContent = "Drop an audio file here";
    el.fileMeta.textContent = "or tap to choose a file";
    el.drop.classList.remove("has-file");
    el.transcribe.disabled = true;
  }

  function stopTracks() {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      state.stream = null;
    }
  }

  function updateTimer() {
    if (!state.recordingStartedAt) {
      el.timer.textContent = "00:00";
      return;
    }
    const seconds = Math.floor((Date.now() - state.recordingStartedAt) / 1000);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    el.timer.textContent = mm + ":" + ss;
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      el.recordStatus.textContent = "Recording is not supported by this browser.";
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.stream = stream;
      state.chunks = [];

      let mimeType = "";
      for (const candidate of [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4"
      ]) {
        if (MediaRecorder.isTypeSupported(candidate)) {
          mimeType = candidate;
          break;
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      state.recorder = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size) state.chunks.push(event.data);
      });

      recorder.addEventListener("stop", () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(state.chunks, { type });
        const ext = extensionFor(type);
        const file = new File([blob], "record." + ext, { type });

        useFile(file);
        stopTracks();
        state.recorder = null;
        state.recordingStartedAt = 0;
        clearInterval(state.recordingTimer);
        state.recordingTimer = null;
        updateTimer();
        el.record.disabled = false;
        el.stopRecord.disabled = true;
        el.recordStatus.textContent = "Recording ready.";
      });

      recorder.start(250);
      state.recordingStartedAt = Date.now();
      updateTimer();
      state.recordingTimer = setInterval(updateTimer, 500);

      el.record.disabled = true;
      el.stopRecord.disabled = false;
      el.recordStatus.textContent = "Recording…";
    } catch (error) {
      stopTracks();
      el.recordStatus.textContent =
        "Microphone unavailable: " + (error?.message || String(error));
    }
  }

  function stopRecording() {
    if (state.recorder && state.recorder.state !== "inactive") {
      state.recorder.stop();
    }
  }

  async function transcribe() {
    if (!state.file || state.controller) return;

    const format = el.format.value;
    const form = new FormData();
    form.append("file", state.file, state.file.name || "record.webm");
    form.append("model", API_MODEL);
    form.append("response_format", format);

    const started = now();
    state.controller = new AbortController();

    el.transcribe.disabled = true;
    el.cancel.disabled = false;
    setStatus("running", "Transcribing");
    setOutput("Transcribing…", true);
    setRaw({});
    el.formatShown.textContent = format;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: form,
        signal: state.controller.signal
      });

      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();

      if (!response.ok) {
        throw new Error("API " + response.status + ": " + rawText.slice(0, 700));
      }

      let transcript = "";
      let rawValue = rawText;

      if (format === "text") {
        transcript = rawText.trim();
      } else {
        let data;
        try {
          data = JSON.parse(rawText);
          rawValue = data;
        } catch {
          data = null;
        }

        transcript =
          typeof data?.text === "string"
            ? data.text
            : typeof data?.output_text === "string"
              ? data.output_text
              : rawText.trim();
      }

      setOutput(transcript || "No transcription text returned.");
      setRaw(rawValue);
      setStatus("ok", "Done");
      el.latency.textContent = fmtMs(now() - started);
      el.chars.textContent = String(transcript.length);

      if (contentType && format !== "text" && !contentType.includes("json")) {
        el.formatShown.textContent = format + " · " + contentType.split(";")[0];
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus("", "Cancelled");
        setOutput("Transcription cancelled.", true);
      } else {
        const message = error?.message || String(error);
        setStatus("error", "Error");
        setOutput(message);
        setRaw({ error: message });
      }
      el.latency.textContent = fmtMs(now() - started);
    } finally {
      state.controller = null;
      el.transcribe.disabled = !state.file;
      el.cancel.disabled = true;
    }
  }

  function cancelTranscription() {
    if (state.controller) state.controller.abort();
  }

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(el.output.textContent || "");
      const old = el.copy.textContent;
      el.copy.textContent = "Copied";
      setTimeout(() => { el.copy.textContent = old; }, 900);
    } catch {}
  }

  el.file.addEventListener("change", () => useFile(el.file.files?.[0]));

  el.drop.addEventListener("click", () => el.file.click());
  el.drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      el.file.click();
    }
  });

  for (const name of ["dragenter", "dragover"]) {
    el.drop.addEventListener(name, (event) => {
      event.preventDefault();
      el.drop.classList.add("dragging");
    });
  }

  for (const name of ["dragleave", "drop"]) {
    el.drop.addEventListener(name, (event) => {
      event.preventDefault();
      el.drop.classList.remove("dragging");
    });
  }

  el.drop.addEventListener("drop", (event) => {
    useFile(event.dataTransfer?.files?.[0]);
  });

  el.record.addEventListener("click", startRecording);
  el.stopRecord.addEventListener("click", stopRecording);
  el.transcribe.addEventListener("click", transcribe);
  el.cancel.addEventListener("click", cancelTranscription);
  el.copy.addEventListener("click", copyTranscript);
  el.format.addEventListener("change", () => {
    el.formatShown.textContent = el.format.value;
  });

  el.clear.addEventListener("click", () => {
    cancelTranscription();
    stopRecording();
    stopTracks();
    resetFile();
    resetResult();
    el.recordStatus.textContent = "Microphone recording is optional.";
  });

  window.addEventListener("beforeunload", () => {
    stopTracks();
    revokePreview();
  });

  resetFile();
  resetResult();
})();