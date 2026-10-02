(() => {
  const API_URL = "https://chat.zorix.it/v1/chat/completions";
  const HEALTH_URL = "https://chat.zorix.it/health";
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
    endedAt: 0
  };

  const el = {
    prompt: $("#prompt"),
    system: $("#systemPrompt"),
    stream: $("#streamMode"),
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

  function setOutput(text, streaming = false) {
    el.output.textContent = text || "";
    el.output.classList.toggle("cp-placeholder", !text);
    el.output.classList.toggle("cp-cursor", streaming);
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
    setOutput("Waiting to run...");
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

  function append(text) {
    if (!text) return;
    if (!state.firstTokenAt) state.firstTokenAt = now();
    state.text += text;
    setOutput(state.text, true);
    el.chars.textContent = String(state.text.length);
  }

  async function readCustomSSE(response) {
    if (!response.body) throw new Error("Streaming response body is unavailable in this browser.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventName = "message";
    const events = [];

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const i = buffer.indexOf("\n");
        if (i < 0) break;

        let line = buffer.slice(0, i);
        buffer = buffer.slice(i + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);

        if (!line) {
          eventName = "message";
          continue;
        }

        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim() || "message";
          continue;
        }

        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        events.push(eventName + ": " + data);

        let json;
        try {
          json = JSON.parse(data);
        } catch {
          continue;
        }

        if (eventName === "delta" && typeof json?.text === "string") {
          append(json.text);
        } else if (eventName === "response" && json?.id) {
          state.previousResponseId = json.id;
        } else if (eventName === "done" && json?.response_id) {
          state.previousResponseId = json.response_id;
        }
      }
    }

    return events;
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
    setOutput("", !!el.stream.checked);
    setRaw({});

    const body = {
      model: API_MODEL,
      messages: messages(),
      stream: !!el.stream.checked
    };

    if (state.previousResponseId) {
      body.previous_response_id = state.previousResponseId;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: state.controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("API " + response.status + ": " + errorText.slice(0, 700));
      }

      if (!body.stream) {
        const data = await response.json();
        state.raw = data;
        state.text = data?.choices?.[0]?.message?.content ?? "";
        state.firstTokenAt = now();
        state.endedAt = now();
        state.previousResponseId =
          data?.zorix?.previous_response_id ||
          data?.id ||
          state.previousResponseId;

        setOutput(state.text || "(empty response)");
        setRaw(data);
        setStatus("ok", "Done");
        updateMetrics(data?.choices?.[0]?.finish_reason || "stop");
      } else {
        const events = await readCustomSSE(response);
        state.raw = events;
        state.endedAt = now();
        setOutput(state.text || "(empty response)");
        setRaw(events.join("\n"));
        setStatus("ok", "Done");
        updateMetrics("done");
      }
    } catch (error) {
      state.endedAt = now();

      if (error?.name === "AbortError") {
        setStatus("", "Stopped");
        setOutput(state.text || "Stopped.");
        updateMetrics("stopped");
      } else {
        const message = error?.message || String(error);
        setStatus("error", "Error");
        setOutput(message);
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
      const response = await fetch(HEALTH_URL, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error("Health check failed");

      el.healthText.innerHTML =
        "API: <strong>online</strong> · model <strong>" +
        DISPLAY_MODEL +
        "</strong>";
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

  resetResult();
})();