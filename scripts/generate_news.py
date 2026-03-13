#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 新闻日报生成器 - 加强安全版
"""

import os
import re
import sys
import unicodedata
import feedparser
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

# 配置
API_BASE = os.environ.get("API_BASE", "")
API_KEY = os.environ.get("API_KEY", "")
MODEL = "gpt-5"

# RSS 白名单（只允许这些域名）
ALLOWED_DOMAINS = [
    "hnrss.org",
    "mshibanami.github.io",
    "artificialintelligence-news.com",
]

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
MAX_RESPONSE_SIZE = 5 * 1024 * 1024  # 5MB
REQUEST_CONNECT_TIMEOUT = 5
REQUEST_READ_TIMEOUT = 30
MAX_REDIRECTS = 3

# Windows 保留文件名
WINDOWS_RESERVED = {
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
}

# 允许的 HTML 标签和属性
ALLOWED_TAGS = {
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'b', 'i', 'u', 's', 'code', 'pre',
    'ul', 'ol', 'li',
    'blockquote',
    'a',
}

ALLOWED_ATTRIBUTES = {
    'a': {'href', 'title'},
    'h1': set(),
    'h2': set(),
    'h3': set(),
}


def slugify(text, max_length=60):
    """
    安全生成文件名
    - Unicode 归一化
    - 禁止前导点、Windows 保留名
    """
    # Unicode 归一化
    text = unicodedata.normalize('NFKD', text)
    # 转小写
    text = text.lower().strip()
    # 移除特殊字符
    text = re.sub(r'[^\w\s-]', '', text)
    # 空格转连字符
    text = re.sub(r'[-\s]+', '-', text)
    # 移除前导/尾随点和连字符
    text = text.strip('.-')
    # 限制长度
    text = text[:max_length].strip('.-')
    # 检查 Windows 保留名
    if text.upper() in WINDOWS_RESERVED:
        text = f"post-{text}"
    # 如果为空，用时间戳
    if not text:
        text = datetime.now().strftime("%Y%m%d%H%M%S")
    return text


def sanitize_html(content):
    """
    HTML 白名单过滤（不依赖第三方库）
    """
    if not content:
        return ""
    
    # 1. 转义 Liquid 模板语法
    content = content.replace('{{', '&lcub;&lcub;')
    content = content.replace('}}', '&rcub;&rcub;')
    content = content.replace('{%', '&lcub;&percnt;')
    content = content.replace('%}', '&percnt;&rcub;')
    
    # 2. 移除危险协议
    content = re.sub(r'javascript\s*:', '', content, flags=re.IGNORECASE)
    content = re.sub(r'data\s*:', '', content, flags=re.IGNORECASE)
    content = re.sub(r'vbscript\s*:', '', content, flags=re.IGNORECASE)
    
    # 3. 移除事件属性（onclick, onerror 等）
    content = re.sub(r'\s+on\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
    
    # 4. 移除危险标签
    dangerous_tags = [
        'script', 'style', 'iframe', 'frame', 'frameset',
        'object', 'embed', 'applet', 'form', 'input',
        'button', 'select', 'textarea', 'meta', 'link',
        'base', 'svg', 'math',
    ]
    for tag in dangerous_tags:
        content = re.sub(
            rf'<{tag}[^>]*>.*?</{tag}>',
            '',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        content = re.sub(rf'<{tag}[^>]*/?>', '', content, flags=re.IGNORECASE)
    
    # 5. 处理链接（强制 http/https，添加安全属性）
    def process_link(match):
        href = match.group(1)
        if href and not href.startswith(('http://', 'https://', '/', '#')):
            href = '#'
        return f'<a href="{href}" rel="noopener noreferrer" target="_blank">'
    
    content = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>', process_link, content, flags=re.IGNORECASE)
    
    return content


def validate_url(url):
    """
    严格 URL 验证
    - 只允许白名单域名
    - 禁止私有 IP
    - 禁止危险协议
    """
    if not url:
        return False
    
    # 只允许 http/https
    if not url.startswith(('http://', 'https://')):
        return False
    
    try:
        parsed = urlparse(url)
        
        # 检查域名白名单
        domain = parsed.netloc.lower()
        # 移除端口号
        if ':' in domain:
            domain = domain.split(':')[0]
        
        # 检查是否在白名单
        domain_allowed = False
        for allowed in ALLOWED_DOMAINS:
            if domain == allowed or domain.endswith('.' + allowed):
                domain_allowed = True
                break
        
        if not domain_allowed:
            return False
        
        # 禁止私有 IP
        private_patterns = [
            r'^127\.',
            r'^10\.',
            r'^172\.(1[6-9]|2[0-9]|3[01])\.',
            r'^192\.168\.',
            r'^169\.254\.',
            r'^0\.0\.0\.0$',
            r'^localhost$',
            r'\.local$',
            r'\.internal$',
        ]
        
        for pattern in private_patterns:
            if re.search(pattern, domain, re.IGNORECASE):
                return False
        
        return True
        
    except Exception:
        return False


class SafeSession:
    """安全的 HTTP Session"""
    
    def __init__(self):
        self.session = requests.Session()
        # 禁用代理
        self.session.trust_env = False
        self.session.max_redirects = MAX_REDIRECTS
    
    def get(self, url, **kwargs):
        # 验证 URL
        if not validate_url(url):
            raise ValueError(f"URL 不在白名单中: {url}")
        
        # 设置超时
        kwargs.setdefault('timeout', (REQUEST_CONNECT_TIMEOUT, REQUEST_READ_TIMEOUT))
        
        # 流式读取，限制大小
        kwargs.setdefault('stream', True)
        
        response = self.session.get(url, **kwargs)
        
        # 验证重定向后的最终 URL
        if response.url and not validate_url(response.url):
            raise ValueError(f"重定向到不允许的 URL: {response.url}")
        
        # 检查响应大小
        content_length = response.headers.get('content-length')
        if content_length and int(content_length) > MAX_RESPONSE_SIZE:
            raise ValueError("响应过大")
        
        # 流式读取并限制大小
        content = b''
        for chunk in response.iter_content(chunk_size=8192):
            content += chunk
            if len(content) > MAX_RESPONSE_SIZE:
                raise ValueError("响应过大")
        
        response._content = content
        return response


def fetch_news():
    """抓取 RSS 新闻（带严格安全限制）"""
    all_news = []
    session = SafeSession()
    
    for name, url in RSS_SOURCES:
        print(f"抓取: {name}")
        try:
            # 验证 URL
            if not validate_url(url):
                print(f"  跳过: URL 不在白名单")
                continue
            
            # 抓取 RSS
            response = session.get(url)
            response.raise_for_status()
            
            # 验证 Content-Type
            content_type = response.headers.get('content-type', '')
            if 'xml' not in content_type.lower() and 'rss' not in content_type.lower():
                print(f"  跳过: 非法的 Content-Type")
                continue
            
            # 解析 RSS
            feed = feedparser.parse(response.content)
            
            # 限制条目
            for entry in feed.entries[:10]:
                title = entry.get("title", "")[:MAX_TITLE_LENGTH]
                link = entry.get("link", "")
                summary = entry.get("summary", "")[:MAX_SUMMARY_LENGTH]
                
                # 验证链接
                if not validate_url(link):
                    continue
                
                all_news.append({
                    "title": title,
                    "link": link,
                    "summary": summary,
                    "source": name,
                })
                
        except Exception as e:
            # 不暴露详细错误
            print(f"  抓取失败")
            continue
    
    print(f"共抓取 {len(all_news)} 条新闻")
    return all_news[:MAX_NEWS_ITEMS]


def call_ai(prompt):
    """调用 AI API"""
    if not API_BASE or not API_KEY:
        print("错误: 未配置 API")
        return None
    
    # 限制 prompt 长度
    if len(prompt) > 10000:
        prompt = prompt[:10000]
    
    # 验证 API_BASE 使用 HTTPS
    if API_BASE.startswith('http://'):
        print("警告: API 使用 HTTP，建议切换到 HTTPS")
    
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
            timeout=(REQUEST_CONNECT_TIMEOUT, REQUEST_READ_TIMEOUT),
            verify=True,  # 强制校验证书
        )
        resp.raise_for_status()
        
        data = resp.json()
        return data["choices"][0]["message"]["content"]
        
    except requests.exceptions.Timeout:
        print("AI 调用超时")
        return None
    except Exception:
        print("AI 调用失败")
        return None


def generate_article(news_items):
    """生成文章"""
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
7. 不要包含任何 JavaScript、脚本、样式或模板语法

请直接输出文章内容："""

    print("正在生成文章...")
    return call_ai(prompt)


