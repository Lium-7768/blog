# 项目结构 (Project Structure)

> 最后更新：2026-02-07
> 项目：Lium-7768/blog - Next.js + Supabase Blog

---

## 📁 目录结构

```
blog/
├── app/                          # Next.js App Router
│   ├── api/                   # API Routes
│   │   ├── posts/           # 文章相关 API
│   │   ├── tags/            # 标签 API
│   │   └── upload/          # 图片上传 API
│   ├── admin/                  # 管理后台
│   │   ├── page.tsx          # 仪表板
│   │   └── posts/           # 文章管理
│   ├── login/                  # 登录页
│   ├── logout/                 # 登出 API
│   ├── register/               # 注册页
│   ├── posts/[slug]/           # 文章详情页
│   ├── tags/[slug]/            # 标签列表页
│   └── page.tsx              # 首页
│
├── components/                  # React 组件
│   ├── DeletePostButton.tsx
│   ├── ImageUpload.tsx
│   ├── MobileNav.tsx
│   ├── Pagination.tsx
│   ├── SearchBar.tsx
│   ├── TagCloud.tsx
│   ├── TagInput.tsx
│   └── ThemeToggle.tsx
│
├── lib/                       # 工具库
│   ├── supabase.ts           # 客户端 Supabase 客户端
│   ├── supabase-server.ts     # 服务端 Supabase 客户端
│   └── supabase-admin.ts     # Admin 客户端（绕过 RLS）
│
├── db/                        # 数据库脚本
│   ├── create_admin.sql         # 创建管理员用户
│   ├── create_admin_working.sql
│   ├── fix_email_confirmation.sql
│   ├── migration.sql           # 数据库迁移
│   ├── supabase_schema.sql     # 简化 schema
│   └── supabase_full_schema.sql  # 完整 schema
│
├── docs/                       # 文档
│   ├── planning/              # 项目规划
│   │   ├── ROADMAP.md         # 功能路线图
│   │   ├── UPGRADE_PLAN.md    # 升级计划
│   │   └── UPGRADE_SUMMARY.md # 升级总结
│   └── archived/              # 归档文档
│       └── SECURITY_IMPROVEMENTS.md
│
├── tests/                      # 测试报告
│   └── README.md             # 测试总览
│
├── .env.example                 # 环境变量示例
├── .env.local.example           # 本地环境变量示例
├── .gitignore                  # Git 忽略文件
├── next.config.js              # Next.js 配置
├── package.json                # 项目依赖
├── package-lock.json           # 依赖锁文件
├── postcss.config.js           # PostCSS 配置
├── tailwind.config.js          # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
└── README.md                  # 项目说明

```

---

## 📄 核心文件说明

### 应用程序 (app/)

#### 页面
| 文件 | 路由 | 说明 |
|------|------|------|
| `app/page.tsx` | `/` | 首页，文章列表 |
| `app/posts/[slug]/page.tsx` | `/posts/:slug` | 文章详情页 |
| `app/tags/[slug]/page.tsx` | `/tags/:slug` | 标签文章列表 |
| `app/admin/page.tsx` | `/admin` | 管理仪表板 |
| `app/admin/posts/new/page.tsx` | `/admin/posts/new` | 新建文章 |
| `app/admin/posts/[id]/edit/page.tsx` | `/admin/posts/:id/edit` | 编辑文章 |
| `app/login/page.tsx` | `/login` | 用户登录 |
| `app/register/page.tsx` | `/register` | 用户注册 |
| `app/logout/route.ts` | `/logout` | 登出 API |

