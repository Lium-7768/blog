# 博客项目改进路线图 (ROADMAP)

> 最后更新：2026-02-07
> 作者：OpenClaw (AI Assistant)
> 项目：Lium-7768/blog - Next.js + Supabase Blog

---

## 📊 项目概况

**技术栈：**
- 框架：Next.js (App Router)
- 数据库：Supabase (PostgreSQL + Auth)
- 样式：Tailwind CSS
- 部署：Vercel

**当前状态：**
- ✅ 基础功能完整（文章CRUD、分类标签、搜索、主题切换）
- ✅ 响应式设计良好
- ✅ SEO优化（动态metadata、Open Graph）
- ✅ 图片上传功能

---

## 🚨 核心问题

### 高优先级问题（P0）
- 🔴 评论功能：数据库有表但未实现前端
- 🔴 编辑器体验：使用普通textarea，无实时预览
- 🔴 草稿自动保存：内容丢失风险高

### 中优先级问题（P1）
- 🟡 缺少后台统计面板
- 🟡 搜索功能不完善
- 🟡 无用户个人资料页
- 🟡 缺少社交互动功能

---

## 🎯 分阶段实施计划

## Phase 1 - 核心体验优化 (预计 1-2 周)

### 1.1 实现评论功能 ⏳ 待开始
**优先级：** P0
**预计时间：** 2-3 天

**任务清单：**
- [ ] 创建评论组件 (`components/CommentList.tsx`)
- [ ] 实现评论发布功能
- [ ] 支持嵌套评论（回复功能）
- [ ] 添加评论审核机制（pending → approved）
- [ ] 评论区样式优化
- [ ] 评论数显示在文章详情页

**技术要点：**
- 使用 `supabase.from('comments').select()`
- 实现递归组件或嵌套数据结构
- 添加乐观更新（立即显示，异步提交）

**文件清单：**
- `app/posts/[slug]/page.tsx` - 添加评论区
- `components/CommentList.tsx` - 新建
- `components/CommentForm.tsx` - 新建
- `app/api/comments/route.ts` - 评论API

---

### 1.2 升级Markdown编辑器 ⏳ 待开始
**优先级：** P0
**预计时间：** 2-3 天

**任务清单：**
- [ ] 选择并集成Markdown编辑器（推荐：react-md-editor）
- [ ] 实现实时预览分屏
- [ ] 添加工具栏（加粗、斜体、代码、链接等）
- [ ] 支持图片拖拽插入
- [ ] 快捷键支持
- [ ] 同步更新到编辑和新建页面

**技术要点：**
- 使用 `react-md-editor` 或 `uiw/react-md-editor`
- 配置主题（light/dark模式）
- 自定义工具栏按钮

**文件清单：**
- `components/MarkdownEditor.tsx` - 新建
- `app/admin/posts/new/page.tsx` - 集成编辑器
- `app/admin/posts/[id]/edit/page.tsx` - 集成编辑器
- `package.json` - 添加依赖

---

### 1.3 草稿自动保存 ⏳ 待开始
**优先级：** P0
**预计时间：** 1-2 天

**任务清单：**
- [ ] 实现localStorage自动保存（每30秒）
- [ ] 添加"已保存/未保存"状态提示
- [ ] 页面离开前确认提示
- [ ] 恢复上次未保存的草稿
- [ ] 清除已发布草稿

**技术要点：**
- 使用 `useEffect` 监听内容变化
- `localStorage.setItem('draft', JSON.stringify(data))`
- `window.addEventListener('beforeunload')`

**文件清单：**
- `hooks/useAutoSave.ts` - 新建hook
- `app/admin/posts/new/page.tsx` - 集成
- `app/admin/posts/[id]/edit/page.tsx` - 集成

---

### 1.4 后台统计面板 ⏳ 待开始
**优先级：** P1
**预计时间：** 2 天

**任务清单：**
- [ ] 创建统计卡片组件
- [ ] 实现数据查询（文章数、阅读量、评论数）
- [ ] 显示热门文章列表（按阅读量排序）
- [ ] 显示近期评论
- [ ] 添加日期筛选器

**技术要点：**
- 使用 Supabase 聚合函数
- `supabase.from('posts').select('*, view_count').order('view_count')`
- 优化查询性能（添加索引）

