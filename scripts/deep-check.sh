#!/bin/bash

echo "========================================="
echo "  Phase 0 深度检查 (Deep Task Check)"
echo "  检查开始时间: $(date)"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# 统计变量
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNING_COUNT=0
ERROR_COUNT=0
CRITICAL_COUNT=0

echo "1️⃣  文件结构深度检查"
echo "-------------------"

# 检查根目录结构
echo "检查根目录文件..."
ROOT_FILES=("package.json" "tsconfig.json" "next.config.js" "postcss.config.js" "tailwind.config.js" ".env.example" ".gitignore" "README.md" ".eslintrc.json" "vercel.json")

for file in "${ROOT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${RESET} $file"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${RESET} $file"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
done

# 检查目录结构
echo ""
echo "检查目录结构..."
DIRS=("app" "components" "lib" "db" "docs" "scripts" "tests")

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        file_count=$(find "$dir" -type f -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l)
        echo -e "${BLUE}📁${RESET} $dir/ ($file_count files)"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${RESET} $dir/"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
done

echo ""
echo "2️⃣  依赖包深度检查"
echo "-------------------"

# 检查 package.json
if [ -f "package.json" ]; then
    echo "package.json 存在"
    
    # 检查 Next.js 版本
    NEXT_VERSION=$(cat package.json | grep -o '"next": "[^"]*' | head -1)
    echo -e "${BLUE}Next.js:${RESET} $NEXT_VERSION"
    
    # 检查 React 版本
    REACT_VERSION=$(cat package.json | grep -o '"react": "[^"]*' | head -1)
    echo -e "${BLUE}React:${RESET} $REACT_VERSION"
    
    # 检查 TypeScript 版本
    TS_VERSION=$(cat package.json | grep -o '"typescript": "[^"]*' | head -1)
    echo -e "${BLUE}TypeScript:${RESET} $TS_VERSION"
    
    # 检查 Tailwind CSS
    TW_VERSION=$(cat package.json | grep -o '"tailwindcss": "[^"]*' | head -1)
    echo -e "${BLUE}Tailwind CSS:${RESET} $TW_VERSION"
    
    # 检查依赖数量
    DEPS_COUNT=$(cat package.json | grep -c '"' | wc -l)
    DEV_DEPS_COUNT=$(cat package.json | grep -c '"devDependencies' -A 1 | xargs cat {} \; | grep -c '"' | wc -l)
    echo -e "${BLUE}总依赖: $DEPS_COUNT 个${RESET}"
    echo -e "${BLUE}开发依赖: $DEV_DEPS_COUNT 个${RESET}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 6))
    PASSED_CHECKS=$((PASSED_CHECKS + 6))
else
    echo -e "${RED}✗${RESET} package.json 不存在"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

echo ""
echo "3️⃣ TypeScript 配置检查"
echo "-------------------"

if [ -f "tsconfig.json" ]; then
    echo "tsconfig.json 存在"
    
    # 检查关键配置
    if grep -q '"jsx": "react-jsx"' tsconfig.json; then
        echo -e "${GREEN}✅${RESET} JSX 运行时: react-jsx"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️${RESET} JSX 运行时可能不是 react-jsx"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    if grep -q '"strict": true' tsconfig.json; then
        echo -e "${GREEN}✅${RESET} 严格模式已启用"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️${RESET} 建议启用严格模式"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    if grep -q '"esModuleInterop": true' tsconfig.json; then
        echo -e "${GREEN}✅${RESET} ES Module Interop 已启用"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️${RESET} 建议启用 ES Module Interop"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    # 检查 paths 和 includes
    if grep -q '"paths"' tsconfig.json; then
        echo -e "${GREEN}✅${RESET} 路径别名已配置"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${CYAN}ℹ️${RESET} 路径别名未配置"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    if grep -q '"include":' tsconfig.json; then
        echo -e "${GREEN}✅${RESET} 文件包含已配置"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${CYAN}ℹ️${RESET} 文件包含未配置"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 6))
else
    echo -e "${RED}✗${RESET} tsconfig.json 不存在"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

echo ""
echo "4️⃣ Next.js 配置检查"
echo "-------------------"

