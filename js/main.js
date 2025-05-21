// js/main.js

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Store player instances
let players = [];

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
  const indicatorsContainer = document.getElementById("carousel-indicators");
  const prevButton = document.querySelector(".carousel-button.prev");
  const nextButton = document.querySelector(".carousel-button.next");
  let currentIndex = 0;
  let autoSlideInterval;
  const SLIDE_INTERVAL = 10000; // 10 seconds

  if (!carousel || !descText || !indicatorsContainer || !Array.isArray(liveVideosConfig) || liveVideosConfig.length === 0) return;

  // Create cards and indicators
  liveVideosConfig.forEach(({ videoId, description }, index) => {
    // Create card
    const card = document.createElement("div");
    card.className = "live-card";
    card.dataset.index = index;
    card.dataset.description = description;
    // Create video container with unique ID
    const playerId = `ytplayer-${Date.now()}-${index}`;
    card.innerHTML = `
      <div class="live-badge">LIVE NOW</div>
      <div id="${playerId}" class="youtube-player"></div>
    `;
    
    // Store player configuration
    const playerConfig = {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        origin: window.location.origin,
        controls: 0,  // Hide controls
        disablekb: 1,  // Disable keyboard controls
        fs: 0,  // Disable fullscreen button
        iv_load_policy: 3,  // Hide annotations
        showinfo: 0,  // Hide video title and uploader
        disable_picture_in_picture: 1,  // Disable picture-in-picture
        playsinline: 1,  // Play inline on iOS
        cc_load_policy: 0,  // Hide captions by default
        widget_referrer: window.location.href,  // Set referrer
        origin: window.location.origin
      },
      events: {
        'onReady': (event) => {
          // Mute the player when it's ready
          event.target.mute();
          // Start playing the video
          event.target.playVideo();
        }
      }
    };
    
    // Create YouTube player instance
    if (window.YT && window.YT.Player) {
      const player = new YT.Player(playerId, playerConfig);
      players.push(player);
    }
    carousel.appendChild(card);

    // Create indicator
    const indicator = document.createElement("button");
    indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
    indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
    indicator.dataset.index = index;
    indicatorsContainer.appendChild(indicator);
  });

  const cards = carousel.querySelectorAll(".live-card");
  const indicators = indicatorsContainer.querySelectorAll(".carousel-indicator");
  const totalSlides = cards.length;

  // Initialize
  updateActiveState(0);
  startAutoSlide();

  // Navigation functions
  function goToSlide(index) {
    index = (index + totalSlides) % totalSlides; // Handle wrap-around
    currentIndex = index;
    updateActiveState(index);
    
    // Calculate scroll position
    const cardWidth = cards[0].offsetWidth;
    const scrollPosition = index * cardWidth;
    
    // Smooth scroll to the card
    carousel.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
    
    // Update description
    const description = cards[index].dataset.description || 'No description available';
    document.getElementById('live-desc-text').textContent = description;
  }

  function updateActiveState(index) {
    // Update cards
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    // Update description
    descText.textContent = cards[index].dataset.description || "";
  }

  function slideNext() {
    goToSlide(currentIndex + 1);
    resetAutoSlide();
  }

  function slidePrev() {
    goToSlide(currentIndex - 1);
    resetAutoSlide();
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(slideNext, SLIDE_INTERVAL);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
  }

  function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // Event Listeners
  nextButton.addEventListener('click', slideNext);
  prevButton.addEventListener('click', slidePrev);

  indicators.forEach(indicator => {
    indicator.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (index !== currentIndex) {
        goToSlide(index);
        resetAutoSlide();
      }
    });
  });

  // Pause auto-slide on hover
  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);

  // Handle keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      slideNext();
    } else if (e.key === 'ArrowLeft') {
      slidePrev();
    }
  });

  // Handle touch events for swipe
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoSlide();
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoSlide();
  }, { passive: true });

  function handleSwipe() {
    const SWIPE_THRESHOLD = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        slideNext();
      } else {
        slidePrev();
      }
    }
  }
});
