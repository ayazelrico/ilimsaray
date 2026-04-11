import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ScoreCardProps {
  icon: string;
  label: string;
  score: number;
  maxScore: number;
  feedback: string;
  delay?: number;
}

export function ScoreCard({ icon, label, score, maxScore, feedback, delay = 0 }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);

      let current = 0;
      const duration = 1200;
      const steps = 50;
      const increment = score / steps;
      const interval = duration / steps;

      const counter = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(counter);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, interval);

      const target = (score / maxScore) * 100;
      requestAnimationFrame(() => {
        setTimeout(() => setProgressWidth(target), 50);
      });

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [score, maxScore, delay]);

  const getBarColor = () => {
    const pct = score / maxScore;
    if (pct >= 0.8) return "#22c55e";
    if (pct >= 0.6) return "#f59e0b";
    return "#ef4444";
  };

  if (!visible) return null;

  return (
    <div
      className="animate-fade-in rounded-xl border border-white/8 bg-white/2 overflow-hidden hover:border-white/12 transition-all"
      data-testid={`score-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
        data-testid={`button-expand-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-white/80">{label}</span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: getBarColor() }}
              data-testid={`text-score-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {displayScore}/{maxScore}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full progress-bar-fill"
              style={{
                width: `${progressWidth}%`,
                backgroundColor: getBarColor(),
                boxShadow: `0 0 8px ${getBarColor()}60`
              }}
            />
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="ml-11 pl-0 border-t border-white/6 pt-3">
            <p className="text-sm text-white/60 leading-relaxed">{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
