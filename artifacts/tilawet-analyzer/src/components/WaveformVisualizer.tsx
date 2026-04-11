import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
}

export function WaveformVisualizer({ analyserNode, isRecording }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!analyserNode || !isRecording) {
        const bars = 40;
        const barWidth = 3;
        const gap = (width - bars * barWidth) / (bars + 1);

        for (let i = 0; i < bars; i++) {
          const x = gap + i * (barWidth + gap);
          const idle = Math.sin(Date.now() / 1000 + i * 0.3) * 3 + 4;
          const barH = idle;
          const y = (height - barH) / 2;

          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 2);
          ctx.fill();
        }
        return;
      }

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      const bars = 50;
      const barWidth = Math.floor(width / bars) - 2;
      const step = Math.floor(bufferLength / bars);

      for (let i = 0; i < bars; i++) {
        const value = dataArray[i * step] / 255;
        const barHeight = Math.max(4, value * height * 0.8);
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const alpha = 0.4 + value * 0.6;
        const green = Math.floor(200 + value * 55);

        if (value > 0.05) {
          ctx.shadowColor = `rgba(204, 255, 0, ${alpha * 0.5})`;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${Math.floor(204 - value * 50)}, ${green}, 0, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyserNode, isRecording]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });

    resizeObserver.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-20 rounded-xl"
      data-testid="waveform-canvas"
    />
  );
}
