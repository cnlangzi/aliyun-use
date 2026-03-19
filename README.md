# Aliyun Use

An [Openclaw](https://openclaw.ai) skill for calling Alibaba Cloud Bailian LLM via DashScope Anthropic API.

## Features

- **Chat** - General-purpose LLM chat with Qwen, GLM, Kimi, MiniMax models
- **Translate** - Language translation between 14 languages
- **Code Generation** - Use `qwen3-coder-next` or `qwen3-coder-plus` for coding tasks

## Requirements

- Python 3.10+
- `ALIYUN_BAILIAN_API_KEY` environment variable

## Quick Start

```bash
# Chat
python -m scripts chat --model qwen3.5-plus --messages '[{"role": "user", "content": "Hello"}]'

# Translate
python -m scripts translate --text "Hello" --target-lang zh

# List models
python -m scripts models
```

## Installation

Get your API key from [Bailian Console](https://bailian.console.aliyun.com/) and set:

```bash
export ALIYUN_BAILIAN_API_KEY="your-api-key"
```

## Documentation

- GitHub: https://github.com/cnlangzi/ai-aliyun
- Skill definition: `SKILL.md`
- API reference: `references/API.md`
- Available models: `assets/models.json`

## License

MIT
