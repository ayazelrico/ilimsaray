import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { saveProgress } from "@/lib/progress";

const arabicAlphabet = [
  { letter: "ا", name: "Elif", pronunciation: "uzun 'a' sesi", order: 1, isolated: "ا" },
  { letter: "ب", name: "Be", pronunciation: "'b' sesi", order: 2, isolated: "ب" },
  { letter: "ت", name: "Te", pronunciation: "'t' sesi", order: 3, isolated: "ت" },
  { letter: "ث", name: "Se", pronunciation: "İngilizce 'th' sesi", order: 4, isolated: "ث" },
  { letter: "ج", name: "Cim", pronunciation: "'c' sesi", order: 5, isolated: "ج" },
  { letter: "ح", name: "Ha", pronunciation: "boğazdan çıkan 'h' sesi", order: 6, isolated: "ح" },
  { letter: "خ", name: "Hı", pronunciation: "hırıltılı 'h' sesi", order: 7, isolated: "خ" },
  { letter: "د", name: "Dal", pronunciation: "'d' sesi", order: 8, isolated: "د" },
  { letter: "ذ", name: "Zel", pronunciation: "İngilizce 'th' (titreşimli)", order: 9, isolated: "ذ" },
  { letter: "ر", name: "Ra", pronunciation: "titrek 'r' sesi", order: 10, isolated: "ر" },
  { letter: "ز", name: "Ze", pronunciation: "'z' sesi", order: 11, isolated: "ز" },
  { letter: "س", name: "Sin", pronunciation: "'s' sesi", order: 12, isolated: "س" },
  { letter: "ش", name: "Şin", pronunciation: "'ş' sesi", order: 13, isolated: "ش" },
  { letter: "ص", name: "Sad", pronunciation: "kalın 's' sesi", order: 14, isolated: "ص" },
  { letter: "ض", name: "Dad", pronunciation: "kalın 'd' sesi", order: 15, isolated: "ض" },
  { letter: "ط", name: "Tı", pronunciation: "kalın 't' sesi", order: 16, isolated: "ط" },
  { letter: "ظ", name: "Zı", pronunciation: "kalın 'z' sesi", order: 17, isolated: "ظ" },
  { letter: "ع", name: "Ayn", pronunciation: "boğazdan 'a' sesi", order: 18, isolated: "ع" },
  { letter: "غ", name: "Gayn", pronunciation: "gırtlaktan 'g' sesi", order: 19, isolated: "غ" },
  { letter: "ف", name: "Fe", pronunciation: "'f' sesi", order: 20, isolated: "ف" },
  { letter: "ق", name: "Kaf", pronunciation: "kalın 'k' sesi", order: 21, isolated: "ق" },
  { letter: "ك", name: "Kef", pronunciation: "ince 'k' sesi", order: 22, isolated: "ك" },
  { letter: "ل", name: "Lam", pronunciation: "'l' sesi", order: 23, isolated: "ل" },
  { letter: "م", name: "Mim", pronunciation: "'m' sesi", order: 24, isolated: "م" },
  { letter: "ن", name: "Nun", pronunciation: "'n' sesi", order: 25, isolated: "ن" },
  { letter: "ه", name: "He", pronunciation: "hafif 'h' sesi", order: 26, isolated: "ه" },
  { letter: "و", name: "Vav", pronunciation: "'v' veya 'u/o' sesi", order: 27, isolated: "و" },
  { letter: "ي", name: "Ye", pronunciation: "'y' veya 'i' sesi", order: 28, isolated: "ي" },
];

const simpleWords = [
  { arabic: ["ب", "ا", "ب"], meaning: "Bab (Kapı)", display: "باب" },
  { arabic: ["ك", "ت", "ب"], meaning: "Ketebe (Yazdı)", display: "كَتَبَ" },
  { arabic: ["م", "ا", "ء"], meaning: "Ma' (Su)", display: "مَاء" },
  { arabic: ["ن", "و", "ر"], meaning: "Nur (Işık)", display: "نُور" },
  { arabic: ["ب", "ي", "ت"], meaning: "Beyt (Ev)", display: "بَيْت" },
  { arabic: ["ر", "ب"], meaning: "Rabb (Rab)", display: "رَبّ" },
];

