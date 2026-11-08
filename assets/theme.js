(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var sun = btn.querySelector('.icon-sun');
  var moon = btn.querySelector('.icon-moon');

  function isLight() {
    return root.getAttribute('data-theme') === 'light';
  }
  function updateIcon() {
    if (!sun || !moon) return;
    // icon shows the theme you'll switch TO, not the current one
    sun.style.display = isLight() ? 'none' : 'block';
    moon.style.display = isLight() ? 'block' : 'none';
  }

  updateIcon();

  btn.addEventListener('click', function () {
    if (isLight()) {
      root.removeAttribute('data-theme');
      try { localStorage.setItem('fontes-theme', 'dark'); } catch (e) {}
    } else {
      root.setAttribute('data-theme', 'light');
      try { localStorage.setItem('fontes-theme', 'light'); } catch (e) {}
    }
    updateIcon();
    btn.classList.remove('spin');
    void btn.offsetWidth;
    btn.classList.add('spin');
  });
})();