def save_article(content):
    """保存文章（原子写入）"""
    if not content:
        print("文章内容为空")
        return False
    
    # 安全过滤
    content = sanitize_html(content)
    
    # 检查大小
    if len(content.encode('utf-8')) > MAX_FILE_SIZE:
        print("文章过大，截断")
        content = content[:MAX_FILE_SIZE // 2]
    
    # 生成文件名
    date_str = datetime.now().strftime("%Y-%m-%d")
    first_line = content.split('\n')[0] if content else ""
    title_slug = slugify(first_line.replace('#', '').strip())
    filename = f"{date_str}-{title_slug}.md"
    
    # 获取目录
    script_dir = Path(__file__).parent.resolve()
    posts_dir = (script_dir.parent / "posts").resolve()
    posts_dir.mkdir(exist_ok=True)
    
    # 构建路径
    filepath = (posts_dir / filename).resolve()
    
    # 验证路径
    if not str(filepath).startswith(str(posts_dir)):
        print("错误: 非法路径")
        return False
    
    # front matter
    front_matter = f"""---
layout: post
title: AI 新闻日报 - {date_str}
date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
categories: [AI]
render_with_liquid: false
---

"""
    
    # 原子写入（先写临时文件）
    temp_path = filepath.with_suffix('.tmp')
    try:
        temp_path.write_text(front_matter + content, encoding="utf-8")
        temp_path.rename(filepath)
        print(f"文章已保存: {filepath}")
        return True
    except Exception as e:
        print(f"保存失败")
        if temp_path.exists():
            temp_path.unlink()
        return False


def main():
    print(f"\n{'='*50}")
    print(f"AI 新闻日报生成器 - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*50}\n")
    
    if not API_KEY or not API_BASE:
        print("错误: 未配置 API")
        sys.exit(1)
    
    news = fetch_news()
    if not news:
        print("没有抓取到新闻")
        sys.exit(1)
    
    article = generate_article(news)
    if not article:
        print("文章生成失败")
        sys.exit(1)
    
    if save_article(article):
        print("\n✅ 完成！")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