type Mode = "learn" | "sort" | "words";

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

  const [sortPage, setSortPage] = useState(0);
  const PAGE_SIZE = 14;
  const sortPages = [
    arabicAlphabet.slice(0, 14),
    arabicAlphabet.slice(14, 28),
  ];
  const [sortLetters0, setSortLetters0] = useState(() => shuffle(arabicAlphabet.slice(0, 14)));
  const [sortLetters1, setSortLetters1] = useState(() => shuffle(arabicAlphabet.slice(14, 28)));
  const getSortLetters = () => (sortPage === 0 ? sortLetters0 : sortLetters1);
  const setSortLetters = (v: typeof sortLetters0) =>
    sortPage === 0 ? setSortLetters0(v) : setSortLetters1(v);
  const [selectedSort, setSelectedSort] = useState<number | null>(null);
  const [sortResults, setSortResults] = useState<{ page: number; correct: number; total: number }[]>([]);
  const [sortPageDone, setSortPageDone] = useState<boolean[]>([false, false]);
  const [sortPageScore, setSortPageScore] = useState<number[]>([0, 0]);

  const [wordIndex, setWordIndex] = useState(0);
  const [wordLetters, setWordLetters] = useState(() => {
    const w = simpleWords[0];
    return shuffle(w.arabic.map((l) => ({ l, id: Math.random() })));
  });
  const [wordPlaced, setWordPlaced] = useState<Array<{ l: string; id: number }>>([]);
  const [wordResult, setWordResult] = useState<"correct" | "wrong" | null>(null);
  const [wordScore, setWordScore] = useState(0);
  const [wordDone, setWordDone] = useState(false);

  const currentLetter = arabicAlphabet[learnIndex];

  function handleSortClick(idx: number) {
    const letters = getSortLetters();
    if (!letters[idx]) return;
    if (selectedSort === null) {
      setSelectedSort(idx);
    } else {
      if (selectedSort === idx) { setSelectedSort(null); return; }
      const newLetters = [...letters];
      [newLetters[selectedSort], newLetters[idx]] = [newLetters[idx], newLetters[selectedSort]];
      setSortLetters(newLetters);
      setSelectedSort(null);
    }
  }

  function checkSortPage() {
    const letters = getSortLetters();
    const correct = letters.filter((l, i) => l.order === sortPages[sortPage][i].order).length;
    const total = letters.length;
    const score = correct * 40;
    const newScores = [...sortPageScore];
    newScores[sortPage] = score;
    setSortPageScore(newScores);
    const newDone = [...sortPageDone];
    newDone[sortPage] = true;
    setSortPageDone(newDone);
    const results = [...sortResults, { page: sortPage, correct, total }];
    setSortResults(results);
    if (newDone.every(Boolean)) {
      const total = newScores.reduce((a, b) => a + b, 0);
      saveProgress("harflerin-yolculugu", total, "🔤 Harf Ustası");
    }
  }

  function handleWordLetterClick(item: { l: string; id: number }, from: "pool" | "placed") {
    if (wordResult) return;
    if (from === "pool") {
      setWordLetters((s) => s.filter((x) => x.id !== item.id));
      setWordPlaced((p) => [...p, item]);
    } else {
      setWordPlaced((p) => p.filter((x) => x.id !== item.id));
      setWordLetters((s) => [...s, item]);
    }
  }

  function checkWord() {
    const word = simpleWords[wordIndex];
    const placed = wordPlaced.map((x) => x.l);
    const correct = placed.join("") === word.arabic.join("");
    setWordResult(correct ? "correct" : "wrong");
    if (correct) setWordScore((s) => s + 150);
    setTimeout(() => {
      setWordResult(null);
      if (wordIndex < simpleWords.length - 1) {
        const next = wordIndex + 1;
        setWordIndex(next);
        setWordLetters(shuffle(simpleWords[next].arabic.map((l) => ({ l, id: Math.random() }))));
        setWordPlaced([]);
      } else {
        const total = wordScore + (correct ? 150 : 0);
        saveProgress("harflerin-yolculugu", total, "🔤 Harf Ustası");
        setWordDone(true);
      }
    }, 1200);
  }

  const allSortDone = sortPageDone.every(Boolean);
  const totalSortScore = sortPageScore.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-[#CCFF00] transition-colors">
            ← Geri
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-sm">🔤</div>
            <span className="font-bold text-sm">Harflerin Yolculuğu</span>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {(["learn", "sort", "words"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? "bg-[#CCFF00] text-black" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "learn" ? "📚 Öğren" : m === "sort" ? "🔢 Sırala" : "🔡 Kelime"}
            </button>
          ))}
        </div>

        {mode === "learn" && (
          <div className="animate-fade-in text-center">
            <div className="text-sm text-muted-foreground mb-2">{learnIndex + 1} / {arabicAlphabet.length}</div>
            <div className="w-full bg-border rounded-full h-1.5 mb-8">
              <div className="bg-[#CCFF00] h-1.5 rounded-full progress-bar-fill" style={{ width: `${((learnIndex + 1) / arabicAlphabet.length) * 100}%` }} />
            </div>
            <button
              onClick={() => setFlipped((f) => !f)}
              className="w-full glass-card rounded-3xl p-10 mb-6 cursor-pointer hover:border-[#CCFF00]/30 transition-all"
            >
              {!flipped ? (
                <div>
                  <div className="text-8xl font-bold text-[#CCFF00] mb-3" style={{ fontFamily: "serif" }}>
                    {currentLetter.letter}
                  </div>
                  <div className="text-muted-foreground text-sm">Dokunarak adını ve sesini gör</div>
                </div>
              ) : (
                <div className="animate-pop-in">
                  <div className="text-5xl font-bold text-foreground mb-1">{currentLetter.name}</div>
                  <div className="text-3xl text-[#CCFF00] mb-2">{currentLetter.letter}</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-sm font-medium">
                    🔊 {currentLetter.pronunciation}
                  </div>
                  <div className="text-muted-foreground text-xs mt-2">{currentLetter.order}. Harf</div>
                </div>
              )}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => { setLearnIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
                disabled={learnIndex === 0}
                className="flex-1 py-3 rounded-xl border border-border/60 text-muted-foreground disabled:opacity-40 hover:text-foreground transition-all"
              >
                ← Önceki
              </button>
              <button
                onClick={() => { setLearnIndex((i) => Math.min(arabicAlphabet.length - 1, i + 1)); setFlipped(false); }}
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
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground mb-1">28 Harfi Sırala</h2>
              <p className="text-sm text-muted-foreground">Arap alfabesi sırasına göre doğru sıraya diz</p>
            </div>
            <div className="flex gap-2 mb-5">
              {[0, 1].map((p) => (
                <button
                  key={p}
                  onClick={() => { setSortPage(p); setSelectedSort(null); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    sortPage === p ? "bg-[#CCFF00]/10 border-[#CCFF00]/40 text-[#CCFF00]" : "border-border/60 text-muted-foreground"
                  } ${sortPageDone[p] ? "opacity-70" : ""}`}
                >
                  {sortPageDone[p] ? "✓ " : ""}Harf {p * 14 + 1}–{(p + 1) * 14}
                  {sortPageDone[p] ? ` (${sortPageScore[p]} pt)` : ""}
                </button>
              ))}
            </div>

            {allSortDone ? (
              <div className="animate-pop-in text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Tüm Harfler Sıralandı!</h3>
                <div className="text-[#CCFF00] text-3xl font-bold mb-2">{totalSortScore} puan</div>
                <p className="text-sm text-muted-foreground mb-6">Rozet kazandın: 🔤 Harf Ustası</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSortLetters0(shuffle(arabicAlphabet.slice(0, 14)));
                      setSortLetters1(shuffle(arabicAlphabet.slice(14, 28)));
                      setSortPageDone([false, false]);
                      setSortPageScore([0, 0]);
                      setSortResults([]);
                      setSortPage(0);
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#CCFF00] text-black font-bold"
                  >
                    Tekrar Oyna
                  </button>
                  <button onClick={() => navigate("/")} className="flex-1 py-3 rounded-xl border border-border/60 text-foreground">
                    Ana Sayfa
                  </button>
                </div>
              </div>
            ) : sortPageDone[sortPage] ? (
              <div className="animate-pop-in text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-foreground font-bold mb-1">Bu grup tamamlandı!</p>
                <p className="text-[#CCFF00] font-bold text-xl mb-4">{sortPageScore[sortPage]} puan</p>
                {!sortPageDone[sortPage === 0 ? 1 : 0] && (
                  <button
                    onClick={() => { setSortPage(sortPage === 0 ? 1 : 0); setSelectedSort(null); }}
                    className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold"
                  >
                    Sonraki Grubu Sırala ({sortPage === 0 ? "15–28" : "1–14"}) →
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {getSortLetters().map((letter, idx) => (
                    <button
                      key={`${letter.order}-${idx}`}
                      onClick={() => handleSortClick(idx)}
                      title={`${letter.name} — ${letter.pronunciation}`}
                      className={`h-14 rounded-xl border text-2xl font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                        selectedSort === idx
                          ? "border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00] scale-110"
                          : "border-border/60 bg-card hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5"
                      }`}
                      style={{ fontFamily: "serif" }}
                    >
                      {letter.letter}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  İki harfe tıklayarak yerlerini değiştir • Üzerine gel: isim ve ses bilgisi
                </p>
                <button onClick={checkSortPage} className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold hover:bg-[#CCFF00]/90 transition-all">
                  Sıralamayı Kontrol Et ✓
                </button>
              </>
            )}
          </div>
        )}

        {mode === "words" && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">Kelime Kur</h2>
              <p className="text-sm text-muted-foreground">Harflere tıklayarak Arapça kelimeyi oluştur</p>
              <div className="text-[#CCFF00] font-bold text-sm mt-1">{wordScore} puan</div>
            </div>

            {wordDone ? (
              <div className="animate-pop-in text-center">
                <div className="text-5xl mb-3">🌟</div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Tüm Kelimeler Tamamlandı!</h3>
                <div className="text-[#CCFF00] text-3xl font-bold mb-2">{wordScore} puan</div>
                <p className="text-sm text-muted-foreground mb-6">Rozet: 🔤 Harf Ustası</p>
                <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold">
                  Tekrar Oyna
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <span>Kelime {wordIndex + 1} / {simpleWords.length}</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mb-6">
                  <div className="bg-[#CCFF00] h-1.5 rounded-full progress-bar-fill" style={{ width: `${(wordIndex / simpleWords.length) * 100}%` }} />
                </div>

                <div className="glass-card rounded-2xl p-5 mb-4 text-center">
                  <div className="text-4xl font-bold text-[#CCFF00] mb-1" style={{ fontFamily: "serif", direction: "rtl" }}>
                    {simpleWords[wordIndex].display}
                  </div>
                  <div className="text-muted-foreground text-sm">{simpleWords[wordIndex].meaning}</div>
                  <div className="text-xs text-muted-foreground/60 mt-1">({simpleWords[wordIndex].arabic.length} harf)</div>
                </div>

                <div
                  className={`min-h-[64px] rounded-2xl border-2 border-dashed p-4 mb-4 flex flex-wrap gap-2 justify-center items-center transition-colors ${
                    wordResult === "correct" ? "border-green-500 bg-green-500/10" :
                    wordResult === "wrong" ? "border-red-500 bg-red-500/10" :
                    "border-border/40 bg-card/50"
                  }`}
                >
                  {wordPlaced.length === 0 ? (
                    <span className="text-muted-foreground text-sm">Harflere tıkla...</span>
                  ) : (
                    wordPlaced.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleWordLetterClick(item, "placed")}
                        className={`w-12 h-12 rounded-xl text-2xl font-bold transition-all ${
                          wordResult === "correct" ? "bg-green-500/20 border border-green-500/60 text-green-400" :
                          wordResult === "wrong" ? "bg-red-500/20 border border-red-500/60 text-red-400" :
                          "bg-[#CCFF00]/10 border border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00]/20"
                        }`}
                        style={{ fontFamily: "serif" }}
                      >
                        {item.l}
                      </button>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center mb-5">
                  {wordLetters.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleWordLetterClick(item, "pool")}
                      className="w-12 h-12 rounded-xl border border-border/60 bg-card text-2xl font-bold hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5 transition-all"
                      style={{ fontFamily: "serif" }}
                    >
                      {item.l}
                    </button>
                  ))}
                </div>

                <button
                  onClick={checkWord}
                  disabled={wordPlaced.length === 0 || !!wordResult}
                  className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold disabled:opacity-40 transition-all"
                >
                  Kontrol Et ✓
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
