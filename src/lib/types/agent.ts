/**
 * Spec-Kit Agent Types
 * エージェントの役割・能力・制約を定義する型
 */

export type AgentStatus = 'active' | 'idle' | 'warning' | 'error' | 'offline';

export interface AgentSpec {
    name: string;
    displayName: string;
    description: string;
    icon: string;
    role: string;
    capabilities: string[];
    constraints: string[];
    communication: {
        canSendTo: string[];
        canReceiveFrom: string[];
    };
}

export interface AgentState {
    agentName: string;
    status: AgentStatus;
    currentTask?: string;
    progress?: number;
    lastActivity: Date;
    metrics: {
        tasksCompleted: number;
        averageResponseTime: string;
        errorRate: number;
    };
}

export interface Agent extends AgentSpec {
    state: AgentState;
}

/**
 * Message Types
 * エージェント間通信のメッセージ型
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';

export interface Message {
    id: string;
    from: string;
    to: string;
    timestamp: Date;
    type: string;
    priority: MessagePriority;
    content: {
        summary: string;
        [key: string]: unknown;
    };
}

/**
 * Log Types
 * コンソールログの型
 */
export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    source?: string;
    message: string;
}
