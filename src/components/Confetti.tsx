/**
 * Canvas-based confetti overlay
 */

import { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
  durationMs?: number;
  onComplete?: () => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  opacity: number;
}

const COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
];

export const Confetti = ({
  active,
  durationMs = 3200,
  onComplete,
}: ConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const spawnParticles = () => {
      const particles: ConfettiParticle[] = [];
      const count = 160;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -Math.random() * canvas.height * 0.2,
          velocityX: (Math.random() - 0.5) * 3,
          velocityY: Math.random() * 3 + 2,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 8 + 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          opacity: Math.random() * 0.5 + 0.5,
        });
      }
      particlesRef.current = particles;
    };

    spawnParticles();
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.rotation += particle.rotationSpeed;
        particle.velocityY += 0.03;

        context.save();
        context.globalAlpha = particle.opacity;
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size
        );
        context.restore();
      });

      particlesRef.current = particlesRef.current.filter(
        (particle) => particle.y < canvas.height + 40
      );

      if (elapsed < durationMs && particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) {
          onComplete();
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resize);
    };
  }, [active, durationMs, onComplete]);

  if (!active) {
    return null;
  }

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1000]" />;
};
