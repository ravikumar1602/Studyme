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

    if (href === currentUrl || currentUrl.includes(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


    // Normalize homepage path
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

// Function to toggle the mobile menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('show');
}
