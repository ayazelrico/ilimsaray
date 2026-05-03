import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const levels = [
  {
    level: 1,
    title: "Fatiha Suresi",
    ayah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    meaning: "Rahman ve Rahim olan Allah'ın adıyla",
    surah: "Fatiha, 1. Ayet",
    questions: [
      {
        q: "Bu ayet hangi surenin başlangıcıdır?",
        options: ["Bakara", "Fatiha", "İhlas", "Nas"],
        answer: 1,
      },
      {
        q: "Ayetteki 'Rahman' kelimesi ne anlama gelir?",
        options: ["Güçlü", "Bilen", "Çok merhametli", "Affedici"],
        answer: 2,
      },
      {
        q: "Besmele Kuran'da kaç kez geçer?",
        options: ["112", "113", "114", "115"],
        answer: 1,
      },
    ],
  },
  {
    level: 2,
    title: "İhlas Suresi",
    ayah: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    meaning: "De ki: O, Allah'tır, bir tektir.",
    surah: "İhlas, 1. Ayet",
    questions: [
      {
        q: "İhlas suresi kaç ayettir?",
        options: ["3", "4", "5", "6"],
        answer: 1,
      },
      {
        q: "'Ahad' kelimesi ne anlama gelir?",
        options: ["Tek, Bir", "Sonsuz", "Güçlü", "Bilen"],
        answer: 0,
      },
      {
        q: "İhlas suresi Kuran'da hangi sıradaki suredir?",
        options: ["110", "111", "112", "113"],
        answer: 2,
      },
    ],
  },
  {
    level: 3,
    title: "Ayet'el Kürsi",
    ayah: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    meaning: "Allah; O'ndan başka ilah yoktur. Diridir, her şeyi ayakta tutandır.",
    surah: "Bakara, 255. Ayet",
    questions: [
      {
        q: "Ayet'el Kürsi hangi surede yer alır?",
        options: ["Al-i İmran", "Nisa", "Bakara", "Maide"],
        answer: 2,
      },
      {
        q: "'El-Hayy' ismi ne anlama gelir?",
        options: ["Güçlü", "Diri, Hayat sahibi", "Affedici", "Bilen"],
        answer: 1,
      },
      {
        q: "Ayet'el Kürsi Bakara suresinde kaçıncı ayettir?",
        options: ["253", "254", "255", "256"],
        answer: 2,
      },
    ],
  },
  {
    level: 4,
    title: "Felak Suresi",
    ayah: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    meaning: "De ki: Sabahın Rabbine sığınırım.",
    surah: "Felak, 1. Ayet",
    questions: [
      {
        q: "Felak suresi kaç ayettir?",
        options: ["4", "5", "6", "7"],
        answer: 1,
      },
      {
        q: "'Felak' kelimesinin anlamı nedir?",
        options: ["Gece", "Sabah aydınlığı / Şafak", "Rüzgar", "Deniz"],
        answer: 1,
      },
      {
        q: "Felak suresi Kuran'da kaçıncı suredir?",
        options: ["112", "113", "114", "115"],
        answer: 1,
      },
    ],
  },
  {
    level: 5,
    title: "Nas Suresi",
    ayah: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    meaning: "De ki: İnsanların Rabbine sığınırım.",
    surah: "Nas, 1. Ayet",
    questions: [
      {
        q: "Nas suresi Kuran'ın kaçıncı suresidir?",
        options: ["112", "113", "114", "115"],
        answer: 2,
      },
      {
        q: "Bu sure kim için en iyi koruma duasıdır?",
        options: ["Sadece çocuklar için", "Herkes için", "Sadece yetişkinler için", "Sadece hastalar için"],
        answer: 1,
      },
      {
        q: "Nas suresi kaç ayettir?",
        options: ["4", "5", "6", "7"],
        answer: 2,
      },
    ],
  },
];

const BADGES = ["🌱 Başlangıç", "⭐ Yıldız", "🔥 Ateşli", "💎 Elmas", "🏆 Şampiyon"];

function GameHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#CCFF00] transition-colors"
      >
        ← Geri
      </button>
      <div className="flex items-center gap-2 ml-auto">
        <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-sm">🗺️</div>
        <span className="font-bold text-sm">Kuran Kaşifi</span>
      </div>
    </div>
  );
}

