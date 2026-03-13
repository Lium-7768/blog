// 主题切换：持久化、同步 aria-pressed 与 meta theme-color
(function() {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const metaTheme = document.getElementById('themeColor');

  function getSystemPref() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (btn) btn.setAttribute('aria-pressed', 'true');
      if (metaTheme) metaTheme.setAttribute('content', '#0f172a');
    } else {
      root.removeAttribute('data-theme');
      if (btn) btn.setAttribute('aria-pressed', 'false');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }
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

  // 系统主题变更时同步（若用户未手动选择）
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();

// 移动端导航开关
(function() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
    
    // 更新 aria-label
    toggle.setAttribute('aria-label', !expanded ? '关闭主导航' : '打开主导航');
  });

  // 点击导航后关闭菜单
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      toggle.setAttribute('aria-label', '打开主导航');
    }
  });

  // 点击页面其他地方关闭菜单
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      toggle.setAttribute('aria-label', '打开主导航');
    }
  });
})();

// 平滑滚动（保留）
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

// 阅读进度条（仅文章页）
const createProgressBar = () => {
  const progressBar = document.createElement('div');
  progressBar.id = 'reading-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), #8b5cf6);
    z-index: 1000;
    transition: width 0.1s;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  });
};

// 仅在文章页显示进度条
if (document.querySelector('.post-content')) {
  createProgressBar();
}

// 目录生成（仅文章页）
const createTOC = () => {
  const postContent = document.querySelector('.post-content');
  if (!postContent) return;

  const headings = postContent.querySelectorAll('h2, h3');
  if (headings.length < 3) return;

  const toc = document.createElement('div');
  toc.className = 'toc';
  toc.innerHTML = '<h4>目录</h4>';

  const tocList = document.createElement('ul');
  headings.forEach((heading, index) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = heading.textContent;
    a.href = `#heading-${index}`;
    a.style.cssText = `
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      display: block;
      padding: 4px 0;
    `;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    li.style.paddingLeft = heading.tagName === 'H3' ? '20px' : '0';
    li.appendChild(a);
    tocList.appendChild(li);
    heading.id = `heading-${index}`;
  });

  toc.appendChild(tocList);

  const postHeader = document.querySelector('.post-header');
  if (postHeader) {
    toc.style.cssText = `
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 32px;
    `;
    toc.querySelector('h4').style.cssText = `
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: var(--text-primary);
    `;
    tocList.style.cssText = `
      list-style: none;
      margin: 0;
      padding: 0;
    `;
    postHeader.after(toc);
  }
};

createTOC();

// 复制代码按钮
document.querySelectorAll('pre code').forEach((block) => {
  const pre = block.parentElement;
  const button = document.createElement('button');
  button.className = 'copy-code-btn';
  button.textContent = '复制';
  button.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    opacity: 0;
    transition: opacity 0.2s;
  `;

  pre.style.position = 'relative';
  pre.appendChild(button);

  pre.addEventListener('mouseenter', () => {
    button.style.opacity = '1';
  });

  pre.addEventListener('mouseleave', () => {
    button.style.opacity = '0';
  });

  button.addEventListener('click', async () => {
    const text = block.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = '已复制!';
      setTimeout(() => {
        button.textContent = '复制';
      }, 2000);
    } catch (err) {
      button.textContent = '失败';
    }
  });
});
