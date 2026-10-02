(() => {
  const BASE = "https://chat.zorix.it";
  const CHAT_URL = BASE + "/v1/chat/completions";
  const RESPONSES_URL = BASE + "/v1/responses";
  const MODELS_URL = BASE + "/v1/models";
  const HEALTH_URL = BASE + "/health";
  const API_MODEL = "Gpt6.1sol";
  const DISPLAY_MODEL = "GPT-6.1 SOL";

  const $ = (s) => document.querySelector(s);
  const state = {
    running: false,
    controller: null,
    previousResponseId: "",
    text: "",
    raw: null,
    startedAt: 0,
    firstTokenAt: 0,
    endedAt: 0,
    renderQueued: false
  };

  const el = {
    prompt: $("#prompt"),
    system: $("#systemPrompt"),
    apiMode: $("#apiMode"),
    endpointHint: $("#endpointHint"),
    stream: $("#streamMode"),
    streamHint: $("#streamHint"),
    run: $("#runPrompt"),
    stop: $("#stopPrompt"),
    clear: $("#clearPrompt"),
    health: $("#checkHealth"),
    healthText: $("#healthText"),
    output: $("#modelOutput"),
    status: $("#modelStatus"),
    raw: $("#modelRaw"),
    latency: $("#modelLatency"),
    first: $("#modelFirst"),
    chars: $("#modelChars"),
    finish: $("#modelFinish"),
    copy: $("#copyOutput"),
    modelShown: $("#modelShown"),
    presets: [...document.querySelectorAll(".cp-preset")]
  };

  const now = () => performance.now();
  const fmtMs = (v) => !Number.isFinite(v) || v < 0 ? "-" : v < 1000 ? Math.round(v) + " ms" : (v / 1000).toFixed(2) + " s";

  function messages() {
    const arr = [];
    const system = el.system.value.trim();
    if (system) arr.push({ role: "system", content: system });
    arr.push({ role: "user", content: el.prompt.value.trim() });
    return arr;
  }

  function setStatus(kind, label) {
    el.status.className = ("cp-status " + (kind || "")).trim();
    el.status.querySelector("span:last-child").textContent = label;
  }

  function renderMarkdownNow(text, streaming = false) {
    if (!text) {
      el.output.textContent = "";
      el.output.classList.add("cp-placeholder");
      el.output.classList.toggle("cp-cursor", streaming);
      return;
    }

    el.output.classList.remove("cp-placeholder");
    el.output.classList.toggle("cp-cursor", streaming);

    if (!window.marked || !window.DOMPurify) {
      el.output.textContent = text;
      return;
    }

    const parsed = window.marked.parse(text, { gfm: true, breaks: true });
    el.output.innerHTML = window.DOMPurify.sanitize(parsed, {
      USE_PROFILES: { html: true }
    });

    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(el.output, {
          throwOnError: false,
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "$", right: "$", display: false }
          ]
        });
      } catch {}
    }

    el.output.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".cp-code-copy")) return;
      const code = pre.querySelector("code");
      if (!code) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cp-code-copy";
      button.textContent = "Copy";
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.textContent || "");
          button.textContent = "Copied";
          setTimeout(() => { button.textContent = "Copy"; }, 900);
        } catch {}
      });
      pre.appendChild(button);
    });
  }

  function queueRender(streaming = false) {
    if (state.renderQueued) return;
    state.renderQueued = true;
    requestAnimationFrame(() => {
      state.renderQueued = false;
      renderMarkdownNow(state.text, streaming);
    });
  }

  function setRaw(data) {
    try {
      el.raw.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    } catch {
      el.raw.textContent = String(data ?? "");
    }
  }

  function resetResult() {
    state.text = "";
    state.raw = null;
    state.startedAt = 0;
    state.firstTokenAt = 0;
    state.endedAt = 0;
    setStatus("", "Idle");
    el.output.textContent = "Waiting to run...";
    el.output.className = "cp-output cp-markdown cp-placeholder";
    setRaw({});
    el.latency.textContent = "-";
    el.first.textContent = "-";
    el.chars.textContent = "0";
    el.finish.textContent = "-";
    el.modelShown.textContent = DISPLAY_MODEL;
  }

  function updateMetrics(finish = "-") {
    const total = state.endedAt && state.startedAt ? state.endedAt - state.startedAt : 0;
    const first = state.firstTokenAt && state.startedAt ? state.firstTokenAt - state.startedAt : 0;
    el.latency.textContent = total ? fmtMs(total) : "-";
    el.first.textContent = first ? fmtMs(first) : "-";
    el.chars.textContent = String(state.text.length);
    el.finish.textContent = finish || "-";
  }

  function normalizeTextPart(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(normalizeTextPart).join("");
    if (!value || typeof value !== "object") return "";

    if (typeof value.text === "string") return value.text;
    if (typeof value.value === "string") return value.value;
    if (typeof value.content === "string") return value.content;
    if (Array.isArray(value.content)) return value.content.map(normalizeTextPart).join("");
    if (value.text && typeof value.text === "object") return normalizeTextPart(value.text);

    return "";
  }

  function extractChatText(data) {
    const choice = data?.choices?.[0];

    const candidates = [
      choice?.message?.content,
      choice?.delta?.content,
      data?.message?.content,
      data?.content,
      data?.output_text,
      data?.text
    ];

    for (const candidate of candidates) {
      const text = normalizeTextPart(candidate);
      if (text) return text;
    }

    return "";
  }

  function extractStreamDelta(data) {
    const choice = data?.choices?.[0];

    const candidates = [
      choice?.delta?.content,
      choice?.message?.content,
      data?.delta,
      data?.text,
      data?.output_text
    ];

    for (const candidate of candidates) {
      const text = normalizeTextPart(candidate);
      if (text) return text;
    }

    if (data?.type === "response.output_text.delta") {
      return normalizeTextPart(data?.delta);
    }

    return "";
  }

  function append(text) {
    text = normalizeTextPart(text);
    if (!text) return;
    if (!state.firstTokenAt) state.firstTokenAt = now();
    state.text += text;
    el.chars.textContent = String(state.text.length);
    queueRender(true);
  }

  async function readOpenAISSE(response) {
    if (!response.body) throw new Error("Streaming response body is unavailable in this browser.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const events = [];
    let finish = "done";

    function handleData(data) {
      if (!data) return;
      events.push(data);
      if (data === "[DONE]") return;

      let json;
      try {
        json = JSON.parse(data);
      } catch {
        return;
      }

      const choice = json?.choices?.[0];
      const delta = extractStreamDelta(json);

      if (delta) append(delta);
      if (choice?.finish_reason) finish = choice.finish_reason;

      const prev =
        json?.zorix?.previous_response_id ||
        json?.previous_response_id;

      if (prev) state.previousResponseId = prev;
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const newline = buffer.indexOf("\n");
        if (newline < 0) break;

        let line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        line = line.trim();

        if (!line || line.startsWith(":") || line.startsWith("event:")) continue;

        if (line.startsWith("data:")) {
          handleData(line.slice(5).trim());
          continue;
        }

        // Fallback for OpenAI-compatible servers that send one JSON object per line.
        if (line.startsWith("{")) {
          handleData(line);
        }
      }
    }

    buffer += decoder.decode();
    const tail = buffer.trim();

    if (tail) {
      if (tail.startsWith("data:")) handleData(tail.slice(5).trim());
      else if (tail.startsWith("{")) handleData(tail);
    }

    // Last-resort recovery: some compatible gateways return a final full
    // completion object instead of text deltas.
    if (!state.text) {
      for (const event of events) {
        if (!event || event === "[DONE]") continue;
        try {
          const json = JSON.parse(event);
          const recovered = extractChatText(json) || extractStreamDelta(json);
          if (recovered) {
            append(recovered);
            break;
          }
        } catch {}
      }
    }

    return { events, finish };
  }
  function extractResponseText(data) {
    const direct = normalizeTextPart(data?.output_text);
    if (direct) return direct;

    const parts = [];

    for (const item of data?.output || []) {
      const itemText = normalizeTextPart(item?.content);
      if (itemText) {
        parts.push(itemText);
        continue;
      }

      for (const content of item?.content || []) {
        const text = normalizeTextPart(content);
        if (text) parts.push(text);
      }
    }

    if (parts.length) return parts.join("\n");

    return extractChatText(data);
  }
  function syncMode() {
    const responses = el.apiMode.value === "responses";
    el.endpointHint.textContent = "POST " + (responses ? RESPONSES_URL : CHAT_URL);
    el.stream.disabled = responses;

    if (responses) {
      el.stream.checked = false;
      el.streamHint.innerHTML = "Responses mode currently uses the documented non-streaming contract.";
    } else {
      el.streamHint.innerHTML = 'Standard OpenAI SSE: <code>data: {...}</code> then <code>data: [DONE]</code>.';
    }
  }

  async function runChat() {
    const stream = !!el.stream.checked;
    const body = {
      model: API_MODEL,
      messages: messages(),
      stream
    };

    if (state.previousResponseId) body.previous_response_id = state.previousResponseId;

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: state.controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("API " + response.status + ": " + errorText.slice(0, 700));
    }

    if (!stream) {
      const data = await response.json();
      state.raw = data;
      state.text = extractChatText(data);
      state.firstTokenAt = now();
      state.endedAt = now();
      state.previousResponseId =
        data?.zorix?.previous_response_id ||
        data?.id ||
        state.previousResponseId;

      renderMarkdownNow(state.text || "No text content was found in the API response. Open Raw response below.");
      setRaw(data);
      return data?.choices?.[0]?.finish_reason || "stop";
    }

    const result = await readOpenAISSE(response);
    state.raw = result.events;
    state.endedAt = now();
    renderMarkdownNow(state.text || "No text content was found in the API response. Open Raw response below.");
    setRaw(result.events.join("\n"));
    return result.finish;
  }

  async function runResponses() {
    const body = {
      model: API_MODEL,
      input: el.prompt.value.trim()
    };

    const instructions = el.system.value.trim();
    if (instructions) body.instructions = instructions;

    const response = await fetch(RESPONSES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: state.controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("API " + response.status + ": " + errorText.slice(0, 700));
    }

    const data = await response.json();
    state.raw = data;
    state.text = extractResponseText(data);
    state.firstTokenAt = now();
    state.endedAt = now();
    state.previousResponseId =
      data?.previous_response_id ||
      data?.zorix?.previous_response_id ||
      data?.id ||
      state.previousResponseId;

    renderMarkdownNow(state.text || "No text content was found in the API response. Open Raw response below.");
    setRaw(data);
    return data?.status || "completed";
  }

  async function run() {
    if (state.running) return;

    const prompt = el.prompt.value.trim();
    if (!prompt) {
      el.prompt.focus();
      return;
    }

    state.running = true;
    state.controller = new AbortController();
    state.startedAt = now();
    state.firstTokenAt = 0;
    state.endedAt = 0;
    state.text = "";
    state.raw = null;

    el.run.disabled = true;
    el.stop.disabled = false;
    setStatus("running", "Running");
    renderMarkdownNow("", el.apiMode.value === "chat" && el.stream.checked);
    setRaw({});

    try {
      const finish = el.apiMode.value === "responses"
        ? await runResponses()
        : await runChat();

      setStatus("ok", "Done");
      updateMetrics(finish);
    } catch (error) {
      state.endedAt = now();

      if (error?.name === "AbortError") {
        setStatus("", "Stopped");
        renderMarkdownNow(state.text || "Stopped.");
        updateMetrics("stopped");
      } else {
        const message = error?.message || String(error);
        state.text = message;
        setStatus("error", "Error");
        renderMarkdownNow(message);
        setRaw({ error: message });
        updateMetrics("error");
      }
    } finally {
      state.running = false;
      state.controller = null;
      el.run.disabled = false;
      el.stop.disabled = true;
    }
  }

  function stop() {
    if (state.controller) state.controller.abort();
  }

  function clear() {
    stop();
    state.previousResponseId = "";
    resetResult();
  }

  async function checkHealth() {
    el.health.disabled = true;
    el.healthText.innerHTML = "Checking <strong>API</strong>...";

    try {
      const [healthRes, modelsRes] = await Promise.all([
        fetch(HEALTH_URL, { cache: "no-store" }),
        fetch(MODELS_URL, { cache: "no-store" })
      ]);

      const health = await healthRes.json();
      const models = await modelsRes.json();

      if (!healthRes.ok || !health?.ok) throw new Error("Health check failed");
      if (!modelsRes.ok) throw new Error("Models request failed");

      const modelIds = Array.isArray(models?.data)
        ? models.data.map((m) => m?.id).filter(Boolean)
        : [];

      const endpoints = health?.endpoints || {};

      el.healthText.innerHTML =
        'API: <strong>online</strong> · service <strong>' +
        String(health?.service || "Zorix OpenAI-Compatible API") +
        '</strong> · status <strong>' +
        String(health?.status || "experimental") +
        '</strong> · model <strong>' +
        String(modelIds[0] || health?.model || API_MODEL) +
        '</strong> · endpoints <strong>' +
        [endpoints.models, endpoints.chat, endpoints.responses].filter(Boolean).join(", ") +
        '</strong>';
    } catch (error) {
      el.healthText.innerHTML =
        "API: <strong>unavailable from this browser</strong> · " +
        String(error?.message || "check failed");
    } finally {
      el.health.disabled = false;
    }
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(state.text);
      const old = el.copy.textContent;
      el.copy.textContent = "Copied";
      setTimeout(() => { el.copy.textContent = old; }, 900);
    } catch {}
  }

  el.run.addEventListener("click", run);
  el.stop.addEventListener("click", stop);
  el.clear.addEventListener("click", clear);
  el.health.addEventListener("click", checkHealth);
  el.copy.addEventListener("click", copyOutput);
  el.apiMode.addEventListener("change", syncMode);

  el.presets.forEach((button) => {
    button.addEventListener("click", () => {
      el.prompt.value = button.dataset.prompt || "";
      el.prompt.focus();
    });
  });

  el.prompt.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      run();
    }
  });

  if (window.marked) {
    window.marked.setOptions({ gfm: true, breaks: true });
  }

  syncMode();
  resetResult();
})();