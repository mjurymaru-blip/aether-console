/**
 * Gemini API Client
 * Google Gemini APIとの通信
 */

import { getSessionApiKey } from './crypto-store';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiRequest {
    contents: GeminiMessage[];
    generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
        topP?: number;
        topK?: number;
    };
    systemInstruction?: {
        parts: { text: string }[];
    };
}

interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[];
            role: string;
        };
        finishReason: string;
    }[];
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

export interface AgentMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AgentConfig {
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
}

// APIキーが利用可能か確認
export function isApiKeyAvailable(): boolean {
    return getSessionApiKey() !== null;
}

// Gemini APIを呼び出す
export async function callGemini(
    messages: AgentMessage[],
    config: AgentConfig,
    model: string = DEFAULT_MODEL,
    signal?: AbortSignal
): Promise<string> {
    const apiKey = getSessionApiKey();
    if (!apiKey) {
        throw new Error('APIキーが設定されていません。設定画面からAPIキーを入力してください。');
    }

    const geminiMessages: GeminiMessage[] = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    const request: GeminiRequest = {
        contents: geminiMessages,
        generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxTokens ?? 1024
        }
    };

    if (config.systemPrompt) {
        request.systemInstruction = {
            parts: [{ text: config.systemPrompt }]
        };
    }

    const response = await fetch(
        `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request),
            signal
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API Error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('AIからの応答がありませんでした');
    }

    return data.candidates[0].content.parts.map(p => p.text).join('');
}

// ストリーミング対応のGemini API呼び出し
export async function* callGeminiStream(
    messages: AgentMessage[],
    config: AgentConfig,
    model: string = DEFAULT_MODEL
): AsyncGenerator<string, void, unknown> {
    const apiKey = getSessionApiKey();
    if (!apiKey) {
        throw new Error('APIキーが設定されていません');
    }

    const geminiMessages: GeminiMessage[] = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    const request: GeminiRequest = {
        contents: geminiMessages,
        generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxTokens ?? 1024
        }
    };

    if (config.systemPrompt) {
        request.systemInstruction = {
            parts: [{ text: config.systemPrompt }]
        };
    }

    const response = await fetch(
        `${GEMINI_API_URL}/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('ストリームを読み取れませんでした');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        yield text;
                    }
                } catch {
                    // パースエラーは無視
                }
            }
        }
    }
}
