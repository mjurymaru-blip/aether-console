<!--
  StudioStatus.svelte - Spec-Flow Studio接続状態インジケーター
-->
<script lang="ts">
    import { studioConnection } from "$lib/stores/studio-connection";

    let connectionState = $derived($studioConnection);

    function handleToggle() {
        if (
            connectionState.status === "connected" ||
            connectionState.status === "connecting"
        ) {
            studioConnection.disconnect();
        } else {
            studioConnection.connect();
        }
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case "connected":
                return "var(--color-green)";
            case "connecting":
                return "var(--color-yellow)";
            case "error":
                return "var(--color-red)";
            default:
                return "var(--color-text-dim)";
        }
    }

    function getStatusIcon(status: string): string {
        switch (status) {
            case "connected":
                return "◉";
            case "connecting":
                return "◎";
            case "error":
                return "◈";
            default:
                return "○";
        }
    }

    function getStatusText(status: string): string {
        switch (status) {
            case "connected":
                return "Studio接続中";
            case "connecting":
                return "接続中...";
            case "error":
                return "接続エラー";
            default:
                return "Studio未接続";
        }
    }
</script>

<div class="studio-status">
    <button
        class="status-btn"
        onclick={handleToggle}
        style="--status-color: {getStatusColor(connectionState.status)}"
        title={connectionState.status === "connected"
            ? "クリックで切断"
            : "クリックで接続"}
    >
        <span
            class="icon"
            class:pulse={connectionState.status === "connecting"}
        >
            {getStatusIcon(connectionState.status)}
        </span>
        <span class="label">{getStatusText(connectionState.status)}</span>
    </button>
</div>

<style>
    .studio-status {
        display: flex;
        align-items: center;
    }

    .status-btn {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-sm);
        background: transparent;
        border: 1px solid var(--status-color);
        border-radius: var(--radius-sm);
        color: var(--status-color);
        cursor: pointer;
        font-size: 0.75rem;
        transition: all var(--transition-fast);
    }

    .status-btn:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .icon {
        font-size: 0.8rem;
    }

    .icon.pulse {
        animation: pulse 1s infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    .label {
        font-family: var(--font-mono);
    }
</style>
