import CryptoJS from 'crypto-js';

// Get encryption key from environment
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_SECRET;
  if (!key) {
    throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
  }
  if (key.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters long');
  }
  return key;
};

/**
 * Encrypts data using AES-256 encryption
 * @param data - The data to encrypt (will be JSON stringified)
 * @returns Encrypted string
 */
export function encrypt(data: any): string {
  try {
    const key = getEncryptionKey();
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts AES-256 encrypted data
 * @param encryptedData - The encrypted string
 * @returns Decrypted and parsed data
 */
export function decrypt(encryptedData: string): any {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hashes data using SHA-256 (one-way hash for verification)
 * @param data - The data to hash
 * @returns SHA-256 hash string
 */
export function hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generates a random encryption key
 * @param length - Length of the key (default: 32)
 * @returns Random hex string
 */
export function generateKey(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

/**
 * Encrypts data for vault storage
 * @param vaultData - The vault data object
 * @returns Encrypted string
 */
export function encryptVaultData(vaultData: {
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  custom_fields?: Record<string, string>;
}): string {
  return encrypt(vaultData);
}

/**
 * Decrypts vault data
 * @param encryptedData - The encrypted vault data
 * @returns Decrypted vault data object
 */
export function decryptVaultData(encryptedData: string): {
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  custom_fields?: Record<string, string>;
} {
  return decrypt(encryptedData);
}
