/**
 * Apfelstrudel Frontend Application
 * WebSocket client + Strudel.cc integration
 *
 * NOTE: All dependencies are vendored in /vendor/
 * No CDN imports allowed - see .github/copilot-instructions.md
 *
 * This file is bundled to public/app.js via `make build-client`
 */

import { initStrudel, controls, silence } from "@strudel/web";

// Types
interface ServerMessage {
  type: string;
  [key: string]: unknown;
}

// DOM Elements
const codeEditor = document.getElementById("code-editor") as HTMLTextAreaElement;
const chatMessages = document.getElementById("chat-messages") as HTMLDivElement;
const chatForm = document.getElementById("chat-form") as HTMLFormElement;
const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
const btnPlay = document.getElementById("btn-play") as HTMLButtonElement;
const btnStop = document.getElementById("btn-stop") as HTMLButtonElement;
const tempoInput = document.getElementById("tempo") as HTMLInputElement;
const statusIndicator = document.getElementById("status-indicator") as HTMLSpanElement;
const resizeHandle = document.getElementById("resize-handle") as HTMLDivElement;
const editorPane = document.querySelector(".editor-pane") as HTMLElement;

// State
let ws: WebSocket | null = null;
let isPlaying = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Strudel instance
let strudelRepl: Awaited<ReturnType<typeof initStrudel>> | null = null;

/**
 * Initialize Strudel REPL
 */
async function initializeStrudel(): Promise<void> {
  try {
    strudelRepl = await initStrudel({
      prebake: async () => {
        // Import common patterns from vendored modules
        const { mini, stack, cat } = await import("@strudel/mini");
        const { samples } = await import("@strudel/webaudio");
        return { mini, stack, cat, samples };
      },
    });
    console.log("[Strudel] Initialized");
    updateStatus("Ready");
  } catch (err) {
    console.error("[Strudel] Init error:", err);
    updateStatus("Error", "error");
  }
}

/**
 * Connect to WebSocket server
 */
function connectWebSocket(): void {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = (): void => {
    console.log("[WS] Connected");
    reconnectAttempts = 0;
    updateStatus("Connected");
  };

  ws.onclose = (): void => {
    console.log("[WS] Disconnected");
    updateStatus("Disconnected", "error");
    ws = null;

    // Attempt reconnection
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
      setTimeout(connectWebSocket, delay);
    }
  };

  ws.onerror = (err): void => {
    console.error("[WS] Error:", err);
  };

  ws.onmessage = (event): void => {
    try {
      const message = JSON.parse(event.data) as ServerMessage;
      handleServerMessage(message);
    } catch (err) {
      console.error("[WS] Parse error:", err);
    }
  };
}

/**
 * Handle incoming server messages
 */
function handleServerMessage(message: ServerMessage): void {
  console.log("[WS] Received:", message.type);

  switch (message.type) {
    case "sync_state":
      // Sync state from server
      if (message.pattern) {
        codeEditor.value = message.pattern as string;
      }
      if (typeof message.playing === "boolean") {
        isPlaying = message.playing;
        updatePlayButton();
      }
      if (typeof message.cps === "number") {
        const bpm = Math.round((message.cps * 60) / 0.5);
        tempoInput.value = String(bpm);
      }
      break;

    case "set_pattern":
      codeEditor.value = message.code as string;
      highlightEditor();
      break;

    case "transport_control":
      if (message.action === "play") {
        playPattern();
      } else if (message.action === "stop") {
        stopPattern();
      }
      break;

    case "set_tempo":
      if (typeof message.cps === "number") {
        const bpm = Math.round((message.cps * 60) / 0.5);
        tempoInput.value = String(bpm);
        if (strudelRepl && controls) {
          controls.setCps(message.cps);
        }
      }
      break;

    case "evaluate":
      evaluateCode(message.code as string);
      break;

    case "assistant_message":
      addMessage("assistant", message.content as string);
      break;

    case "assistant_chunk":
      appendToLastMessage(message.content as string);
      break;

    case "tool_use":
      addMessage("tool", `Using tool: ${message.name}`);
      break;

    case "tool_result": {
      const resultText =
        typeof message.result === "string"
          ? message.result
          : JSON.stringify(message.result, null, 2);
      addMessage(
        "tool",
        `Result: ${resultText.slice(0, 100)}${resultText.length > 100 ? "..." : ""}`
      );
      break;
    }

    case "thinking":
      showThinking(true);
      break;

    case "done":
      showThinking(false);
      break;

    case "error":
      addMessage("error", message.message as string);
      showThinking(false);
      break;

    default:
      console.log("[WS] Unknown message type:", message.type);
  }
}

/**
 * Send message to server
 */
function send(message: Record<string, unknown>): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.error("[WS] Not connected");
  }
}

/**
 * Play the current pattern
 */