#### API Routes
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/posts/[id]` | GET, DELETE | 获取/删除文章 |
| `/api/posts/search` | GET | 搜索文章 |
| `/api/tags` | GET | 获取标签列表 |
| `/api/upload` | POST | 上传图片 |

### 组件 (components/)

| 组件 | 说明 |
|------|------|
| `DeletePostButton.tsx` | 文章删除按钮（带确认） |
| `ImageUpload.tsx` | 图片上传组件（拖拽） |
| `MobileNav.tsx` | 移动端导航 |
| `Pagination.tsx` | 分页组件 |
| `SearchBar.tsx` | 搜索栏（实时搜索） |
| `TagCloud.tsx` | 标签云 |
| `TagInput.tsx` | 标签选择器 |
| `ThemeToggle.tsx` | 深色模式切换 |

### 工具库 (lib/)

| 文件 | 说明 |
|------|------|
| `supabase.ts` | 浏览器端 Supabase 客户端 |
| `supabase-server.ts` | 服务端 Supabase 客户端（配合 cookies） |
| `supabase-admin.ts` | 管理员客户端（绕过 RLS 策略） |

### 数据库 (db/)

| 文件 | 说明 |
|------|------|
| `supabase_schema.sql` | 简化 schema（推荐用于新项目） |
| `supabase_full_schema.sql` | 完整 schema（包含所有函数） |
| `create_admin.sql` | 创建管理员用户的脚本 |
| `migration.sql` | 数据库迁移脚本 |

---

## 🎯 技术栈

### 核心框架
- **Next.js 16.1.6** - React 框架（App Router）
- **React 19.2.4** - UI 库
- **TypeScript 5.7.0** - 类型系统

### 后端
- **Supabase 2.95.3** - 数据库 + 认证
- **PostgreSQL** - 关系型数据库
- **Supabase Storage** - 图片存储

### 样式
- **Tailwind CSS 3.4.17** - CSS 框架
- **PostCSS 8.5.1** - CSS 处理器

### 工具
- **date-fns 4.1.0** - 日期处理
- **lucide-react 0.563.0** - 图标库
- **zod 4.3.6** - 数据验证
- **react-markdown 9.0.3** - Markdown 渲染

### 代码质量
- **ESLint 9.39.2** - 代码检查
- **eslint-config-next 16.1.6** - Next.js ESLint 配置

---

## 🔐 安全特性

- ✅ Supabase Auth（基于 JWT）
- ✅ Row Level Security (RLS)
- ✅ 环境变量保护（.env 不提交到 Git）
- ✅ API 认证中间件
- ✅ 用户所有权验证（删除/更新文章）
- ✅ CSRF 保护（SameSite cookies）
- ✅ 输入验证（Zod）

---

## 📝 开发规范

### Git 工作流
1. 从 `main` 创建新分支
2. 开发功能或修复 bug
3. 提交到分支
4. 创建 Pull Request
5. Code Review
6. 合并到 `main`

### 提交消息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat` - 新功能
- `fix` - Bug 修复
- `chore` - 构建/工具变更
- `docs` - 文档更新
- `refactor` - 代码重构
- `perf` - 性能优化
- `test` - 测试相关

**Scope:**
- `phase-N` - 升级阶段（如 phase-1）
- 特定模块或文件名

### 代码风格
- 使用 TypeScript 类型
- 组件使用 PascalCase
- 工具函数使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

---

## 🚀 部署

### 本地开发
```bash
npm install
npm run dev
```

### 构建生产
```bash
npm run build
npm run start
```

### 部署到 Vercel
```bash
vercel
```

---

## 📚 参考文档

### 项目文档
- [ROADMAP.md](docs/planning/ROADMAP.md) - 功能路线图
- [UPGRADE_PLAN.md](docs/planning/UPGRADE_PLAN.md) - 升级计划
- [UPGRADE_SUMMARY.md](docs/planning/UPGRADE_SUMMARY.md) - 升级总结

### 外部文档
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

## 🔄 维护记录

### 2026-02-07
- ✅ 依赖升级（Next.js 16, React 19, ESLint 9）
- ✅ 替换 @supabase/auth-helpers-nextjs → @supabase/ssr
- ✅ 工程目录整理
- ✅ 创建项目结构文档

---

**最后更新：2026-02-07** 📅
