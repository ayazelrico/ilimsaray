import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  maxScore: number;
  animate?: boolean;
}

export function ScoreCircle({ score, maxScore, animate = true }: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    let current = 0;
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [score, animate]);

  const percentage = displayScore / maxScore;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getLabel = (s: number) => {
    if (s >= 90) return "Mükemmel";
    if (s >= 80) return "Çok İyi";
    if (s >= 70) return "İyi";
    if (s >= 60) return "Orta";
    if (s >= 50) return "Gelişebilir";
    return "Yeni Başlayan";
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-3" data-testid="score-circle">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-black leading-none"
            style={{ color }}
            data-testid="text-total-score"
          >
            {displayScore}
          </span>
          <span className="text-white/40 text-sm mt-1">/ {maxScore}</span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
        data-testid="text-score-label"
      >
        {getLabel(score)}
      </div>
    </div>
  );
}
