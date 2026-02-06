# 依赖包升级计划 (Dependency Upgrade Plan)

> 创建日期：2026-02-07
> 项目：Lium-7768/blog - Next.js + Supabase Blog

---

## 📊 当前版本 vs 最新稳定版本

| 包名 | 当前版本 | 最新稳定版本 | 升级类型 | 风险等级 |
|------|---------|-------------|---------|---------|
| `next` | 14.2.35 | **16.1.6** | 大版本 | 🔴 高 |
| `react` | 18.3.1 | **19.2.4** | 大版本 | 🟡 中 |
| `react-dom` | 18.3.1 | **19.2.4** | 大版本 | 🟡 中 |
| `@supabase/supabase-js` | 2.94.1 | **2.95.3** | 小版本 | 🟢 低 |
| `lucide-react` | 0.474.0 | **0.563.0** | 小版本 | 🟢 低 |
| `react-markdown` | 9.1.0 | **10.1.0** | 大版本 | 🟡 中 |
| `tailwindcss` | 3.4.19 | **4.1.18** | 大版本 | 🟡 中 |
| `eslint` | 8.57.1 | **9.39.2** | 大版本 | 🟡 中 |
| `eslint-config-next` | 14.2.35 | **16.1.6** | 大版本 | 🟡 中 |
| `@types/node` | 22.19.8 | **25.2.1** | 大版本 | 🟢 低 |
| `autoprefixer` | 10.4.24 | **10.4.24** | 最新 | ✅ 无需升级 |

---

## 🚨 已弃用包（必须替换）

### @supabase/auth-helpers-nextjs ⚠️
**状态：** 已弃用
**替代方案：** `@supabase/ssr`
**影响：** 认证和服务器端客户端初始化

---

## 🎯 升级策略

### 阶段 1：小版本升级（低风险）- 1天
- [ ] 升级 `@supabase/supabase-js`: 2.94.1 → 2.95.3
- [ ] 升级 `lucide-react`: 0.474.0 → 0.563.0

### 阶段 2：大版本升级（中风险）- 3-5天
- [ ] 升级 React: 18.3.1 → 19.2.4
- [ ] 升级 Next.js: 14.2.35 → 16.1.6
- [ ] 升级 Tailwind CSS: 3.4.19 → 4.1.18
- [ ] 升级 ESLint: 8.57.1 → 9.39.2

### 阶段 3：依赖替换 - 1-2天
- [ ] 替换 `@supabase/auth-helpers-nextjs` → `@supabase/ssr`
- [ ] 更新相关导入和用法

---

## 📝 详细升级步骤

### Phase 1: 小版本升级

#### 1.1 升级 @supabase/supabase-js
```bash
npm install @supabase/supabase-js@latest
```

**变更检查：**
- 检查 breaking changes
- 测试数据库连接
- 测试认证流程

#### 1.2 升级 lucide-react
```bash
npm install lucide-react@latest
```

**变更检查：**
- 检查是否有图标名称变更
- 测试所有使用图标的地方

---

### Phase 2: React 19 升级

#### 2.1 升级 React 和 React DOM
```bash
npm install react@^19.0.0 react-dom@^19.0.0
npm install -D @types/react@^19.0.0 @types/react-dom@^19.0.0
```

**重要变更（来自官方文档）：**

1. **Actions（新特性）**
   - 自动处理 pending 状态
   - 自动处理错误
   - 自动处理 optimistic updates
   - 表单自动重置

2. **useOptimistic Hook（新特性）**
   - 管理乐观更新
   - 自动回滚错误状态

3. **Breaking Changes**
   - 一些已弃用的 API 被移除
   - 类型定义变更

**需要检查的文件：**
- `app/page.tsx` - 首页
- `app/admin/page.tsx` - 管理页
- `app/posts/[slug]/page.tsx` - 文章详情页
- 所有表单提交逻辑

**测试清单：**
- [ ] 所有页面正常渲染
- [ ] 表单提交正常工作
- [ ] 状态管理正常
- [ ] 错误处理正常

