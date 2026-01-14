/**
 * Scenario Types
 * シナリオ再生用の型定義
 */

import type { AgentStatus, LogLevel, MessagePriority } from './agent';

export type ScenarioActionType = 'set-state' | 'send-message' | 'console-log';

export interface SetStateAction {
    time: number;
    action: 'set-state';
    agent: string;
    state: {
        status?: AgentStatus;
        currentTask?: string;
        progress?: number;
    };
}

export interface SendMessageAction {
    time: number;
    action: 'send-message';
    from: string;
    to: string;
    message: {
        type: string;
        priority?: MessagePriority;
        content: {
            summary: string;
            [key: string]: unknown;
        };
    };
}

export interface ConsoleLogAction {
    time: number;
    action: 'console-log';
    level?: LogLevel;
    source?: string;
    message: string;
}

export type ScenarioStep = SetStateAction | SendMessageAction | ConsoleLogAction;

export interface Scenario {
    name: string;
    description: string;
    duration: number; // 総時間（ms）
    steps: ScenarioStep[];
}

export interface SimulationState {
    isPlaying: boolean;
    isPaused: boolean;
    currentTime: number;
    playbackSpeed: number;
    scenario: Scenario | null;
}
