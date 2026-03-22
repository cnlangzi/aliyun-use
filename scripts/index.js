#!/usr/bin/env node

/**
 * Aliyun Use - Aliyun Bailian AI tools for Node.js
 * 
 * 统一接口:
 *   import { chat, translate, understandImage, webSearch } from 'aliyun-use/scripts/index.js';
 * 
 * CLI 用法:
 *   node scripts/index.js chat "hello" --model qwen3.5-plus
 *   node scripts/index.js translate "hello" --to Chinese
 */

import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Config
const ALIYUN_API_KEY = process.env.ALIYUN_BAILIAN_API_KEY;
const ALIYUN_API_HOST = process.env.ALIYUN_BAILIAN_API_HOST || 'https://coding.dashscope.aliyuncs.com/apps/anthropic';
const MODEL = process.env.ALIYUN_MODEL || 'qwen3.5-plus';

if (!ALIYUN_API_KEY) {
  console.error('Error: ALIYUN_BAILIAN_API_KEY environment variable not set.');
  console.error('Get your API key at: https://bailian.console.aliyun.com/');
  process.exit(1);
}

/**
 * Chat with LLM
 * @param {string} message - User message
 * @param {Object} opts - Options
 * @param {string} opts.system - System prompt
 * @param {string} opts.model - Model name (default: qwen3.5-plus)
 * @param {number} opts.temperature - Temperature 0-1 (default: 0.7)
 * @param {number} opts.max_tokens - Max tokens (default: 2048)
 * @param {boolean} opts.stream - Enable streaming (default: false)
 * @param {Array} opts.history - Chat history [{role: 'user'|'assistant', content: '...'}]
 * @returns {Promise<{success: boolean, result?: {content: string}, error?: string}>}
 */
async function chat(message, opts = {}) {
  const {
    system = null,
    model = MODEL,
    temperature = 0.7,
    max_tokens = 2048,
    stream = false,
    history = null
  } = opts;

  const msgs = [];
  if (system) msgs.push({ role: 'system', content: system });
  if (history) msgs.push(...history);
  msgs.push({ role: 'user', content: message });

  try {
    const body = {
      model,
      messages: msgs,
      max_tokens,
      stream,
    };
    if (temperature !== undefined) body.temperature = temperature;

    const resp = await fetch(`${ALIYUN_API_HOST}/v1/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALIYUN_API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { success: false, error: `HTTP ${resp.status}: ${err}` };
    }

    if (stream) {
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        process.stdout.write(chunk);
        content += chunk;
      }
      return { success: true, result: { content } };
    }

    const data = await resp.json();
    let content = '';
    for (const block of data.content || []) {
      if (block.type === 'text') content += block.text;
    }
    return { success: true, result: { content } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Translate text
 * @param {string} text - Text to translate
 * @param {Object} opts - Options
 * @param {string} opts.to - Target language (default: 'English')
 * @param {string} opts.from - Source language (default: 'auto')
 * @param {string} opts.model - Model name (default: qwen3.5-plus)
 * @returns {Promise<{success: boolean, result?: {content: string}, error?: string}>}
 */
async function translate(text, opts = {}) {
  const { to = 'English', from = 'auto', model = MODEL } = opts;
  const systemPrompt = `You are a professional translator. Translate the following text to ${to}${from !== 'auto' ? ` from ${from}` : ''}. Only output the translated text, no explanations.`;
  return await chat(text, { system: systemPrompt, model, temperature: 0.3, max_tokens: 4096 });
}

/**
 * Understand/analyze image (via chat with image URL)
 * @param {string} prompt - Question about the image
 * @param {string} imagePath - Path to image file or URL
 * @param {Object} opts - Options
 * @param {string} opts.model - Vision model (default: qwen-vl-plus)
 * @param {number} opts.temperature - Temperature 0-1 (default: 0.3)
 * @param {number} opts.max_tokens - Max tokens (default: 300)
 * @returns {Promise<{success: boolean, result?: {content: string}, error?: string}>}
 */
async function understandImage(prompt, imagePath, opts = {}) {
  const {
    model = 'qwen-vl-plus',
    temperature = 0.3,
    max_tokens = 300
  } = opts;

  try {
    // For now, Aliyun doesn't have native vision API in this format
    // Return error suggesting using chat with image URL
    return { 
      success: false, 
      error: 'Aliyun vision not supported in unified interface. Use chat with image URL or switch to kimi-use/minimax-use.' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Web search (using model's knowledge base)
 * @param {string} query - Search query
 * @param {Object} opts - Options
 * @param {string} opts.model - Model name (default: qwen3.5-plus)
 * @returns {Promise<{success: boolean, result?: {content: string}, error?: string}>}
 */
async function webSearch(query, opts = {}) {
  const { model = MODEL } = opts;
  const systemPrompt = 'You are a helpful assistant. Answer questions based on your knowledge.';
  return await chat(query, { system: systemPrompt, model, temperature: 0.5, max_tokens: 2048 });
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/index.js chat "message" [--model MODEL] [--stream]');
    console.log('  node scripts/index.js translate "text" --to Chinese [--from English]');
    console.log('  node scripts/index.js search "query" [--model MODEL]');
    console.log('');
    console.log('Environment variables:');
    console.log('  ALIYUN_BAILIAN_API_KEY - API key (required)');
    console.log('  ALIYUN_BAILIAN_API_HOST - API host (default: https://coding.dashscope.aliyuncs.com/apps/anthropic)');
    console.log('  ALIYUN_MODEL           - chat model (default: qwen3.5-plus)');
    process.exit(0);
  }

  const command = args[0];
  const rest = args.slice(1);

  const getOpt = (args) => {
    const result = {};
    const remaining = [];
    const consumed = new Set();
    for (let i = 0; i < args.length; i++) {
      if (consumed.has(i)) continue;
      const opt = args[i];
      if (opt === '--model' && i + 1 < args.length) { result.model = args[i + 1]; consumed.add(i); consumed.add(i + 1); }
      else if (opt === '--stream') { result.stream = true; consumed.add(i); }
      else if (opt === '--to' && i + 1 < args.length) { result.to = args[i + 1]; consumed.add(i); consumed.add(i + 1); }
      else if (opt === '--from' && i + 1 < args.length) { result.from = args[i + 1]; consumed.add(i); consumed.add(i + 1); }
      else if (!opt.startsWith('--')) { remaining.push(opt); consumed.add(i); }
    }
    return { parsed: result, remaining };
  };

  let result;
  switch (command) {
    case 'chat': {
      const msg = rest.find(a => !a.startsWith('--')) || '';
      const { parsed } = getOpt(rest);
      result = await chat(msg, parsed);
      break;
    }
    case 'translate': {
      const text = rest.find(a => !a.startsWith('--')) || '';
      const { parsed } = getOpt(rest);
      result = await translate(text, parsed);
      break;
    }
    case 'search': {
      const query = rest.find(a => !a.startsWith('--')) || '';
      const { parsed } = getOpt(rest);
      result = await webSearch(query, parsed);
      break;
    }
    default:
      console.error(`Unknown command: ${command}`); process.exit(1);
  }

  if (result?.success) {
    console.log(result.result.content || '');
  } else {
    console.error('Error:', result?.error || 'Unknown error');
    process.exit(1);
  }
}

export { chat, translate, understandImage, webSearch };

// Run CLI if executed directly
main().catch(err => { console.error('Fatal error:', err.message); process.exit(1); });
