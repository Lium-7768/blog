#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 新闻日报生成器 - 安全版
从 RSS 抓取新闻，调用 AI 生成文章，推送到博客
"""

import os
import re
import sys
import html
import hashlib
import feedparser
import requests
from datetime import datetime
from pathlib import Path

# 配置
API_BASE = os.environ.get("API_BASE", "")
API_KEY = os.environ.get("API_KEY", "")
MODEL = "gpt-5"

# RSS 白名单（只允许这些域名）
RSS_SOURCES = [
    ("Hacker News AI", "https://hnrss.org/newest?q=AI+OR+GPT+OR+LLM"),
    ("GitHub Trending", "https://mshibanami.github.io/GitHubTrendingRSS/daily.xml"),
    ("AI News", "https://artificialintelligence-news.com/feed/"),
]

# 安全配置
MAX_NEWS_ITEMS = 15
MAX_SUMMARY_LENGTH = 300
MAX_TITLE_LENGTH = 80
MAX_FILE_SIZE = 200 * 1024  # 200KB
REQUEST_TIMEOUT = 30


def slugify(text, max_length=60):
    """
    安全生成文件名（只保留字母、数字、连字符）
    """
    # 转小写
    text = text.lower().strip()
    # 移除特殊字符，只保留字母数字和空格
    text = re.sub(r'[^\w\s-]', '', text)
    # 空格和多个连字符合并为单个连字符
    text = re.sub(r'[-\s]+', '-', text)
    # 限制长度
    text = text[:max_length].strip('-')
    # 如果为空，用时间戳
    if not text:
        text = datetime.now().strftime("%Y%m%d%H%M%S")
    return text


def sanitize_content(content):
    """
    安全过滤生成的内容
    - 禁用 Liquid 模板
    - 转义危险字符
    - 移除脚本标签
    """
    if not content:
        return ""
    
    # 禁用 Liquid 渲染（Jekyll）
    content = re.sub(r'\{\{', '&lcub;&lcub;', content)
    content = re.sub(r'\}\}', '&rcub;&rcub;', content)
    content = re.sub(r'\{%', '&lcub;&percnt;', content)
    content = re.sub(r'%\}', '&percnt;&rcub;', content)
    
    # 移除危险标签
    dangerous_tags = [
        r'<script[^>]*>.*?</script>',
        r'<iframe[^>]*>.*?</iframe>',
        r'<style[^>]*>.*?</style>',
        r'<object[^>]*>.*?</object>',
        r'<embed[^>]*>.*?</embed>',
        r'<form[^>]*>.*?</form>',
    ]
    for pattern in dangerous_tags:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # 移除事件处理器属性
    content = re.sub(r'\s+on\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
    
    # 移除 javascript: 协议
    content = re.sub(r'javascript\s*:', '', content, flags=re.IGNORECASE)
    
    return content


def validate_link(link):
    """
    验证链接是否安全
    """
    if not link:
        return False
    
    # 只允许 http/https
    if not link.startswith(('http://', 'https://')):
        return False
    
    # 禁止私有 IP 和本地地址
    blocked_patterns = [
        r'127\.',
        r'10\.',
        r'172\.(1[6-9]|2[0-9]|3[01])\.',
        r'192\.168\.',
        r'localhost',
        r'0\.0\.0\.0',
        r'\.local$',
        r'\.internal$',
    ]
    
    for pattern in blocked_patterns:
        if re.search(pattern, link, re.IGNORECASE):
            return False
    
    return True


def fetch_news():
    """抓取 RSS 新闻（带安全限制）"""
    all_news = []
    
    for name, url in RSS_SOURCES:
        print(f"抓取: {name}")
        try:
            # 验证 URL
            if not validate_link(url):
                print(f"  跳过不安全的 URL: {url}")
                continue
            
            # 抓取 RSS（带超时）
            feed = feedparser.parse(url)
            
            # 限制条目数量
            for entry in feed.entries[:10]:
                title = entry.get("title", "")[:MAX_TITLE_LENGTH]
                link = entry.get("link", "")
                summary = entry.get("summary", "")[:MAX_SUMMARY_LENGTH]
                
                # 验证链接
                if not validate_link(link):
                    continue
                
                all_news.append({
                    "title": title,
                    "link": link,
                    "summary": summary,
                    "source": name,
                })
        except Exception as e:
            print(f"  失败: {e}")
    
    print(f"共抓取 {len(all_news)} 条新闻")
    return all_news[:MAX_NEWS_ITEMS]


def call_ai(prompt):
    """调用 AI API（带安全控制）"""
    if not API_BASE or not API_KEY:
        print("错误: 未配置 API")
        return None
    
    # 限制 prompt 长度
    if len(prompt) > 10000:
        prompt = prompt[:10000]
    
    try:
        resp = requests.post(
            f"{API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 3000,
                "temperature": 0.7,
            },
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        
        # 不记录完整响应
        data = resp.json()
        return data["choices"][0]["message"]["content"]
        
    except requests.exceptions.Timeout:
        print("AI 调用超时")
        return None
    except requests.exceptions.RequestException as e:
        # 不暴露详细错误信息
        print(f"AI 调用失败: 请求错误")
        return None
    except Exception as e:
        print(f"AI 调用失败: 未知错误")
        return None


def generate_article(news_items):
    """生成文章（带安全 prompt）"""
    # 整理新闻（已过滤）
    news_text = "\n\n".join([
        f"【{n['source']}】{n['title']}\n{n['summary']}"
        for n in news_items[:15]
    ])
    
    prompt = f"""你是一个技术博客作者。请根据以下 AI 相关新闻，写一篇中文博客文章。

