import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, Square, RefreshCw, ChevronRight } from "lucide-react";
import ilimsarayLogo from "@assets/ilimsaray_1775908969299.png";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { ScoreCircle } from "@/components/ScoreCircle";
import { ScoreCard } from "@/components/ScoreCard";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { useRecorder } from "@/hooks/useRecorder";
import { transcribeAudio, analyzeRecitation, AnalysisResult } from "@/lib/openai";

type AppState = "landing" | "recording" | "analyzing" | "results";

export function TilawetApp() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [analysisStep, setAnalysisStep] = useState<"transcribing" | "analyzing">("transcribing");
  const [typewriterText, setTypewriterText] = useState("");
  const [typewriterDone, setTypewriterDone] = useState(false);
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    recordingState,
    recordingTime,
    audioBlob,
    analyserNode,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError,
  } = useRecorder();

  const addToast = useCallback((message: string, type: ToastMessage["type"] = "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  useEffect(() => {
    if (recorderError) addToast(recorderError, "error");
  }, [recorderError, addToast]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleStartRecording = async () => {
    setAppState("recording");
    await startRecording();
  };

  const handleStopAndAnalyze = async () => {
    stopRecording();
    setAppState("analyzing");
  };

  useEffect(() => {
    if (appState === "analyzing" && audioBlob && recordingState === "stopped") {
      runAnalysis(audioBlob);
    }
  }, [appState, audioBlob, recordingState]);

  const runAnalysis = async (blob: Blob) => {
    try {
      setAnalysisStep("transcribing");
      const transcribed = await transcribeAudio(blob);

      setAnalysisStep("analyzing");
      const result = await analyzeRecitation(transcribed);

      setAnalysisResult(result);
      setAppState("results");
      startTypewriter(result.genel_yorum);
    } catch (err) {
      const e = err as Error;
      addToast(e.message || "Analiz sırasında bir hata oluştu.", "error");
      setAppState("recording");
    }
  };

  const startTypewriter = (text: string) => {
    setTypewriterText("");
    setTypewriterDone(false);
    let i = 0;
    const type = () => {
      if (i < text.length) {
        setTypewriterText(text.slice(0, i + 1));
        i++;
        typewriterRef.current = setTimeout(type, 20);
      } else {
        setTypewriterDone(true);
      }
    };
    type();
  };

  const handleReset = () => {
    resetRecording();
    setAppState("landing");
    setAnalysisResult(null);
    setTypewriterText("");
    setTypewriterDone(false);
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
  };

  const criteriaCards = analysisResult
    ? [
        { icon: "📖", label: "Taban Puan", key: "taban_puan" as const, max: 50 },
        { icon: "⭐", label: "Tecvid ve Mahreç", key: "tecvid_ve_mahrec" as const, max: 15 },
        { icon: "👁", label: "Yüzünden Doğru Okuma", key: "yuzunden_dogru_okuma" as const, max: 15 },
        { icon: "🎵", label: "Makam", key: "makam" as const, max: 15 },
        { icon: "🔊", label: "Ses", key: "ses" as const, max: 5 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden" data-testid="tilawet-app">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-radial-bg"
          style={{ background: "radial-gradient(circle, rgba(204,255,0,0.04) 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(204,255,0,0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 70%)" }} />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5">
        <a href="https://ilimsaray.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 group"
          data-testid="link-ilimsaray-home">
          <img src={ilimsarayLogo} alt="ilimsaray" className="h-7 w-auto brightness-100 invert" />
        </a>
        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/8 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
          AI Destekli
        </span>
      </header>

      <main className="relative z-10 flex flex-col items-center min-h-[calc(100vh-73px)]">
        {appState === "landing" && <LandingSection onStart={handleStartRecording} />}
        {(appState === "recording") && (
          <RecordingSection
            recordingState={recordingState}
            recordingTime={recordingTime}
            analyserNode={analyserNode}
            onStart={handleStartRecording}
            onStop={handleStopAndAnalyze}
            formatTime={formatTime}
          />
        )}
        {appState === "analyzing" && (
          <AnalyzingSection step={analysisStep} />
        )}
        {appState === "results" && analysisResult && (
          <ResultsSection
            result={analysisResult}
            criteriaCards={criteriaCards}
            typewriterText={typewriterText}
            typewriterDone={typewriterDone}
            onReset={handleReset}
          />
        )}
      </main>

      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function LandingSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center animate-fade-in">
      <div className="mb-8 relative">
        <span className="text-xs font-semibold tracking-[0.3em] text-[#CCFF00]/60 uppercase">
          ilimsaray.com
        </span>
      </div>

      <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-none tracking-tight">
        <span className="text-white">Tilawet</span>
        <br />
        <span className="lime-glow animate-glow-text">Analizör</span>
      </h1>

      <p className="text-white/50 text-base sm:text-lg max-w-md mb-16 leading-relaxed">
        Yapay zeka ile Kuran tilavetinizi analiz edin ve{" "}
        <span className="text-white/70">kişisel geri bildirim</span> alın
      </p>

      <div className="relative mb-12 animate-float">
        <div className="absolute inset-0 rounded-full animate-pulse-ring-2 border-2 border-[#CCFF00]/30" />
        <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-[#CCFF00]/50" />
        <button
          onClick={onStart}
          className="relative w-32 h-32 rounded-full flex items-center justify-center transition-transform active:scale-95 animate-glow-pulse"
          style={{
            background: "linear-gradient(135deg, #CCFF00 0%, #a8d400 100%)",
            boxShadow: "0 0 30px rgba(204,255,0,0.4), 0 0 60px rgba(204,255,0,0.15)"
          }}
          data-testid="button-start-recording"
        >
          <Mic className="w-12 h-12 text-black" />
        </button>
      </div>

      <p className="text-white/30 text-sm">Kayıt başlatmak için dokunun</p>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {[
          { label: "Taban Puan", max: "50 puan", icon: "📖" },
          { label: "Tecvid & Makam", max: "30 puan", icon: "⭐" },
          { label: "Ses Kalitesi", max: "20 puan", icon: "🔊" },
        ].map((item) => (
          <div
            key={item.label}
            className="glass-card rounded-xl p-4 text-center"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="mt-2 text-xs text-white/40">{item.label}</div>
            <div className="text-[#CCFF00]/80 text-xs font-medium mt-0.5">{item.max}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecordingSection({
  recordingState,
  recordingTime,
  analyserNode,
  onStart,
  onStop,
  formatTime,
}: {
  recordingState: string;
  recordingTime: number;
  analyserNode: AnalyserNode | null;
  onStart: () => void;
  onStop: () => void;
  formatTime: (s: number) => string;
}) {
  const isRecording = recordingState === "recording";
  const isIdle = recordingState === "idle";

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 w-full max-w-lg mx-auto animate-fade-in">
      <div className="w-full glass-card rounded-2xl p-8 text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {isIdle ? "Hazır" : isRecording ? "Kaydediliyor..." : "Kaydedildi"}
          </h2>
          {isRecording && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-recording-pulse" />
              <span className="text-white/60 text-sm">Canlı kayıt</span>
            </div>
          )}
        </div>

        <div
          className="text-6xl font-black tabular-nums font-mono"
          style={{ color: isRecording ? "#ef4444" : "rgba(255,255,255,0.8)" }}
          data-testid="text-recording-timer"
        >
          {formatTime(recordingTime)}
        </div>

        <div className="w-full glass-card rounded-xl p-3">
          <WaveformVisualizer analyserNode={analyserNode} isRecording={isRecording} />
        </div>

        <div className="flex items-center justify-center gap-4">
          {isIdle && (
            <button
              onClick={onStart}
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-black transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #CCFF00 0%, #a8d400 100%)",
                boxShadow: "0 4px 20px rgba(204,255,0,0.3)"
              }}
              data-testid="button-start-record"
            >
              <Mic className="w-5 h-5" />
              Kaydı Başlat
            </button>
          )}
          {isRecording && (
            <button
              onClick={onStop}
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all active:scale-95"
              data-testid="button-stop-analyze"
            >
              <Square className="w-4 h-4 fill-current" />
              Durdur ve Analiz Et
            </button>
          )}
        </div>

        <p className="text-white/20 text-xs">Maksimum kayıt süresi: 3 dakika</p>
      </div>
    </div>
  );
}

function AnalyzingSection({ step }: { step: "transcribing" | "analyzing" }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-20 animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#CCFF00]/20 animate-spin-slow"
          style={{ borderTopColor: "#CCFF00" }} />
        <div className="absolute inset-3 rounded-full border-2 border-[#CCFF00]/10 animate-spin-slow"
          style={{ borderBottomColor: "#CCFF00", animationDirection: "reverse", animationDuration: "1.5s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">
            {step === "transcribing" ? "📝" : "🔍"}
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">
        {step === "transcribing" ? "Ses Dönüştürülüyor..." : "Analiz Ediliyor..."}
      </h2>
      <p className="text-white/40 text-sm max-w-xs text-center" data-testid="text-analyzing-status">
        {step === "transcribing"
          ? "Whisper AI ile sesiniz metne dönüştürülüyor"
          : "GPT-4o tilavetinizi değerlendiriyor"}
      </p>

      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#CCFF00]/60"
            style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function ResultsSection({
  result,
  criteriaCards,
  typewriterText,
  typewriterDone,
  onReset,
}: {
  result: AnalysisResult;
  criteriaCards: { icon: string; label: string; key: keyof AnalysisResult["scores"]; max: number }[];
  typewriterText: string;
  typewriterDone: boolean;
  onReset: () => void;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-slide-up" data-testid="results-section">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-medium mb-4">
          <span>✓</span>
          Sonuçlar Hazır!
        </div>
        <h2 className="text-2xl font-bold text-white">Tilavet Analizi</h2>
      </div>

      <div className="glass-card rounded-2xl p-8 mb-6 flex flex-col items-center">
        <ScoreCircle score={result.total} maxScore={100} animate={true} />

        {result.transcribed_text && (
          <div className="mt-6 w-full p-4 rounded-xl bg-white/3 border border-white/8">
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Transkripsyon</p>
            <p
              className="text-sm text-white/70 text-right leading-relaxed font-arabic"
              dir="rtl"
              data-testid="text-transcription"
            >
              {result.transcribed_text}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {criteriaCards.map((c, i) => (
          <ScoreCard
            key={c.key}
            icon={c.icon}
            label={c.label}
            score={result.scores[c.key]}
            maxScore={c.max}
            feedback={result.feedback[c.key]}
            delay={i * 100}
          />
        ))}
      </div>

      {typewriterText && (
        <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in" data-testid="genel-yorum">
          <h3 className="text-sm font-semibold text-[#CCFF00]/80 uppercase tracking-wider mb-3">
            Genel Yorum
          </h3>
          <p className={`text-white/70 text-sm leading-relaxed ${!typewriterDone ? "typewriter-cursor" : ""}`}>
            {typewriterText}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-black transition-all active:scale-98"
          style={{
            background: "linear-gradient(135deg, #CCFF00 0%, #a8d400 100%)",
            boxShadow: "0 4px 20px rgba(204,255,0,0.3)"
          }}
          data-testid="button-record-again"
        >
          <RefreshCw className="w-4 h-4" />
          Tekrar Kaydet
        </button>
        <a
          href="https://ilimsaray.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all text-sm"
          data-testid="link-ilimsaray"
        >
          ilimsaray.com
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