**文件清单：**
- `app/admin/stats/page.tsx` - 新建统计页
- `components/StatCard.tsx` - 新建
- `components/RecentComments.tsx` - 新建

---

## Phase 2 - 增强功能 (预计 2-3 周)

### 2.1 用户个人资料页 ⏳ 待开始
**优先级：** P1
**预计时间：** 2-3 天

**任务清单：**
- [ ] 创建个人资料页 (`app/profile/[id]/page.tsx`)
- [ ] 显示用户信息（头像、简介、社交链接）
- [ ] 显示用户发布的文章列表
- [ ] 用户资料编辑功能
- [ ] 头像上传

**技术要点：**
- 扩展 `profiles` 表（bio、social_links等字段）
- 图片上传到 Supabase Storage
- 权限控制（只能编辑自己的资料）

**文件清单：**
- `app/profile/[id]/page.tsx` - 新建
- `app/profile/edit/page.tsx` - 新建
- `components/ProfileCard.tsx` - 新建
- `supabase_schema.sql` - 更新schema

---

### 2.2 文章点赞/收藏 ⏳ 待开始
**优先级：** P1
**预计时间：** 2 天

**任务清单：**
- [ ] 创建点赞功能表 (`post_likes`)
- [ ] 点赞按钮组件（支持点赞/取消）
- [ ] 点赞数实时更新
- [ ] 创建收藏功能表 (`post_favorites`)
- [ ] 收藏列表页
- [ ] 添加数据库RLS策略

**技术要点：**
- 使用 upsert 操作（点赞/取消点赞）
- 乐观更新（立即响应）
- 防止重复点赞

**文件清单：**
- `components/LikeButton.tsx` - 新建
- `components/FavoriteButton.tsx` - 新建
- `app/favorites/page.tsx` - 新建
- `supabase_schema.sql` - 添加表

---

### 2.3 相关文章推荐 ⏳ 待开始
**优先级：** P1
**预计时间：** 1-2 天

**任务清单：**
- [ ] 实现推荐算法（按标签、分类匹配）
- [ ] 推荐组件样式
- [ ] 显示在文章详情页底部
- [ ] 添加加载状态

**技术要点：**
- 查询相同标签的其他文章
- 排除当前文章
- 限制数量（3-5篇）

**文件清单：**
- `components/RelatedPosts.tsx` - 新建
- `app/posts/[slug]/page.tsx` - 集成

---

### 2.4 社交分享按钮 ⏳ 待开始
**优先级：** P1
**预计时间：** 1 天

**任务清单：**
- [ ] 创建分享按钮组件
- [ ] 支持 Twitter、Facebook、LinkedIn
- [ ] 支持复制链接
- [ ] 添加分享动画

**文件清单：**
- `components/ShareButtons.tsx` - 新建
- `app/posts/[slug]/page.tsx` - 集成

---

### 2.5 阅读进度条 ⏳ 待开始
**优先级：** P2
**预计时间：** 0.5 天

**任务清单：**
- [ ] 创建进度条组件
- [ ] 监听滚动位置
- [ ] 平滑过渡动画

**文件清单：**
- `components/ReadingProgress.tsx` - 新建
- `app/posts/[slug]/page.tsx` - 集成

---

## Phase 3 - 社区建设 (预计 3-4 周)

### 3.1 用户关注/粉丝系统 ⏳ 待开始
**优先级：** P1
**预计时间：** 3-4 天

**任务清单：**
- [ ] 创建关注表 (`follows`)
- [ ] 关注/取消关注功能
- [ ] 显示粉丝/关注数
- [ ] 关注列表页
- [ ] 首页显示关注用户的文章

**文件清单：**
- `components/FollowButton.tsx` - 新建
- `app/[username]/following/page.tsx` - 新建
- `app/[username]/followers/page.tsx` - 新建
- `supabase_schema.sql` - 添加表

---

### 3.2 评论审核和管理 ⏳ 待开始
**优先级：** P1
**预计时间：** 2 天

**任务清单：**
- [ ] 后台评论管理页面
- [ ] 批准/拒绝/删除评论
- [ ] 标记垃圾评论
- [ ] 评论筛选器

**文件清单：**
- `app/admin/comments/page.tsx` - 新建

---

