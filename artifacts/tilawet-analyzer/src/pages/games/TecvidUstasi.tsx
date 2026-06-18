import { useState } from "react";
import { useLocation } from "wouter";
import { saveProgress } from "@/lib/progress";

type Difficulty = "baslangic" | "orta" | "ileri";

const questions: Record<Difficulty, Array<{ q: string; options: string[]; answer: number; explanation: string }>> = {
  baslangic: [
    { q: "Tecvid nedir?", options: ["Kuran ezberlemek", "Kuran'ı doğru ve güzel okuma kuralları", "Namaz vakitleri", "Dua çeşitleri"], answer: 1, explanation: "Tecvid, Kuran harflerini doğru makam ve kurallara göre okuma ilmidir." },
    { q: "Med ne anlama gelir?", options: ["Kısaltmak", "Uzatmak", "Beklemek", "Hızlandırmak"], answer: 1, explanation: "Med, bazı harflerin sesini belirli kurallara göre uzatmak demektir." },
    { q: "Şedde işareti neyi gösterir?", options: ["Harfi kısa oku", "Harfi iki kez oku (şeddeli)", "Dur işareti", "Uzat işareti"], answer: 1, explanation: "Şedde, harfin iki kez, yani şeddeli okunacağını gösterir." },
    { q: "Tenvin nedir?", options: ["Harfin uzatılması", "Kelimenin sonuna eklenen düz 'n' sesi (ن)", "Durma işareti", "Başlangıç harfi"], answer: 1, explanation: "Tenvin, kelimenin sonunda belirtisizlik bildiren n (ن) sesidir." },
    { q: "Sükun işareti neye benzer?", options: ["Küçük bir w harfi", "Küçük bir daire (°)", "Bir nokta", "Bir tire"], answer: 1, explanation: "Sükun, harfin üzerinde küçük bir daire şeklinde görülür ve harekesiz okunduğunu gösterir." },
    { q: "Fetha harekesi harfin altına mı üstüne mi konur?", options: ["Altına", "Üstüne", "Yanına", "İçine"], answer: 1, explanation: "Fetha harekesi harfin üstüne konur ve 'a' sesini verir." },
    { q: "Kuran'ı okurken hangi yönde okunur?", options: ["Soldan sağa", "Sağdan sola", "Yukarıdan aşağıya", "Aşağıdan yukarıya"], answer: 1, explanation: "Arapça ve Kuran sağdan sola doğru okunur." },
    { q: "Elif harfinin med hali nasıl okunur?", options: ["Kısa 'a'", "Uzun 'a'", "Sessiz", "'e' sesi"], answer: 1, explanation: "Med elif, uzun 'a' sesiyle okunur." },
    { q: "Vakf ne demektir?", options: ["Hızlı okumak", "Durmak, okumayı kesmek", "Tekrar okumak", "Başa dönmek"], answer: 1, explanation: "Vakf, okumayı uygun bir yerde duraklatmak demektir." },
    { q: "Besmele ile okumaya başlamak nasıl bir sünnettir?", options: ["Vacip", "Farz", "Sünnet", "Mekruh"], answer: 2, explanation: "Besmele ile başlamak sünnettir ve her işte bereket getirir." },
  ],
  orta: [
    { q: "İzhar ne demektir?", options: ["Gizlemek", "Açık ve net okumak", "Uzatmak", "Durdurmak"], answer: 1, explanation: "İzhar, harfi açık ve belirgin şekilde okumak demektir." },
    { q: "İdğam nedir?", options: ["İki harfi birleştirerek şeddeli okumak", "Uzatmak", "Kesmek", "Tekrar etmek"], answer: 0, explanation: "İdğam, bir harfi kendisinden sonra gelen harfe katarak şeddeli okumaktır." },
    { q: "İhfa kuralı neye göredir?", options: ["Harfi tam okumak", "Gizleyerek, burunda tutarak okumak", "Çok uzatmak", "Kısa kesmek"], answer: 1, explanation: "İhfa, nun veya tenvini burunda tutarak okumaktır." },
    { q: "Kalkale harfleri hangileridir?", options: ["ب ج د ذ ز", "ق ط ب ج د", "م ن و ي", "أ ه ع ح غ خ"], answer: 1, explanation: "Kalkale harfleri 'قطبجد' (KATBACED) olarak bilinir." },
    { q: "Med-i tabii kaç elif uzunluğundadır?", options: ["1 elif", "2 elif", "4 elif", "6 elif"], answer: 1, explanation: "Med-i tabii 2 elif (hareke) uzunluğunda okunur." },
    { q: "Medd-i munfasıl kaç hareke uzatılır?", options: ["2", "4 veya 5", "6", "1"], answer: 1, explanation: "Medd-i munfasıl genellikle 4 veya 5 hareke uzatılır." },
    { q: "Tecvidin öğrenmesi kime farz-ı ayndır?", options: ["Yalnızca alimlere", "Tüm Müslümanlara", "Sadece imamlara", "Sadece erkeklere"], answer: 1, explanation: "Tecvid kurallarını öğrenmek tüm Müslümanlara farzdır." },
    { q: "Sekte nedir?", options: ["Kısa bir duraklama (nefes vermeden)", "Uzun duraklama", "Tekrar okuma", "Hızlandırma"], answer: 0, explanation: "Sekte, nefes vermeksizin yapılan çok kısa bir durmadır." },
    { q: "Hems (hemse) ne demektir?", options: ["Sesi yükseltmek", "Sesi hafifçe fısıldamak", "Uzatmak", "Kesmek"], answer: 1, explanation: "Hems, harfi fısıltıyla hafif okumaktır." },
    { q: "İdğam-ı bigunn ile idğam-ı maa'l-gunn farkı nedir?", options: ["Bigunnede gunn (geniz sesi) yoktur", "İkisi aynıdır", "Maa'l-gunne'de gunn yoktur", "Fark sadece hız"], answer: 0, explanation: "Bigunnede geniz sesi korunmaz, maa'l-gunne'de korunur." },
  ],
  ileri: [
    { q: "Medd-i muttasıl ile medd-i munfasıl farkı nedir?", options: ["Muttasıl aynı kelimede, munfasıl ayrı kelimelerde olur", "Muttasıl daha kısa", "İkisi aynı kuraldır", "Fark yoktur"], answer: 0, explanation: "Muttasıl, med ve hemze aynı kelimede; munfasıl ayrı kelimelerde olduğunda geçerlidir." },
    { q: "Medd-i lazım kaç elif uzatılır?", options: ["2", "4", "6", "8"], answer: 2, explanation: "Medd-i lazım en uzun med türüdür ve 6 elif uzatılır." },
    { q: "Kalkale harflerinin vakf halindeki okunuşu nasıldır?", options: ["Yumuşak okunur", "Sert ve sekme sesiyle okunur", "Hiç okunmaz", "Uzatılarak okunur"], answer: 1, explanation: "Vakf halinde kalkale harfleri belirgin bir sekme ve titreşimle okunur." },
    { q: "Tecvid ilminin temelleri kimden rivayet edilmiştir?", options: ["Hz. Ömer'den", "Hz. Ali'den", "Hz. Peygamber'den (s.a.v.) Cebrail aracılığıyla", "İlk Müslümanlardan"], answer: 2, explanation: "Tecvid ilmi, Hz. Peygamber'e Cebrail vasıtasıyla Allah'tan gelmiştir." },
    { q: "Ra harfinin kalın (tefhim) okunacağı durum nedir?", options: ["Daima kalın okunur", "Fetha veya damme harekeli olduğunda", "Daima ince okunur", "Yalnızca kelimenin sonunda"], answer: 1, explanation: "Ra, fetha veya damme harekeli ise kalın okunur." },
    { q: "Lam-ı celale (الله) ne zaman kalın okunur?", options: ["Her zaman kalın", "Öncesinde fetha veya damme harekesi geldiğinde", "Her zaman ince", "Öncesinde kesra geldiğinde"], answer: 1, explanation: "Lafzatullah'taki lam, öncesinde fetha veya damme varsa kalın okunur." },
    { q: "İklab nedir?", options: ["Nun'u mim sesine çevirerek okumak", "Harfi uzatmak", "İki harfi birleştirmek", "Harfi kesmek"], answer: 0, explanation: "İklab; sükünlü veya tenvinli nun'un ba harfinden önce mim sesine dönüşmesidir." },
    { q: "Tecvid ilminde 'sıfat' ne anlama gelir?", options: ["Harfin çıkış yeri", "Harfin ses özellikleri (cehr, hems, şiddet vb.)", "Harfin yazılış şekli", "Harfin ismi"], answer: 1, explanation: "Sıfat, harfin cehr, hems, şiddet gibi ses özelliklerini ifade eder." },
    { q: "Tecvid öğrenmede rivayet ve dirayet ne demektir?", options: ["Ezberleme ve anlama metotları", "Tecvid kurallarının sözlü ve uygulamalı aktarımı", "İki farklı okuma hızı", "İki farklı med türü"], answer: 1, explanation: "Tecvid, rivayet (aktarım) ve dirayet (kavrayış) yoluyla öğrenilir." },
    { q: "Hemze-i kat' ile hemze-i vasl farkı nedir?", options: ["Kat' her zaman okunur, vasl cümle başında okunur", "Vasl her zaman okunur, kat' kesilir", "İkisi aynıdır", "Sadece yazılışta farklıdır"], answer: 0, explanation: "Hemze-i kat' her konumda okunurken, hemze-i vasl yalnızca cümle başında okunur." },
  ],
};

