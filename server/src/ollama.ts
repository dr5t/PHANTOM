// =============================================================================
// PHANTOM Server — Genuine Ollama Local Model Integration
// =============================================================================

import type { OllamaModel, OllamaStatus } from './types.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Checks if Ollama runtime is actively running on the host machine
 * and returns the list of locally pulled models.
 */
export async function getOllamaStatus(): Promise<OllamaStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        available: false,
        models: [],
        error: `Ollama returned HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as { models?: any[] };
    const rawModels = data.models || [];

    const models: OllamaModel[] = rawModels.map((m: any) => ({
      name: m.name,
      size: m.size || 0,
      sizeFormatted: formatBytes(m.size || 0),
      modifiedAt: m.modified_at || '',
      digest: m.digest ? m.digest.slice(0, 12) : '',
      parameterSize: m.details?.parameter_size,
      quantizationLevel: m.details?.quantization_level,
    }));

    return {
      available: true,
      models,
    };
  } catch (error: any) {
    let errorMsg = 'Ollama is not running locally on port 11434.';
    if (error?.name === 'AbortError') {
      errorMsg = 'Connection to Ollama timed out (port 11434).';
    } else if (error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
      errorMsg = 'Ollama service is unreachable (connection refused at 127.0.0.1:11434). Run `ollama serve` to start.';
    }

    return {
      available: false,
      models: [],
      error: errorMsg,
    };
  }
}

/**
 * Sends an inference prompt to a selected local Ollama model.
 * Does not fall back to any cloud API.
 */
export async function generateLocalInference(
  modelName: string,
  prompt: string,
  systemPrompt?: string,
  timeoutMs: number = 60000
): Promise<{
  success: boolean;
  response?: string;
  error?: string;
  durationMs: number;
}> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const body: Record<string, any> = {
      model: modelName,
      prompt,
      stream: false,
      options: {
        temperature: 0.2, // Low temperature for high factual accuracy in forensics
        num_predict: 1024,
      },
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Ollama error (${response.status}): ${errText}`,
        durationMs,
      };
    }

    const data = (await response.json()) as { response?: string };

    return {
      success: true,
      response: data.response || '',
      durationMs,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    let message = error?.message || 'Inference request failed.';

    if (error?.name === 'AbortError') {
      message = `Inference request timed out after ${timeoutMs / 1000}s.`;
    }

    return {
      success: false,
      error: message,
      durationMs,
    };
  }
}
