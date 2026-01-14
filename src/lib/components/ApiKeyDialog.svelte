<!--
  ApiKeyDialog.svelte - APIキー設定ダイアログ
-->
<script lang="ts">
	import {
		encrypt,
		decrypt,
		saveEncryptedApiKey,
		getEncryptedApiKey,
		setSessionApiKey,
		clearApiKey,
		hasEncryptedApiKey,
		hasSessionApiKey
	} from '$lib/stores/crypto-store';

	interface Props {
		onClose: () => void;
		onKeySet: () => void;
	}

	let { onClose, onKeySet } = $props<Props>();

	let mode = $state<'input' | 'unlock' | 'ready'>(
		hasSessionApiKey() ? 'ready' : hasEncryptedApiKey() ? 'unlock' : 'input'
	);

	let apiKey = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleSave() {
		error = '';

		if (!apiKey.trim()) {
			error = 'APIキーを入力してください';
			return;
		}

		if (!password) {
			error = 'パスワードを入力してください';
			return;
		}

		if (password !== confirmPassword) {
			error = 'パスワードが一致しません';
			return;
		}

		if (password.length < 8) {
			error = 'パスワードは8文字以上で入力してください';
			return;
		}

		isLoading = true;
		try {
			const encrypted = await encrypt(apiKey.trim(), password);
			saveEncryptedApiKey(encrypted);
			setSessionApiKey(apiKey.trim());
			mode = 'ready';
			onKeySet();
		} catch (e) {
			error = '暗号化に失敗しました';
		} finally {
			isLoading = false;
		}
	}

	async function handleUnlock() {
		error = '';

		if (!password) {
			error = 'パスワードを入力してください';
			return;
		}

		const encryptedData = getEncryptedApiKey();
		if (!encryptedData) {
			error = '保存されたAPIキーがありません';
			return;
		}

		isLoading = true;
		try {
			const decryptedKey = await decrypt(encryptedData, password);
			setSessionApiKey(decryptedKey);
			mode = 'ready';
			onKeySet();
		} catch {
			error = 'パスワードが正しくありません';
		} finally {
			isLoading = false;
		}
	}

	function handleClear() {
		if (confirm('APIキーを削除しますか？この操作は取り消せません。')) {
			clearApiKey();
			mode = 'input';
			apiKey = '';
			password = '';
			confirmPassword = '';
		}
	}

	function handleNewKey() {
		mode = 'input';
		apiKey = '';
		password = '';
		confirmPassword = '';
	}
</script>

