// Firebase Manager with Encryption
class FirebaseManager {
    constructor(encryptionManager) {
        this.encryption = encryptionManager;
        this.db = null;
        this.userId = null;
        this.isConfigured = false;
        this.isSyncing = false;
        this.loadConfig();
    }

    // Load Firebase config from localStorage
    loadConfig() {
        const config = localStorage.getItem('firebase_config');
        if (config) {
            try {
                const parsedConfig = JSON.parse(config);
                this.initializeFirebase(parsedConfig);
            } catch (error) {
                console.error('Error loading Firebase config:', error);
            }
        }
    }

    // Save Firebase config to localStorage
    saveConfig(config) {
        localStorage.setItem('firebase_config', JSON.stringify(config));
        this.initializeFirebase(config);
    }

    // Initialize Firebase with config
    async initializeFirebase(config) {
        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(config);
            }

            this.db = firebase.firestore();

            // Generate or get unique user ID for this device
            this.userId = this.getOrCreateUserId();

            this.isConfigured = true;
            console.log('Firebase initialized successfully');

            // Enable offline persistence
            try {
                await this.db.enablePersistence({ synchronizeTabs: true });
                console.log('Offline persistence enabled');
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.log('Persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.log('Persistence not supported');
                }
            }

            return true;
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.isConfigured = false;
            return false;
        }
    }

    // Get or create unique user ID
    getOrCreateUserId() {
        let userId = localStorage.getItem('firebase_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('firebase_user_id', userId);
        }
        return userId;
    }

    // Check if Firebase is configured
    isReady() {
        return this.isConfigured && this.db !== null;
    }

    // Sync all ideas to Firebase
    async syncToFirebase(ideas) {
        if (!this.isReady()) {
            throw new Error('Firebase not configured');
        }

        this.isSyncing = true;

        try {
            const batch = this.db.batch();
            const userRef = this.db.collection('users').doc(this.userId);

            // Encrypt and prepare ideas
            const encryptedIdeas = ideas.map(idea => this.encryption.encryptIdea(idea));

            // Store encrypted ideas
            const ideasData = {
                ideas: encryptedIdeas,
                lastSync: firebase.firestore.FieldValue.serverTimestamp(),
                deviceId: this.encryption.getDeviceFingerprint()
            };

            batch.set(userRef, ideasData);

            await batch.commit();

            this.isSyncing = false;
            return {
                success: true,
                count: ideas.length,
                timestamp: new Date()
            };
        } catch (error) {
            this.isSyncing = false;
            console.error('Sync error:', error);
            throw error;
        }
    }

    // Load ideas from Firebase
    async loadFromFirebase() {
        if (!this.isReady()) {
            throw new Error('Firebase not configured');
        }

        try {
            const userRef = this.db.collection('users').doc(this.userId);
            const doc = await userRef.get();

            if (!doc.exists) {
                return {
                    success: true,
                    ideas: [],
                    message: 'No data found in Firebase'
                };
            }

            const data = doc.data();
            const encryptedIdeas = data.ideas || [];

            // Decrypt ideas
            const ideas = encryptedIdeas.map(encrypted => {
                try {
                    return this.encryption.decryptIdea(encrypted);
                } catch (error) {
                    console.error('Failed to decrypt idea:', encrypted.id, error);
                    return null;
                }
            }).filter(idea => idea !== null);

            return {
                success: true,
                ideas: ideas,
                lastSync: data.lastSync?.toDate() || null
            };
        } catch (error) {
            console.error('Load error:', error);
            throw error;
        }
    }

    // Auto-sync: sync to Firebase periodically
    async autoSync(ideas, intervalMinutes = 5) {
        if (!this.isReady()) return;

        const sync = async () => {
            try {
                await this.syncToFirebase(ideas);
                console.log('Auto-sync completed');
            } catch (error) {
                console.error('Auto-sync failed:', error);
            }
        };

        // Initial sync
        await sync();

        // Set up periodic sync
        setInterval(sync, intervalMinutes * 60 * 1000);
    }

    // Real-time sync listener
    setupRealtimeSync(onUpdate) {
        if (!this.isReady()) {
            throw new Error('Firebase not configured');
        }

        const userRef = this.db.collection('users').doc(this.userId);

        return userRef.onSnapshot(
            (doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const encryptedIdeas = data.ideas || [];

                    const ideas = encryptedIdeas.map(encrypted => {
                        try {
                            return this.encryption.decryptIdea(encrypted);
                        } catch (error) {
                            console.error('Failed to decrypt idea:', error);
                            return null;
                        }
                    }).filter(idea => idea !== null);

                    onUpdate(ideas, data.lastSync?.toDate());
                }
            },
            (error) => {
                console.error('Realtime sync error:', error);
            }
        );
    }

    // Delete all data from Firebase
    async clearFirebaseData() {
        if (!this.isReady()) {
            throw new Error('Firebase not configured');
        }

        try {
            const userRef = this.db.collection('users').doc(this.userId);
            await userRef.delete();
            return { success: true };
        } catch (error) {
            console.error('Clear data error:', error);
            throw error;
        }
    }

    // Disconnect Firebase
    disconnect() {
        if (firebase.apps.length) {
            firebase.app().delete();
        }
        this.db = null;
        this.isConfigured = false;
    }

    // Get sync status
    getSyncStatus() {
        return {
            configured: this.isConfigured,
            syncing: this.isSyncing,
            userId: this.userId
        };
    }
}
