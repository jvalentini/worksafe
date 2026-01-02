import { ref } from "vue";
import type { Detection } from "$lib/detector";
import { formatAsEmail, transformText } from "$lib/replacer";
import { checkSpeechSupport, SpeechHandler } from "$lib/speech";

interface ChangeLog {
  original: string;
  replacement: string;
}

export const inputMode = ref<"voice" | "text">("voice");
export const aiMode = ref(false);
export const sarcasmMode = ref(false);
export const isRecording = ref(false);
export const voiceStatus = ref("Ready");
export const liveTranscript = ref("");
export const textInput = ref("");
export const transformedPlain = ref("");
export const transformedEmail = ref("");
export const changes = ref<ChangeLog[]>([]);
export const apiKey = ref("");
export const isProcessing = ref(false);

let speechHandler: SpeechHandler | null = null;

export function initApp() {
  if (typeof window !== "undefined") {
    apiKey.value = localStorage.getItem("worksafe-api-key") || "";
    const savedSarcasmMode = localStorage.getItem("worksafe-sarcasm-mode");
    sarcasmMode.value = savedSarcasmMode === "true";
    initSpeech();
  }
}

function initSpeech() {
  const support = checkSpeechSupport();
  if (!support.supported) {
    voiceStatus.value = support.message;
    return;
  }

  speechHandler = new SpeechHandler(
    (text: string, _isFinal: boolean) => {
      liveTranscript.value = text;
    },
    (status: string) => {
      voiceStatus.value = status;
    },
  );
}

export function saveApiKey(key: string) {
  apiKey.value = key;
  localStorage.setItem("worksafe-api-key", key);
}

export function saveSarcasmMode(enabled: boolean) {
  sarcasmMode.value = enabled;
  localStorage.setItem("worksafe-sarcasm-mode", String(enabled));
}

export async function toggleRecording() {
  if (!speechHandler) return;

  if (isRecording.value) {
    speechHandler.stop();
    isRecording.value = false;
    voiceStatus.value = "Processing...";
    await processText(liveTranscript.value);
  } else {
    await speechHandler.start();
    if (
      voiceStatus.value !== "Microphone access denied. Please allow access." &&
      voiceStatus.value !== "No microphone found. Check your settings."
    ) {
      isRecording.value = true;
    }
  }
}

export async function processText(text: string) {
  if (!text.trim()) return;

  isProcessing.value = true;
  changes.value = [];

  try {
    if (aiMode.value && apiKey.value) {
      await processWithAI(text);
    } else {
      await processLocally(text);
    }
  } catch (error) {
    console.error("Processing error:", error);
  } finally {
    isProcessing.value = false;
  }
}

async function processLocally(text: string) {
  const result = transformText(text, { sarcasmMode: sarcasmMode.value });
  transformedPlain.value = result.transformed;
  transformedEmail.value = formatAsEmail(result.transformed);

  changes.value = result.changes.map((d: Detection) => ({
    original: d.original,
    replacement: d.replacement,
  }));
}

async function processWithAI(text: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.value}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a corporate communication filter. Transform unprofessional language into professional, workplace-appropriate communication. Be diplomatic but clear. Do not change the meaning or add unnecessary fluff.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content || text;

  transformedPlain.value = result;
  transformedEmail.value = formatAsEmail(result);
  changes.value = [{ original: text, replacement: result }];
}
