/* StarMenu click-fix: не даём документу закрывать поповер на клик по аватару и внутри меню */
(function(){
  const starSel = '#heroStar';
  const menuSel = '#starMenu';
  const star = document.querySelector(starSel);
  const menu = document.querySelector(menuSel);
  if (!star || !menu) return;

  /* 1) На фазе захвата отсекаем клики по аватару и по самому меню,
        чтобы любой документ-«закрыватель» в capture не увидел событие */
  document.addEventListener('click', function(e){
    const inStar = e.target.closest(starSel);
    const inMenu = e.target.closest(menuSel);
    if (inStar || inMenu) e.stopPropagation();   // ломаем путь события для capture-наблюдателей
  }, true); // <— важен capture=true

  /* 2) Надёжный тогглер (оставляем родной, но подстраховываемся) */
  function position(){
    // показываем на миг, чтобы измерить
    const wasHidden = menu.hidden;
    if (wasHidden){ menu.hidden = false; menu.style.visibility = 'hidden'; }

    const r = star.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth,  window.innerWidth  || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const w  = menu.offsetWidth, h = menu.offsetHeight;
    let left = r.right - w + window.scrollX;
    let top  = r.bottom + 8 + window.scrollY;
    left = Math.max(8 + window.scrollX, Math.min(left, vw - w - 8 + window.scrollX));
    if (top + h > window.scrollY + vh) top = r.top - h - 8 + window.scrollY;

    menu.style.left = left + 'px';
    menu.style.top  = top  + 'px';

    if (wasHidden){ menu.style.visibility = ''; menu.hidden = true; }
  }

  function open(){ position(); menu.hidden = false; star.setAttribute('aria-expanded','true'); }
  function close(){ menu.hidden = true;  star.setAttribute('aria-expanded','false'); }

  // Если внешний скрипт не повесил обработчик — повесим наш
  star.addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    menu.hidden ? open() : close();
  });

  document.addEventListener('click', function(e){
    if (menu.hidden) return;
    if (e.target.closest(menuSel) || e.target.closest(starSel)) return;
    close();
  });

  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  window.addEventListener('resize', ()=>{ if (!menu.hidden) position(); }, {passive:true});
  window.addEventListener('scroll', ()=>{ if (!menu.hidden) position(); }, {passive:true});

  // наверняка выше всех
  menu.style.zIndex = '100000';
})();
