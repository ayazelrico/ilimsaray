import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const arabicAlphabet = [
  { letter: "ا", name: "Elif", order: 1 },
  { letter: "ب", name: "Be", order: 2 },
  { letter: "ت", name: "Te", order: 3 },
  { letter: "ث", name: "Se", order: 4 },
  { letter: "ج", name: "Cim", order: 5 },
  { letter: "ح", name: "Ha", order: 6 },
  { letter: "خ", name: "Hı", order: 7 },
  { letter: "د", name: "Dal", order: 8 },
  { letter: "ذ", name: "Zel", order: 9 },
  { letter: "ر", name: "Ra", order: 10 },
  { letter: "ز", name: "Ze", order: 11 },
  { letter: "س", name: "Sin", order: 12 },
  { letter: "ش", name: "Şin", order: 13 },
  { letter: "ص", name: "Sad", order: 14 },
  { letter: "ض", name: "Dad", order: 15 },
  { letter: "ط", name: "Tı", order: 16 },
  { letter: "ظ", name: "Zı", order: 17 },
  { letter: "ع", name: "Ayn", order: 18 },
  { letter: "غ", name: "Gayn", order: 19 },
  { letter: "ف", name: "Fe", order: 20 },
  { letter: "ق", name: "Kaf", order: 21 },
  { letter: "ك", name: "Kef", order: 22 },
  { letter: "ل", name: "Lam", order: 23 },
  { letter: "م", name: "Mim", order: 24 },
  { letter: "ن", name: "Nun", order: 25 },
  { letter: "ه", name: "He", order: 26 },
  { letter: "و", name: "Vav", order: 27 },
  { letter: "ي", name: "Ye", order: 28 },
];

