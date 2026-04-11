import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}

interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ messages, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(message.id), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  const colors = {
    error: { bg: "bg-red-950/90", border: "border-red-500/30", text: "text-red-400", icon: AlertCircle },
    success: { bg: "bg-green-950/90", border: "border-green-500/30", text: "text-green-400", icon: CheckCircle },
    info: { bg: "bg-[#CCFF00]/10", border: "border-[#CCFF00]/30", text: "text-[#CCFF00]", icon: CheckCircle },
  };

  const c = colors[message.type];
  const Icon = c.icon;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl transition-all duration-300 ${c.bg} ${c.border} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      data-testid="toast-message"
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.text}`} />
      <p className="text-sm text-white/80 flex-1 leading-relaxed">{message.message}</p>
      <button
        onClick={() => onDismiss(message.id)}
        className="text-white/30 hover:text-white/60 flex-shrink-0"
        data-testid="button-dismiss-toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
