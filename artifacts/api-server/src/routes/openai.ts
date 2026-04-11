import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

router.post("/transcribe", upload.single("file"), async (req: Request, res: Response) => {
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API anahtarı yapılandırılmamış." });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "Ses dosyası gerekli." });
    return;
  }

  try {
    const formData = new FormData();
    const ext = req.file.mimetype.includes("mp4") ? "mp4" : req.file.mimetype.includes("ogg") ? "ogg" : "webm";
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("file", blob, `recording.${ext}`);
    formData.append("model", "whisper-1");
    formData.append("language", "ar");
    formData.append("response_format", "text");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
      req.log.error({ status: response.status }, "Whisper API error");
      res.status(response.status).json({ error: err.error?.message || "Transkripsiyon hatası" });
      return;
    }

    const text = await response.text();
    res.json({ text: text.trim() });
  } catch (err) {
    req.log.error({ err }, "Transcription error");
    res.status(500).json({ error: "Transkripsiyon sırasında hata oluştu." });
  }
});

router.post("/analyze", async (req: Request, res: Response) => {
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API anahtarı yapılandırılmamış." });
    return;
  }

  const { transcribedText } = req.body as { transcribedText?: string };

  if (transcribedText === undefined) {
    res.status(400).json({ error: "transcribedText alanı gerekli." });
    return;
  }

  const userMessage = `Lütfen aşağıdaki Kuran tilaveti transkripsiyonunu değerlendir:\n\n"${transcribedText || '[Ses kalitesi çok düşük veya metin çözümlenemedi]'}"`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
      req.log.error({ status: response.status }, "GPT-4o API error");
      res.status(response.status).json({ error: err.error?.message || "Analiz hatası" });
      return;
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "API'den geçersiz yanıt alındı." });
      return;
    }

    const result = JSON.parse(content) as {
      scores: { taban_puan: number; tecvid_ve_mahrec: number; yuzunden_dogru_okuma: number; makam: number; ses: number };
      total: number;
      feedback: Record<string, string>;
      genel_yorum: string;
      transcribed_text: string;
    };

    result.total =
      (result.scores.taban_puan || 0) +
      (result.scores.tecvid_ve_mahrec || 0) +
      (result.scores.yuzunden_dogru_okuma || 0) +
      (result.scores.makam || 0) +
      (result.scores.ses || 0);

    result.transcribed_text = transcribedText;
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Analysis error");
    res.status(500).json({ error: "Analiz sırasında hata oluştu." });
  }
});

export { logger };
export default router;
