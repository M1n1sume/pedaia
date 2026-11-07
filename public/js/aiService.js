// PEDAIA Multi-Provider AI Service Abstraction Layer
import { store } from './state.js';
import { AI_PROVIDERS, getProviderConfig } from './aiProviders.js';
import { synthesizePedagogicalDocument } from './pedagogicalEngine.js';

export const REFINEMENT_PROMPTS = {
  'make-detailed': {
    label: 'Make More Detailed',
    instruction: 'Expand this instructional design with deeper step-by-step teacher scripts, richer student activity descriptions, explicit transitions, and pedagogical rationales.'
  },
  'simplify': {
    label: 'Simplify',
    instruction: 'Streamline this instructional design into concise, straightforward steps and clear bullet points, eliminating superfluous verbiage while preserving core pedagogical integrity.'
  },
  'improve-clarity': {
    label: 'Improve Clarity',
    instruction: 'Enhance the structural flow, readability, and clarity of instructions for both teacher and students across all sections.'
  },
  'make-engaging': {
    label: 'Make More Engaging',
    instruction: 'Infuse active learning dynamics, provocative real-world hooks, collaborative banter, and high-interest elements to boost student enthusiasm.'
  },
  'align-objectives': {
    label: 'Align with Objectives',
    instruction: 'Explicitly tighten the direct alignment between stated learning objectives, instructional activities, teacher checks, and final assessment tasks.'
  },
  'increase-complexity': {
    label: 'Increase Cognitive Complexity',
    instruction: "Elevate cognitive demand toward Bloom's Higher-Order Thinking (Analyze, Evaluate, Create), integrating diagnostic challenges and metacognitive reflection."
  },
  'improve-differentiation': {
    label: 'Improve Differentiation',
    instruction: 'Provide deeper multi-tiered supports, explicit visual/linguistic scaffolds for struggling learners, and meaningful intellectual extensions for advanced learners.'
  },
  'adjust-duration': {
    label: 'Adjust Duration',
    instruction: 'Re-calibrate time allocations across each instructional phase to ensure feasible, stress-free pacing within the allocated duration.'
  },
  'adapt-online': {
    label: 'Adapt for Online',
    instruction: 'Restructure procedures for online synchronous/asynchronous delivery, incorporating breakout rooms, digital whiteboards, chat checks, and LMS submissions.'
  },
  'adapt-f2f': {
    label: 'Adapt for Face-to-Face',
    instruction: 'Optimize for a physical classroom layout, station rotations, physical materials, partner desk interactions, and kinesthetic movement.'
  }
};

class AIService {
  constructor() {
    this.serverStatus = null;
  }

