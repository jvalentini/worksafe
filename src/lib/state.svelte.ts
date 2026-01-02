import { type Detection, detectIssues } from "$lib/detector";
import { formatAsEmail, getChangeSummary, transformText } from "$lib/replacer";
import { checkSpeechSupport, SpeechHandler } from "$lib/speech";

interface ChangeLog {
  original: string;
  replacement: string;
}

class AppState {
  inputMode = $state<"voice" | "text">("voice");
  aiMode = $state(false);
  isRecording = $state(false);
  voiceStatus = $state("Ready");
  liveTranscript = $state("");
  textInput = $state("");
  transformedPlain = $state("");
  transformedEmail = $state("");
  changes = $state<Array<{ original: string; replacement: string }>>([]);
  apiKey = $state("");
  isProcessing = $state(false);
  private speechHandler: SpeechHandler | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.apiKey = localStorage.getItem("worksafe-api-key") || "";
      this.initSpeech();
    }
  }

  private initSpeech() {
    const support = checkSpeechSupport();
    if (!support.supported) {
      this.voiceStatus = support.message;
      return;
    }

    this.speechHandler = new SpeechHandler(
      (text: string, _isFinal: boolean) => {
        this.liveTranscript = text;
      },
      (status: string) => {
        this.voiceStatus = status;
      },
    );
  }

  saveApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem("worksafe-api-key", key);
  }

  async toggleRecording() {
    if (!this.speechHandler) return;

    if (this.isRecording) {
      this.speechHandler.stop();
      this.isRecording = false;
      this.voiceStatus = "Processing...";
      this.processText(this.liveTranscript);
    } else {
      this.speechHandler.start();
      this.isRecording = true;
      this.voiceStatus = "Listening...";
    }
  }

  async processText(text: string) {
    if (!text.trim()) return;

    this.isProcessing = true;
    this.changes = [];

    try {
      if (this.aiMode && this.apiKey) {
        await this.processWithAI(text);
      } else {
        await this.processLocally(text);
      }
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  async processLocally(text: string) {
    const result = transformText(text);
    this.transformedPlain = result.transformed;
    this.transformedEmail = formatAsEmail(result.transformed);

    // Convert Detection[] to ChangeLog[]
    this.changes = result.changes.map((d: Detection) => ({
      original: d.original,
      replacement: d.replacement,
    }));
  }

  async processWithAI(text: string) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
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

    this.transformedPlain = result;
    this.transformedEmail = formatAsEmail(result);
    this.changes = [{ original: text, replacement: result }];
  }
}

export const appState = new AppState();
