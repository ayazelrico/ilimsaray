import { useLocation } from "wouter";
import { useUser, useClerk, UserProfile } from "@clerk/react";
import { getAllProgress } from "@/lib/progress";
import { useState, useEffect, useRef } from "react";

function UserMenu() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <button
        onClick={() => { window.location.href = "/sign-in"; }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-semibold hover:bg-[#CCFF00]/20 transition-all"
      >
        Giriş Yap
      </button>
    );
  }

  const initials = user.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : (user.emailAddresses[0]?.emailAddress?.[0] ?? "?").toUpperCase();

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-border/60 hover:border-[#CCFF00]/30 bg-card hover:bg-[#CCFF00]/5 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-[#CCFF00] flex items-center justify-center text-black text-xs font-bold shrink-0 overflow-hidden">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <span className="text-foreground text-xs font-medium max-w-[100px] truncate hidden sm:block">{displayName}</span>
          <span className="text-muted-foreground text-xs">▾</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border/60 bg-card shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border/40">
              <p className="text-foreground text-sm font-semibold truncate">{displayName}</p>
              <p className="text-muted-foreground text-xs truncate">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
            <button
              onClick={() => { setOpen(false); setShowProfile(true); }}
              className="w-full text-left px-3 py-2 text-muted-foreground text-sm hover:bg-[#CCFF00]/5 hover:text-foreground transition-colors flex items-center gap-2"
            >
              <span>👤</span> Profil
            </button>
            <button
              onClick={() => { setOpen(false); setShowProfile(true); }}
              className="w-full text-left px-3 py-2 text-muted-foreground text-sm hover:bg-[#CCFF00]/5 hover:text-foreground transition-colors flex items-center gap-2"
            >
              <span>⚙️</span> Ayarlar
            </button>
            <div className="border-t border-border/40" />
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="w-full text-left px-3 py-2 text-muted-foreground text-sm hover:bg-[#CCFF00]/5 hover:text-foreground transition-colors flex items-center gap-2"
            >
              <span>🚪</span> Çıkış Yap
            </button>
          </div>
        )}
      </div>

      {showProfile && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="max-h-[95dvh] overflow-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <UserProfile />
          </div>
        </div>
      )}
    </>
  );
}

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

export default function GamesHome() {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState(getAllProgress());
  const { isSignedIn, isLoaded, user } = useUser();

  useEffect(() => {
    setProgress(getAllProgress());
  }, [isLoaded, isSignedIn, user?.id]);

  const totalCompleted = Object.values(progress).filter((p) => p.completed).length;
  const totalHighScore = Object.values(progress).reduce((sum, p) => sum + (p.highScore ?? 0), 0);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.emailAddresses[0]?.emailAddress ?? "";

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
            <a href="/" className="hidden sm:block text-xs text-muted-foreground hover:text-[#CCFF00] transition-colors">
              Tilavet Analizör →
            </a>
            <UserMenu />
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
            const gp = isSignedIn ? progress[game.id] : undefined;
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

        {isLoaded && isSignedIn && totalCompleted > 0 && (
          <div className="mt-10 rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/5 p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold text-base">
                  Hoş geldin, {displayName || "oyuncu"}! 🎉
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Hesabına bağlı ilerleme durumun:
                </p>
              </div>
              <div className="text-right">
                <div className="text-[#CCFF00] font-black text-2xl">{totalCompleted}/5</div>
                <div className="text-muted-foreground text-xs">oyun tamamlandı</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card border border-border/60 p-3 text-center">
                <div className="text-[#CCFF00] font-bold text-lg">{totalHighScore}</div>
                <div className="text-muted-foreground text-xs mt-0.5">Toplam Puan</div>
              </div>
              <div className="rounded-xl bg-card border border-border/60 p-3 text-center">
                <div className="text-[#CCFF00] font-bold text-lg">{5 - totalCompleted}</div>
                <div className="text-muted-foreground text-xs mt-0.5">Kalan Oyun</div>
              </div>
            </div>
          </div>
        )}

        {isLoaded && !isSignedIn && (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card p-5 flex items-center justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-foreground font-semibold text-sm">🔒 İlerlemenizi hesabınıza kaydedin</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Giriş yaparak puanlarınız ve rozetleriniz cihazlar arası senkronize edilsin.
              </p>
            </div>
            <button
              onClick={() => { window.location.href = "/sign-in"; }}
              className="shrink-0 px-4 py-2 rounded-lg bg-[#CCFF00] text-black text-xs font-bold hover:bg-[#CCFF00]/90 transition-all"
            >
              Giriş Yap
            </button>
          </div>
        )}

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
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