export default function TecvidUstasi() {
  const [, navigate] = useLocation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [phase, setPhase] = useState<"select" | "quiz" | "result">("select");

  const LABELS: Record<Difficulty, string> = { baslangic: "Başlangıç", orta: "Orta", ileri: "İleri" };
  const currentQuestions = difficulty ? questions[difficulty] : [];
  const question = currentQuestions[qIndex];
  const isLast = qIndex === currentQuestions.length - 1;

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === question.answer;
    if (isCorrect) {
      const pts = difficulty === "ileri" ? 150 : difficulty === "orta" ? 120 : 100;
      setScore((s) => s + pts);
      setCorrectCount((c) => c + 1);
    }
    setShowExplanation(true);
  }

  function next() {
    setShowExplanation(false);
    setSelected(null);
    if (isLast) {
      const badge = difficulty === "ileri" ? "🏆 Tecvid Üstadı" : difficulty === "orta" ? "⭐ Tecvid Yıldızı" : "📖 Tecvid Öğrencisi";
      saveProgress("tecvid-ustasi", score, badge);
      setPhase("result");
    } else {
      setQIndex((q) => q + 1);
    }
  }

  function restart() {
    setPhase("select");
    setDifficulty(null);
    setQIndex(0);
    setScore(0);
    setCorrectCount(0);
    setSelected(null);
    setShowExplanation(false);
  }

  const percentage = currentQuestions.length ? Math.round((correctCount / currentQuestions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-[#CCFF00] transition-colors">← Geri</button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-sm">📖</div>
            <span className="font-bold text-sm">Tecvid Ustası</span>
          </div>
        </div>

        {phase === "select" && (
          <div className="animate-fade-in text-center">
            <div className="text-5xl mb-4 animate-float">📖</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tecvid Ustası</h1>
            <p className="text-muted-foreground mb-10">Zorluk seviyeni seç ve tecvid bilgini test et!</p>
            <div className="grid gap-4">
              {(["baslangic", "orta", "ileri"] as Difficulty[]).map((d) => (
                <button key={d} onClick={() => { setDifficulty(d); setPhase("quiz"); }}
                  className="p-5 rounded-2xl border border-border/60 bg-card hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5 transition-all text-left">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{d === "baslangic" ? "🌱" : d === "orta" ? "⭐" : "🏆"}</span>
                    <div>
                      <div className="font-bold text-foreground">{LABELS[d]}</div>
                      <div className="text-sm text-muted-foreground">
                        {d === "baslangic" ? "Temel kavramlar ve hareke bilgisi" : d === "orta" ? "İdğam, ihfa, izhar ve kalkale" : "Med türleri, sıfatlar ve ileri kurallar"}
                      </div>
                    </div>
                    <div className="ml-auto text-[#CCFF00] font-bold">{d === "baslangic" ? "100" : d === "orta" ? "120" : "150"} pt/soru</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "quiz" && difficulty && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#CCFF00] uppercase px-2 py-1 bg-[#CCFF00]/10 rounded-full">{LABELS[difficulty]}</span>
              <span className="text-sm text-muted-foreground">{qIndex + 1} / {currentQuestions.length}</span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 mb-8">
              <div className="bg-[#CCFF00] h-1.5 rounded-full progress-bar-fill" style={{ width: `${(qIndex / currentQuestions.length) * 100}%` }} />
            </div>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <p className="text-lg font-semibold text-foreground">{question.q}</p>
            </div>
            <div className="space-y-3 mb-4">
              {question.options.map((opt, idx) => (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-xl border border-border/60 bg-card transition-all duration-300 font-medium ${
                    selected !== null && idx === question.answer ? "correct-answer" :
                    selected === idx && idx !== question.answer ? "wrong-answer" :
                    "hover:border-[#CCFF00]/40 hover:bg-[#CCFF00]/5"
                  }`}>
                  <span className="inline-flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
            {showExplanation && (
              <div className="animate-fade-in p-4 rounded-xl bg-card border border-border/60 mb-4">
                <p className="text-sm text-muted-foreground"><span className="text-[#CCFF00] font-semibold">Açıklama: </span>{question.explanation}</p>
              </div>
            )}
            {selected !== null && (
              <button onClick={next} className="w-full py-3 rounded-xl bg-[#CCFF00] text-black font-bold hover:bg-[#CCFF00]/90 transition-all animate-fade-in">
                {isLast ? "Sonuçları Gör →" : "Sonraki Soru →"}
              </button>
            )}
          </div>
        )}

        {phase === "result" && difficulty && (
          <div className="animate-pop-in text-center">
            <div className="text-6xl mb-4">{percentage >= 80 ? "🏆" : percentage >= 60 ? "⭐" : "📖"}</div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{percentage >= 80 ? "Harika!" : percentage >= 60 ? "İyi!" : "Daha Çok Çalış!"}</h2>
            <p className="text-muted-foreground mb-6">{LABELS[difficulty]} seviyesinde {correctCount}/{currentQuestions.length} doğru</p>
            <div className="glass-card rounded-2xl p-6 mb-8">
              <div className="text-5xl font-bold text-[#CCFF00] mb-1">{percentage}%</div>
              <div className="text-muted-foreground text-sm mb-4">Başarı Oranı</div>
              <div className="w-full bg-border rounded-full h-3">
                <div className="h-3 rounded-full bg-[#CCFF00] progress-bar-fill" style={{ width: `${percentage}%` }} />
              </div>
              <div className="mt-4 text-lg font-bold text-[#CCFF00]">{score} Puan</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={restart} className="py-3 rounded-xl border border-border/60 text-foreground font-semibold hover:border-[#CCFF00]/40 transition-all">Tekrar Oyna</button>
              <button onClick={() => navigate("/")} className="py-3 rounded-xl bg-[#CCFF00] text-black font-bold hover:bg-[#CCFF00]/90 transition-all">Ana Sayfa</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
