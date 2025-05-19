// js/main.js

// Show the loader immediately when the script runs
const loader = document.getElementById("loading-overlay");
if (loader) loader.style.display = "flex";

// Load header and footer as early as possible
includeHTML("header.html", "header", () => {
    highlightActiveNav();

    includeHTML("footer.html", "footer", () => {
        // Once both header and footer are loaded, hide the loader
        if (loader) loader.style.display = "none";
    });
});

// Function to fetch and include HTML content dynamically
function includeHTML(file, id, callback) {
    fetch(file)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to load ${file}`);
            }
            return res.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => {
            console.error(error);
        });
}

// Function to highlight the active nav link based on current URL
function highlightActiveNav() {
    const links = document.querySelectorAll('.nav-links a');
    let currentUrl = window.location.pathname;

    // Normalize path for homepage
    if (currentUrl === '/' || currentUrl === '/index.html') {
        currentUrl = 'index.html';
    }

    links.forEach(link => {
        const href = link.getAttribute('href');

        // Simple check: exact match or currentUrl contains href
        if (href === currentUrl || currentUrl.includes(href)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to toggle the mobile menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

// Contact form submit handling
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const messageBox = document.getElementById("formMessage");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get values
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      // Simple check (you can expand this later)
      if (name && email && message) {
        messageBox.textContent = "Thank you! Your message has been sent.";
        messageBox.style.color = "green";

        // Clear form
        form.reset();
      } else {
        messageBox.textContent = "Please fill out all fields.";
        messageBox.style.color = "red";
      }
    });
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("live-carousel");
  const descText = document.getElementById("live-desc-text");

  if (!carousel || !descText || !Array.isArray(liveVideosConfig) || liveVideosConfig.length === 0) return;

  // Dynamically generate live video cards
  liveVideosConfig.forEach(({ videoId, description }) => {
    const card = document.createElement("div");
    card.className = "live-card";
    card.dataset.description = description;
    card.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        allowfullscreen
        loading="lazy"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    `;
    carousel.appendChild(card);
  });

  const cards = carousel.querySelectorAll(".live-card");
  let currentIndex = 0;

  // Initialize description
  descText.textContent = cards[0].dataset.description || "";

  function slideNext() {
    currentIndex++;
    if (currentIndex >= cards.length) {
      currentIndex = 0;
    }

    carousel.scrollTo({
      left: cards[currentIndex].offsetLeft,
      behavior: "smooth"
    });

    descText.textContent = cards[currentIndex].dataset.description || "";
  }

  // Slide every 10 seconds
  setInterval(slideNext, 10000);
});
