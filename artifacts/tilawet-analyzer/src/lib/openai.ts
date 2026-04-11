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

const SYSTEM_PROMPT = `Sen bir Kuran tilavetiyle uzmanlaşmış, İslami ilimler ve kıraat ilmi konusunda derin bilgiye sahip yapay zeka analistsin.

Sana bir Kuran tilaveti kaydının transkripsiyonu verilecek. Bu tilaveti aşağıdaki 5 kritere göre değerlendir ve SADECE JSON formatında yanıt ver:

1. taban_puan (0-50): Genel tilavet doğruluğu, tamlık, büyük hataların yokluğu
2. tecvid_ve_mahrec (0-15): Tecvid kurallarının uygulanması, harf mahreçlerinin doğruluğu
3. yuzunden_dogru_okuma (0-15): Kelimelerin Kuran'daki gibi doğru okunması
4. makam (0-15): Geleneksel Kurani makamların doğru kullanımı (Rast, Bayati, Hicaz vb.)
5. ses (0-5): Ses netliği, projeksiyon, ses kalitesi

ÖNEMLI: 
- Tüm geri bildirimler Türkçe olmalıdır
- Gerçekçi ve yapıcı değerlendirme yap
- Eğer metin Arapça değilse veya Kuran tilaveti değilse, tüm puanları düşük tut ve açıkla
- Yalnızca aşağıdaki JSON şemasını kullan, hiçbir ek metin ekleme

{
  "scores": {
    "taban_puan": <0-50>,
    "tecvid_ve_mahrec": <0-15>,
    "yuzunden_dogru_okuma": <0-15>,
    "makam": <0-15>,
    "ses": <0-5>
  },
  "total": <0-100>,
  "feedback": {
    "taban_puan": "Türkçe detaylı geri bildirim",
    "tecvid_ve_mahrec": "Türkçe detaylı geri bildirim",
    "yuzunden_dogru_okuma": "Türkçe detaylı geri bildirim",
    "makam": "Türkçe detaylı geri bildirim",
    "ses": "Türkçe detaylı geri bildirim"
  },
  "genel_yorum": "Türkçe genel değerlendirme ve tavsiyeler (2-4 cümle)",
  "transcribed_text": "Transkripsiyonun aynısı"
}`;

export async function transcribeAudio(audioBlob: Blob, apiKey: string): Promise<string> {
  const formData = new FormData();

  let file: File;
  const mimeType = audioBlob.type || "audio/webm";
  const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
  file = new File([audioBlob], `recording.${extension}`, { type: mimeType });
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("language", "ar");
  formData.append("response_format", "text");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as Record<string, unknown>;
    const msg = ((err as { error?: { message?: string } }).error?.message) || `HTTP ${response.status}`;
    if (response.status === 401) throw new Error("Geçersiz API anahtarı. Lütfen anahtarınızı kontrol edin.");
    if (response.status === 429) throw new Error("API istek limiti aşıldı. Lütfen biraz bekleyin.");
    throw new Error(`Transkripsiyon hatası: ${msg}`);
  }

  const text = await response.text();
  return text.trim();
}

export async function analyzeRecitation(transcribedText: string, apiKey: string): Promise<AnalysisResult> {
  const userMessage = `Lütfen aşağıdaki Kuran tilaveti transkripsiyonunu değerlendir:\n\n"${transcribedText || '[Ses kalitesi çok düşük veya metin çözümlenemedi]'}"`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as Record<string, unknown>;
    const msg = ((err as { error?: { message?: string } }).error?.message) || `HTTP ${response.status}`;
    if (response.status === 401) throw new Error("Geçersiz API anahtarı. Lütfen anahtarınızı kontrol edin.");
    if (response.status === 429) throw new Error("API istek limiti aşıldı. Lütfen biraz bekleyin.");
    throw new Error(`Analiz hatası: ${msg}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("API'den geçersiz yanıt alındı.");

  const result = JSON.parse(content) as AnalysisResult;

  result.total = (result.scores.taban_puan || 0) +
    (result.scores.tecvid_ve_mahrec || 0) +
    (result.scores.yuzunden_dogru_okuma || 0) +
    (result.scores.makam || 0) +
    (result.scores.ses || 0);

  result.transcribed_text = transcribedText;

  return result;
}