type Mode = "learn" | "sort" | "match";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HarflerinYolculugu() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("learn");
  const [learnIndex, setLearnIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [sortLetters, setSortLetters] = useState(() => shuffle(arabicAlphabet.slice(0, 14)));
  const [sortPlaced, setSortPlaced] = useState<Array<{ letter: string; name: string; order: number } | null>>(
    new Array(14).fill(null)
  );
  const [selectedSort, setSelectedSort] = useState<number | null>(null);
  const [sortComplete, setSortComplete] = useState(false);
  const [sortScore, setSortScore] = useState(0);

  const [matchPairs] = useState(() => {
    const subset = shuffle(arabicAlphabet).slice(0, 8);
    return subset;
  });
  const [matchLetterOptions] = useState(() => shuffle([...matchPairs]));
  const [matchNameOptions] = useState(() => shuffle([...matchPairs]));
  const [matchSelections, setMatchSelections] = useState<{ left: number | null; right: number | null }>({
    left: null,
    right: null,
  });
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [matchScore, setMatchScore] = useState(0);
  const [matchComplete, setMatchComplete] = useState(false);

  function handleSortClick(idx: number) {
    const letter = sortLetters[idx];
    if (!letter) return;

    if (selectedSort === null) {
      setSelectedSort(idx);
    } else {
      if (selectedSort === idx) {
        setSelectedSort(null);
        return;
      }
      const newLetters = [...sortLetters];
      const temp = newLetters[selectedSort];
      newLetters[selectedSort] = newLetters[idx];
      newLetters[idx] = temp;
      setSortLetters(newLetters);
      setSelectedSort(null);

      const sorted = newLetters.every((l, i) => !l || (i === 0 || newLetters[i - 1].order < l.order));
      if (sorted && newLetters.every((l) => l !== null)) {
        setSortScore(500);
        setSortComplete(true);
      }
    }
  }

  function checkSortOrder() {
    const ordered = [...sortLetters].sort((a, b) => a.order - b.order);
    const correct = sortLetters.every((l, i) => l.order === ordered[i].order);
    if (correct) {
      setSortScore(500);
      setSortComplete(true);
    } else {
      const correctCount = sortLetters.filter((l, i) => l.order === ordered[i].order).length;
      setSortScore(correctCount * 30);
      setSortComplete(true);
    }
  }

  function handleMatchLeft(idx: number) {
    if (matchedPairs.has(matchLetterOptions[idx].order)) return;
    setMatchSelections((prev) => ({ ...prev, left: idx }));
    checkMatch(idx, matchSelections.right, "left");
  }

  function handleMatchRight(idx: number) {
    if (matchedPairs.has(matchNameOptions[idx].order)) return;
    setMatchSelections((prev) => ({ ...prev, right: idx }));
    checkMatch(matchSelections.left, idx, "right");
  }

  function checkMatch(left: number | null, right: number | null, just: "left" | "right") {
    const l = just === "left" ? left : matchSelections.left;
    const r = just === "right" ? right : matchSelections.right;
    if (l === null || r === null) return;
    if (matchLetterOptions[l].order === matchNameOptions[r].order) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(matchLetterOptions[l].order);
      setMatchedPairs(newMatched);
      setMatchScore((s) => s + 100);
      setMatchSelections({ left: null, right: null });
      if (newMatched.size === matchPairs.length) {
        setMatchComplete(true);
      }
    } else {
      setTimeout(() => setMatchSelections({ left: null, right: null }), 700);
    }
  }

  const currentLetter = arabicAlphabet[learnIndex];

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
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-sm">🔤</div>
            <span className="font-bold text-sm">Harflerin Yolculuğu</span>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {(["learn", "sort", "match"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m
                  ? "bg-[#CCFF00] text-black"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "learn" ? "📚 Öğren" : m === "sort" ? "🔢 Sırala" : "🔗 Eşleştir"}
            </button>
          ))}
        </div>

        {mode === "learn" && (
          <div className="animate-fade-in text-center">
            <div className="mb-4 text-sm text-muted-foreground">
              {learnIndex + 1} / {arabicAlphabet.length}
            </div>
            <div className="w-full bg-border rounded-full h-1.5 mb-8">
              <div
                className="bg-[#CCFF00] h-1.5 rounded-full progress-bar-fill"
                style={{ width: `${((learnIndex + 1) / arabicAlphabet.length) * 100}%` }}
              />
            </div>

            <button
              onClick={() => setFlipped((f) => !f)}
              className="w-full glass-card rounded-3xl p-12 mb-8 cursor-pointer hover:border-[#CCFF00]/30 transition-all"
            >
              {!flipped ? (
                <div>
                  <div className="text-8xl font-bold text-[#CCFF00] mb-4" style={{ fontFamily: "serif" }}>
                    {currentLetter.letter}
                  </div>
                  <div className="text-muted-foreground text-sm">Dokunarak adını gör</div>
                </div>
              ) : (
                <div className="animate-pop-in">
                  <div className="text-6xl font-bold text-foreground mb-2">{currentLetter.name}</div>
                  <div className="text-2xl text-[#CCFF00]">{currentLetter.letter}</div>
                  <div className="text-muted-foreground text-sm mt-2">{currentLetter.order}. Harf</div>
                </div>
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setLearnIndex((i) => Math.max(0, i - 1));
                  setFlipped(false);
                }}
                disabled={learnIndex === 0}
                className="flex-1 py-3 rounded-xl border border-border/60 text-muted-foreground disabled:opacity-40 hover:text-foreground transition-all"
              >
                ← Önceki
              </button>
              <button
                onClick={() => {
                  setLearnIndex((i) => Math.min(arabicAlphabet.length - 1, i + 1));
                  setFlipped(false);
                }}
                disabled={learnIndex === arabicAlphabet.length - 1}
                className="flex-1 py-3 rounded-xl bg-[#CCFF00] text-black font-bold hover:bg-[#CCFF00]/90 transition-all disabled:opacity-40"
              >
                Sonraki →
              </button>
            </div>
          </div>
        )}

        {mode === "sort" && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">Harfleri Sırala</h2>
              <p className="text-sm text-muted-foreground">İlk 14 harfi Arap alfabesi sırasına göre doğru sıraya diz</p>
            </div>

            {sortComplete ? (
              <div className="animate-pop-in text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Tamamlandı!</h3>
                <div className="text-[#CCFF00] text-3xl font-bold mb-6">{sortScore} puan</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSortLetters(shuffle(arabicAlphabet.slice(0, 14)));
                      setSortComplete(false);
                      setSortScore(0);
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#CCFF00] text-black font-bold"
                  >
                    Tekrar Oyna
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="flex-1 py-3 rounded-xl border border-border/60 text-foreground"
                  >
                    Ana Sayfa
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {sortLetters.map((letter, idx) => (
                    <button
                      key={`${letter.order}-${idx}`}
                      onClick={() => handleSortClick(idx)}
                      className={`h-14 rounded-xl border text-2xl font-bold transition-all ${
                        selectedSort === idx
                          ? "border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00] scale-110"
                          : "border-border/60 bg-card hover:border-[#CCFF00]/40"
                      }`}
                      title={letter.name}
                      style={{ fontFamily: "serif" }}
                    >
                      {letter.letter}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  İki harfe tıklayarak yerlerini değiştir
                </p>
                <button
                  onClick={checkSortOrder}
                  className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold hover:bg-[#CCFF00]/90 transition-all"
                >
                  Sıralamayı Kontrol Et ✓
                </button>
              </>
            )}
          </div>
        )}

        {mode === "match" && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">Harf Eşleştir</h2>
              <p className="text-sm text-muted-foreground">Harfleri Türkçe adlarıyla eşleştir</p>
              <div className="text-[#CCFF00] font-bold text-sm mt-1">{matchScore} puan</div>
            </div>

            {matchComplete ? (
              <div className="animate-pop-in text-center">
                <div className="text-5xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Tüm Eşler Bulundu!</h3>
                <div className="text-[#CCFF00] text-3xl font-bold mb-6">{matchScore} puan</div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold"
                >
                  Tekrar Oyna
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {matchLetterOptions.map((item, idx) => {
                    const matched = matchedPairs.has(item.order);
                    return (
                      <button
                        key={idx}
                        onClick={() => !matched && handleMatchLeft(idx)}
                        disabled={matched}
                        className={`w-full h-12 rounded-xl border text-2xl font-bold transition-all ${
                          matched
                            ? "correct-answer opacity-60"
                            : matchSelections.left === idx
                            ? "border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00]"
                            : "border-border/60 bg-card hover:border-[#CCFF00]/40"
                        }`}
                        style={{ fontFamily: "serif" }}
                      >
                        {item.letter}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {matchNameOptions.map((item, idx) => {
                    const matched = matchedPairs.has(item.order);
                    return (
                      <button
                        key={idx}
                        onClick={() => !matched && handleMatchRight(idx)}
                        disabled={matched}
                        className={`w-full h-12 rounded-xl border text-sm font-semibold transition-all ${
                          matched
                            ? "correct-answer opacity-60"
                            : matchSelections.right === idx
                            ? "border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00]"
                            : "border-border/60 bg-card hover:border-[#CCFF00]/40"
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