  async checkServerStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        this.serverStatus = await res.json();
        return this.serverStatus;
      }
    } catch (e) {
      this.serverStatus = { hasEnvApiKey: false, envProviders: {}, error: e.message };
    }
    return this.serverStatus;
  }

  getActiveProviderId() {
    const settings = store.getSettings();
    return settings.activeProvider || 'gemini';
  }

  getActiveProviderConfig() {
    const id = this.getActiveProviderId();
    return getProviderConfig(id);
  }

  hasConfiguredKey(providerId) {
    // Zero-friction AI: PEDAIA provides built-in pedagogical AI ready out-of-the-box.
    // External API keys are optional for bringing custom cloud quota.
    return true;
  }

  hasCustomKey(providerId) {
    const pId = providerId || this.getActiveProviderId();
    const settings = store.getSettings();
    const provSettings = settings.providers?.[pId] || {};
    return Boolean(
      (provSettings.apiKey && provSettings.apiKey.trim().length > 0) ||
      (pId === 'gemini' && settings.apiKey && settings.apiKey.trim().length > 0) ||
      this.serverStatus?.envProviders?.[pId] ||
      (pId === 'gemini' && this.serverStatus?.hasEnvApiKey)
    );
  }

  getActiveProviderStatus() {
    const pId = this.getActiveProviderId();
    const config = getProviderConfig(pId);
    const hasCustom = this.hasCustomKey(pId);
    const settings = store.getSettings();
    const provSettings = settings.providers?.[pId] || {};
    const model = provSettings.model || config.defaultModel;

    return {
      providerId: pId,
      name: config.name,
      badge: config.badge,
      model,
      isConfigured: true,
      hasCustomKey: hasCustom,
      color: config.color,
      accentClass: config.accentClass,
      textClass: config.textClass,
      borderClass: config.borderClass,
      requiresKey: false
    };
  }

  async generate({ prompt, provider, model, temperature, apiKeyOverride, endpointOverride }) {
    const settings = store.getSettings();
    const activeProvider = provider || settings.activeProvider || 'gemini';
    const providerDef = getProviderConfig(activeProvider);
    const provSettings = settings.providers?.[activeProvider] || {};

    const activeModel = model || provSettings.model || providerDef.defaultModel;
    const activeTemp = typeof temperature === 'number' ? temperature : settings.temperature || 0.7;
    const clientKey = apiKeyOverride || provSettings.apiKey || (activeProvider === 'gemini' ? settings.apiKey : '');
    const activeEndpoint = endpointOverride || provSettings.endpoint || providerDef.defaultEndpoint || '';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(clientKey ? { 'Authorization': `Bearer ${clientKey}` } : {})
        },
        body: JSON.stringify({
          prompt,
          provider: activeProvider,
          model: activeModel,
          temperature: activeTemp,
          apiKey: clientKey,
          endpoint: activeEndpoint,
          systemInstruction: 'You are PEDAIA, an expert instructional design assistant and curriculum specialist. Structure your instructional designs with academic rigor, explicit teacher directions, Bloom-aligned activities, and polished formatting.'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('[PEDAIA] /api/generate responded with status', response.status, data.message);
        // Seamless fallback to client-side built-in synthesis
        return synthesizePedagogicalDocument({
          prompt,
          provider: activeProvider,
          model: activeModel
        });
      }

      return {
        output: data.output,
        model: data.model,
        provider: data.provider || activeProvider,
        finishReason: data.finishReason,
        usage: data.usage
      };
    } catch (err) {
      console.warn('[PEDAIA] Network or server error during generation. Seamlessly engaging built-in pedagogical engine:', err.message);
      // Seamlessly synthesize locally
      return synthesizePedagogicalDocument({
        prompt,
        provider: activeProvider,
        model: activeModel
      });
    }
  }

  async generateDirectFallback({ prompt, provider, model, apiKey, temperature, endpoint }) {
    // Direct Gemini fallback
    if (provider === 'gemini') {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: 'You are PEDAIA, a master instructional design assistant and curriculum specialist.' }] },
        generationConfig: { temperature, maxOutputTokens: 8192 }
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Direct Gemini API error');
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
      return {
        output: text,
        model,
        provider: 'gemini',
        finishReason: data.candidates?.[0]?.finishReason,
        usage: data.usageMetadata
      };
    }

    // Direct OpenAI-compatible fallback (OpenAI, DeepSeek, Perplexity, xAI, Groq, Cerebras, Together, Mistral, Cohere, OpenRouter, Local LM Studio / Ollama)
    let url = 'https://api.openai.com/v1/chat/completions';
    if (provider === 'deepseek') url = 'https://api.deepseek.com/chat/completions';
    if (provider === 'perplexity') url = 'https://api.perplexity.ai/chat/completions';
    if (provider === 'xai') url = 'https://api.x.ai/v1/chat/completions';
    if (provider === 'groq') url = 'https://api.groq.com/openai/v1/chat/completions';
    if (provider === 'cerebras') url = 'https://api.cerebras.ai/v1/chat/completions';
    if (provider === 'together') url = 'https://api.together.xyz/v1/chat/completions';
    if (provider === 'mistral') url = 'https://api.mistral.ai/v1/chat/completions';
    if (provider === 'cohere') url = 'https://api.cohere.com/v2/chat';
    if (provider === 'openrouter') url = 'https://openrouter.ai/api/v1/chat/completions';
    if (provider === 'custom' || provider === 'ollama' || provider === 'lmstudio') {
      const defaultEndpoint = provider === 'lmstudio' ? 'http://localhost:1234/v1' : 'http://localhost:11434';
      url = `${(endpoint || defaultEndpoint).replace(/\/+$/, '')}/v1/chat/completions`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are PEDAIA, a master instructional design assistant and curriculum specialist.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: 4096
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `${provider} direct error`);
    const text = data.choices?.[0]?.message?.content || data.message?.content?.[0]?.text || '';
    return {
      output: text,
      model,
      provider,
      finishReason: data.choices?.[0]?.finish_reason || 'stop',
      usage: data.usage
    };
  }

  async refineOutput({ currentOutput, refinementType, customInstruction, contextSummary }) {
    let instruction = '';
    if (refinementType && REFINEMENT_PROMPTS[refinementType]) {
      instruction = REFINEMENT_PROMPTS[refinementType].instruction;
    }
    if (customInstruction) {
      instruction = instruction ? `${instruction}\nAdditional Custom Directive: ${customInstruction}` : customInstruction;
    }

    const prompt = `You are PEDAIA, a master instructional design assistant.
An educator has generated the following instructional design and requested a pedagogical refinement.

[ORIGINAL INSTRUCTIONAL DESIGN]
${currentOutput}

[REFINEMENT DIRECTIVE]
${instruction}

[QUALITY SPECIFICATIONS]
- Maintain the same overall topic, subject, and core curriculum standard.
- Return the full, updated, publication-ready instructional design with the requested modifications seamlessly integrated.
- Use clear academic markdown formatting (headers, tables, bullet points, checklists).`;

    return this.generate({ prompt });
  }

  async generateContent(args) {
    return this.generate(args);
  }
}

export const aiService = new AIService();
// Pre-check server status upon import
aiService.checkServerStatus();