---

### Phase 3: Next.js 16 升级

#### 3.1 升级 Next.js
```bash
npm install next@^16.0.0
npm install -D eslint-config-next@^16.0.0
```

**参考官方升级指南：**
- https://nextjs.org/docs/app/guides/upgrading

**重要变更：**

1. **Server Actions 改进**
   - 更好的错误处理
   - 更好的类型安全

2. **性能优化**
   - 更快的构建速度
   - 更好的缓存策略

3. **Breaking Changes**
   - 检查 migration guide
   - 更新弃用的 API

**需要检查的文件：**
- `next.config.js` - 配置文件
- 所有 `app/` 目录下的页面
- API routes

**测试清单：**
- [ ] 开发服务器正常启动
- [ ] 生产构建成功
- [ ] 所有路由正常工作
- [ ] ISR/SSR 正常工作
- [ ] 图片优化正常

---

### Phase 4: Tailwind CSS 4 升级

#### 4.1 检查 Node.js 版本
**要求：** Node.js 20 或更高

```bash
node --version
# 如果版本 < 20，需要先升级 Node.js
```

#### 4.2 使用升级工具（推荐）
```bash
npx @tailwindcss/upgrade
```

**升级工具会自动处理：**
- 更新依赖包
- 迁移配置文件到 CSS
- 更新模板文件

#### 4.3 手动升级步骤（如果工具失败）

**1. 更新依赖：**
```bash
npm install -D tailwindcss@latest @tailwindcss/postcss@latest
npm uninstall postcss-import autoprefixer
```

**2. 更新 CSS 文件：**
从：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

改为：
```css
@import "tailwindcss";
```

**3. 更新 PostCSS 配置：**
`postcss.config.js`:
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  }
}
```

**重要变更：**

1. **浏览器要求**
   - Safari 16.4+
   - Chrome 111+
   - Firefox 128+
   - 如果需要支持旧浏览器，保持 Tailwind v3

2. **已移除的工具类**
   - `bg-opacity-*` → 使用 `bg-black/50`
   - `text-opacity-*` → 使用 `text-black/50`
   - `border-opacity-*` → 使用 `border-black/50`
   - `divide-opacity-*` → 使用 `divide-black/50`
   - `ring-opacity-*` → 使用 `ring-black/50`

**需要检查的文件：**
- 所有 `.tsx` 和 `.css` 文件
- 查找并替换已弃用的工具类

**测试清单：**
- [ ] 开发服务器正常启动
- [ ] 样式正常显示
- [ ] 深色模式正常
- [ ] 响应式设计正常
- [ ] 生产构建成功

---

### Phase 5: ESLint 9 升级

#### 5.1 升级 ESLint
```bash
npm install -D eslint@^9.0.0
```

**重要变更：**

1. **Flat Config**（新配置方式）
   - 传统的 `.eslintrc.js` 已弃用
   - 推荐使用 `eslint.config.js`

2. **Breaking Changes**
   - 一些插件可能不兼容
   - 配置格式变更

**迁移步骤：**

1. 创建新配置文件 `eslint.config.js`:
```javascript
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

2. 安装额外依赖（如果需要）:
```bash
npm install -D @eslint/eslintrc @eslint/js
```

3. 删除旧配置:
```bash
rm .eslintrc.js
```

**测试清单：**
- [ ] ESLint 正常工作
- [ ] 代码检查正确
- [ ] 自动修复正常
- [ ] CI/CD 正常运行

---

### Phase 6: 替换 @supabase/auth-helpers-nextjs

#### 6.1 卸载旧包
```bash
npm uninstall @supabase/auth-helpers-nextjs
```

#### 6.2 安装新包
```bash
npm install @supabase/ssr
```

#### 6.3 更新导入

**旧的导入方式：**
```typescript
import { getServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/auth-helpers-nextjs'
```

**新的导入方式：**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
```

#### 6.4 更新服务器端客户端

`lib/supabase-server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

#### 6.5 更新客户端客户端

