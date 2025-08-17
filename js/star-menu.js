(function(){
  // 1) Опоры
  const star = document.getElementById('heroStar') || document.querySelector('.hero .star, .starbtn');
  const menu = document.getElementById('starMenu');
  const slot = menu?.querySelector('#starActions');

  if (!star || !menu || !slot) return;

  // 2) Перемещаем (!) существующие узлы (сохранятся обработчики)
  const ids = ['btnNewHero','btnExport','btnImport']; // подставь свои id
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) slot.appendChild(el);
  });

  // 3) Тогглер
  star.addEventListener('click', (e)=>{ e.stopPropagation(); openMenu(); });

  function openMenu(){
    positionMenu();
    menu.hidden = false;
    star.setAttribute('aria-expanded','true');
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKeyDown);
  }
  function closeMenu(){
    menu.hidden = true;
    star.setAttribute('aria-expanded','false');
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeyDown);
  }
  function onDocClick(e){
    if (!menu.contains(e.target) && e.target !== star) closeMenu();
  }
  function onKeyDown(e){ if (e.key === 'Escape') closeMenu(); }

  // 4) Позиционирование около звезды с автопереворотом
  function positionMenu(){
    // чтобы корректно считать размеры, уберём hidden на момент измерений
    const wasHidden = menu.hidden;
    if (wasHidden) { menu.hidden = false; menu.style.visibility = 'hidden'; }

    const r = star.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    const w = menu.offsetWidth;
    const h = menu.offsetHeight;

    let left = r.right - w + window.scrollX;   // выравниваем по правому краю звезды
    let top  = r.bottom + 8 + window.scrollY;  // ниже звезды

    // если не влезает справа/слева — сдвигаем
    left = Math.max(8 + window.scrollX, Math.min(left, vw - w - 8 + window.scrollX));
    // если не влезает вниз — показываем над звездой
    if (top + h > window.scrollY + vh) top = r.top - h - 8 + window.scrollY;

    menu.style.left = left + 'px';
    menu.style.top  = top  + 'px';

    if (wasHidden) { menu.style.visibility = ''; menu.hidden = true; }
  }

  // 5) Перепозиционирование при ресайзе/скролле, если открыт
  const rev = () => { if (!menu.hidden) positionMenu(); };
  window.addEventListener('resize', rev, {passive:true});
  window.addEventListener('scroll', rev, {passive:true});
})();
