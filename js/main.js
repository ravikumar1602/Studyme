// js/main.js

// Store player instances
let players = [];

// Initialize the application
function initApp() {
  // Show loader
  const loader = document.getElementById("loading-overlay");
  if (loader) loader.style.display = "flex";

  // Load header and footer
  includeHTML("header.html", "header", () => {
    highlightActiveNav();
    includeHTML("footer.html", "footer", () => {
      if (loader) loader.style.display = "none";
    });
  });

  // Initialize video player when YouTube API is ready
  window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API is ready');
    // The actual video loading will be triggered by the admin panel data
  };
}

// Function to initialize video player with videos from admin panel
function initVideoPlayer() {
  const carousel = document.getElementById("live-carousel");
  if (!carousel || !window.YT || !window.YT.Player) return;
  
  // Clear existing content
  carousel.innerHTML = '';
  
  // Create video elements based on liveVideosConfig
  liveVideosConfig.forEach((video, index) => {
    const card = document.createElement("div");
    card.className = "live-card";
    card.dataset.index = index;
    card.dataset.description = video.description || '';
    
    const playerId = `ytplayer-${Date.now()}-${index}`;
    card.innerHTML = `
      <div class="live-badge">LIVE NOW</div>
      <div id="${playerId}" class="youtube-player"></div>
    `;
    
    carousel.appendChild(card);
    
    // Initialize YouTube player
    const player = new YT.Player(playerId, {
      videoId: video.videoId,
      playerVars: {
        autoplay: index === 0 ? 1 : 0,
        mute: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        origin: window.location.origin,
        controls: 1,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        showinfo: 0,
        disable_picture_in_picture: 1,
        playsinline: 1,
        cc_load_policy: 0,
        widget_referrer: window.location.href
      },
      events: {
        'onReady': (event) => {
          if (index === 0) {
            event.target.playVideo();
          }
        }
      }
    });
    
    players.push(player);
  });
  
  // Initialize carousel functionality
  initCarousel();
}

// Function to fetch videos from admin panel
async function fetchVideosFromAdmin() {
  try {
    // This should be replaced with your actual admin panel API endpoint
    const response = await fetch('/api/admin/videos');
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    const data = await response.json();
    
    // Initialize videos with data from admin panel
    if (window.initVideosFromAdmin) {
      window.initVideosFromAdmin(data);
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    // You can show an error message to the user here
  }
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', initApp);

// Load YouTube IFrame API after the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
  // Fetch videos from admin panel
  fetchVideosFromAdmin();
});

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
      
      // Force play the first video
      if (index === 0) {
        player.addEventListener('onReady', function() {
          player.mute();
          player.playVideo();
          // Unmute after a short delay to ensure autoplay works
          setTimeout(() => {
            player.unMute();
          }, 1000);
        });
      }
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