export default function KuranKasifi() {
  const [, navigate] = useLocation();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result" | "complete">("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kuran-kasifi-completed") || "[]");
    } catch {
      return [];
    }
  });

  const level = levels[currentLevel];
  const question = level.questions[questionIndex];
  const totalQuestions = level.questions.length;
  const isLast = questionIndex === totalQuestions - 1;

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === question.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((s) => s + 100);
      setCorrectCount((c) => c + 1);
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (isLast) {
        const updated = [...new Set([...completedLevels, currentLevel])];
        setCompletedLevels(updated);
        localStorage.setItem("kuran-kasifi-completed", JSON.stringify(updated));
        setPhase("result");
      } else {
        setQuestionIndex((q) => q + 1);
      }
    }, 1100);
  }

  function nextLevel() {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel((l) => l + 1);
      setPhase("intro");
      setQuestionIndex(0);
      setCorrectCount(0);
    } else {
      setPhase("complete");
    }
  }

  function resetGame() {
    setCurrentLevel(0);
    setPhase("intro");
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <GameHeader onBack={() => navigate("/")} />

        {phase === "intro" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              {levels.map((l, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    i < currentLevel
                      ? "bg-[#CCFF00]"
                      : i === currentLevel
                      ? "bg-[#CCFF00]/50"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block animate-float">🗺️</span>
              <div className="text-xs text-[#CCFF00] font-semibold uppercase tracking-widest mb-2">
                Seviye {level.level}
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{level.title}</h2>
              <div className="text-sm text-muted-foreground">{level.surah}</div>
            </div>
            <div className="glass-card rounded-2xl p-6 mb-6 text-center">
              <p className="arabic-text text-[#CCFF00] mb-4">{level.ayah}</p>
              <p className="text-muted-foreground text-base italic">"{level.meaning}"</p>
            </div>
            <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
              <span>Toplam Puan: <span className="text-[#CCFF00] font-bold">{score}</span></span>
              <span>{totalQuestions} soru</span>
            </div>
            <button
              onClick={() => setPhase("quiz")}
              className="w-full py-4 rounded-xl bg-[#CCFF00] text-black font-bold text-lg hover:bg-[#CCFF00]/90 transition-all animate-glow-pulse"
            >
              Soruları Yanıtla →
            </button>
          </div>
        )}

        {phase === "quiz" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Soru {questionIndex + 1} / {totalQuestions}
              </span>
              <span className="text-sm font-bold text-[#CCFF00]">{score} puan</span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 mb-8">
              <div
                className="bg-[#CCFF00] h-1.5 rounded-full progress-bar-fill"
                style={{ width: `${((questionIndex) / totalQuestions) * 100}%` }}
              />
            </div>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <p className="text-lg font-semibold text-foreground">{question.q}</p>
            </div>
            <div className="space-y-3">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-xl border border-border/60 bg-card transition-all duration-300 font-medium ${
                    selected === idx && feedback === "correct" ? "correct-answer" :
                    selected === idx && feedback === "wrong" ? "wrong-answer" :
                    selected !== null && idx === question.answer ? "correct-answer" :
                    "hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5"
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="animate-pop-in text-center">
            <div className="text-6xl mb-4">{BADGES[currentLevel]}</div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Tebrikler!</h2>
            <p className="text-muted-foreground mb-6">
              {level.title} tamamlandı — {correctCount}/{totalQuestions} doğru
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] font-bold text-lg mb-8">
              +{correctCount * 100} puan
            </div>
            {currentLevel < levels.length - 1 ? (
              <button
                onClick={nextLevel}
                className="w-full py-4 rounded-xl bg-[#CCFF00] text-black font-bold text-lg hover:bg-[#CCFF00]/90 transition-all"
              >
                Sonraki Seviye: {levels[currentLevel + 1].title} →
              </button>
            ) : (
              <div>
                <div className="text-5xl mb-4">🏆</div>
                <p className="text-[#CCFF00] font-bold text-xl mb-6">Tüm seviyeleri tamamladın!</p>
                <button onClick={resetGame} className="w-full py-4 rounded-xl bg-[#CCFF00] text-black font-bold">
                  Tekrar Oyna
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "complete" && (
          <div className="animate-pop-in text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-[#CCFF00] mb-2">Şampiyon!</h2>
            <p className="text-muted-foreground mb-4">Tüm 5 seviyeyi tamamladın</p>
            <div className="text-4xl font-bold text-[#CCFF00] mb-8">{score} puan</div>
            <button onClick={resetGame} className="w-full py-4 rounded-xl bg-[#CCFF00] text-black font-bold text-lg">
              Tekrar Oyna
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
