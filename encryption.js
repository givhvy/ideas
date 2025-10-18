// Encryption Utility using AES-256
class EncryptionManager {
    constructor() {
        // Encryption key will be set from user's password after login
        this.encryptionKey = null;
    }

    // Set encryption key from user's password
    setEncryptionKey(password) {
        // Derive a strong key from the user's password
        // Using SHA-256 to create a consistent key from the password
        this.encryptionKey = CryptoJS.SHA256(password).toString();

        // Store in sessionStorage (or localStorage based on remember me)
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
            localStorage.setItem('_user_encryption_key', this.encryptionKey);
        } else {
            sessionStorage.setItem('_user_encryption_key', this.encryptionKey);
        }
    }

    // Get encryption key from storage
    getEncryptionKey() {
        if (this.encryptionKey) {
            return this.encryptionKey;
        }

        // Try to retrieve from storage
        this.encryptionKey = localStorage.getItem('_user_encryption_key') ||
                           sessionStorage.getItem('_user_encryption_key');

        return this.encryptionKey;
    }

    // Clear encryption key on logout
    clearEncryptionKey() {
        this.encryptionKey = null;
        localStorage.removeItem('_user_encryption_key');
        sessionStorage.removeItem('_user_encryption_key');
        // Also clear old shared key if exists
        localStorage.removeItem('_shared_encryption_key');
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
            const key = this.getEncryptionKey();
            if (!key) {
                throw new Error('Encryption key not set. Please login first.');
            }

            const jsonString = JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();

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
            const key = this.getEncryptionKey();
            if (!key) {
                throw new Error('Encryption key not set. Please login first.');
            }

            // Convert from hex back to encrypted string
            const encrypted = this.hexToString(encryptedData);

            const decrypted = CryptoJS.AES.decrypt(encrypted, key);
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
        const key = this.getEncryptionKey();
        return {
            algorithm: 'AES-256',
            encoding: 'HEX',
            keyHash: key ? CryptoJS.SHA256(key).toString().substring(0, 16) + '...' : 'Not set'
        };
    }
}
