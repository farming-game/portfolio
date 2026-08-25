////////////////////////////////////////////////
// DARK MODE (fest, kein Umschalten mehr)
////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add('dark-mode');
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