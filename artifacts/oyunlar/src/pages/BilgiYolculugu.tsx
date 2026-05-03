import { useState } from "react";
import { useLocation } from "wouter";

type Choice = { text: string; isCorrect: boolean; consequence: string };
type Node = { title: string; story: string; icon: string; choices: Choice[] };
type Chapter = { chapter: number; title: string; intro: string; icon: string; nodes: Node[] };

const chapters: Chapter[] = [
  {
    chapter: 1,
    title: "Hz. İbrahim'in İmanı",
    intro: "Hz. İbrahim, Allah'ın birliğini arayan bir peygamberdir. Onun izinde yürü...",
    icon: "🌙",
    nodes: [
      {
        title: "Yıldız, Ay ve Güneş",
        story:
          "Hz. İbrahim gökyüzüne bakıyor. Parlak bir yıldız görüyor. İnsanlar yıldıza tapıyorlar. Hz. İbrahim ne yapmalı?",
        icon: "⭐",
        choices: [
          {
            text: "Yıldıza 'Bu benim Rabbim' de, sonra kaybolduğunda Allah'ı bul",
            isCorrect: true,
            consequence: "Hz. İbrahim, yıldızın, ayın ve güneşin kaybolduğunu görünce 'Ben kaybolanlara tapınmam' dedi. (Enam 76-78) +100 puan",
          },
          {
            text: "Yıldıza tapınmaya devam et",
            isCorrect: false,
            consequence: "Hz. İbrahim hiçbir zaman yıldıza gerçek anlamda tapmadı; kalbi Allah'ı arıyordu.",
          },
        ],
      },
      {
        title: "Putları Kırmak",
        story:
          "Hz. İbrahim, kavminin putseverlere tapınmasına üzülüyor. Onları düşündürecek bir ders vermek istiyor. Ne yapmalı?",
        icon: "🗿",
        choices: [
          {
            text: "Büyük put hariç küçük putları kır ve baltayı büyüğün omzuna bırak",
            isCorrect: true,
            consequence: "Hz. İbrahim onlara 'Büyük putunuza sorun, konuşabiliyorsa...' dedi. Böylece putların aciz olduğunu gösterdi. +100 puan",
          },
          {
            text: "Kavmine kızarak şehri terk et",
            isCorrect: false,
            consequence: "Hz. İbrahim önce kavmine öğüt vermeyi tercih etti.",
          },
        ],
      },
    ],
  },
  {
    chapter: 2,
    title: "Hz. Yusuf'un Sabrı",
    intro: "Hz. Yusuf, güzel ahlakı ve sabrıyla bilinen bir peygamberdir...",
    icon: "🌾",
    nodes: [
      {
        title: "Kardeşlerin Kıskançlığı",
        story:
          "Kardeşlerin Hz. Yusuf'u kuyuya attı ve babalarına öldüğünü söyledi. Hz. Yusuf kuyuda ne düşünmeli?",
        icon: "🪣",
        choices: [
          {
            text: "Allah'a güven ve sabret",
            isCorrect: true,
            consequence: "Hz. Yusuf sabır ve tevekkülüyle kuyudan kurtuldu, sonunda Mısır'a yönetici oldu. +100 puan",
          },
          {
            text: "Ümitsizliğe düş",
            isCorrect: false,
            consequence: "Hz. Yusuf hiçbir zaman ümitsizliğe düşmedi; sabır ve imanı onu kurtardı.",
          },
        ],
      },
      {
        title: "Mısır'da İmtihan",
        story:
          "Hz. Yusuf Mısır'da iken bir imtihanla karşılaştı. Aziz'in hanımı onu kötü bir şeye davet etti. Hz. Yusuf ne yapmalı?",
        icon: "🏛️",
        choices: [
          {
            text: "Allah'a sığın ve reddet",
            isCorrect: true,
            consequence: "Hz. Yusuf 'Haşa! O benim efendimdir. O bana iyi davrandı...' diyerek reddetti. (Yusuf 23) +100 puan",
          },
          {
            text: "Zor durumda olduğu için kabul et",
            isCorrect: false,
            consequence: "Hz. Yusuf harama yaklaşmayı kesinlikle reddetti ve hapsedilmeyi tercih etti.",
          },
        ],
      },
    ],
  },
  {
    chapter: 3,
    title: "Namaz ve İbadet",
    intro: "İslam'ın şartları, ibadetler ve kulluğun önemi...",
    icon: "🕌",
    nodes: [
      {
        title: "Namazın Önemi",
        story:
          "İslam'ın beş şartından ikincisi namazdır. Bir Müslüman günde kaç vakit namaz kılmalıdır?",
        icon: "🙏",
        choices: [
          {
            text: "Beş vakit: Sabah, Öğle, İkindi, Akşam, Yatsı",
            isCorrect: true,
            consequence: "Doğru! Günde beş vakit namaz kılmak her Müslümana farzdır. +100 puan",
          },
          {
            text: "Üç vakit yeterlidir",
            isCorrect: false,
            consequence: "Namaz İslam'ın direğidir ve beş vakit kılınması farzdır.",
          },
        ],
      },
      {
        title: "Zekat",
        story:
          "Zekat İslam'ın üçüncü şartıdır. Malın ne kadarı zekat olarak verilir?",
        icon: "💰",
        choices: [
          {
            text: "Malın kırkta biri (% 2.5)",
            isCorrect: true,
            consequence: "Doğru! Nisabı dolduran malın %2,5'i zekat olarak verilir. +100 puan",
          },
          {
            text: "Malın onda biri (%10)",
            isCorrect: false,
            consequence: "Zekat oranı %2,5'tir; %10, öşür/haraç için geçerli olabilir.",
          },
        ],
      },
    ],
  },
  {
    chapter: 4,
    title: "Hz. Musa ve Firavun",
    intro: "Hz. Musa, Allah'ın mesajını Firavun'a iletmekle görevlendirilen peygamberdir...",
    icon: "🌊",
    nodes: [
      {
        title: "Firavun'a Gitmek",
        story:
          "Allah, Hz. Musa ve Hz. Harun'u Firavun'a gönderdi. Nasıl konuşmaları gerekir?",
        icon: "👑",
        choices: [
          {
            text: "Yumuşak ve nazik bir dille konuş, belki öğüt alır",
            isCorrect: true,
            consequence: "'Ona yumuşak söz söyleyin, belki öğüt alır ya da korkar.' (Taha 44) +100 puan",
          },
          {
            text: "Sert ve tehditkâr bir dil kullan",
            isCorrect: false,
            consequence: "Allah, Hz. Musa ve Harun'a nazik bir dil kullanmalarını emretti.",
          },
        ],
      },
      {
        title: "Denizin Yarılması",
        story:
          "İsrailoğulları Kızıldeniz'de Firavun'un ordusuna sıkıştı. Hz. Musa ne yapmalı?",
        icon: "🌊",
        choices: [
          {
            text: "Allah'a güven ve asayı denize vur",
            isCorrect: true,
            consequence: "Hz. Musa asasını vurdu ve deniz ikiye ayrıldı. Allah'a tevekkül onu kurtardı. +100 puan",
          },
          {
            text: "Firavun ile barış anlaşması yap",
            isCorrect: false,
            consequence: "Hz. Musa Allah'a tevekkül etti ve mucizevi bir kurtarışla deniz yarıldı.",
          },
        ],
      },
    ],
  },
  {
    chapter: 5,
    title: "Hz. Muhammed (s.a.v.) ve İslam",
    intro: "Son peygamber Hz. Muhammed (s.a.v.) hakkında bilgilerini test et...",
    icon: "✨",
    nodes: [
      {
        title: "İlk Vahiy",
        story:
          "Hz. Muhammed (s.a.v.) Hira Mağarası'ndaydı. Cebrail (a.s.) geldi ve ilk vahyi bildirdi. İlk inen ayet hangisidir?",
        icon: "📜",
        choices: [
          {
            text: "'Oku! Yaratan Rabbinin adıyla...' (Alak 1)",
            isCorrect: true,
            consequence: "Doğru! İlk inen ayet Alak suresidir: 'İkra bismi rabbikellezi halak...' +100 puan",
          },
          {
            text: "'Besmele ile başla...'",
            isCorrect: false,
            consequence: "İlk inen ayet Alak suresinin ilk beş ayetidir.",
          },
        ],
      },
      {
        title: "İslam'ın Yayılması",
        story:
          "Mekke'de İslam yayılmaya başladı. İlk Müslümanlar zulme uğruyordu. Hz. Peygamber ne yaptı?",
        icon: "🕊️",
        choices: [
          {
            text: "Sahabilerini Habeşistan'a hicrete izin verdi",
            isCorrect: true,
            consequence: "Hz. Peygamber, Habeşistan'a ilk hicreti izin verdi. Orada adil Necaşi Müslümanlara kucak açtı. +100 puan",
          },
          {
            text: "Mekkelilerle savaş açtı",
            isCorrect: false,
            consequence: "Mekke döneminde savaş yoktu; sabır ve hicret emredildi.",
          },
        ],
      },
    ],
  },
];

