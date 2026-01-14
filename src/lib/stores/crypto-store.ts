/**
 * Crypto Store
 * APIキーの暗号化保存（BYOK方式）
 * 
 * Security Weather Stationと同様の実装：
 * - PBKDF2 (600,000回) でパスワードから鍵導出
 * - AES-GCM で暗号化
 * - Session Storageに復号済みキーを保持（タブを閉じると消去）
 */

const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

// 暗号化されたデータの形式
interface EncryptedData {
    salt: string;  // Base64
    iv: string;    // Base64
    data: string;  // Base64
}

// パスワードから暗号化キーを導出
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// 暗号化
export async function encrypt(plaintext: string, password: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(plaintext)
    );

    return {
        salt: btoa(String.fromCharCode(...salt)),
        iv: btoa(String.fromCharCode(...iv)),
        data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
}

// 復号
export async function decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(encryptedData.data), c => c.charCodeAt(0));

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}

// LocalStorage キー
const STORAGE_KEY = 'aether-console-api-key';
const SESSION_KEY = 'aether-console-decrypted-key';

// 暗号化されたAPIキーを保存
export function saveEncryptedApiKey(encryptedData: EncryptedData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedData));
}

// 暗号化されたAPIキーを取得
export function getEncryptedApiKey(): EncryptedData | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
}

// 復号済みAPIキーをセッションに保存（タブを閉じると消去）
export function setSessionApiKey(apiKey: string): void {
    sessionStorage.setItem(SESSION_KEY, apiKey);
}

// セッションからAPIキーを取得
export function getSessionApiKey(): string | null {
    return sessionStorage.getItem(SESSION_KEY);
}

// APIキーをクリア
export function clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
}

// 暗号化されたキーが存在するか
export function hasEncryptedApiKey(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

// セッションにキーがあるか
export function hasSessionApiKey(): boolean {
    return sessionStorage.getItem(SESSION_KEY) !== null;
}
