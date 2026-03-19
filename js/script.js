const button = document.getElementById("darkModeToggle");

button.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // Change button text
    if (document.body.classList.contains("dark")) {
        button.textContent = "☀️";
    } else {
        button.textContent = "🌙";
    }
});