<div class="dialog-overlay" onclick={onClose} role="presentation">
	<div class="dialog" onclick={(e) => e.stopPropagation()} role="dialog">
		<div class="dialog-header">
			<h2>🔑 API Key Settings</h2>
			<button class="close-btn" onclick={onClose}>×</button>
		</div>

		<div class="dialog-content">
			{#if mode === 'input'}
				<div class="security-notice">
					<span class="icon">🛡️</span>
					<div>
						<strong>BYOK (Bring Your Own Key)</strong>
						<p>あなたのAPIキーはブラウザ外へ送信されません。パスワードで暗号化して保存されます。</p>
					</div>
				</div>

				<div class="form-group">
					<label for="apiKey">Gemini API Key</label>
					<input
						id="apiKey"
						type="password"
						bind:value={apiKey}
						placeholder="AIza..."
						autocomplete="off"
					/>
					<span class="hint">
						<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">
							Google AI Studioでキーを取得
						</a>
					</span>
				</div>

				<div class="form-group">
					<label for="password">暗号化パスワード</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="8文字以上"
						autocomplete="new-password"
					/>
				</div>

				<div class="form-group">
					<label for="confirmPassword">パスワード確認</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						placeholder="もう一度入力"
						autocomplete="new-password"
					/>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<button class="btn primary" onclick={handleSave} disabled={isLoading}>
					{isLoading ? '暗号化中...' : '保存'}
				</button>

			{:else if mode === 'unlock'}
				<div class="security-notice">
					<span class="icon">🔐</span>
					<div>
						<strong>ロック解除</strong>
						<p>保存されたAPIキーを使用するにはパスワードを入力してください。</p>
					</div>
				</div>

				<div class="form-group">
					<label for="unlockPassword">パスワード</label>
					<input
						id="unlockPassword"
						type="password"
						bind:value={password}
						placeholder="暗号化パスワード"
						autocomplete="current-password"
					/>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<div class="button-group">
					<button class="btn primary" onclick={handleUnlock} disabled={isLoading}>
						{isLoading ? '復号中...' : 'ロック解除'}
					</button>
					<button class="btn secondary" onclick={handleNewKey}>
						新しいキーを設定
					</button>
				</div>

			{:else}
				<div class="security-notice success">
					<span class="icon">✅</span>
					<div>
						<strong>APIキー設定済み</strong>
						<p>Gemini APIが使用可能です。キーはセッション終了時に自動消去されます。</p>
					</div>
				</div>

				<div class="button-group">
					<button class="btn secondary" onclick={handleClear}>
						キーを削除
					</button>
					<button class="btn primary" onclick={onClose}>
						閉じる
					</button>
				</div>
			{/if}
		</div>

		<div class="dialog-footer">
			<span class="warning">⚠️ XSS攻撃からは完全には保護されません</span>
		</div>
	</div>
</div>

<style>
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-bright);
		border-radius: var(--radius-lg);
		width: 90%;
		max-width: 450px;
		box-shadow: 0 0 50px rgba(0, 255, 255, 0.2);
	}

	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.dialog-header h2 {
		margin: 0;
		font-size: 1rem;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--color-text-dim);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--color-text);
	}

	.dialog-content {
		padding: var(--space-lg);
	}

	.security-notice {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-md);
		background: rgba(0, 255, 255, 0.1);
		border-left: 3px solid var(--color-cyan);
		border-radius: var(--radius-sm);
		margin-bottom: var(--space-lg);
	}

	.security-notice.success {
		background: rgba(0, 255, 136, 0.1);
		border-color: var(--color-green);
	}

	.security-notice .icon {
		font-size: 1.5rem;
	}

	.security-notice strong {
		display: block;
		margin-bottom: var(--space-xs);
	}

	.security-notice p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-text-dim);
	}

	.form-group {
		margin-bottom: var(--space-md);
	}

	.form-group label {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-xs);
	}

	.form-group input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: 0.9rem;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--color-cyan);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
	}

	.hint {
		display: block;
		font-size: 0.7rem;
		color: var(--color-text-dim);
		margin-top: var(--space-xs);
	}

	.hint a {
		color: var(--color-cyan);
		text-decoration: none;
	}

	.hint a:hover {
		text-decoration: underline;
	}

	.error {
		color: var(--color-red);
		font-size: 0.8rem;
		margin-bottom: var(--space-md);
		padding: var(--space-sm);
		background: rgba(255, 85, 85, 0.1);
		border-radius: var(--radius-sm);
	}

	.btn {
		padding: var(--space-sm) var(--space-lg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		font-size: 0.85rem;
		transition: all var(--transition-fast);
	}

	.btn.primary {
		background: rgba(0, 255, 255, 0.1);
		border-color: var(--color-cyan);
		color: var(--color-cyan);
		width: 100%;
	}

	.btn.primary:hover:not(:disabled) {
		background: rgba(0, 255, 255, 0.2);
		box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
	}

	.btn.secondary {
		border-color: var(--color-text-dim);
		color: var(--color-text-dim);
	}

	.btn.secondary:hover {
		border-color: var(--color-text);
		color: var(--color-text);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.button-group {
		display: flex;
		gap: var(--space-sm);
	}

	.button-group .btn {
		flex: 1;
	}

	.dialog-footer {
		padding: var(--space-sm) var(--space-lg);
		border-top: 1px solid var(--color-border);
		text-align: center;
	}

	.warning {
		font-size: 0.65rem;
		color: var(--color-orange);
	}
</style>
