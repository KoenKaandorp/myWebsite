const words = [
  "AI Engineer",
  "Python Developer",
  "Machine Learning Engineer",
  "Problem Solver",
  "Data Scientist"
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

const textElement = document.getElementById("changing-text");

function typeEffect() {
  const currentWord = words[wordIndex];

  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  textElement.textContent = currentWord.substring(0, charIndex);

  if (!isDeleting && charIndex === currentWord.length) {
    isDeleting = true;
    setTimeout(typeEffect, 1000); // pause at full word
    return;
  }

  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
  }

  setTimeout(typeEffect, isDeleting ? 25 : 50);
}

// Make sure DOM is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  typeEffect();
});

// Particle Network Background (standalone)
document.addEventListener("DOMContentLoaded", () => {

(function () {
    const rootStyles = getComputedStyle(document.documentElement);
    const particleColor = rootStyles.getPropertyValue('--particle-color').trim();
    const canvas = document.querySelector(".connecting-dots");
    const ctx = canvas.getContext("2d");
    const hero = document.querySelector(".hero");

  // Resize canvas
function resize() {
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}
  window.addEventListener("resize", resize);
  resize();

  // Mouse position
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = (Math.random() - 0.5) * 1;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Mouse interaction (repel)
      if (mouse.x && mouse.y) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          this.x += dx / 10;
          this.y += dy / 10;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${particleColor})`;
      ctx.fill();
    }
  }

  // Create particles
  const particles = [];
  const PARTICLE_COUNT = 100;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Draw connecting lines
  function connect() {
    const maxDistance = 120;

    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = 1 - dist / maxDistance;

          ctx.strokeStyle = `rgba(${particleColor}, ${opacity})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    connect();

    requestAnimationFrame(animate);
  }

  animate();
})();


});