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
    const repel = false;


    // Resize canvas
    function resize() {
      const rect = hero.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;
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
      const rect = canvas.getBoundingClientRect();

      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
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
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;

        // Mouse interaction (repel)
        if (mouse.x && mouse.y && repel) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            this.x += dx / 10;
            this.y += dy / 10;
          }
        }

        // Mouse interaction (attract)
        if (mouse.x && mouse.y && !repel) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            this.x -= dx / 75;
            this.y -= dy / 75;
          }
        }

      }

      draw() {

        let opacity = 0.5;

        if (mouse.x && mouse.y) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDistance = 300;

          if (dist < maxDistance) {
            opacity = 0.6 + (1 - dist / maxDistance) * 0.8;
          }
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${opacity})`;
        ctx.fill();
      }
    }

    // Create particles
    const particles = [];
    const PARTICLE_COUNT = getParticleCount();

    function getParticleCount() {
      const area = canvas.width * canvas.height;

      // tweak density (lower = more particles)
      const density = 5000;

      return Math.floor(area / density);
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function connect() {
      const maxParticleDistance = 120;
      const mouseRadius = 400;
      const mouseConnectRadius = 120;
      if (!mouse.x || !mouse.y) return;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {

          // Distance between particles
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxParticleDistance) {

            // Midpoint of line
            const midX = (particles[a].x + particles[b].x) / 2;
            const midY = (particles[a].y + particles[b].y) / 2;

            // Distance to mouse
            const dxMouse = midX - mouse.x;
            const dyMouse = midY - mouse.y;
            const mouseDist = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (mouseDist > mouseRadius) continue;
            let normalized = mouseDist / mouseRadius;
            normalized = Math.min(Math.max(normalized, 0), 1);
            let mouseFactor = Math.pow(1 - normalized, 0.5);
            mouseFactor = Math.min(mouseFactor, 1);
            const particleFactor = 1 - dist / maxParticleDistance;
            const opacity = mouseFactor * particleFactor;

            ctx.strokeStyle = `rgba(${particleColor}, ${opacity})`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      if (mouse.x && mouse.y) {
        for (let i = 0; i < particles.length; i++) {

          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > mouseConnectRadius) continue;

          // Your custom falloff
          const normalized = Math.max(dist / mouseConnectRadius, 0.01);
          let mouseFactor = Math.pow(1 / normalized, 0.35);

          mouseFactor = Math.min(mouseFactor, 1);

          ctx.strokeStyle = `rgba(${particleColor}, ${mouseFactor})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
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

//hamburger menu
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

// Close menu when a link is clicked
navMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", false);
  });
});

// contact form send button
const contactForm = document.getElementById("contact-form");
const formSuccess = document.getElementById("form-success");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  contactForm.style.display = "none";
  formSuccess.style.display = "block";
  return;

  const data = new FormData(contactForm);

  const response = await fetch("https://formspree.io/f/MY_ID_HERE", {
    method: "POST",
    body: data,
    headers: { Accept: "application/json" }
  });

  if (response.ok) {
    contactForm.style.display = "none";
    formSuccess.style.display = "block";
  } else {
    alert("Something went wrong. Please try again or email me directly.");
  }
});