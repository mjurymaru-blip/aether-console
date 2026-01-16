/**
 * Spec Diff Store
 * Spec差分の状態管理
 */

import { writable, derived, get } from 'svelte/store';
import type { SpecDiff, PredefinedPatch } from '../types/spec-diff';
import { agentStore, logStore } from './simulation';

// 適用済みパッチ
function createAppliedPatchesStore() {
    const { subscribe, set, update } = writable<PredefinedPatch[]>([]);

    return {
        subscribe,
        reset: () => set([]),
        apply: (patch: PredefinedPatch) => {
            update(patches => {
                // 既に適用済みならスキップ
                if (patches.some(p => p.id === patch.id)) {
                    return patches;
                }

                // パッチのdiffを適用
                patch.diffs.forEach(diff => {
                    applyDiff(diff);
                });

                // ログに記録
                logStore.add({
                    level: 'success',
                    source: 'SpecKit',
                    message: `Patch適用: ${patch.name}`
                });

                return [...patches, patch];
            });
        },
        revert: (patchId: string) => {
            update(patches => {
                const patch = patches.find(p => p.id === patchId);
                if (!patch) return patches;

                // パッチのdiffを巻き戻す
                patch.diffs.forEach(diff => {
                    revertDiff(diff);
                });

                // ログに記録
                logStore.add({
                    level: 'warning',
                    source: 'SpecKit',
                    message: `Patch取消: ${patch.name}`
                });

                return patches.filter(p => p.id !== patchId);
            });
        },
        isApplied: (patchId: string): boolean => {
            return get({ subscribe }).some(p => p.id === patchId);
        },
        // Studioから受信したパッチを追加（適用済みとしてマーク）
        addFromStudio: (patch: PredefinedPatch) => {
            update(patches => {
                // 既に存在するならスキップ
                if (patches.some(p => p.id === patch.id)) {
                    return patches;
                }

                // パッチのdiffを適用
                patch.diffs.forEach(diff => {
                    applyDiff(diff);
                });

                // ログに記録
                logStore.add({
                    level: 'success',
                    source: 'Studio',
                    message: `Studioからパッチ受信: ${patch.name}`
                });

                return [...patches, patch];
            });
        }
    };
}

// 差分を適用
function applyDiff(diff: Omit<SpecDiff, 'id'>) {
    const { agentName, operation, path, after } = diff;

    // 状態変更のみをここで処理（他の変更は将来の拡張用）
    if (path === 'state.status' && typeof after === 'string') {
        agentStore.updateState(agentName, {
            status: after as 'active' | 'idle' | 'warning' | 'error' | 'offline'
        });
    }

    // capability追加のログ
    if (path === 'capabilities' && operation === 'add') {
        logStore.add({
            level: 'info',
            source: agentName,
            message: `新能力追加: ${after}`
        });
    }

    // 制約変更のログ
    if (path.startsWith('constraints') && operation === 'modify') {
        logStore.add({
            level: 'info',
            source: agentName,
            message: `制約更新: ${diff.before} → ${after}`
        });
    }

    // 通信設定変更のログ
    if (path.startsWith('communication') && operation === 'add') {
        logStore.add({
            level: 'info',
            source: agentName,
            message: `通信許可追加: ${after}`
        });
    }
}

// 差分を巻き戻す
function revertDiff(diff: Omit<SpecDiff, 'id'>) {
    const { agentName, operation, path, before } = diff;

    // 状態を元に戻す
    if (path === 'state.status' && typeof before === 'string') {
        agentStore.updateState(agentName, {
            status: before as 'active' | 'idle' | 'warning' | 'error' | 'offline'
        });
    }
}

// Store exports
export const appliedPatchesStore = createAppliedPatchesStore();

// Derived: 適用済みパッチのID一覧
export const appliedPatchIds = derived(appliedPatchesStore, $patches =>
    $patches.map(p => p.id)
);
