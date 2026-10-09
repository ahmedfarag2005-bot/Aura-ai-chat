import React, { useEffect, useRef } from 'react';
import { GlassTint } from '../types/chat';

interface ParticleBackgroundProps {
  enabled: boolean;
  tint: GlassTint;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  alphaSpeed: number;
  color: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  enabled,
  tint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palettes based on glass tint
    const getPalette = (t: GlassTint) => {
      switch (t) {
        case 'emerald':
          return [
            'rgba(16, 185, 129,', // emerald-500
            'rgba(52, 211, 153,', // emerald-400
            'rgba(110, 231, 183,', // emerald-300
            'rgba(5, 150, 105,',  // emerald-600
          ];
        case 'amethyst':
          return [
            'rgba(168, 85, 247,', // purple-500
            'rgba(192, 132, 252,', // purple-400
            'rgba(236, 72, 153,',  // pink-500
            'rgba(129, 140, 248,', // indigo-400
          ];
        case 'obsidian':
          return [
            'rgba(148, 163, 184,', // slate-400
            'rgba(203, 213, 225,', // slate-300
            'rgba(100, 116, 139,', // slate-500
            'rgba(71, 85, 105,',   // slate-600
          ];
        case 'crystal':
        default:
          return [
            'rgba(99, 102, 241,',  // indigo-500
            'rgba(168, 85, 247,', // purple-500
            'rgba(59, 130, 246,',  // blue-500
            'rgba(244, 114, 182,', // pink-400
          ];
      }
    };

    const palette = getPalette(tint);
    const particleCount = Math.min(Math.floor((width * height) / 32000), 40);

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const colorBase = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 22 + 6,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        alpha: Math.random() * 0.4 + 0.15,
        alphaSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: colorBase,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds softly
        if (p.x < -40) p.x = width + 40;
        else if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        else if (p.y > height + 40) p.y = -40;

        // Pulse alpha
        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.6 || p.alpha < 0.12) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        // Draw soft glowing orb
        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 2.5
        );
        grad.addColorStop(0, `${p.color} ${p.alpha})`);
        grad.addColorStop(0.5, `${p.color} ${p.alpha * 0.4})`);
        grad.addColorStop(1, `${p.color} 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, tint]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-700"
    />
  );
};
