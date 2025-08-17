/*
  Star Menu Embed — v2.0 (UMD-free, drop-in)
  Подключаемый внешний скрипт для открытия поповера по клику на «звезду» и переноса действий внутрь меню.

  ИСПОЛЬЗОВАНИЕ (на целевом сайте):
  1) Дай триггеру-звезде селектор (например, id="heroStar").
  2) Подключи скрипт с настройками через data-* атрибуты:

     <script defer src="https://cdn.example.com/star-menu-embed.js"
             data-star="#heroStar"
             data-actions="#btnNewHero,#btnExport,#btnImport"
             data-menu="#starMenu"
             data-slot="#starActions"
             data-offset="8"
             data-inject="true"></script>

     — data-inject="true" создаст разметку поповера автоматически, если её нет.
     — Если разметка уже есть, можно поставить data-inject="false".

  3) (Опционально) Отключи старый контейнер с кнопками, если он в шапке.

  Глобальный API: window.StarMenu => { open(), close(), position(), init(cfg) }
*/
(function(){
  var d = document, w = window;

  function ready(fn){ if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn, {once:true}); else fn(); }
  function qs(sel, root){ return (root||d).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||d).querySelectorAll(sel)); }
  function parseSelectors(str){
    if (!str) return [];
    return String(str).split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  }

  function injectCSS(){
    if (qs('#dl-star-menu-style')) return;
    var css = '
.dl-star-anchor{ position:relative; overflow:visible; }
.dl-star-menu[hidden]{ display:none; }
.dl-star-menu{ position:absolute; top:calc(100% + 8px); right:0; z-index:100000; min-width:240px; padding:12px; border-radius:16px; background:#0f1829; border:1px solid rgba(255,255,255,.06); box-shadow:0 10px 30px rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.03); }
.dl-star-actions{ display:flex; flex-wrap:wrap; gap:8px; }
.dl-star-menu .btn, .dl-star-menu button, .dl-star-menu label{ flex:1 1 auto; }
';
    var style = d.createElement('style');
    style.id = 'dl-star-menu-style';
    style.textContent = css; d.head.appendChild(style);
  }

  function ensureMenu(starEl, menuSel, slotSel, inject){
    var menu = qs(menuSel);
    var slot;
    if (!menu && inject){
      // создаём разметку поповера рядом со звездой (якорём делаем ближайшего родителя)
      var anchor = starEl.closest('.dl-star-anchor') || starEl.parentElement;
      if (anchor){ anchor.classList.add('dl-star-anchor'); }
      else { anchor = d.body; }
      menu = d.createElement('div');
      menu.id = menuSel.replace('#','');
      menu.className = 'dl-star-menu';
      menu.setAttribute('role','menu');
      menu.hidden = true;
      var title = d.createElement('div'); title.className = 'dl-star-title'; title.textContent = 'Твой персонаж';
      slot = d.createElement('div'); slot.className = 'dl-star-actions'; slot.id = slotSel.replace('#','');
      menu.appendChild(title); menu.appendChild(slot);
      anchor.appendChild(menu);
    }
    slot = slot || qs(slotSel, menu);
    return { menu: menu, slot: slot };
  }

  function positionMenu(starEl, menuEl, offset){
    // Если меню в обычном потоке (через CSS top/right) — выходим
    if (!menuEl || menuEl.hidden) return;
    // Переопределяем координаты, если меню не помещается в вьюпорт
    var r = starEl.getBoundingClientRect();
    var vw = Math.max(d.documentElement.clientWidth,  w.innerWidth  || 0);
    var vh = Math.max(d.documentElement.clientHeight, w.innerHeight || 0);
    // Временно показываем для измерений, если display:none
    var wasHidden = menuEl.hidden;
    if (wasHidden){ menuEl.hidden = false; menuEl.style.visibility = 'hidden'; }
    var wMenu = menuEl.offsetWidth, hMenu = menuEl.offsetHeight;
    var left = r.right - wMenu + w.scrollX;
    var top  = r.bottom + (offset||8) + w.scrollY;
    left = Math.max(8 + w.scrollX, Math.min(left, vw - wMenu - 8 + w.scrollX));
    if (top + hMenu > w.scrollY + vh) top = r.top - hMenu - (offset||8) + w.scrollY;
    menuEl.style.left = left + 'px';
    menuEl.style.top  = top  + 'px';
    if (wasHidden){ menuEl.style.visibility=''; menuEl.hidden = true; }
  }

  function init(cfg){
    cfg = cfg || {};
    var starSel = cfg.star || '#heroStar';
    var menuSel = cfg.menu || '#starMenu';
    var slotSel = cfg.slot || '#starActions';
    var actions = Array.isArray(cfg.actions) ? cfg.actions : parseSelectors(cfg.actions || '#btnNewHero,#btnExport,#btnImport');
    var offset  = Number(cfg.offset || 8);
    var inject  = cfg.inject !== undefined ? !!cfg.inject : !qs(menuSel);

    var star = qs(starSel) || qs('.hero .star, .starbtn');
    if (!star) return console.warn('[StarMenu] Не найден триггер по селектору', starSel), null;

    injectCSS();
    var refs = ensureMenu(star, menuSel, slotSel, inject);
    var menu = refs.menu, slot = refs.slot;
    if (!menu || !slot) return console.warn('[StarMenu] Не удалось подготовить меню/слот.'), null;

    // Перенос действий
    actions.forEach(function(sel){ var el = qs(sel); if (el) slot.appendChild(el); });

    function open(){ positionMenu(star, menu, offset); menu.hidden = false; star.setAttribute('aria-expanded','true'); d.addEventListener('click', onDocClick, true); d.addEventListener('keydown', onKeyDown); }
    function close(){ menu.hidden = true; star.setAttribute('aria-expanded','false'); d.removeEventListener('click', onDocClick, true); d.removeEventListener('keydown', onKeyDown); }
    function toggle(ev){ ev && ev.stopPropagation(); menu.hidden ? open() : close(); }
    function onDocClick(e){ if (!menu.contains(e.target) && e.target !== star) close(); }
    function onKeyDown(e){ if (e.key === 'Escape') close(); }

    star.setAttribute('aria-haspopup','menu');
    star.setAttribute('aria-controls', menu.id);
    star.addEventListener('click', toggle);

    function re(){ if (!menu.hidden) positionMenu(star, menu, offset); }
    w.addEventListener('resize', re, {passive:true});
    w.addEventListener('scroll', re, {passive:true});

    return { open: open, close: close, position: function(){ positionMenu(star, menu, offset); }, init: init, config: cfg };
  }

  // Автоконфиг из атрибутов <script>
  ready(function(){
    var s = d.currentScript || qsa('script[data-star],script[data-actions]').slice(-1)[0];
    var cfg = s ? {
      star:   s.dataset.star,
      menu:   s.dataset.menu,
      slot:   s.dataset.slot,
      actions:s.dataset.actions,
      offset: s.dataset.offset,
      inject: s.dataset.inject === 'true'
    } : {};
    var api = init(cfg);
    if (api) w.StarMenu = api; else w.StarMenu = { init: init };
  });
})();