### 3.3 邮件订阅通知 ⏳ 待开始
**优先级：** P2
**预计时间：** 3-4 天

**任务清单：**
- [ ] 创建订阅表 (`subscriptions`)
- [ ] 订阅表单组件
- [ ] 邮件通知功能（新文章发布）
- [ ] 取消订阅功能
- [ ] 使用 Supabase Edge Functions 发送邮件

**文件清单：**
- `components/SubscribeForm.tsx` - 新建
- `supabase/functions/notify-subscribers/index.ts` - 新建

---

### 3.4 第三方登录 ⏳ 待开始
**优先级：** P2
**预计时间：** 2-3 天

**任务清单：**
- [ ] 集成 Google OAuth
- [ ] 集成 GitHub OAuth
- [ ] 账号关联功能

---

## Phase 4 - 管理优化 (持续进行)

### 4.1 多作者管理 ⏳ 待开始
**优先级：** P2
**预计时间：** 2-3 天

**任务清单：**
- [ ] 角色管理（admin/editor/user）
- [ ] 文章分配给作者
- [ ] 作者列表页
- [ ] 权限控制（不同角色不同权限）

---

### 4.2 定时发布 ⏳ 待开始
**优先级：** P2
**预计时间：** 2 天

**任务清单：**
- [ ] 添加发布时间字段
- [ ] 后台定时任务（Vercel Cron Jobs）
- [ ] 发布状态管理

---

### 4.3 操作日志 ⏳ 待开始
**优先级：** P2
**预计时间：** 2 天

**任务清单：**
- [ ] 创建日志表 (`audit_logs`)
- [ ] 记录重要操作（登录、发布、删除等）
- [ ] 日志查询和筛选
- [ ] 日志导出功能

---

### 4.4 数据备份机制 ⏳ 待开始
**优先级：** P3
**预计时间：** 持续

**任务清单：**
- [ ] 定期备份数据库
- [ ] 图片备份
- [ ] 备份恢复测试

---

## 🔧 技术优化任务

### 性能优化
- [ ] 图片懒加载 (`loading="lazy"`)
- [ ] 使用 Next.js Image 组件优化
- [ ] 代码分割（动态导入）
- [ ] 添加服务端缓存
- [ ] 数据库查询优化（添加索引）

### 安全加固
- [ ] XSS防护（Markdown渲染sanitizer）
- [ ] CSRF防护（重要操作添加token）
- [ ] Rate Limiting（API限流）
- [ ] 文件上传安全验证
- [ ] 敏感信息脱敏

### 代码质量
- [ ] 完善TypeScript类型定义
- [ ] 统一错误处理机制
- [ ] 添加单元测试
- [ ] 添加E2E测试
- [ ] 代码格式化（Prettier）
- [ ] 代码检查（ESLint）

---

## 📋 状态说明

- ⏳ 待开始
- 🔄 进行中
- ✅ 已完成
- ⏸️ 暂停
- ❌ 已取消

---

## 🎉 快速见效改进清单（非功能类）

1. 添加全局loading状态
2. 优化错误提示信息
3. 添加空状态设计
4. 成功操作反馈（toast提示）
5. 优化移动端菜单动画
6. 添加骨架屏加载
7. 优化深色模式切换
8. 添加面包屑导航

---

## 📝 注意事项

1. **开发顺序：** 按Phase顺序执行，每个Phase内按优先级排序
2. **测试要求：** 每个功能完成后进行充分测试
3. **文档更新：** 完成任务后更新此文档状态
4. **Git提交：** 每个功能独立提交，便于回滚
5. **数据库迁移：** schema变更需创建migration文件

---

## 🔄 进度追踪

**当前Phase：** Phase 1 - 核心体验优化
**开始日期：** 2026-02-07
**预计完成：** 2026-02-21

**当前任务：**
- [ ] 1.1 实现评论功能
- [ ] 1.2 升级Markdown编辑器
- [ ] 1.3 草稿自动保存
- [ ] 1.4 后台统计面板

**Phase 1 进度：** 0/4 (0%)

---

## 📞 反馈与协作

如需调整优先级或有新的需求，请在此文档中更新。
每次完成任务后，请在任务前打勾 ✅ 并更新进度百分比。

---

**祝开发顺利！ 🚀**
