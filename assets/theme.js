const themeToggle = document.getElementById('theme-toggle');

// Dark Mode standardmäßig aktivieren
if (localStorage.getItem('theme') !== 'light') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = '☀';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  const isDark = document.body.classList.contains('dark-mode');

  themeToggle.textContent = isDark ? '☀' : '☾';

  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


////////////////////////////////////////////////
// SCROLL TABLE OF CONTENTS
////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  const tocLinks = document.querySelectorAll(".toc-link");

  if (!tocLinks.length) return;

  const sections = Array.from(tocLinks)
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {

          tocLinks.forEach(link => {
            link.classList.remove("is-active");
          });

          const activeLink = document.querySelector(
            `.toc-link[href="#${entry.target.id}"]`
          );

          if (activeLink) {
            activeLink.classList.add("is-active");
          }
        }
      });
    },
    {
      rootMargin: "-20% 0px -65% 0px",
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));
});


////////////////////////////////////////////////
// SCROLL PROGRESS
////////////////////////////////////////////////

const progressBar = document.getElementById('scroll-progress');

if (progressBar) {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const pct = docHeight > 0
        ? (scrollTop / docHeight) * 100
        : 0;

      progressBar.style.width = `${pct}%`;

      ticking = false;
    });
  }, { passive: true });
}


////////////////////////////////////////////////
// COUNTER ANIMATION
////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {

  const counters = document.querySelectorAll(".count-up");

  counters.forEach(counter => {

    const target = parseInt(counter.dataset.target, 10);
    const duration = 3000;
    const startTime = performance.now();

    function updateCounter(currentTime) {

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const current = Math.floor(target * progress);

      counter.textContent = current.toLocaleString("de-DE");

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString("de-DE");
      }
    }

    setTimeout(() => {
      requestAnimationFrame(updateCounter);
    }, 500);

  });

});