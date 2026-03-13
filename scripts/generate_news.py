#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 新闻日报生成器 - 简化版
从 RSS 抓取新闻，调用 AI 生成文章，推送到博客
"""

import os
import sys
import feedparser
import requests
from datetime import datetime
from pathlib import Path

# 配置
API_BASE = os.environ.get("API_BASE", "http://38.165.45.25:8112/v1")
API_KEY = os.environ.get("API_KEY", "")
MODEL = "gpt-5"

# RSS 新闻源
RSS_SOURCES = [
    ("Hacker News AI", "https://hnrss.org/newest?q=AI+OR+GPT+OR+LLM"),
    ("GitHub Trending", "https://mshibanami.github.io/GitHubTrendingRSS/daily.xml"),
    ("AI News", "https://artificialintelligence-news.com/feed/"),
]

def fetch_news():
    """抓取 RSS 新闻"""
    all_news = []
    
    for name, url in RSS_SOURCES:
        print(f"抓取: {name}")
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:10]:
                all_news.append({
                    "title": entry.get("title", ""),
                    "link": entry.get("link", ""),
                    "summary": entry.get("summary", "")[:300],
                    "source": name,
                })
        except Exception as e:
            print(f"  失败: {e}")
    
    print(f"共抓取 {len(all_news)} 条新闻")
    return all_news


def call_ai(prompt):
    """调用 AI API"""
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
            },
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"AI 调用失败: {e}")
        return None


def generate_article(news_items):
    """生成文章"""
    # 整理新闻
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

请直接输出文章内容（从一级标题开始）："""

    print("正在生成文章...")
    return call_ai(prompt)


def save_article(content):
    """保存文章"""
    if not content:
        print("文章内容为空，跳过保存")
        return False
    
    # 生成文件名
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"{date_str}-ai-news-daily.md"
    
    # 获取 posts 目录
    script_dir = Path(__file__).parent
    posts_dir = script_dir.parent / "posts"
    posts_dir.mkdir(exist_ok=True)
    
    # 保存文件
    filepath = posts_dir / filename
    filepath.write_text(content, encoding="utf-8")
    print(f"文章已保存: {filepath}")
    
    return True


def main():
    print(f"\n{'='*50}")
    print(f"AI 新闻日报生成器 - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*50}\n")
    
    # 检查配置
    if not API_KEY:
        print("错误: 未设置 API_KEY")
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
