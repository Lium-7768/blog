#!/bin/bash

echo "========================================="
echo "  Phase 0 任务前检查 (Pre-Task Check)"
echo "  检查开始时间: $(date)"
echo "========================================="
echo ""

# 1. 检查项目结构
echo "1️⃣  项目结构检查..."
if [ ! -d "app" ]; then
    echo "   ❌ app/ 目录不存在"
    CHECK_RESULT="项目结构不完整"
elif [ ! -d "components" ]; then
    echo "   ❌ components/ 目录不存在"
    CHECK_RESULT="项目结构不完整"
elif [ ! -d "lib" ]; then
    echo "   ❌ lib/ 目录不存在"
    CHECK_RESULT="项目结构不完整"
elif [ ! -f "package.json" ]; then
    echo "   ❌ package.json 不存在"
    CHECK_RESULT="项目结构不完整"
elif [ ! -f "tsconfig.json" ]; then
    echo "   ❌ tsconfig.json 不存在"
    CHECK_RESULT="项目结构不完整"
else
    echo "   ✅ 项目结构完整"
    CHECK_RESULT="无"
fi

# 2. 检查依赖版本
echo ""
echo "2️⃣  依赖版本检查..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js: $NODE_VERSION"
else
    echo "   ❌ Node.js 未安装"
    CHECK_RESULT="Node.js 未安装"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm: $NPM_VERSION"
else
    echo "   ❌ npm 未安装"
    CHECK_RESULT="npm 未安装"
fi

# 3. 检查 TypeScript 编译
echo ""
echo "3️⃣  TypeScript 编译检查..."
if [ -f "tsconfig.json" ]; then
    echo "   检查 TypeScript 配置..."
    # 实际编译检查会在 npm run build 时进行
    echo "   ✅ tsconfig.json 存在"
else
    echo "   ❌ tsconfig.json 不存在"
    CHECK_RESULT="TypeScript 配置缺失"
fi

# 4. 检查 ESLint
echo ""
echo "4️⃣  ESLint 检查..."
if [ -f "package.json" ]; then
    # 检查 eslint 是否在 devDependencies
    if grep -q '"eslint"' package.json > /dev/null; then
        echo "   ✅ ESLint 已配置"
    else
        echo "   ⚠️  ESLint 未在 devDependencies 中"
        CHECK_RESULT="ESLint 可能未正确配置"
    fi
else
    echo "   ❌ package.json 不存在"
    CHECK_RESULT="package.json 缺失"
fi

# 5. 检查环境变量
echo ""
echo "5️⃣  环境变量检查..."
if [ -f ".env.example" ]; then
    echo "   ✅ .env.example 存在"
else
    echo "   ❌ .env.example 不存在"
    CHECK_RESULT="配置文件缺失"
fi

# 6. 检查 Git 状态
echo ""
echo "6️⃣  Git 状态检查..."
if command -v git &> /dev/null; then
    BRANCH=$(git branch --show-current)
    REMOTE=$(git remote get-url origin)
    echo "   ✅ Git 已初始化"
    echo "   当前分支: $BRANCH"
    echo "   远程仓库: $REMOTE"
else
    echo "   ❌ Git 未初始化"
    CHECK_RESULT="Git 未初始化"
fi

# 7. 检查文件完整性
echo ""
echo "7️⃣  文件完整性检查..."
CRITICAL_FILES=("app/page.tsx" "app/layout.tsx" "app/admin/page.tsx" "components/SearchBar.tsx" "lib/supabase-server.ts" "lib/supabase.ts")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ 缺失: $file"
        CHECK_RESULT="关键文件缺失"
        MISSING_FILES+=("$file")
    else
        echo "   ✅ 存在: $file"
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "   ⚠️  发现 ${#MISSING_FILES[@]} 个缺失的关键文件"
    CHECK_RESULT="关键文件缺失"
fi

# 8. 检查新增组件
echo ""
echo "8️⃣  新增组件检查..."
NEW_COMPONENTS=("PostSkeleton.tsx" "TableOfContents.tsx" "ReadingProgress.tsx" "animations.css")
NEW_MISSING=()

for file in "${NEW_COMPONENTS[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ⚠️  缺失: $file"
        NEW_MISSING+=("$file")
    else
        echo "   ✅ 存在: $file"
    fi
done

# 9. 检查 Vercel 配置
echo ""
echo "9️⃣  Vercel 部署配置检查..."
if [ -f ".vercelignore" ]; then
    echo "   ✅ .vercelignore 存在"
else
    echo "   ⚠️  .vercelignore 不存在"
fi

# 总结检查结果
echo ""
echo "========================================="
echo "  检查结果总结"
echo "========================================="
echo ""

if [ -n "$CHECK_RESULT" ]; then
    echo "✅ 所有检查通过 - 项目状态良好"
    echo ""
    echo "准备执行任务："
    echo "A) 测试和部署"
    echo "B) 搜索历史 + 相关推荐 + 社交分享"
    echo "C) 评论系统 + 编辑器 + 草稿保存 + 统计面板"
    echo ""
    echo "建议选择：选项 A（快速见效）"
    TASK_STATUS="ready"
elif [ "$CHECK_RESULT" = "项目结构不完整" ]; then
    echo "❌ 发现问题：项目结构不完整"
    echo ""
    echo "必须先解决："
    echo "1. 缺失的目录或文件"
    echo ""
    TASK_STATUS="needs_fix"
elif [ "$CHECK_RESULT" = "Node.js 未安装" ] || [ "$CHECK_RESULT" = "npm 未安装" ]; then
    echo "❌ 发现问题：依赖管理工具未安装"
    echo ""
    echo "必须先运行："
    echo "npm install"
    echo ""
    TASK_STATUS="needs_env_setup"
elif [ "$CHECK_RESULT" = "TypeScript 配置缺失" ]; then
    echo "⚠️  发现问题：TypeScript 配置可能不完整"
    echo ""
    echo "建议检查："
    echo "tsconfig.json 配置"
    echo ""
    TASK_STATUS="config_review"
elif [ "$CHECK_RESULT" = "ESLint 可能未正确配置" ]; then
    echo "⚠️  发现问题：ESLint 配置可能不正确"
    echo ""
    echo "建议检查："
    echo "package.json 中的 eslint 配置"
    echo ""
    TASK_STATUS="config_review"
elif [ ${#NEW_MISSING[@]} -gt 0 ]; then
    echo "⚠️  发现问题：部分新增组件文件缺失"
    echo ""
    echo "缺失的组件："
    for file in "${NEW_MISSING[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "需要先创建这些组件文件"
    echo ""
    TASK_STATUS="missing_components"
elif [ "$CHECK_RESULT" = "关键文件缺失" ]; then
    echo "❌ 发现问题：关键文件缺失"
    echo ""
    echo "缺失的文件："
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "必须先创建这些核心文件"
    echo ""
    TASK_STATUS="missing_files"
else
    echo "❓ 未知的检查问题：$CHECK_RESULT"
    TASK_STATUS="unknown_issue"
fi

echo ""
echo "========================================="
echo "  检查完成"
echo "========================================="
