import { useLocation } from "wouter";
import { getAllProgress } from "@/lib/progress";
import { useState, useEffect } from "react";

const games = [
  {
    id: "kuran-kasifi",
    title: "Kuran Kaşifi",
    subtitle: "Macera & Keşif",
    description: "Ayetleri öğren, soruları yanıtla ve her seviyede yeni bir keşif yap. 5 heyecan dolu seviye seni bekliyor!",
    icon: "🗺️",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "hover:border-emerald-500/40",
    badge: "5 Seviye",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
    maxScore: 1500,
  },
  {
    id: "tecvid-ustasi",
    title: "Tecvid Ustası",
    subtitle: "Quiz & Bilgi",
    description: "Med, şedde, idğam ve daha fazlasını öğren. Zorluk seviyeni seç ve tecvid kurallarında ustalaş!",
    icon: "📖",
    color: "from-blue-500/20 to-indigo-500/10",
    border: "hover:border-blue-500/40",
    badge: "3 Zorluk",
    badgeColor: "bg-blue-500/20 text-blue-400",
    maxScore: 1500,
  },
  {
    id: "harflerin-yolculugu",
    title: "Harflerin Yolculuğu",
    subtitle: "Bulmaca & Öğrenme",
    description: "28 Arap harfini tanı, sırala ve kelimeler oluştur. Her harfin adını ve sesini öğren!",
    icon: "🔤",
    color: "from-purple-500/20 to-violet-500/10",
    border: "hover:border-purple-500/40",
    badge: "28 Harf",
    badgeColor: "bg-purple-500/20 text-purple-400",
    maxScore: 2000,
  },
  {
    id: "tilavet-yarismasi",
    title: "Tilavet Yarışması",
    subtitle: "Yarışma & Skor",
    description: "Ayet kelimelerini doğru sıraya diz, süreye karşı yarış ve sıralama tablosuna gir!",
    icon: "⏱️",
    color: "from-orange-500/20 to-amber-500/10",
    border: "hover:border-orange-500/40",
    badge: "Süre Yarışması",
    badgeColor: "bg-orange-500/20 text-orange-400",
    maxScore: 1500,
  },
  {
    id: "bilgi-yolculugu",
    title: "İslami Bilgi Yolculuğu",
    subtitle: "Hikaye & Öğrenme",
    description: "Peygamber kıssaları ve İslami bilgilerin arasında bir yolculuğa çık. Doğru seçimler yap, puan kazan!",
    icon: "✨",
    color: "from-rose-500/20 to-pink-500/10",
    border: "hover:border-rose-500/40",
    badge: "5 Bölüm",
    badgeColor: "bg-rose-500/20 text-rose-400",
    maxScore: 1000,
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState(getAllProgress());

  useEffect(() => {
    setProgress(getAllProgress());
  }, []);

  const totalCompleted = Object.values(progress).filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-lg">
            🕌
          </div>
          <div>
            <div className="font-bold text-base text-foreground leading-tight">ilimsaray</div>
            <div className="text-xs text-muted-foreground">İslami Eğitim Oyunları</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {totalCompleted > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00] px-2.5 py-1 bg-[#CCFF00]/10 rounded-full border border-[#CCFF00]/20">
                🏆 {totalCompleted}/5 Oyun Tamamlandı
              </div>
            )}
            <a href="/" className="text-xs text-muted-foreground hover:text-[#CCFF00] transition-colors">
              Tilavet Analizör →
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-medium mb-4">
            <span>✦</span> Eğitici & Eğlenceli
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            İslami <span className="lime-glow">Oyunlar</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Kuran, tecvid ve İslami bilgilerini oyunlarla keşfet. Her oyun seni daha ileri taşır.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game, index) => {
            const gp = progress[game.id];
            const completed = gp?.completed ?? false;
            const highScore = gp?.highScore ?? 0;
            const progressPct = Math.min(100, Math.round((highScore / game.maxScore) * 100));

            return (
              <button
                key={game.id}
                onClick={() => navigate(`/${game.id}`)}
                className={`group text-left p-6 rounded-2xl bg-gradient-to-br ${game.color} border ${
                  completed ? "border-[#CCFF00]/30" : "border-border/60"
                } ${game.border} transition-all duration-300 game-card-hover animate-fade-in`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="text-4xl animate-float" style={{ animationDelay: `${index * 200}ms` }}>
                      {game.icon}
                    </div>
                    {completed && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#CCFF00] flex items-center justify-center text-black text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${game.badgeColor}`}>
                    {game.badge}
                  </span>
                </div>
                <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {game.subtitle}
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{game.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{game.description}</p>

                {completed ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">En yüksek puan</span>
                      <span className="text-[#CCFF00] font-bold">{highScore}</span>
                    </div>
                    <div className="w-full bg-border/60 rounded-full h-1.5">
                      <div
                        className="bg-[#CCFF00] h-1.5 rounded-full progress-bar-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    {gp?.badge && (
                      <div className="text-xs text-muted-foreground">{gp.badge}</div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity">
                    Oyna <span className="translate-x-0 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Oyun", value: "5" },
            { label: "Soru & Görev", value: "100+" },
            { label: "Öğrenme Konusu", value: "28+" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-card border border-border/60">
              <div className="text-2xl font-bold text-[#CCFF00]">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