新闻内容：
{news_text}

要求：
1. 标题要有吸引力
2. 内容整合这些新闻，加入分析和见解
3. 使用 Markdown 格式
4. 字数 800-1500 字
5. 文章结构：标题 -> 引言 -> 正文 -> 总结
6. 在末尾列出参考来源链接

安全要求：
- 不要在文章中包含任何可执行代码
- 不要使用 {{ 或 }} 字符
- 不要使用模板语法
- 不要包含脚本或样式

请直接输出文章内容（从一级标题开始）："""

    print("正在生成文章...")
    return call_ai(prompt)


def save_article(content):
    """保存文章（带安全验证）"""
    if not content:
        print("文章内容为空，跳过保存")
        return False
    
    # 安全过滤
    content = sanitize_content(content)
    
    # 检查内容大小
    if len(content.encode('utf-8')) > MAX_FILE_SIZE:
        print("文章内容过大，截断保存")
        content = content[:MAX_FILE_SIZE // 2]
    
    # 生成安全的文件名
    date_str = datetime.now().strftime("%Y-%m-%d")
    
    # 从内容提取标题用于文件名
    first_line = content.split('\n')[0] if content else ""
    title_slug = slugify(first_line.replace('#', '').strip())
    
    filename = f"{date_str}-{title_slug}.md"
    
    # 获取 posts 目录（防止路径遍历）
    script_dir = Path(__file__).parent.resolve()
    posts_dir = (script_dir.parent / "posts").resolve()
    
    # 确保目录存在
    posts_dir.mkdir(exist_ok=True)
    
    # 构建文件路径并验证
    filepath = (posts_dir / filename).resolve()
    
    # 验证文件路径在允许的目录内
    if not str(filepath).startswith(str(posts_dir)):
        print("错误: 非法文件路径")
        return False
    
    # 添加 YAML front matter（禁用 Liquid）
    front_matter = f"""---
layout: post
title: AI 新闻日报 - {date_str}
date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
categories: [AI]
render_with_liquid: false
---

"""
    
    # 写入文件
    try:
        filepath.write_text(front_matter + content, encoding="utf-8")
        print(f"文章已保存: {filepath}")
        return True
    except Exception as e:
        print(f"保存失败: {e}")
        return False


def main():
    print(f"\n{'='*50}")
    print(f"AI 新闻日报生成器 - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*50}\n")
    
    # 检查配置
    if not API_KEY:
        print("错误: 未设置 API_KEY")
        sys.exit(1)
    
    if not API_BASE:
        print("错误: 未设置 API_BASE")
        sys.exit(1)
    
    # 1. 抓取新闻
    news = fetch_news()
    if not news:
        print("没有抓取到新闻")
        sys.exit(1)
    
    # 2. 生成文章
    article = generate_article(news)
    if not article:
        print("文章生成失败")
        sys.exit(1)
    
    # 3. 保存文章
    if save_article(article):
        print("\n✅ 完成！")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
