import { useEffect, useRef } from 'react';

interface SeismographProps {
  data: number[];
  width?: number;
  height?: number;
}

const Seismograph = ({ data, width = 800, height = 200 }: SeismographProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set line style
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Draw the waveform
    const step = width / data.length;
    const middle = height / 2;
    data.forEach((value, i) => {
      const x = i * step;
      const y = middle + (value * height / 2);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-auto bg-white/50 rounded-lg backdrop-blur-sm"
    />
  );
};

export default Seismograph;