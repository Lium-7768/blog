// 主题切换：持久化、无闪烁
(function() {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const metaTheme = document.getElementById('themeColor');

  function getSystemPref() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    // 开启过渡动画
    root.classList.add('theme-animating');
    
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (btn) btn.setAttribute('aria-pressed', 'true');
      if (metaTheme) metaTheme.setAttribute('content', '#0f172a');
    } else {
      root.removeAttribute('data-theme');
      if (btn) btn.setAttribute('aria-pressed', 'false');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }
    
    // 移除过渡动画类
    setTimeout(() => root.classList.remove('theme-animating'), 300);
  }

  // 初始化
  const saved = localStorage.getItem('theme');
  applyTheme(saved || getSystemPref());

  // 点击切换
  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }

  // 系统主题变更
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();

// 移动端导航抽屉
(function() {
  const menuToggle = document.getElementById('menuToggle');
  const navOverlay = document.getElementById('navOverlay');
  const navDrawer = document.getElementById('navDrawer');
  
  if (!menuToggle || !navOverlay || !navDrawer) return;
  
  let previousFocus = null;

  function openMenu() {
    previousFocus = document.activeElement;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', '关闭菜单');
    document.documentElement.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
    
    // 焦点移到抽屉第一个链接
    const firstLink = navDrawer.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开菜单');
    document.documentElement.classList.remove('nav-open');
    document.body.style.overflow = '';
    
    // 焦点还原
    if (previousFocus) previousFocus.focus();
  }

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // 点击遮罩关闭
  navOverlay.addEventListener('click', closeMenu);

  // 点击链接后关闭
  navDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Esc 键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.documentElement.classList.contains('nav-open')) {
      closeMenu();
    }
  });
})();

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});
