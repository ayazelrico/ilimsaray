import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, X } from "lucide-react";

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
  onClose: () => void;
}

export function ApiKeyModal({ onSubmit, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!key.trim()) {
      setError("Lütfen bir API anahtarı girin.");
      return;
    }
    if (!key.trim().startsWith("sk-")) {
      setError("Geçersiz API anahtarı formatı. 'sk-' ile başlamalıdır.");
      return;
    }
    onSubmit(key.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="api-key-modal"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFF00]/50 to-transparent" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">OpenAI API Anahtarı</h2>
                  <p className="text-xs text-white/40">Analiz için gerekli</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                data-testid="close-modal"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="mb-5 p-4 rounded-xl bg-[#CCFF00]/5 border border-[#CCFF00]/10">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#CCFF00] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    API anahtarınız <strong className="text-[#CCFF00]">yalnızca tarayıcınızda</strong> saklanır ve hiçbir sunucumuza kaydedilmez. Yalnızca OpenAI'ye yapılan isteklerde kullanılır.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                    <span className="text-xs text-[#CCFF00]/80 font-medium">Güvenli • Şifrelenmiş • Paylaşılmaz</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={key}
                  onChange={(e) => { setKey(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40 focus:bg-white/8 transition-all font-mono text-sm"
                  data-testid="input-api-key"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-400 px-1">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl font-bold text-sm text-black bg-[#CCFF00] hover:bg-[#d4ff1a] active:bg-[#b8e600] transition-all transform active:scale-98 shadow-lg shadow-[#CCFF00]/20"
                data-testid="button-submit-api-key"
              >
                Devam Et
              </button>

              <p className="text-center text-xs text-white/30">
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#CCFF00]/60 hover:text-[#CCFF00] transition-colors underline"
                >
                  API anahtarı nasıl edinilir?
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
