import React, { useEffect, useRef } from 'react';
import './animated-background.scss';

const AnimatedBackground = ({ variant = 'default' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let shapes = [];
    let time = 0;

    class MorphingShape {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 100 + 50;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.color = this.getRandomColor();
        this.vertices = this.generateVertices();
        this.morphSpeed = Math.random() * 0.02 + 0.01;
      }

      getRandomColor() {
        const colors = [
          'rgba(100, 200, 255, 0.1)',
          'rgba(255, 100, 200, 0.1)',
          'rgba(100, 255, 150, 0.1)',
          'rgba(255, 200, 100, 0.1)',
          'rgba(150, 100, 255, 0.1)',
          'rgba(255, 150, 100, 0.1)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      generateVertices() {
        const vertices = [];
        const sides = Math.floor(Math.random() * 5) + 3; // 3-7 sides
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const radius = this.size * (0.8 + Math.random() * 0.4);
          vertices.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          });
        }
        return vertices;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Morph vertices
        this.vertices.forEach(vertex => {
          vertex.x += (Math.random() - 0.5) * this.morphSpeed;
          vertex.y += (Math.random() - 0.5) * this.morphSpeed;
        });
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
          ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.strokeStyle = this.color.replace('0.1', '0.3');
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
    }

    class FloatingParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        this.opacity += (Math.random() - 0.5) * 0.01;
        this.opacity = Math.max(0.1, Math.min(0.8, this.opacity));
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('hsl', 'hsla').replace(')', `, ${this.opacity})`);
        ctx.fill();
      }
    }

    // Initialize shapes based on variant
    const initShapes = () => {
      shapes = [];

      if (variant === 'hero') {
        // Fewer, larger shapes for hero section
        for (let i = 0; i < 8; i++) {
          shapes.push(new MorphingShape());
        }
        for (let i = 0; i < 50; i++) {
          shapes.push(new FloatingParticle());
        }
      } else if (variant === 'minimal') {
        // Minimal background
        for (let i = 0; i < 3; i++) {
          shapes.push(new MorphingShape());
        }
        for (let i = 0; i < 20; i++) {
          shapes.push(new FloatingParticle());
        }
      } else {
        // Default dense background
        for (let i = 0; i < 15; i++) {
          shapes.push(new MorphingShape());
        }
        for (let i = 0; i < 100; i++) {
          shapes.push(new FloatingParticle());
        }
      }
    };

    initShapes();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 10, 30, 0.1)');
      gradient.addColorStop(0.5, 'rgba(20, 20, 50, 0.05)');
      gradient.addColorStop(1, 'rgba(10, 10, 30, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      shapes.forEach(shape => {
        shape.update();
        shape.draw();
      });

      time += 0.01;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initShapes();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`animated-background animated-background--${variant}`}
    />
  );
};

export default AnimatedBackground;
