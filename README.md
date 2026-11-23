<div align="center">

# İlimsaray

**Yapay zekâ destekli Kur'an tilaveti analizi ve eğitici İslami oyunlar.**

[ilimsaray.com](https://www.ilimsaray.com) · [Tilawet Analizör](#tilawet-analizör) · [İslami Oyunlar](#i̇slami-oyunlar) · [Kurulum](#kurulum)

</div>

---

İlimsaray, Kur'an öğrenenler ve İslami ilimlere ilgi duyan öğrenciler için hazırlanmış açık kaynaklı bir web platformudur. İki uygulamadan oluşur:

- **Tilawet Analizör:** Tilavetini tarayıcıda kaydet, yapay zekâ okuyuşunu dinlesin ve 100 puan üzerinden ayrıntılı geri bildirim versin.
- **İslami Oyunlar:** Ayet, tecvid, Arap alfabesi ve peygamber kıssalarını oyunla öğreten 5 eğitici oyun.

Arayüzün tamamı Türkçedir ve mobil cihazlarda da çalışır.

> **English:** İlimsaray is an open-source Islamic education platform. It includes an AI-powered Quran recitation (tilawah) analyzer that transcribes Arabic audio with Whisper and scores it with GPT-4o, plus five educational games covering Quran verses, tajweed rules, the Arabic alphabet and stories of the prophets. Built with React, TypeScript and Vite. Turkish UI.

## Tilawet Analizör

Yapay zekâ ile gerçek zamanlı Kur'an tilaveti analizi.

- Tarayıcıda ses kaydı (MediaRecorder API, en fazla 3 dakika)
- Kayıt sırasında canlı dalga formu görselleştirmesi
- Arapça sesi **OpenAI Whisper** ile metne çevirme
- **GPT-4o** ile 5 kriter üzerinden, toplam 100 puanlık tilavet değerlendirmesi
- Her kriter için açılıp kapanan ayrıntılı puan kartları ve genel yorum
- Geçmiş analizlerin cihazda saklanması

Kullanıcının girdiği OpenAI API anahtarı yalnızca tarayıcı oturumunda (`sessionStorage`) tutulur.

## İslami Oyunlar

`/oyunlar/` adresinde çalışan 5 eğitici oyun. İlerleme tarayıcıda (`localStorage`) saklanır, sunucu gerekmez.

| Oyun | Tür | İçerik |
| --- | --- | --- |
| **Kuran Kaşifi** | Macera ve keşif | Ayetleri öğren, soruları yanıtla. 5 seviye ve rozetler. |
| **Tecvid Ustası** | Quiz | Med, şedde, idğam ve diğer tecvid kuralları. 3 zorluk seviyesi ve her soru için açıklama. |
| **Harflerin Yolculuğu** | Bulmaca | 28 Arap harfini kart, sıralama ve eşleştirme modlarıyla öğren. |
| **Tilavet Yarışması** | Yarışma | Ayet kelimelerini 30 saniyede doğru sıraya diz, sıralama tablosuna gir. |
| **İslami Bilgi Yolculuğu** | Hikâye | Peygamber kıssalarında 5 bölümlük, seçimli ve Kur'an referanslı bir yolculuk. |

## Teknolojiler

- **Ön yüz:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Sunucu:** Express 5 (`/api`), OpenAI Whisper ve GPT-4o proxy uçları (`/api/transcribe`, `/api/analyze`)
- **Veritabanı:** PostgreSQL ve Drizzle ORM
- **Doğrulama ve API:** Zod, OpenAPI'den Orval ile üretilen istemci
- **Monorepo:** pnpm workspaces, Node.js 24

## Proje yapısı

```text
artifacts/
  tilawet-analyzer/   Tilawet Analizör (kök yol: /)
  oyunlar/            İslami Oyunlar (/oyunlar/)
  api-server/         Express API sunucusu (/api)
lib/                  Paylaşılan paketler (API şeması, veritabanı)
```

## Kurulum

Gereksinimler: Node.js 24 ve pnpm.

```bash
git clone https://github.com/ayazelrico/ilimsaray.git
cd ilimsaray
pnpm install
```

API sunucusu için `OPENAI_API_KEY` ortam değişkenini tanımla, ardından:

```bash
pnpm --filter @workspace/api-server run dev   # API sunucusu
pnpm run typecheck                            # Tüm paketlerde tip kontrolü
pnpm run build                                # Tip kontrolü ve derleme
```

## Anahtar kelimeler

Kur'an, tilavet, tecvid, Kuran öğren, Arap alfabesi, elif ba, İslami oyunlar, çocuklar için dini eğitim, yapay zekâ tilavet analizi, Quran recitation, tajweed, Islamic games, Islamic education, edtech.

---

<div align="center">

[ilimsaray.com](https://www.ilimsaray.com) · Geliştiren: [Ayazelrico](https://www.ayazelrico.com)

</div>
