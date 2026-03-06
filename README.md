# Lium 的博客

一个基于 GitHub Pages 的静态个人博客，采用纯 HTML/CSS/JavaScript 构建。

## ✨ 特性

- 🌙 **深色/浅色主题切换** - 自动保存用户偏好
- 📱 **响应式设计** - 完美适配手机、平板和桌面设备
- 🏷️ **标签分类** - 文章按标签分类，支持筛选
- 📖 **多页面架构** - 首页、归档、关于页面
- 🎨 **现代化 UI** - 简洁优雅的设计风格
- ⚡ **快速加载** - 纯静态文件，秒开体验

## 🌐 访问地址

- **GitHub Pages:** https://lium-7768.github.io/blog/

## 📁 项目结构

```
blog/
├── index.html              # 首页（文章列表）
├── about.html              # 关于页面
├── archive.html            # 文章归档（带标签筛选）
├── css/
│   └── style.css           # 全局样式（包含主题变量）
├── js/
│   └── main.js             # 交互脚本（主题切换、平滑滚动等）
├── posts/                  # 博客文章目录
│   ├── hello-world.html
│   ├── javascript-closures.html
│   ├── a-day-in-life.html
│   ├── async-await.html
│   ├── vscode-tips.html
│   └── git-best-practices.html
├── .nojekyll               # 禁用 Jekyll 处理
├── .gitignore              # Git 忽略配置
└── README.md               # 本文件
```

## 🚀 部署方式

博客通过 GitHub Pages 自动部署：

1. 将代码推送到 `main` 分支
2. GitHub Actions 自动构建并部署
3. 几分钟后即可访问

## 📝 添加新文章

1. 在 `posts/` 目录下创建新的 HTML 文件
2. 复制现有文章的头部结构和样式
3. 在 `index.html` 和 `archive.html` 中添加文章链接
4. 提交并推送到 GitHub

## 🎨 主题自定义

编辑 `css/style.css` 中的 CSS 变量：

```css
:root {
  --accent: #3b82f6;        /* 主题色 */
  --accent-light: #dbeafe;  /* 主题色浅色 */
  /* ... 其他变量 */
}
```

## 🛠️ 技术栈

- **HTML5** - 语义化标签
- **CSS3** - 自定义属性（变量）、Grid、Flexbox
- **JavaScript (Vanilla)** - 无框架依赖
- **GitHub Pages** - 静态托管

## 📄 许可证

MIT License
