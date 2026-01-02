type SpeechCallback = (text: string, isFinal: boolean) => void;
type StatusCallback = (status: string) => void;

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onnomatch: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class SpeechHandler {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onTranscript: SpeechCallback;
  private onStatus: StatusCallback;
  private fullTranscript = "";
  private pendingEndStatus: string | null = null;

  constructor(onTranscript: SpeechCallback, onStatus: StatusCallback) {
    this.onTranscript = onTranscript;
    this.onStatus = onStatus;
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.onStatus("Speech recognition not supported in this browser");
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = this.fullTranscript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result || result.length === 0) continue;

        const alternative = result[0];
        if (!alternative) continue;

        const transcript = alternative.transcript;

        if (result.isFinal) {
          finalTranscript += `${transcript} `;
          this.fullTranscript = finalTranscript;
          this.onTranscript(finalTranscript.trim(), true);
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        this.onTranscript(
          (this.fullTranscript + interimTranscript).trim(),
          false,
        );
      }
    };

    this.recognition.onnomatch = () => {
      this.onStatus("Speech detected but not recognized. Try again.");
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const stopWithStatus = (status: string) => {
        this.pendingEndStatus = status;
        this.isListening = false;
        this.recognition?.stop();
      };

      if (event.error === "no-speech") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("No speech detected. Click microphone to try again.");
        return;
      }

      if (event.error === "audio-capture") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("No microphone found. Check your settings.");
        return;
      }

      if (event.error === "not-allowed") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("Microphone access denied. Please allow access.");
        return;
      }

      if (event.error === "network") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("Speech recognition network error. Please try again.");
        return;
      }

      if (event.error === "aborted") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("Speech recognition was aborted.");
        return;
      }

      if (event.error === "language-not-supported") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("Speech recognition language not supported.");
        return;
      }

      if (event.error === "service-not-allowed") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("Speech recognition service not allowed.");
        return;
      }

      if (event.error === "phrases-not-supported") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("Speech recognition phrases not supported.");
        return;
      }

      if (event.error === "bad-grammar") {
        console.warn("Speech recognition error:", event.error);
        stopWithStatus("Speech recognition grammar error.");
        return;
      }

      console.error("Speech recognition error:", event.error, event.message);
      stopWithStatus(`Error: ${event.error}`);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition?.start();
        } catch (error) {
          console.error("Failed to restart speech recognition:", error);
          this.isListening = false;
          this.onStatus(
            "Microphone connection lost. Click microphone to try again.",
          );
        }
        return;
      }

      if (this.pendingEndStatus) {
        this.onStatus(this.pendingEndStatus);
        this.pendingEndStatus = null;
        return;
      }

      this.onStatus("Ready");
    };

    this.recognition.onstart = () => {
      this.onStatus("Listening...");
    };
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(): void {
    if (!this.recognition) {
      this.onStatus("Speech recognition not available");
      return;
    }

    this.fullTranscript = "";
    this.isListening = true;

    try {
      this.recognition.start();
    } catch (error) {
      const errorMessage = (error as Error).message || "Unknown error";

      if (errorMessage.includes("already started")) {
        try {
          this.recognition.stop();
        } catch (stopError) {
          console.error("Failed to stop speech recognition:", stopError);
        }

        setTimeout(() => {
          try {
            this.recognition?.start();
          } catch (restartError) {
            console.error(
              "Failed to restart speech recognition:",
              restartError,
            );
            this.isListening = false;
            this.onStatus("Failed to start microphone. Please try again.");
          }
        }, 100);

        return;
      }

      console.error("Speech recognition start error:", error);
      this.isListening = false;
      this.onStatus(`Microphone error: ${errorMessage}`);
    }
  }

  stop(): void {
    this.isListening = false;
    this.recognition?.stop();
    this.onStatus("Ready");
  }

  toggle(): boolean {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
    return this.isListening;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  clear(): void {
    this.fullTranscript = "";
    this.onTranscript("", true);
  }
}

export function checkSpeechSupport(): {
  supported: boolean;
  message: string;
} {
  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    return {
      supported: false,
      message:
        "Speech recognition requires Chrome, Edge, or another Chromium-based browser.",
    };
  }

  return {
    supported: true,
    message: "Speech recognition is available",
  };
}
