import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { saveProgress } from "@/lib/progress";

const rounds = [
  { ayah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", meaning: "Rahman ve Rahim olan Allah'ın adıyla", words: ["بِسْمِ", "اللَّهِ", "الرَّحْمَٰنِ", "الرَّحِيمِ"], hint: "Besmele — Fatiha 1" },
  { ayah: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", meaning: "Hamd, âlemlerin Rabbi Allah'a mahsustur.", words: ["الْحَمْدُ", "لِلَّهِ", "رَبِّ", "الْعَالَمِينَ"], hint: "Fatiha 2" },
  { ayah: "قُلْ هُوَ اللَّهُ أَحَدٌ", meaning: "De ki: O, Allah'tır, bir tektir.", words: ["قُلْ", "هُوَ", "اللَّهُ", "أَحَدٌ"], hint: "İhlas 1" },
  { ayah: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ", meaning: "Ben cinleri ve insanları yalnızca bana ibadet etsinler diye yarattım.", words: ["وَمَا", "خَلَقْتُ", "الْجِنَّ", "وَالْإِنسَ", "إِلَّا", "لِيَعْبُدُونِ"], hint: "Zariyat 56" },
  { ayah: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", meaning: "Şüphesiz zorlukla birlikte kolaylık vardır.", words: ["إِنَّ", "مَعَ", "الْعُسْرِ", "يُسْرًا"], hint: "İnşirah 6" },
];

type LeaderboardEntry = { name: string; score: number; date: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TilavetYarismasi() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"start" | "game" | "result" | "leaderboard">("start");
  const [roundIndex, setRoundIndex] = useState(0);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem("tilavet-leaderboard") || "[]"); } catch { return []; }
  });
  const [showCorrect, setShowCorrect] = useState(false);

  const currentRound = rounds[roundIndex];
  const isComplete = placed.length === currentRound.words.length;

  const checkAnswer = useCallback(() => placed.every((w, i) => w === currentRound.words[i]), [placed, currentRound.words]);

  useEffect(() => {
    if (phase !== "game" || showCorrect) return;
    if (timeLeft <= 0) { handleRoundEnd(false); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, showCorrect]);

  useEffect(() => {
    if (isComplete && phase === "game" && !showCorrect) {
      const correct = checkAnswer();
      if (correct) {
        const timeBonus = Math.max(0, timeLeft * 10);
        setScore((s) => s + 200 + timeBonus);
        setShowCorrect(true);
        setTimeout(() => { setShowCorrect(false); handleRoundEnd(true); }, 1200);
      }
    }
  }, [isComplete, phase, placed]);

  function startGame() {
    setRoundIndex(0);
    setScore(0);
    setRoundResults([]);
    initRound(0);
    setPhase("game");
  }

  function initRound(idx: number) {
    setShuffled(shuffle(rounds[idx].words));
    setPlaced([]);
    setTimeLeft(30);
    setShowCorrect(false);
  }

  function handleWordClick(word: string, from: "shuffled" | "placed") {
    if (showCorrect) return;
    if (from === "shuffled") {
      setShuffled((s) => { const idx = s.indexOf(word); if (idx === -1) return s; return [...s.slice(0, idx), ...s.slice(idx + 1)]; });
      setPlaced((p) => [...p, word]);
    } else {
      setPlaced((p) => { const idx = p.indexOf(word); if (idx === -1) return p; return [...p.slice(0, idx), ...p.slice(idx + 1)]; });
      setShuffled((s) => [...s, word]);
    }
  }

  function handleRoundEnd(correct: boolean) {
    const results = [...roundResults, correct];
    setRoundResults(results);
    if (roundIndex < rounds.length - 1) {
      const next = roundIndex + 1;
      setRoundIndex(next);
      initRound(next);
    } else {
      setPhase("result");
    }
  }

  function saveScore() {
    const name = playerName.trim() || "Anonim";
    const entry: LeaderboardEntry = { name, score, date: new Date().toLocaleDateString("tr-TR") };
    const updated = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem("tilavet-leaderboard", JSON.stringify(updated));
    saveProgress("tilavet-yarismasi", score, "⏱️ Tilavet Şampiyonu");
    setPhase("leaderboard");
  }

  const timerColor = timeLeft > 15 ? "text-[#CCFF00]" : timeLeft > 5 ? "text-orange-400" : "text-red-500";
  const correctCount = roundResults.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-[#CCFF00] transition-colors">← Geri</button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-sm">⏱️</div>
            <span className="font-bold text-sm">Tilavet Yarışması</span>
          </div>
        </div>

        {phase === "start" && (
          <div className="animate-fade-in text-center">
            <div className="text-5xl mb-4 animate-float">⏱️</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tilavet Yarışması</h1>
            <p className="text-muted-foreground mb-8">Ayet kelimelerini doğru sıraya diz! Her turda 30 saniyeni var.</p>
            <div className="glass-card rounded-2xl p-5 mb-8 text-left space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><span className="text-[#CCFF00]">•</span> Doğru sıra: 200 puan + zaman bonusu</div>
              <div className="flex items-center gap-2"><span className="text-[#CCFF00]">•</span> {rounds.length} farklı ayet</div>
              <div className="flex items-center gap-2"><span className="text-[#CCFF00]">•</span> En yüksek skor sıralama tablosuna kaydedilir</div>
            </div>
            <button onClick={startGame} className="w-full py-4 rounded-xl bg-[#CCFF00] text-black font-bold text-lg hover:bg-[#CCFF00]/90 transition-all animate-glow-pulse">
              Yarışmaya Başla →
            </button>
            <button onClick={() => setPhase("leaderboard")} className="w-full mt-3 py-3 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground transition-all">
              🏆 Sıralama Tablosu
            </button>
          </div>
        )}

        {phase === "game" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Tur {roundIndex + 1} / {rounds.length}</div>
              <div className={`text-2xl font-bold tabular-nums ${timerColor}`}>{timeLeft}s</div>
              <div className="text-sm font-bold text-[#CCFF00]">{score} puan</div>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 mb-6">
              <div className="bg-[#CCFF00] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / 30) * 100}%` }} />
            </div>
            <div className="glass-card rounded-2xl p-4 mb-4">
              <div className="text-xs text-muted-foreground mb-1">{currentRound.hint}</div>
              <div className="text-sm text-muted-foreground italic">"{currentRound.meaning}"</div>
            </div>
            <div className={`min-h-[80px] rounded-2xl border-2 border-dashed p-4 mb-4 flex flex-wrap gap-2 justify-center items-center transition-colors ${
              showCorrect ? "border-green-500 bg-green-500/10" : "border-border/40 bg-card/50"
            }`}>
              {placed.length === 0 ? (
                <span className="text-muted-foreground text-sm">Kelimelere tıkla...</span>
              ) : (
                placed.map((word, idx) => (
                  <button key={`placed-${idx}`} onClick={() => handleWordClick(word, "placed")}
                    className={`px-3 py-2 rounded-xl text-base font-bold transition-all ${
                      showCorrect ? "bg-green-500/20 border border-green-500/60 text-green-400" :
                      "bg-[#CCFF00]/10 border border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00]/20"
                    }`}
                    style={{ fontFamily: "serif", direction: "rtl" }}>{word}</button>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {shuffled.map((word, idx) => (
                <button key={`shuffled-${idx}`} onClick={() => handleWordClick(word, "shuffled")}
                  className="px-3 py-2 rounded-xl border border-border/60 bg-card text-base font-bold hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5 transition-all"
                  style={{ fontFamily: "serif", direction: "rtl" }}>{word}</button>
              ))}
            </div>
            <button onClick={() => handleRoundEnd(false)} className="w-full py-2.5 rounded-xl border border-border/60 text-muted-foreground text-sm hover:text-foreground transition-all">
              Bu Turu Geç →
            </button>
          </div>
        )}

        {phase === "result" && (
          <div className="animate-pop-in text-center">
            <div className="text-5xl mb-4">{correctCount >= 4 ? "🏆" : correctCount >= 2 ? "⭐" : "📖"}</div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Yarışma Bitti!</h2>
            <p className="text-muted-foreground mb-6">{correctCount}/{rounds.length} tur başarılı</p>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="text-4xl font-bold text-[#CCFF00] mb-1">{score}</div>
              <div className="text-muted-foreground text-sm">Toplam Puan</div>
            </div>
            <div className="mb-4">
              <input type="text" placeholder="Adın (sıralama için)" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground focus:border-[#CCFF00]/50 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={saveScore} className="py-3 rounded-xl bg-[#CCFF00] text-black font-bold">Skoru Kaydet 🏆</button>
              <button onClick={startGame} className="py-3 rounded-xl border border-border/60 text-foreground font-semibold">Tekrar Oyna</button>
            </div>
          </div>
        )}

        {phase === "leaderboard" && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold text-foreground">Sıralama Tablosu</h2>
            </div>
            {leaderboard.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">Henüz skor yok. İlk sen ol!</div>
            ) : (
              <div className="space-y-2 mb-6">
                {leaderboard.map((entry, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border ${idx === 0 ? "border-[#CCFF00]/40 bg-[#CCFF00]/5" : "border-border/60 bg-card"}`}>
                    <span className={`text-xl font-bold w-8 ${idx === 0 ? "text-[#CCFF00]" : "text-muted-foreground"}`}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}</span>
                    <span className="font-semibold text-foreground flex-1">{entry.name}</span>
                    <span className="text-[#CCFF00] font-bold">{entry.score}</span>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={startGame} className="py-3 rounded-xl bg-[#CCFF00] text-black font-bold">Yarış →</button>
              <button onClick={() => navigate("/")} className="py-3 rounded-xl border border-border/60 text-foreground">Ana Sayfa</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
