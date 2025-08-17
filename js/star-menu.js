(function(){
  const star = document.getElementById('heroStar');
  const menu = document.getElementById('starMenu');

  if (!star || !menu) return;

  function openMenu()  { menu.hidden = false; star.setAttribute('aria-expanded','true'); }
  function closeMenu() { menu.hidden = true;  star.setAttribute('aria-expanded','false'); }
  function toggleMenu(e){ e.stopPropagation(); menu.hidden ? openMenu() : closeMenu(); }

  star.addEventListener('click', toggleMenu);

  // Закрытие по клику вне
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== star) closeMenu();
  });

  // Закрытие по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) closeMenu();
  });
})();
