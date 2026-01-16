/**
 * Spec-Flow Studio Connection Service
 * WebSocketを使用したStudioとの接続管理
 */

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type {
    ConsoleToStudioEvent,
    StudioToConsoleEvent,
    IntegrationConfig,
    DEFAULT_INTEGRATION_CONFIG
} from '../types/integration';
import { appliedPatchesStore } from './spec-diff';
import { logStore } from './simulation';

// 接続状態
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface StudioConnectionState {
    status: ConnectionStatus;
    studioUrl: string;
    autoSync: boolean;
    lastError: string | null;
    lastSyncTime: Date | null;
}

// WebSocketインスタンス
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function createStudioConnectionStore() {
    const { subscribe, set, update } = writable<StudioConnectionState>({
        status: 'disconnected',
        studioUrl: 'ws://localhost:3001/api/ws',
        autoSync: false,
        lastError: null,
        lastSyncTime: null
    });

    // イベントハンドラー用のコールバック
    let onEventReceived: ((event: StudioToConsoleEvent) => void) | null = null;

    // WebSocket接続
    function connect() {
        if (!browser) return;

        const state = get({ subscribe });

        if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
            console.log('Already connected or connecting');
            return;
        }

        update(s => ({ ...s, status: 'connecting', lastError: null }));

        try {
            ws = new WebSocket(state.studioUrl);

            ws.onopen = () => {
                update(s => ({ ...s, status: 'connected' }));
                logStore.add({
                    level: 'success',
                    source: 'Studio',
                    message: 'Spec-Flow Studioに接続しました'
                });

                // 接続後に同期リクエストを送信
                sendEvent({ type: 'SYNC_REQUEST' });
            };

            ws.onclose = (event) => {
                update(s => ({ ...s, status: 'disconnected' }));
                logStore.add({
                    level: 'warning',
                    source: 'Studio',
                    message: `接続が切断されました (code: ${event.code})`
                });
                ws = null;

                // 自動再接続（autoSyncが有効な場合）
                const currentState = get({ subscribe });
                if (currentState.autoSync && !reconnectTimer) {
                    reconnectTimer = setTimeout(() => {
                        reconnectTimer = null;
                        connect();
                    }, 5000);
                }
            };

            ws.onerror = (error) => {
                update(s => ({ ...s, status: 'error', lastError: '接続エラー' }));
                logStore.add({
                    level: 'error',
                    source: 'Studio',
                    message: '接続エラーが発生しました'
                });
            };

            ws.onmessage = (event) => {
                try {
                    const data: StudioToConsoleEvent = JSON.parse(event.data);
                    handleStudioEvent(data);
                } catch (e) {
                    console.error('Failed to parse message:', e);
                }
            };
        } catch (error) {
            update(s => ({
                ...s,
                status: 'error',
                lastError: error instanceof Error ? error.message : '接続失敗'
            }));
        }
    }

    // WebSocket切断
    function disconnect() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        if (ws) {
            ws.close();
            ws = null;
        }

        update(s => ({ ...s, status: 'disconnected' }));
    }

    // イベント送信
    function sendEvent(event: ConsoleToStudioEvent) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket is not connected');
            return false;
        }

        try {
            ws.send(JSON.stringify(event));
            return true;
        } catch (error) {
            console.error('Failed to send event:', error);
            return false;
        }
    }

    // Studioからのイベント処理
    function handleStudioEvent(event: StudioToConsoleEvent) {
        logStore.add({
            level: 'info',
            source: 'Studio',
            message: `イベント受信: ${event.type}`
        });

        switch (event.type) {
            case 'SPEC_UPDATED':
                // エージェント仕様の更新
                console.log('Spec updated:', event.agents);
                break;

            case 'PATCH_CREATED':
                // 新しいパッチが作成された
                console.log('Patch created:', event.patch);
                break;

            case 'SCENARIO_CREATED':
                // 新しいシナリオが作成された
                console.log('Scenario created:', event.scenario);
                break;

            case 'SYNC_RESPONSE':
                // 同期レスポンス
                update(s => ({ ...s, lastSyncTime: new Date() }));
                console.log('Sync response received:', event);
                break;
        }

        // 外部のイベントハンドラーに通知
        if (onEventReceived) {
            onEventReceived(event);
        }
    }

    return {
        subscribe,

        // 接続
        connect,

        // 切断
        disconnect,

        // イベント送信
        send: sendEvent,

        // Studio URLを設定
        setStudioUrl: (url: string) => {
            update(s => ({ ...s, studioUrl: url }));
        },

        // 自動同期の設定
        setAutoSync: (enabled: boolean) => {
            update(s => ({ ...s, autoSync: enabled }));
        },

        // イベントハンドラーを設定
        onEvent: (handler: (event: StudioToConsoleEvent) => void) => {
            onEventReceived = handler;
        },

        // パッチ適用を通知
        notifyPatchApplied: (patchId: string) => {
            const patches = get(appliedPatchesStore);
            const patch = patches.find(p => p.id === patchId);
            if (patch) {
                // PredefinedPatch型をSpecPatch形式に変換して送信
                sendEvent({
                    type: 'PATCH_APPLIED',
                    patch: {
                        id: patch.id,
                        name: patch.name,
                        description: patch.description,
                        diffs: patch.diffs.map((d, i) => ({
                            id: `${patch.id}-diff-${i}`,
                            ...d
                        })),
                        appliedAt: new Date()
                    }
                });
            }
        },

        // パッチ取消を通知
        notifyPatchReverted: (patchId: string) => {
            sendEvent({ type: 'PATCH_REVERTED', patchId });
        },

        // 同期リクエスト
        requestSync: () => {
            sendEvent({ type: 'SYNC_REQUEST' });
        }
    };
}

export const studioConnection = createStudioConnectionStore();
