// Encryption Utility using AES-256
class EncryptionManager {
    constructor() {
        // Generate or retrieve device-specific encryption key
        this.encryptionKey = this.getOrCreateEncryptionKey();
    }

    // Get or create a SHARED encryption key for all devices
    getOrCreateEncryptionKey() {
        let key = localStorage.getItem('_shared_encryption_key');

        if (!key) {
            // Use a fixed master key derived from app identifier
            // This ensures all devices using the same account can decrypt data
            const masterSeed = 'MyIdeasApp_SharedKey_2024'; // Fixed seed
            key = CryptoJS.SHA256(masterSeed).toString();
            localStorage.setItem('_shared_encryption_key', key);
        }

        return key;
    }

    // Generate device fingerprint for unique key generation
    getDeviceFingerprint() {
        const navigator_info = navigator.userAgent +
                              navigator.language +
                              screen.width +
                              screen.height +
                              new Date().getTimezoneOffset();
        return CryptoJS.SHA256(navigator_info).toString();
    }

    // Generate random string
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Encrypt data using AES-256
    encrypt(data) {
        try {
            const jsonString = JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();

            // Convert to hex for additional obfuscation
            const hexEncrypted = this.stringToHex(encrypted);

            return hexEncrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    // Decrypt data
    decrypt(encryptedData) {
        try {
            // Convert from hex back to encrypted string
            const encrypted = this.hexToString(encryptedData);

            const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
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

    // Convert string to hex
    stringToHex(str) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            const hexValue = charCode.toString(16);
            hex += hexValue.padStart(2, '0');
        }
        return hex;
    }

    // Convert hex to string
    hexToString(hex) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            const hexValue = hex.substr(i, 2);
            const decimalValue = parseInt(hexValue, 16);
            str += String.fromCharCode(decimalValue);
        }
        return str;
    }

    // Encrypt individual idea
    encryptIdea(idea) {
        return {
            id: idea.id,
            data: this.encrypt({
                title: idea.title,
                content: idea.content,
                tags: idea.tags,
                createdAt: idea.createdAt,
                updatedAt: idea.updatedAt
            }),
            timestamp: idea.updatedAt
        };
    }

    // Decrypt individual idea
    decryptIdea(encryptedIdea) {
        const decrypted = this.decrypt(encryptedIdea.data);
        return {
            id: encryptedIdea.id,
            ...decrypted
        };
    }

    // Get encryption info for display
    getEncryptionInfo() {
        return {
            algorithm: 'AES-256',
            encoding: 'HEX',
            keyHash: CryptoJS.SHA256(this.encryptionKey).toString().substring(0, 16) + '...'
        };
    }
}
