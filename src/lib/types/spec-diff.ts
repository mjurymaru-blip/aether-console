/**
 * Spec Diff Types
 * エージェントSpec差分の型定義
 */

import type { AgentSpec } from './agent';

export type DiffOperation = 'add' | 'remove' | 'modify';

export interface SpecDiff {
    id: string;
    agentName: string;
    operation: DiffOperation;
    path: string; // e.g., "capabilities", "constraints", "communication.canSendTo"
    before?: unknown;
    after?: unknown;
    description: string;
    impact: 'low' | 'medium' | 'high';
}

export interface SpecPatch {
    id: string;
    name: string;
    description: string;
    diffs: SpecDiff[];
    createdAt: Date;
}

// 事前定義されたSpec変更パッチ
export interface PredefinedPatch {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'capability' | 'constraint' | 'communication' | 'observability';
    diffs: Omit<SpecDiff, 'id'>[];
}
