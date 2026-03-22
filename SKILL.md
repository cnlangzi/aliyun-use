---
name: aliyun-use
version: 0.2.0
description: "Aliyun Bailian AI tools for Node.js - chat, translation. Use when you need LLM capabilities with Qwen or other Aliyun models."
metadata:
  openclaw:
    requires:
      env:
        - ALIYUN_BAILIAN_API_KEY
    primaryEnv: ALIYUN_BAILIAN_API_KEY
    os:
      - linux
      - darwin
      - win32
---

# Aliyun Use - Node.js AI Tools

Aliyun Bailian 百炼 AI 工具集，提供对话、翻译等功能。Node.js 实现。

## 统一接口（与其他 provider 接口一致）

```javascript
import { chat, translate, understandImage, webSearch } from 'aliyun-use/scripts/index.js';

// 对话
await chat('你好');                              // 简单对话
await chat('写代码', { model: 'qwen3.5-plus' });  // 指定模型
await chat('继续', { history: [{role:'user',content:'你好'}] }); // 带历史

// 翻译
await translate('hello', { to: 'Chinese' });
await translate('你好', { to: 'English', from: 'zh' });

// 搜索（基于模型知识库）
await webSearch('今日新闻');
```

## 返回格式

```javascript
// 成功
{ success: true, result: { content: '...' } }

// 失败
{ success: false, error: 'error message' }
```

## CLI 用法

```bash
# 对话
node scripts/index.js chat "你好"

# 翻译
node scripts/index.js translate "hello" --to Chinese

# 搜索
node scripts/index.js search "news"
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `ALIYUN_BAILIAN_API_KEY` | - | 必填，API Key |
| `ALIYUN_BAILIAN_API_HOST` | `https://coding.dashscope.aliyuncs.com/apps/anthropic` | API 端点 |
| `ALIYUN_MODEL` | `qwen3.5-plus` | 对话模型 |

获取 API Key: https://bailian.console.aliyun.com/

## 函数签名

### chat(message, opts)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| message | string | - | 用户消息 |
| opts.system | string | null | 系统提示 |
| opts.model | string | qwen3.5-plus | 模型名 |
| opts.temperature | number | 0.7 | 温度 0-1 |
| opts.max_tokens | number | 2048 | 最大 token |
| opts.stream | boolean | false | 流式输出 |
| opts.history | array | null | 历史记录 |

### translate(text, opts)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | - | 待翻译文本 |
| opts.to | string | English | 目标语言 |
| opts.from | string | auto | 源语言 |
| opts.model | string | qwen3.5-plus | 模型名 |

### understandImage(prompt, imagePath, opts)

**注意**: Aliyun 暂不支持此接口，建议使用 `kimi-use` 或 `minimax-use`。

### webSearch(query, opts)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| query | string | - | 搜索查询 |
| opts.model | string | qwen3.5-plus | 模型名 |

## 可用模型

- `qwen3.5-plus` - 旗舰模型
- `qwen3-max` - 最大模型
- `qwen3-coder-next` - 编码模型
- `qwen3-coder-plus` - 编码增强

## 安装依赖

```bash
cd ~/workspace/skills/aliyun-use
npm install
```
