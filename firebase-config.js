// Firebase Configuration - Hardcoded
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAIPe_76KQGx0Cx6TaU82CrVfj0YfIfgs0",
    authDomain: "ideas-3863e.firebaseapp.com",
    projectId: "ideas-3863e",
    storageBucket: "ideas-3863e.firebasestorage.app",
    messagingSenderId: "1043179459503",
    appId: "1:1043179459503:web:d3641567612c17b754555a"
};

// Auto-save config to localStorage
localStorage.setItem('firebase_config', JSON.stringify(FIREBASE_CONFIG));

console.log('[Firebase Config] Config saved to localStorage:', FIREBASE_CONFIG.projectId);

// Make it globally available
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