`lib/supabase.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**需要更新的文件：**
- `lib/supabase-server.ts`
- `lib/supabase.ts`
- `lib/supabase-admin.ts`
- 所有使用 Supabase 客户端的组件

**测试清单：**
- [ ] 认证流程正常
- [ ] 服务器端查询正常
- [ ] 客户端查询正常
- [ ] Cookie/Session 管理正常
- [ ] RLS 策略正常工作

---

## ⚠️ 风险评估

### 高风险操作
- ❌ **不要在主分支直接升级**
- ❌ **不要跳过测试**
- ✅ **在新的特性分支升级**
- ✅ **完整测试后再合并**

### 需要备份的内容
1. `package.json` 和 `package-lock.json`
2. `next.config.js`
3. `postcss.config.js`
4. `tailwind.config.js`
5. 所有 Supabase 客户端文件

---

## 📋 测试清单（升级完成后）

### 功能测试
- [ ] 用户注册/登录/登出
- [ ] 创建文章
- [ ] 编辑文章
- [ ] 删除文章
- [ ] 搜索功能
- [ ] 标签过滤
- [ ] 图片上传
- [ ] 深色模式切换

### 性能测试
- [ ] 首页加载速度
- [ ] 文章详情页加载速度
- [ ] 构建时间
- [ ] Bundle 大小

### 兼容性测试
- [ ] Chrome (最新)
- [ ] Firefox (最新)
- [ ] Safari (最新)
- [ ] 移动端浏览器

### 错误检查
```bash
npm run lint
npm run build
```

---

## 🔄 回滚计划

如果升级后出现问题，按以下步骤回滚：

```bash
# 1. 切换到升级前的分支
git checkout upgrade-backup

# 2. 恢复 package.json 和 lock 文件
git checkout upgrade-backup -- package.json package-lock.json

# 3. 恢复配置文件
git checkout upgrade-backup -- next.config.js postcss.config.js tailwind.config.js

# 4. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 5. 测试
npm run dev
```

---

## 📅 建议的时间表

| 阶段 | 预计时间 | 开始时间 | 完成时间 | 状态 |
|------|---------|---------|---------|------|
| Phase 1: 小版本升级 | 0.5 天 | 待定 | 待定 | ⏳ 待开始 |
| Phase 2: React 19 | 1 天 | 待定 | 待定 | ⏳ 待开始 |
| Phase 3: Next.js 16 | 1-2 天 | 待定 | 待定 | ⏳ 待开始 |
| Phase 4: Tailwind 4 | 1-2 天 | 待定 | 待定 | ⏳ 待开始 |
| Phase 5: ESLint 9 | 0.5 天 | 待定 | 待定 | ⏳ 待开始 |
| Phase 6: Supabase SSR | 1-2 天 | 待定 | 待定 | ⏳ 待开始 |
| 测试和修复 | 1-2 天 | 待定 | 待定 | ⏳ 待开始 |
| **总计** | **6-9 天** | - | - | - |

---

## 💡 最佳实践

1. **一次升级一个主要版本**
   - 不要同时升级 Next.js、React、Tailwind
   - 每个版本升级后充分测试

2. **使用 Git 分支**
   ```bash
   git checkout -b upgrade/nextjs-16
   ```

3. **提交每个阶段**
   ```bash
   git add .
   git commit -m "chore: upgrade Next.js to 16.1.6"
   ```

4. **查看每个版本的 Release Notes**
   - Next.js: https://github.com/vercel/next.js/releases
   - React: https://github.com/facebook/react/releases
   - Tailwind: https://github.com/tailwindlabs/tailwindcss/releases

5. **使用 Codemods（如果可用）**
   ```bash
   npx @next/codemod@latest
   ```

---

## 📞 需要帮助？

- Next.js 文档: https://nextjs.org/docs
- React 文档: https://react.dev
- Tailwind 文档: https://tailwindcss.com/docs
- Supabase 文档: https://supabase.com/docs

---

**准备好开始升级了吗？让我知道你想从哪个阶段开始！** 🚀
