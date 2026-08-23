// Speech-To-Text and Text-To-Speech Utilities

export class SpeechHandler {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onWakeWordCallback?: () => void;
  private onErrorCallback?: (err: string) => void;
  private onStatusChangeCallback?: (listening: boolean) => void;
  private wakeWords = ["hey aura", "aura", "hey jarvis", "jarvis"];

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis || null;
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";

        this.recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          const currentText = (final || interim).trim();

          // Check for wake-word
          const lower = currentText.toLowerCase();
          for (const ww of this.wakeWords) {
            if (lower.startsWith(ww)) {
              if (this.onWakeWordCallback) {
                this.onWakeWordCallback();
              }
              break;
            }
          }

          if (this.onResultCallback && currentText) {
            this.onResultCallback(currentText, Boolean(final));
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            if (this.onErrorCallback) {
              this.onErrorCallback(event.error);
            }
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(false);
          }
        };
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onWakeWord?: () => void,
    onError?: (err: string) => void,
    onStatusChange?: (listening: boolean) => void
  ) {
    if (!this.recognition) {
      if (onError) onError("Speech recognition is not supported in this browser.");
      return;
    }

    this.onResultCallback = onResult;
    this.onWakeWordCallback = onWakeWord;
    this.onErrorCallback = onError;
    this.onStatusChangeCallback = onStatusChange;

    try {
      this.recognition.start();
      this.isListening = true;
      if (onStatusChange) onStatusChange(true);
    } catch (e: any) {
      // Already running or permission issue
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback(false);
      }
    }
  }

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ) {
    if (!this.synthesis) return;

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*_#`[\]()]/g, "")
      .replace(/https?:\/\/\S+/g, "link")
      .replace(/>+/g, "")
      .trim();

    if (!cleanText) return;

    // Cancel ongoing speech
    this.synthesis.cancel();

    // Split long text into speakable sentence chunks to avoid speech buffer cutoff
    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 400));
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    const voices = this.synthesis.getVoices();
    if (options.voiceName && voices.length > 0) {
      const selected = voices.find((v) => v.name.includes(options.voiceName!));
      if (selected) utterance.voice = selected;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;

    this.synthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }
}

export const speechHandler = new SpeechHandler();
