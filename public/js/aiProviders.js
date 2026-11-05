// PEDAIA Multi-Provider AI Registry
// Comprehensive catalog of 15 frontier, reasoning, ultra-fast, search-grounded, and local AI engines

export const AI_CATEGORIES = {
  all: 'All AI Engines',
  frontier: 'Frontier Labs',
  reasoning: 'Reasoning & Search',
  fast: 'Ultra-Fast LPUs',
  local: '100% Free & Local',
  aggregator: 'Aggregators & Custom'
};

export const AI_PROVIDERS = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    company: 'Google DeepMind',
    category: 'frontier',
    tagline: 'Multimodal intelligence, massive context window, and pedagogical reasoning',
    badge: 'Gemini',
    color: 'indigo',
    accentClass: 'bg-indigo-600',
    borderClass: 'border-indigo-500',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    requiresKey: true,
    keyPlaceholder: 'AIzaSy...',
    keyEnvVar: 'GEMINI_API_KEY',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Recommended — High Speed & Deep Pedagogical Logic' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', badge: 'Next-Gen Multimodal Architecture' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: 'Deep Pedagogical & Massive Curriculum Analysis' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Standard Production Model' }
    ],
    helpUrl: 'https://aistudio.google.com/app/apikey',
    helpText: 'Get free API key on Google AI Studio'
  },

  openai: {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    company: 'OpenAI',
    category: 'frontier',
    tagline: 'Benchmark curriculum design, conversational mastery, and STEM reasoning',
    badge: 'OpenAI',
    color: 'emerald',
    accentClass: 'bg-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    requiresKey: true,
    keyPlaceholder: 'sk-proj-...',
    keyEnvVar: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', badge: 'Flagship Multimodal & Curriculum Design' },
      { id: 'gpt-4o-mini', name: 'GPT-4o-mini', badge: 'Affordable, Ultra-Fast & Precise' },
      { id: 'o1', name: 'o1 (Full Reasoning)', badge: 'State-of-the-Art Deep STEM & Logic Reasoning' },
      { id: 'o3-mini', name: 'o3-mini', badge: 'Scientific & Diagnostic Assessment Reasoning' }
    ],
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Create API key on OpenAI Platform'
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    company: 'Anthropic',
    category: 'frontier',
    tagline: 'Nuanced academic prose, rubric analysis, and safe instruction',
    badge: 'Claude',
    color: 'amber',
    accentClass: 'bg-amber-600',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    requiresKey: true,
    keyPlaceholder: 'sk-ant-...',
    keyEnvVar: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-3-7-sonnet-20250219',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', badge: 'Hybrid Reasoning & Frontier Pedagogical Mastery' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', badge: 'Benchmark Academic Prose & Rubric Formatting' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', badge: 'Lightning-Fast Scaffolding & Quick Checks' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', badge: 'Maximum Depth for Academic Frameworks' }
    ],
    helpUrl: 'https://console.anthropic.com/',
    helpText: 'Generate API key in Anthropic Console'
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    company: 'DeepSeek-AI',
    category: 'reasoning',
    tagline: 'Open-weights architecture with state-of-the-art reasoning and chain of thought',
    badge: 'DeepSeek',
    color: 'sky',
    accentClass: 'bg-sky-600',
    borderClass: 'border-sky-500',
    textClass: 'text-sky-600 dark:text-sky-400',
    requiresKey: true,
    keyPlaceholder: 'sk-...',
    keyEnvVar: 'DEEPSEEK_API_KEY',
    defaultModel: 'deepseek-reasoner',
    models: [
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (Reasoner)', badge: '671B Chain of Thought & STEM Problem Solving' },
      { id: 'deepseek-chat', name: 'DeepSeek-V3 (Chat)', badge: '671B General Purpose Curriculum & Fast' }
    ],
    helpUrl: 'https://platform.deepseek.com/',
    helpText: 'Obtain API key on DeepSeek Platform'
  },

  perplexity: {
    id: 'perplexity',
    name: 'Perplexity AI',
    company: 'Perplexity',
    category: 'reasoning',
    tagline: 'Fact-grounded search-augmented AI with live curriculum citations',
    badge: 'Perplexity',
    color: 'teal',
    accentClass: 'bg-teal-600',
    borderClass: 'border-teal-500',
    textClass: 'text-teal-600 dark:text-teal-400',
    requiresKey: true,
    keyPlaceholder: 'pplx-...',
    keyEnvVar: 'PERPLEXITY_API_KEY',
    defaultModel: 'sonar-pro',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', badge: 'Advanced Academic Research with Real-Time Web Grounding' },
      { id: 'sonar', name: 'Sonar', badge: 'Fast Search-Augmented Instructional Design' },
      { id: 'sonar-reasoning', name: 'Sonar Reasoning', badge: 'Deep Analytical Research & Problem Solving' }
    ],
    helpUrl: 'https://www.perplexity.ai/settings/api',
    helpText: 'Get API key from Perplexity Settings'
  },

  xai: {
    id: 'xai',
    name: 'xAI Grok',
    company: 'xAI',
    category: 'frontier',
    tagline: 'High-speed reasoning, fresh perspectives, and deep STEM intuition',
    badge: 'Grok',
    color: 'slate',
    accentClass: 'bg-slate-700',
    borderClass: 'border-slate-500',
    textClass: 'text-slate-800 dark:text-slate-200',
    requiresKey: true,
    keyPlaceholder: 'xai-...',
    keyEnvVar: 'XAI_API_KEY',
    defaultModel: 'grok-2-1212',
    models: [
      { id: 'grok-2-1212', name: 'Grok 2', badge: 'State-of-the-Art Reasoning & Vision' },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', badge: 'Multimodal Diagrams & Visual Rubrics' },
      { id: 'grok-beta', name: 'Grok Beta', badge: 'Frontier Experimental Intelligence' }
    ],
    helpUrl: 'https://console.x.ai/',
    helpText: 'Generate API key in xAI Console'
  },

  groq: {
    id: 'groq',
    name: 'Groq Cloud LPU',
    company: 'Groq Inc.',
    category: 'fast',
    tagline: 'Sub-second real-time inference on open weights with LPUs',
    badge: 'Groq',
    color: 'orange',
    accentClass: 'bg-orange-600',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-600 dark:text-orange-400',
    requiresKey: true,
    keyPlaceholder: 'gsk_...',
    keyEnvVar: 'GROQ_API_KEY',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', badge: 'Flagship 70B Open Weights at 300+ tok/s' },
      { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B Reasoning', badge: 'Chain of Thought at Blazing LPU Speed' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', badge: 'Sub-Second Turnaround for Quick Classroom Prompts' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k)', badge: 'Multilingual Curriculum & Extended Context' }
    ],
    helpUrl: 'https://console.groq.com/',
    helpText: 'Create free Groq Cloud API key'
  },

  cerebras: {
    id: 'cerebras',
    name: 'Cerebras Cloud',
    company: 'Cerebras Systems',
    category: 'fast',
    tagline: 'The fastest AI inference on Earth powered by Wafer-Scale Engines (1,800+ tok/s)',
    badge: 'Cerebras',
    color: 'yellow',
    accentClass: 'bg-amber-500',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-600 dark:text-amber-400',
    requiresKey: true,
    keyPlaceholder: 'csk-...',
    keyEnvVar: 'CEREBRAS_API_KEY',
    defaultModel: 'llama3.3-70b',
    models: [
      { id: 'llama3.3-70b', name: 'Llama 3.3 70B', badge: 'Instantaneous 1,800 tokens/second Generation' },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B', badge: 'Sub-100ms Instant Classroom Pacing' }
    ],
    helpUrl: 'https://cloud.cerebras.ai/',
    helpText: 'Generate free Cerebras API key'
  },

  together: {
    id: 'together',
    name: 'Together AI',
    company: 'Together AI',
    category: 'fast',
    tagline: 'Leading open source AI cloud with high throughput and diverse model architectures',
    badge: 'Together',
    color: 'blue',
    accentClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600 dark:text-blue-400',
    requiresKey: true,
    keyPlaceholder: 'tog-...',
    keyEnvVar: 'TOGETHER_API_KEY',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', badge: 'Fast, High-Fidelity Open Instruction' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1 (Together)', badge: 'Full 671B DeepSeek Reasoning' },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B Turbo', badge: 'Multilingual & Mathematics Champion' }
    ],
    helpUrl: 'https://api.together.xyz/settings/api-keys',
    helpText: 'Get API key from Together AI'
  },

  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    company: 'Mistral AI (Europe)',
    category: 'frontier',
    tagline: 'Frontier European AI with superior multilingual fluency and concise logic',
    badge: 'Mistral',
    color: 'rose',
    accentClass: 'bg-rose-600',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400',
    requiresKey: true,
    keyPlaceholder: 'mistral-...',
    keyEnvVar: 'MISTRAL_API_KEY',
    defaultModel: 'mistral-large-latest',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', badge: 'Top-Tier Multilingual Curriculum Reasoning' },
      { id: 'mistral-small-latest', name: 'Mistral Small', badge: 'Fast, Efficient Everyday Lesson Planning' },
      { id: 'codestral-latest', name: 'Codestral', badge: 'Computer Science, STEM & Logic Design' }
    ],
    helpUrl: 'https://console.mistral.ai/',
    helpText: 'Create API key on La Plateforme Mistral'
  },

  cohere: {
    id: 'cohere',
    name: 'Cohere',
    company: 'Cohere Inc.',
    category: 'reasoning',
    tagline: 'Enterprise-grade document synthesis and pedagogical citation grounding',
    badge: 'Cohere',
    color: 'purple',
    accentClass: 'bg-purple-600',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-600 dark:text-purple-400',
    requiresKey: true,
    keyPlaceholder: 'coh-...',
    keyEnvVar: 'COHERE_API_KEY',
    defaultModel: 'command-r-plus-08-2024',
    models: [
      { id: 'command-r-plus-08-2024', name: 'Command R+', badge: 'Document Grounding & Extended Curriculum Context' },
      { id: 'command-r-08-2024', name: 'Command R', badge: 'Balanced Retrieval & Classroom Synthesis' }
    ],
    helpUrl: 'https://dashboard.cohere.com/api-keys',
    helpText: 'Generate API key in Cohere Dashboard'
  },

  ollama: {
    id: 'ollama',
    name: 'Ollama (Local CLI)',
    company: 'Self-Hosted / Private',
    category: 'local',
    tagline: 'Zero cloud cost, 100% private & student-safe on your computer terminal',
    badge: 'Ollama (Local)',
    color: 'violet',
    accentClass: 'bg-violet-600',
    borderClass: 'border-violet-500',
    textClass: 'text-violet-600 dark:text-violet-400',
    requiresKey: false,
    defaultEndpoint: 'http://localhost:11434',
    defaultModel: 'llama3.2',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2 (Meta)', badge: 'Fast, Lightweight & Great for General Instruction' },
      { id: 'mistral', name: 'Mistral 7B', badge: 'Strong Pedagogical Knowledge Base' },
      { id: 'qwen2.5', name: 'Qwen 2.5', badge: 'Exceptional Multilingual & STEM Performance' },
      { id: 'deepseek-r1:8b', name: 'DeepSeek-R1 8B', badge: 'Local Chain of Thought Reasoning' }
    ],
    helpUrl: 'https://ollama.com/',
    helpText: 'Download Ollama to run local models without API keys'
  },

  lmstudio: {
    id: 'lmstudio',
    name: 'LM Studio (Local Desktop GUI)',
    company: 'LM Studio',
    category: 'local',
    tagline: 'User-friendly desktop application to download & run open weights with 1-click',
    badge: 'LM Studio',
    color: 'cyan',
    accentClass: 'bg-cyan-600',
    borderClass: 'border-cyan-500',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    requiresKey: false,
    defaultEndpoint: 'http://localhost:1234/v1',
    defaultModel: 'default',
    models: [
      { id: 'default', name: 'Currently Loaded Model in LM Studio', badge: 'Connects directly to LM Studio Local Server' }
    ],
    helpUrl: 'https://lmstudio.ai/',
    helpText: 'Download LM Studio Desktop App'
  },

  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    company: 'OpenRouter Aggregator',
    category: 'aggregator',
    tagline: 'One single API key to access 200+ global frontier models',
    badge: 'OpenRouter',
    color: 'blue',
    accentClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600 dark:text-blue-400',
    requiresKey: true,
    keyPlaceholder: 'sk-or-v1-...',
    keyEnvVar: 'OPENROUTER_API_KEY',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (via OR)', badge: 'Anthropic via OpenRouter' },
      { id: 'openai/gpt-4o', name: 'GPT-4o (via OR)', badge: 'OpenAI via OpenRouter' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek-R1 (via OR)', badge: 'Full 671B DeepSeek Reasoning' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (via OR)', badge: 'Meta Open Weights' }
    ],
    helpUrl: 'https://openrouter.ai/keys',
    helpText: 'Get an all-in-one API key on OpenRouter'
  },

  custom: {
    id: 'custom',
    name: 'Custom OpenAI-Compatible API',
    company: 'University / Private Server',
    category: 'aggregator',
    tagline: 'Connect university clusters, vLLM, LiteLLM, or institutional gateways',
    badge: 'Custom API',
    color: 'teal',
    accentClass: 'bg-teal-700',
    borderClass: 'border-teal-500',
    textClass: 'text-teal-700 dark:text-teal-300',
    requiresKey: false,
    defaultEndpoint: 'http://localhost:8000/v1',
    defaultModel: 'default',
    models: [
      { id: 'default', name: 'Default Endpoint Model', badge: 'Model Hosted on Private Server' }
    ],
    helpUrl: '',
    helpText: 'Compatible with any server providing an OpenAI /v1/chat/completions route'
  }
};

export function getProviderConfig(providerId) {
  return AI_PROVIDERS[providerId] || AI_PROVIDERS.gemini;
}

export function getProviderIcon(providerId, sizeClass = 'w-5 h-5') {
  switch (providerId) {
    case 'gemini':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
    case 'openai':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
    case 'anthropic':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
    case 'deepseek':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`;
    case 'perplexity':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`;
    case 'xai':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
    case 'groq':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
    case 'cerebras':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
    case 'together':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`;
    case 'mistral':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
    case 'cohere':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
    case 'ollama':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>`;
    case 'lmstudio':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
    case 'openrouter':
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    case 'custom':
    default:
      return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
  }
}
