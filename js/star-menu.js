// Star Menu Script — v1.1
// Делает поповер у звезды и переносит в него кнопки действий.
// ВЫЗОВ: initStarMenu({
//   star:   '#heroStar',         // селектор кнопки со звездой
//   menu:   '#starMenu',         // селектор контейнера поповера
//   slot:   '#starActions',      // селектор места, куда класть кнопки
//   actions:['#btnNewHero','#btnExport','#btnImport'], // селекторы переносимых узлов
//   offset: 8                    // отступ от звезды, px
// })

(function(){
  function initStarMenu({
    star = '#heroStar',
    menu = '#starMenu',
    slot = '#starActions',
    actions = ['#btnNewHero','#btnExport','#btnImport'],
    offset = 8
  } = {}){
    const starEl = document.querySelector(star) || document.querySelector('.hero .star, .starbtn');
    const menuEl = document.querySelector(menu);
    const slotEl = document.querySelector(slot);
    if (!starEl || !menuEl || !slotEl) return;

    // Переносим существующие элементы (сохраняются все обработчики)
    actions.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) slotEl.appendChild(el);
    });

    function openMenu(){
      positionMenu();
      menuEl.hidden = false;
      starEl.setAttribute('aria-expanded','true');
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeyDown);
    }
    function closeMenu(){
      menuEl.hidden = true;
      starEl.setAttribute('aria-expanded','false');
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onKeyDown);
    }
    function onDocClick(e){ if (!menuEl.contains(e.target) && e.target !== starEl) closeMenu(); }
    function onKeyDown(e){ if (e.key === 'Escape') closeMenu(); }

    function positionMenu(){
      const wasHidden = menuEl.hidden;
      if (wasHidden) { menuEl.hidden = false; menuEl.style.visibility = 'hidden'; }

      const r  = starEl.getBoundingClientRect();
      const vw = Math.max(document.documentElement.clientWidth,  window.innerWidth  || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const w = menuEl.offsetWidth;
      const h = menuEl.offsetHeight;

      let left = r.right - w + window.scrollX;   // по правому краю звезды
      let top  = r.bottom + offset + window.scrollY;  // под звездой

      left = Math.max(8 + window.scrollX, Math.min(left, vw - w - 8 + window.scrollX));
      if (top + h > window.scrollY + vh) top = r.top - h - offset + window.scrollY; // переворот вверх

      menuEl.style.left = left + 'px';
      menuEl.style.top  = top  + 'px';

      if (wasHidden) { menuEl.style.visibility = ''; menuEl.hidden = true; }
    }

    function reposition(){ if (!menuEl.hidden) positionMenu(); }

    starEl.addEventListener('click', (e)=>{ e.stopPropagation(); openMenu(); });
    window.addEventListener('resize', reposition, {passive:true});
    window.addEventListener('scroll', reposition, {passive:true});

    return { open: openMenu, close: closeMenu, position: positionMenu };
  }

  // Экспорт в глобальную область и автозапуск после загрузки DOM
  window.initStarMenu = initStarMenu;
  document.addEventListener('DOMContentLoaded', ()=> initStarMenu());
})();

