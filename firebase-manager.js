// Firebase Manager (Shared Data - No Encryption)
class FirebaseManager {
    constructor() {
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

            // Set up auth listener to get user ID from Firebase Auth
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.userId = user.uid; // Use Firebase Auth UID
                    console.log('[Firebase] User authenticated, ID:', this.userId);
                } else {
                    this.userId = null;
                    console.log('[Firebase] User signed out');
                }
            });

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

    // Check if Firebase is configured and user is authenticated
    isReady() {
        return this.isConfigured && this.db !== null && this.userId !== null;
    }

    // Save ideas to Firebase (simple)
    async saveIdeas(ideas) {
        if (!this.isReady()) {
            throw new Error('Firebase not configured');
        }

        try {
            const userRef = this.db.collection('users').doc(this.userId);

            await userRef.set({
                ideas: ideas,
                lastSync: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    // Real-time sync listener - automatically updates when data changes
    setupRealtimeSync(onUpdate) {
        if (!this.isReady()) {
            throw new Error('Firebase not configured');
        }

        const userRef = this.db.collection('users').doc(this.userId);

        console.log('[Firebase] Setting up realtime sync for user:', this.userId);

        return userRef.onSnapshot(
            (doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const ideas = data.ideas || [];
                    console.log('[Firebase] Realtime update received:', ideas.length, 'ideas');
                    onUpdate(ideas);
                } else {
                    console.log('[Firebase] No data exists yet');
                    onUpdate([]);
                }
            },
            (error) => {
                console.error('[Firebase] Realtime sync error:', error);
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
