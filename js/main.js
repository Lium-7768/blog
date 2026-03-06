// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to light mode
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Smooth scroll for anchor links
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

// Reading progress indicator (for post pages)
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

// Only show progress bar on post pages
if (document.querySelector('.post-content')) {
  createProgressBar();
}

// Table of Contents (for post pages)
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

    // Add level based on h2/h3
    li.style.paddingLeft = heading.tagName === 'H3' ? '20px' : '0';
    li.appendChild(a);
    tocList.appendChild(li);

    // Add id to heading
    heading.id = `heading-${index}`;
  });

  toc.appendChild(tocList);

  // Insert TOC after post header
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

// Copy code button (for post pages)
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
