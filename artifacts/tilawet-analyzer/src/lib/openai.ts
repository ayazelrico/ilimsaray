export interface AnalysisResult {
  scores: {
    taban_puan: number;
    tecvid_ve_mahrec: number;
    yuzunden_dogru_okuma: number;
    makam: number;
    ses: number;
  };
  total: number;
  feedback: {
    taban_puan: string;
    tecvid_ve_mahrec: string;
    yuzunden_dogru_okuma: string;
    makam: string;
    ses: string;
  };
  genel_yorum: string;
  transcribed_text: string;
}

const BASE = `${import.meta.env.BASE_URL}api`;

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  const mimeType = audioBlob.type || "audio/webm";
  const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
  const file = new File([audioBlob], `recording.${extension}`, { type: mimeType });
  formData.append("file", file);

  const response = await fetch(`${BASE}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 429) throw new Error("API istek limiti aşıldı. Lütfen biraz bekleyin.");
    throw new Error(err.error || `Transkripsiyon hatası (${response.status})`);
  }

  const data = await response.json() as { text: string };
  return data.text.trim();
}

export async function analyzeRecitation(transcribedText: string): Promise<AnalysisResult> {
  const response = await fetch(`${BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcribedText }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 429) throw new Error("API istek limiti aşıldı. Lütfen biraz bekleyin.");
    throw new Error(err.error || `Analiz hatası (${response.status})`);
  }

  return response.json() as Promise<AnalysisResult>;
}
