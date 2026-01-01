const STORAGE_KEY = "worksafe_openai_key";

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return key?.startsWith("sk-") ?? false;
}

export interface AIRewriteResult {
  success: boolean;
  rewritten?: string;
  error?: string;
}

export async function rewriteWithAI(
  text: string,
  tone: "professional" | "friendly" | "formal" = "professional",
): Promise<AIRewriteResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error:
        "No API key configured. Please add your OpenAI API key in settings.",
    };
  }

  const systemPrompt = `You are a professional communication assistant. Your job is to rewrite text to be workplace-appropriate while preserving the core message and intent.

Guidelines:
- Remove all profanity, insults, and aggressive language
- Maintain the original meaning and key points
- Use ${tone} tone
- Keep the rewritten text concise
- Do not add unnecessary pleasantries or filler
- Preserve any technical terms or specific details
- Return ONLY the rewritten text, no explanations`;

  const userPrompt = `Rewrite this text to be professional and workplace-appropriate:\n\n${text}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key. Please check your OpenAI API key.",
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again in a moment.",
        };
      }

      return {
        success: false,
        error: errorData.error?.message || `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (!rewritten) {
      return {
        success: false,
        error: "No response from AI. Please try again.",
      };
    }

    return {
      success: true,
      rewritten,
    };
  } catch (error) {
    console.error("AI rewrite error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }

    return {
      success: false,
      error: "Failed to connect to AI service. Please try again.",
    };
  }
}
