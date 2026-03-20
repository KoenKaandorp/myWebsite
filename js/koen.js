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