if [ -f "next.config.js" ]; then
    echo "next.config.js 存在"
    
    # 检查关键配置
    if grep -q '"output":"' next.config.js; then
        echo -e "${GREEN}✅${RESET} 输出目录已配置"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${CYAN}ℹ️${RESET} 输出目录未配置（将使用 .next）"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    if grep -q '"reactStrictMode": true' next.config.js; then
        echo -e "${GREEN}✅${RESET} React 严格模式已启用"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️${RESET} 建议启用 React 严格模式"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    if grep -q '"swcMinify": true' next.config.js; then
        echo -e "${GREEN}✅${RESET} SWC 缩小已启用"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${CYAN}ℹ️${RESET} SWC 缩小未启用"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 4))
else
    echo -e "${RED}✗${RESET} next.config.js 不存在"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

echo ""
echo "5️⃣ Tailwind CSS 配置检查"
echo "-------------------"

if [ -f "tailwind.config.js" ]; then
    echo "tailwind.config.js 存在"
    
    # 检查主题配置
    if grep -q '"darkMode": "class"' tailwind.config.js; then
        echo -e "${GREEN}✅${RESET} 深色模式已配置（class 策略）"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️${RESET} 深色模式配置可能不完整"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    if grep -q '"content"' tailwind.config.js; then
        echo -e "${GREEN}✅${RESET} 内容路径已配置"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${CYAN}ℹ️${RESET} 内容路径未配置"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 3))
else
    echo -e "${RED}✗${RESET} tailwind.config.js 不存在"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

echo ""
echo "6️⃣ 环境变量检查"
echo "-------------------"

ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅${RESET} .env 文件存在"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️${RESET} .env 文件不存在（使用 .env.example）"
    WARNING_COUNT=$((WARNING_COUNT + 1))
fi

# 检查 .env.example 是否包含必需变量
if [ -f ".env.example" ]; then
    echo ".env.example 存在"
    
    REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "$var" .env.example; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅${RESET} 所需环境变量已定义"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️${RESET} 缺失环境变量："
        for var in "${MISSING_VARS[@]}"; do
            echo -e "  - $var"
        done
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
else
    echo -e "${RED}✗${RESET} .env.example 不存在"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 5))

echo ""
echo "7️⃣ Git 状态检查"
echo "-------------------"

if command -v git &> /dev/null; then
    echo "Git 已初始化"
    
    # 检查分支状态
    BRANCH=$(git branch --show-current)
    echo -e "${BLUE}当前分支:${RESET} $BRANCH"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️${RESET} 存在未提交的更改"
        UNCOMMITTED_FILES=$(git status --porcelain | wc -l)
        echo -e "  未提交文件: $UNCOMMITTED_FILES 个"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    else
        echo -e "${GREEN}✅${RESET} 工作目录干净"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
    
    # 检查远程仓库连接
    REMOTE_URL=$(git remote get-url origin)
    if [ -n "$REMOTE_URL" ]; then
        echo -e "${GREEN}✅${RESET} 远程仓库已连接: $REMOTE_URL"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${RESET} 远程仓库未连接"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    
    # 获取最近的提交
    if [ -n "$(git log -1 --oneline 2>/dev/null)" ]; then
        LATEST_COMMIT=$(git log -1 --oneline)
        echo -e "${BLUE}最近提交:${RESET} $LATEST_COMMIT"
    else
        echo -e "${YELLOW}⚠️${RESET} 无提交历史"
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 5))
else
    echo -e "${RED}✗${RESET} Git 未初始化"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

echo ""
echo "8️⃣ 新增组件检查"
echo "-------------------"

NEW_COMPONENTS=("PostSkeleton.tsx" "TableOfContents.tsx" "ReadingProgress.tsx" "animations.css")
MISSING_COUNT=0

echo "检查 Phase 0 新增组件..."
for file in "${NEW_COMPONENTS[@]}"; do
    if [ -f "components/$file" ]; then
        echo -e "${GREEN}✅${RESET} $file"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${RESET} $file (缺失)"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        ERROR_COUNT=$((ERROR_COUNT + 1))
        MISSING_COUNT=$((MISSING_COUNT + 1))
    done

if [ -f "app/animations.css" ]; then
    echo -e "${GREEN}✅${RESET} app/animations.css"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${RESET} app/animations.css (缺失)"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    ERROR_COUNT=$((ERROR_COUNT + 1))
    MISSING_COUNT=$((MISSING_COUNT + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 6))

