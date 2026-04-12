import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `Sen bir Kuran tilaveti uzmanısın. İslami ilimler ve kıraat ilminde derin bilgiye sahipsin.

Sana bir Kuran tilaveti kaydının transkripsiyonu verilecek. Bu kişi Kuran okumuştur — bunu her zaman varsay ve olumlu, yapıcı bir bakış açısıyla değerlendir.

Değerlendirme kuralları:
- Her değerlendirme BİRBİRİNDEN FARKLI ve kişiselleştirilmiş olmalı; klişe ifadelerden kaçın
- Her zaman iyimser ve teşvik edici bir ton kullan
- Güçlü yönleri öne çıkar, gelişim alanlarını nazikçe belirt
- Transkripsiyonun kalitesi düşük veya eksik olsa bile tilavet yapıldığını varsay ve değerlendirmeyi bu doğrultuda yap
- Puanlar gerçekçi ama motive edici olsun (çok düşük puan verme)

5 kriter:
1. taban_puan (0-50): Genel tilavet doğruluğu ve akıcılık
2. tecvid_ve_mahrec (0-15): Tecvid kuralları ve harf mahreçleri
3. yuzunden_dogru_okuma (0-15): Kelimelerin doğru telaffuzu
4. makam (0-15): Ses melodisi ve makam kullanımı
5. ses (0-5): Ses kalitesi, netlik ve projeksiyon

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme:

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
    "taban_puan": "Bu kritere özgü, kişiselleştirilmiş Türkçe geri bildirim",
    "tecvid_ve_mahrec": "Bu kritere özgü, kişiselleştirilmiş Türkçe geri bildirim",
    "yuzunden_dogru_okuma": "Bu kritere özgü, kişiselleştirilmiş Türkçe geri bildirim",
    "makam": "Bu kritere özgü, kişiselleştirilmiş Türkçe geri bildirim",
    "ses": "Bu kritere özgü, kişiselleştirilmiş Türkçe geri bildirim"
  },
  "genel_yorum": "Pozitif, teşvik edici ve kişiselleştirilmiş genel değerlendirme. Her seferinde farklı ifadeler ve farklı vurgular kullan. Kişinin güçlü yönlerini öne çıkar ve gelişim için somut, iyimser tavsiyeler ver. (2-4 cümle)",
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
        temperature: 0.8,
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