async function playPattern(): Promise<void> {
  const code = codeEditor.value;

  if (strudelRepl) {
    try {
      await strudelRepl.evaluate(code);
      isPlaying = true;
      updatePlayButton();
      updateStatus("Playing", "playing");
    } catch (err) {
      console.error("[Strudel] Eval error:", err);
      updateStatus("Error", "error");
    }
  }
}

/**
 * Stop playback
 */
function stopPattern(): void {
  if (strudelRepl) {
    silence();
    isPlaying = false;
    updatePlayButton();
    updateStatus("Stopped");
  }
}

/**
 * Evaluate code without changing play state
 */
async function evaluateCode(code: string): Promise<void> {
  if (strudelRepl) {
    try {
      await strudelRepl.evaluate(code);
      updateStatus("Evaluated", "playing");
    } catch (err) {
      console.error("[Strudel] Eval error:", err);
      updateStatus("Error", "error");
    }
  }
}

/**
 * Update play button state
 */
function updatePlayButton(): void {
  if (isPlaying) {
    btnPlay.classList.add("playing");
    btnPlay.textContent = "⏸ Pause";
  } else {
    btnPlay.classList.remove("playing");
    btnPlay.textContent = "▶ Play";
  }
}

/**
 * Update status indicator
 */
function updateStatus(text: string, className?: string): void {
  statusIndicator.textContent = text;
  statusIndicator.className = "status";
  if (className) {
    statusIndicator.classList.add(className);
  }
}

/**
 * Flash editor to indicate update
 */
function highlightEditor(): void {
  codeEditor.style.backgroundColor = "#1a2b3c";
  setTimeout(() => {
    codeEditor.style.backgroundColor = "";
  }, 200);
}

type MessageRole = "user" | "assistant" | "tool" | "error";

/**
 * Add message to chat
 */
function addMessage(role: MessageRole, content: string): void {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";

  // Parse markdown-like content for assistant messages
  if (role === "assistant") {
    contentDiv.innerHTML = parseSimpleMarkdown(content);
  } else {
    contentDiv.textContent = content;
  }

  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Append content to the last assistant message (for streaming)
 */
function appendToLastMessage(content: string): void {
  const lastMessage = chatMessages.querySelector(
    ".message.assistant:last-child .message-content"
  );
  if (lastMessage) {
    lastMessage.innerHTML = parseSimpleMarkdown((lastMessage.textContent || "") + content);
  } else {
    addMessage("assistant", content);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Simple markdown parser
 */
function parseSimpleMarkdown(text: string): string {
  return (
    text
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      // Line breaks
      .replace(/\n/g, "<br>")
  );
}

/**
 * Show/hide thinking indicator
 */
function showThinking(show: boolean): void {
  const existingIndicator = chatMessages.querySelector(".loading");
  if (show && !existingIndicator) {
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading";
    loadingDiv.textContent = "Thinking";
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else if (!show && existingIndicator) {
    existingIndicator.remove();
  }
}

// Event Listeners

// Play button
btnPlay.addEventListener("click", () => {
  if (isPlaying) {
    stopPattern();
    send({ type: "transport", action: "stop" });
  } else {
    playPattern();
    send({ type: "transport", action: "play" });
    send({ type: "pattern_update", code: codeEditor.value });
  }
});

// Stop button
btnStop.addEventListener("click", () => {
  stopPattern();
  send({ type: "transport", action: "stop" });
});

// Tempo change
tempoInput.addEventListener("change", () => {
  const bpm = parseInt(tempoInput.value, 10);
  if (bpm >= 20 && bpm <= 300) {
    const cps = (bpm / 60) * 0.5;
    if (strudelRepl && controls) {
      controls.setCps(cps);
    }
    // Don't send to server - agent controls tempo
  }
});

// Chat form
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (message) {
    addMessage("user", message);
    send({ type: "chat", message });
    chatInput.value = "";
    showThinking(true);
  }
});

// Enter to send (Shift+Enter for newline)
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to play
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    if (!isPlaying) {
      playPattern();
      send({ type: "transport", action: "play" });
      send({ type: "pattern_update", code: codeEditor.value });
    }
  }
  // Ctrl/Cmd + . to stop
  if ((e.ctrlKey || e.metaKey) && e.key === ".") {
    e.preventDefault();
    stopPattern();
    send({ type: "transport", action: "stop" });
  }
});

// Resizable panes
let isResizing = false;
resizeHandle.addEventListener("mousedown", () => {
  isResizing = true;
  resizeHandle.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;

  const container = document.querySelector(".main");
  if (!container) return;

  const containerWidth = container.getBoundingClientRect().width;
  const newWidth = e.clientX;
  const minWidth = 300;
  const maxWidth = containerWidth - 280;

  if (newWidth >= minWidth && newWidth <= maxWidth) {
    editorPane.style.flex = "none";
    editorPane.style.width = `${newWidth}px`;
  }
});

document.addEventListener("mouseup", () => {
  if (isResizing) {
    isResizing = false;
    resizeHandle.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }
});

// Initialize on load
document.addEventListener("DOMContentLoaded", async () => {
  await initializeStrudel();
  connectWebSocket();
});
