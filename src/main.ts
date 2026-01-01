import {
  getApiKey,
  hasApiKey,
  rewriteWithAI,
  saveApiKey,
} from "./lib/ai-rewriter";
import { formatAsEmail, getChangeSummary, transformText } from "./lib/replacer";
import { checkSpeechSupport, SpeechHandler } from "./lib/speech";

const $ = <T extends HTMLElement>(selector: string): T =>
  document.querySelector(selector) as T;

const voiceTabs = document.querySelectorAll(".input-tabs .tab");
const outputTabs = document.querySelectorAll(".output-tabs .tab");

const voicePanel = $("#voice-panel");
const textPanel = $("#text-panel");
const recordBtn = $("#record-btn");
const voiceStatus = $("#voice-status");
const liveTranscript = $("#live-transcript");
const textInput = $<HTMLTextAreaElement>("#text-input");
const transformBtn = $("#transform-btn");

const aiModeToggle = $<HTMLInputElement>("#ai-mode");
const modeBadge = $("#mode-badge");
const apiKeyInput = $<HTMLInputElement>("#api-key");
const saveKeyBtn = $("#save-key-btn");

const plainOutput = $("#plain-output");
const emailOutput = $("#email-output");
const outputPlain = $("#output-plain");
const outputEmail = $("#output-email");
const changesSummary = $("#changes-summary");
const copyBtns = document.querySelectorAll(".copy-btn");

let speechHandler: SpeechHandler | null = null;
let currentTranscript = "";

function init(): void {
  initTabs();
  initSpeech();
  initSettings();
  initTransform();
  initCopy();
}

function initTabs(): void {
  voiceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      for (const t of voiceTabs) {
        t.classList.remove("active");
      }
      tab.classList.add("active");

      if (target === "voice") {
        voicePanel.classList.remove("hidden");
        textPanel.classList.add("hidden");
      } else {
        voicePanel.classList.add("hidden");
        textPanel.classList.remove("hidden");
      }
    });
  });

  outputTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-output");

      for (const t of outputTabs) {
        t.classList.remove("active");
      }
      tab.classList.add("active");

      if (target === "plain") {
        plainOutput.classList.remove("hidden");
        emailOutput.classList.add("hidden");
      } else {
        plainOutput.classList.add("hidden");
        emailOutput.classList.remove("hidden");
      }
    });
  });
}

function initSpeech(): void {
  const support = checkSpeechSupport();

  if (!support.supported) {
    voiceStatus.textContent = support.message;
    recordBtn.setAttribute("disabled", "true");
    return;
  }

  speechHandler = new SpeechHandler(
    (text, isFinal) => {
      currentTranscript = text;
      liveTranscript.textContent = text || "Speak now...";

      if (isFinal && text) {
        processText(text);
      }
    },
    (status) => {
      voiceStatus.textContent = status;

      const isListening = speechHandler?.getIsListening() ?? false;
      recordBtn.classList.toggle("recording", isListening);

      const recordText = recordBtn.querySelector(".record-text");
      if (recordText) {
        recordText.textContent = isListening
          ? "Click to stop"
          : "Click to speak";
      }
    },
  );

  recordBtn.addEventListener("click", () => {
    if (!speechHandler) return;

    const isListening = speechHandler.toggle();
    recordBtn.classList.toggle("recording", isListening);

    const recordText = recordBtn.querySelector(".record-text");
    if (recordText) {
      recordText.textContent = isListening ? "Click to stop" : "Click to speak";
    }
  });
}

function initSettings(): void {
  const savedKey = getApiKey();
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }

  aiModeToggle.addEventListener("change", () => {
    const isAI = aiModeToggle.checked;

    modeBadge.textContent = isAI ? "AI Mode" : "Dictionary Mode";
    modeBadge.classList.toggle("ai", isAI);

    if (isAI && !hasApiKey()) {
      const details = document.querySelector(
        ".api-settings",
      ) as HTMLDetailsElement;
      if (details) details.open = true;
    }

    if (currentTranscript || textInput.value) {
      processText(currentTranscript || textInput.value);
    }
  });

  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();

    if (!key) {
      alert("Please enter an API key");
      return;
    }

    if (!key.startsWith("sk-")) {
      alert("Invalid API key format. OpenAI keys start with 'sk-'");
      return;
    }

    saveApiKey(key);
    saveKeyBtn.textContent = "Saved!";
    setTimeout(() => {
      saveKeyBtn.textContent = "Save";
    }, 2000);
  });
}

function initTransform(): void {
  transformBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (text) {
      processText(text);
    }
  });

  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      const text = textInput.value.trim();
      if (text) {
        processText(text);
      }
    }
  });
}

async function processText(text: string): Promise<void> {
  if (!text) return;

  transformBtn.setAttribute("disabled", "true");
  transformBtn.textContent = "Processing...";

  try {
    if (aiModeToggle.checked && hasApiKey()) {
      const result = await rewriteWithAI(text);

      if (result.success && result.rewritten) {
        outputPlain.textContent = result.rewritten;
        outputEmail.textContent = formatAsEmail(result.rewritten);
        changesSummary.textContent = "Rewritten by AI for professional tone";
      } else {
        const dictResult = transformText(text);
        outputPlain.textContent = dictResult.transformed;
        outputEmail.textContent = formatAsEmail(dictResult.transformed);
        changesSummary.textContent = `AI unavailable (${result.error}). Used dictionary mode: ${getChangeSummary(dictResult.changes)}`;
      }
    } else {
      const result = transformText(text);
      outputPlain.textContent = result.transformed;
      outputEmail.textContent = formatAsEmail(result.transformed);
      changesSummary.textContent = getChangeSummary(result.changes);
    }
  } catch (error) {
    console.error("Processing error:", error);
    const result = transformText(text);
    outputPlain.textContent = result.transformed;
    outputEmail.textContent = formatAsEmail(result.transformed);
    changesSummary.textContent = getChangeSummary(result.changes);
  } finally {
    transformBtn.removeAttribute("disabled");
    transformBtn.textContent = "Transform";
  }
}

function initCopy(): void {
  copyBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-target");
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      const text = target.textContent || "";

      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied!";
        btn.classList.add("copied");

        setTimeout(() => {
          btn.textContent = "📋 Copy";
          btn.classList.remove("copied");
        }, 2000);
      } catch (error) {
        console.error("Copy failed:", error);
        btn.textContent = "Failed";
        setTimeout(() => {
          btn.textContent = "📋 Copy";
        }, 2000);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