echo ""
echo "========================================="
echo "  检查结果总结 (Summary)"
echo "========================================="
echo ""

echo -e "${BLUE}总检查项:${RESET} $TOTAL_CHECKS"
echo -e "${GREEN}通过项:${RESET} $PASSED_CHECKS"
echo -e "${YELLOW}警告项:${RESET} $WARNING_COUNT"
echo -e "${RED}错误项:${RESET} $ERROR_COUNT"
echo ""

# 评估整体状态
echo "项目状态评估："
if [ $ERROR_COUNT -eq 0 ]; then
    if [ $WARNING_COUNT -eq 0 ]; then
        echo -e "${GREEN}✅${RESET} 项目状态: 优秀（所有检查通过，无警告）"
        echo -e "${CYAN}建议:${RESET} 可以开始新任务"
        TASK_STATUS="ready"
    else
        echo -e "${YELLOW}⚠️${RESET} 项目状态: 良好（通过所有检查，但有一些警告）"
        echo -e "${CYAN}建议:${RESET} 可以开始新任务，但需要注意警告"
        TASK_STATUS="ready_with_warnings"
    fi
else
    echo -e "${RED}❌${RESET} 项目状态: 需要修复（发现错误）"
    echo -e "${CYAN}建议:${RESET} 必须先修复错误，然后再开始新任务"
    TASK_STATUS="needs_fixes"
fi

echo ""
echo "========================================="
echo "  具体建议 (Recommendations)"
echo "========================================="
echo ""

if [ $ERROR_COUNT -gt 0 ]; then
    echo "🔴 必须先修复的错误："
    echo ""
    
    if [ ! -f "components/PostSkeleton.tsx" ]; then
        echo "  1. 创建 PostSkeleton 组件"
    fi
    
    if [ ! -f "components/TableOfContents.tsx" ]; then
        echo "  2. 创建 TableOfContents 组件"
    fi
    
    if [ ! -f "components/ReadingProgress.tsx" ]; then
        echo "  3. 创建 ReadingProgress 组件"
    fi
    
    if [ ! -f "app/animations.css" ]; then
        echo "  4. 创建 animations.css 文件"
    fi
    
    echo ""
    echo "修复命令："
    echo "  cd /root/.openclaw/workspace/blog"
    echo "  npm run dev"
    echo ""
    echo "然后检查页面是否正常加载"
    
elif [ $WARNING_COUNT -gt 0 ]; then
    echo "⚠️  需要注意的警告："
    echo ""
    
    if [ ! -f ".env" ]; then
        echo "  1. 创建 .env 文件（复制 .env.example 并填入实际值）"
    fi
    
    if ! grep -q '"jsx": "react-jsx"' tsconfig.json; then
        echo "  2. 在 tsconfig.json 中设置 jsx 为 react-jsx"
    fi
    
    echo ""
    echo "建议命令："
    echo "  cd /root/.openclaw/workspace/blog"
    echo "  cp .env.example .env"
    echo "  # 编辑 .env 文件，填入你的 Supabase 凭据"
    echo "  npm run dev"
    
else
    echo "✅ 项目状态良好，可以开始新任务！"
    echo ""
    echo "推荐的下一步："
    echo ""
    echo "选项 A: 测试和部署（1-2 天）"
    echo "  - 部署到 Vercel 测试环境"
    echo "  - 验证所有功能正常工作"
    echo "  - 运行性能测试"
    echo ""
    echo "选项 B: 继续优化搜索（2-3 天）"
    echo "  - 添加搜索历史记录"
    echo "  - 添加搜索建议/自动补全"
    echo "  - 显示文章封面缩略图"
    echo "  - 高级筛选面板（按分类、日期、标签）"
    echo ""
    echo "选项 C: 核心功能开发（2-3 周）"
    echo "  - 1.1 实现评论系统（数据库已建表）"
    echo "  - 1.2 升级 Markdown 编辑器"
    echo "  - 1.3 草稿自动保存"
    echo "  - 1.4 后台统计面板"
    echo ""
    echo "开始命令："
    echo "  cd /root/.openclaw/workspace/blog"
    echo "  npm run dev"

echo ""
echo "========================================="
echo "  检查完成 (Check Complete)"
echo "========================================="
echo ""

# 输出任务状态
echo "TASK_STATUS=$TASK_STATUS"
