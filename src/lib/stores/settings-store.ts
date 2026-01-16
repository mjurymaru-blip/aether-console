/**
 * Settings Store
 * 設定の状態管理（リアクティブ）
 * モデル一覧はAPIから動的に取得
 */

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// モデル情報の型
export interface ModelInfo {
    id: string;
    name: string;
    description: string;
}

// 設定の型
interface Settings {
    selectedModel: string;
    apiKeyReady: boolean;
    availableModels: ModelInfo[];
    isLoadingModels: boolean;
    modelError: string | null;
    streamingEnabled: boolean;
    reducedMotion: boolean;
}

// ブラウザ環境でのみsessionStorageをチェック
function getApiKey(): string | null {
    if (!browser) return null;
    return sessionStorage.getItem('aether-console-decrypted-key');
}

// Gemini APIからモデル一覧を取得
async function fetchAvailableModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
        throw new Error('モデル一覧の取得に失敗しました');
    }

    const data = await response.json();

    // generateContentをサポートするモデルのみフィルタリング
    const models: ModelInfo[] = data.models
        .filter((m: any) =>
            m.supportedGenerationMethods?.includes('generateContent') &&
            m.name.includes('gemini')
        )
        .map((m: any) => ({
            id: m.name.replace('models/', ''),
            name: m.displayName || m.name.replace('models/', ''),
            description: m.description || ''
        }))
        // Flash/Proを優先、最新順
        .sort((a: ModelInfo, b: ModelInfo) => {
            // flashが上、proが下
            const aFlash = a.id.includes('flash');
            const bFlash = b.id.includes('flash');
            if (aFlash && !bFlash) return -1;
            if (!aFlash && bFlash) return 1;
            // 新しいバージョンが上
            return b.id.localeCompare(a.id);
        });

    return models;
}

function createSettingsStore() {
    // システムのアニメーション設定を確認
    const prefersReducedMotion = browser
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const { subscribe, set, update } = writable<Settings>({
        selectedModel: '',
        apiKeyReady: false,
        availableModels: [],
        isLoadingModels: false,
        modelError: null,
        streamingEnabled: true,
        reducedMotion: prefersReducedMotion
    });

    return {
        subscribe,
        setModel: (modelId: string) => {
            update(s => ({ ...s, selectedModel: modelId }));
        },
        setApiKeyReady: (ready: boolean) => {
            update(s => ({ ...s, apiKeyReady: ready }));
        },
        // モデル一覧を取得
        loadModels: async () => {
            const apiKey = getApiKey();
            if (!apiKey) return;

            update(s => ({ ...s, isLoadingModels: true, modelError: null }));

            try {
                const models = await fetchAvailableModels(apiKey);
                update(s => ({
                    ...s,
                    availableModels: models,
                    selectedModel: models.length > 0 ? models[0].id : '',
                    isLoadingModels: false
                }));
            } catch (error) {
                update(s => ({
                    ...s,
                    modelError: error instanceof Error ? error.message : 'モデル取得エラー',
                    isLoadingModels: false
                }));
            }
        },
        // クライアント側で初期化
        init: async () => {
            if (!browser) return;

            const apiKey = getApiKey();
            if (apiKey) {
                update(s => ({ ...s, apiKeyReady: true }));
                // モデル一覧を自動取得
                const store = get({ subscribe });
                if (store.availableModels.length === 0) {
                    await createSettingsStore().loadModels();
                }
            }
        },
        // ストリーミング設定
        setStreaming: (enabled: boolean) => {
            update(s => ({ ...s, streamingEnabled: enabled }));
        },
        // 視覚効果軽減設定
        setReducedMotion: (reduced: boolean) => {
            update(s => ({ ...s, reducedMotion: reduced }));
        }
    };
}

export const settingsStore = createSettingsStore();
