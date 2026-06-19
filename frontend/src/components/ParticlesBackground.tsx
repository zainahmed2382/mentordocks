import React, { useEffect, useRef } from "react";

export const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener("resize", resizeCanvas);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1.5; // 1.5 to 3.5 px
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.6 + 0.2; 
        
        // AI Theme Brand Colors
        // Primary: 59, 130, 246
        // Secondary: 99, 102, 241
        // Accent: 6, 182, 212
        const colors = ["59, 130, 246", "99, 102, 241", "6, 182, 212"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges smoothly
        if (this.x > canvas!.width + 50) this.x = -50;
        else if (this.x < -50) this.x = canvas!.width + 50;
        if (this.y > canvas!.height + 50) this.y = -50;
        else if (this.y < -50) this.y = canvas!.height + 50;

        // Mouse Interaction (Repulsion / Parallax)
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (maxDistance - distance) / maxDistance;
          this.x -= forceDirectionX * force * 3;
          this.y -= forceDirectionY * force * 3;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${this.color}, 0.9)`;
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        
        ctx.fill();
        ctx.closePath();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 9000); 
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      let connectDistance = 150;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance) {
            let opacityValue = 1 - (distance / connectDistance);
            // Draw subtle connecting lines (neural network effect) using Primary Color
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacityValue * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      // Connect to mouse cursor
      const mouseMaxDistance = 200;
      for (let a = 0; a < particles.length; a++) {
        let dx = particles[a].x - mouseRef.current.x;
        let dy = particles[a].y - mouseRef.current.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseMaxDistance) {
          let opacityValue = 1 - (distance / mouseMaxDistance);
          // Highlight connection to mouse with Accent Color
          ctx.strokeStyle = `rgba(6, 182, 212, ${opacityValue * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      }
    };

    const animate = () => {
      // Light trails logic: Fade out existing pixels slightly instead of clearing completely
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 0.2 controls the trail length
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      
      drawLines();
      
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Layer 1: Soft Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #F9FAFB 1px, transparent 1px),
            linear-gradient(to bottom, #F9FAFB 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Layer 2: Moving Soft Glowing Orbs (Primary & Accent) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[150px] bg-blue-600 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[180px] bg-cyan-600 animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full opacity-[0.15] blur-[120px] bg-indigo-600 animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Layer 3: The Canvas Particles & AI Neural Lines */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: "transparent" }}
      />
      
      {/* Layer 4: Subtle Glassmorphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] opacity-40" />
    </div>
  );
};
