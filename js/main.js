// 主题切换：持久化、无闪烁、同步 theme-color
(function() {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var metaTheme = document.getElementById('themeColor');
  var key = 'theme';
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(t, animate) {
    if (animate) {
      root.classList.add('theme-animating');
      setTimeout(function() { root.classList.remove('theme-animating'); }, 300);
    }
    
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (metaTheme) metaTheme.setAttribute('content', '#0f172a');
      if (btn) btn.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
      if (btn) btn.setAttribute('aria-pressed', 'false');
    }
  }

  // 初始化
  var saved = localStorage.getItem(key);
  applyTheme(saved || (prefersDark.matches ? 'dark' : 'light'), false);

  // 点击切换
  if (btn) {
    btn.addEventListener('click', function() {
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(key, next);
      applyTheme(next, true);
    });
  }

  // 系统主题变更
  prefersDark.addEventListener('change', function(e) {
    if (!localStorage.getItem(key)) {
      applyTheme(e.matches ? 'dark' : 'light', true);
    }
  });
})();

// 移动端导航抽屉（焦点陷阱 + Esc 关闭）
(function() {
  var drawer = document.getElementById('navDrawer');
  var overlay = document.getElementById('navOverlay');
  var btn = document.getElementById('menuToggle');
  
  if (!drawer || !overlay || !btn) return;
  
  var focusable, lastActive, opened = false;

  function setOpen(open) {
    opened = open;
    document.documentElement.classList.toggle('nav-open', open);
    drawer.setAttribute('aria-hidden', !open);
    btn.setAttribute('aria-expanded', open);
    
    if (open) {
      lastActive = document.activeElement;
      focusable = drawer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
    } else {
      if (lastActive) lastActive.focus();
    }
  }

  btn.addEventListener('click', function() { setOpen(!opened); });
  overlay.addEventListener('click', function() { setOpen(false); });

  document.addEventListener('keydown', function(e) {
    if (!opened) return;
    
    if (e.key === 'Escape') {
      setOpen(false);
    }
    
    if (e.key === 'Tab' && focusable && focusable.length) {
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    var href = this.getAttribute('href');
    if (href !== '#' && href.length > 1) {
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});