export default function BilgiYolculugu() {
  const [, navigate] = useLocation();
  const [chapterIdx, setChapterIdx] = useState(0);
  const [nodeIdx, setNodeIdx] = useState(0);
  const [phase, setPhase] = useState<"select" | "story" | "consequence" | "chapterEnd" | "complete">("select");
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [lastConsequence, setLastConsequence] = useState("");
  const [lastCorrect, setLastCorrect] = useState(false);

  const chapter = chapters[chapterIdx];
  const node = chapter.nodes[nodeIdx];
  const isLastNode = nodeIdx === chapter.nodes.length - 1;
  const isLastChapter = chapterIdx === chapters.length - 1;

  function handleChoice(choice: Choice) {
    setLastConsequence(choice.consequence);
    setLastCorrect(choice.isCorrect);
    if (choice.isCorrect) {
      setScore((s) => s + 100);
      setTotalCorrect((t) => t + 1);
    }
    setPhase("consequence");
  }

  function continueStory() {
    if (isLastNode) {
      setPhase("chapterEnd");
    } else {
      setNodeIdx((n) => n + 1);
      setPhase("story");
    }
  }

  function nextChapter() {
    if (isLastChapter) {
      setPhase("complete");
    } else {
      setChapterIdx((c) => c + 1);
      setNodeIdx(0);
      setPhase("story");
    }
  }

  function selectChapter(idx: number) {
    setChapterIdx(idx);
    setNodeIdx(0);
    setPhase("story");
  }

  const totalNodes = chapters.reduce((sum, c) => sum + c.nodes.length, 0);
  const progressPercent = Math.round((totalCorrect / totalNodes) * 100);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-[#CCFF00] transition-colors"
          >
            ← Geri
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-sm">✨</div>
            <span className="font-bold text-sm">Bilgi Yolculuğu</span>
          </div>
          {score > 0 && (
            <span className="text-sm font-bold text-[#CCFF00]">{score} puan</span>
          )}
        </div>

        {phase === "select" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3 animate-float">✨</div>
              <h1 className="text-3xl font-bold text-foreground mb-2">İslami Bilgi Yolculuğu</h1>
              <p className="text-muted-foreground">Peygamber kıssaları ve İslami bilgilerle dolu bir yolculuk!</p>
            </div>
            <div className="space-y-3">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => selectChapter(idx)}
                  className="w-full text-left p-5 rounded-2xl border border-border/60 bg-card hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{ch.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-0.5">Bölüm {ch.chapter}</div>
                      <div className="font-bold text-foreground">{ch.title}</div>
                      <div className="text-sm text-muted-foreground">{ch.nodes.length} bölüm</div>
                    </div>
                    <span className="text-[#CCFF00] text-lg">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "story" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">{chapter.icon}</span>
              <div>
                <div className="text-xs text-muted-foreground">Bölüm {chapter.chapter}</div>
                <div className="font-bold text-foreground">{chapter.title}</div>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">
                {nodeIdx + 1}/{chapter.nodes.length}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="text-3xl mb-3 text-center">{node.icon}</div>
              <h3 className="text-lg font-bold text-foreground mb-3">{node.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{node.story}</p>
            </div>

            <div className="text-sm text-muted-foreground mb-3 font-medium">Senin seçimin:</div>
            <div className="space-y-3">
              {node.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left p-4 rounded-xl border border-border/60 bg-card hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5 transition-all font-medium"
                >
                  <span className="inline-flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {choice.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "consequence" && (
          <div className="animate-pop-in text-center">
            <div className="text-5xl mb-4">{lastCorrect ? "✅" : "📖"}</div>
            <h3 className={`text-xl font-bold mb-4 ${lastCorrect ? "text-[#CCFF00]" : "text-muted-foreground"}`}>
              {lastCorrect ? "Doğru Seçim!" : "Öğrenme Fırsatı"}
            </h3>
            <div className="glass-card rounded-2xl p-5 mb-6 text-left">
              <p className="text-muted-foreground leading-relaxed">{lastConsequence}</p>
            </div>
            <button
              onClick={continueStory}
              className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold hover:bg-[#CCFF00]/90 transition-all"
            >
              {isLastNode ? "Bölümü Tamamla →" : "Devam Et →"}
            </button>
          </div>
        )}

        {phase === "chapterEnd" && (
          <div className="animate-pop-in text-center">
            <div className="text-5xl mb-3">{chapter.icon}</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{chapter.title} Tamamlandı!</h2>
            <div className="glass-card rounded-2xl p-5 mb-6">
              <div className="text-3xl font-bold text-[#CCFF00]">{score} puan</div>
            </div>
            {isLastChapter ? (
              <button
                onClick={() => setPhase("complete")}
                className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold"
              >
                Yolculuğu Tamamla 🏆
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={nextChapter}
                  className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold"
                >
                  Sonraki Bölüm: {chapters[chapterIdx + 1].title} →
                </button>
                <button
                  onClick={() => setPhase("select")}
                  className="w-full py-3 rounded-xl border border-border/60 text-muted-foreground"
                >
                  Bölüm Seç
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "complete" && (
          <div className="animate-pop-in text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-[#CCFF00] mb-2">Yolculuk Tamamlandı!</h2>
            <p className="text-muted-foreground mb-6">Tüm 5 bölümü bitirdin!</p>
            <div className="glass-card rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold text-[#CCFF00]">{score}</div>
                  <div className="text-xs text-muted-foreground mt-1">Toplam Puan</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">{progressPercent}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Başarı Oranı</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setChapterIdx(0);
                  setNodeIdx(0);
                  setScore(0);
                  setTotalCorrect(0);
                  setPhase("select");
                }}
                className="py-3 rounded-xl border border-border/60 text-foreground font-semibold"
              >
                Tekrar Oyna
              </button>
              <button
                onClick={() => navigate("/")}
                className="py-3 rounded-xl bg-[#CCFF00] text-black font-bold"
              >
                Ana Sayfa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
