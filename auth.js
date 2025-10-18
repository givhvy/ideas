// Authentication Manager
class AuthManager {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.initPromise = this.init();
    }

    async init() {
        console.log('[Auth] Initializing AuthManager...');
        // Wait for Firebase config
        await this.loadFirebaseConfig();
        this.setupAuthListener();
        console.log('[Auth] AuthManager initialized, auth:', this.auth ? 'ready' : 'not ready');
    }

    // Ensure auth is ready before use
    async ensureReady() {
        await this.initPromise;
        if (!this.auth) {
            throw new Error('Firebase chưa được cấu hình. Vui lòng cấu hình Firebase trước.');
        }
    }

    async loadFirebaseConfig() {
        // Wait a bit for firebase-config.js to execute
        await new Promise(resolve => setTimeout(resolve, 100));

        const config = localStorage.getItem('firebase_config');

        if (!config) {
            console.error('[Auth] No Firebase config found in localStorage');
            return;
        }

        try {
            const parsedConfig = JSON.parse(config);
            console.log('[Auth] Firebase config loaded from localStorage');

            if (!firebase.apps.length) {
                firebase.initializeApp(parsedConfig);
                console.log('[Auth] Firebase app initialized');
            } else {
                console.log('[Auth] Firebase app already initialized');
            }

            this.auth = firebase.auth();

            // Check remember me setting
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            const persistence = rememberMe ?
                firebase.auth.Auth.Persistence.LOCAL :
                firebase.auth.Auth.Persistence.SESSION;

            await this.auth.setPersistence(persistence);
            console.log('[Auth] Persistence set to:', rememberMe ? 'LOCAL' : 'SESSION');
        } catch (error) {
            console.error('[Auth] Error loading Firebase config:', error);
        }
    }

    setupAuthListener() {
        if (!this.auth) {
            console.error('[Auth] Firebase auth not initialized');
            return;
        }

        let isRedirecting = false;

        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;

            // Prevent multiple redirects
            if (isRedirecting) return;

            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('login.html') || currentPath === '/login';
            const isAppPage = currentPath.includes('index.html') || currentPath === '/' || currentPath === '/index';

            console.log('[Auth] onAuthStateChanged fired');
            console.log('[Auth] Path check:', { currentPath, isLoginPage, isAppPage, user: user?.email || 'none' });

            // If on login page and user is logged in, redirect to app
            if (isLoginPage && user) {
                console.log('[Auth] User logged in on login page - redirecting to app...');
                isRedirecting = true;
                window.location.replace('index.html');
            }
            // If on app page and user is not logged in, redirect to login
            else if (isAppPage && !user) {
                console.log('[Auth] No user on app page - redirecting to login...');
                isRedirecting = true;
                window.location.replace('login.html');
            } else {
                console.log('[Auth] No redirect needed');
            }
        });
    }

    // Wait for auth to be ready
    waitForAuth() {
        return new Promise((resolve) => {
            if (!this.auth) {
                console.error('[Auth] No auth instance');
                resolve(null);
                return;
            }

            const unsubscribe = this.auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    async login(email, password, rememberMe) {
        await this.ensureReady();

        try {
            // Set persistence based on remember me
            const persistence = rememberMe ?
                firebase.auth.Auth.Persistence.LOCAL :
                firebase.auth.Auth.Persistence.SESSION;

            await this.auth.setPersistence(persistence);

            // Save remember me preference
            localStorage.setItem('rememberMe', rememberMe.toString());

            // Sign in
            const result = await this.auth.signInWithEmailAndPassword(email, password);

            return { success: true, user: result.user };
        } catch (error) {
            console.error('Login error:', error);

            let message = 'Đăng nhập thất bại';
            if (error.code === 'auth/user-not-found') {
                message = 'Email không tồn tại';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Sai mật khẩu';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Email không hợp lệ';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Quá nhiều lần thử. Vui lòng thử lại sau';
            }

            return { success: false, error: message };
        }
    }

    async logout() {
        if (!this.auth) return;

        try {
            console.log('[Auth] Logging out...');
            await this.auth.signOut();
            console.log('[Auth] Sign out successful, redirecting to login...');
            // Force redirect immediately
            window.location.replace('login.html');
        } catch (error) {
            console.error('[Auth] Logout error:', error);
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorMessage = document.getElementById('errorMessage');
        const loginBtn = document.getElementById('loginBtn');

        // Disable button
        loginBtn.disabled = true;
        loginBtn.textContent = 'Đang đăng nhập...';
        errorMessage.style.display = 'none';

        try {
            const result = await authManager.login(email, password, rememberMe);

            if (result.success) {
                // Redirect will happen automatically via onAuthStateChanged
            } else {
                errorMessage.textContent = result.error;
                errorMessage.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.textContent = 'Đăng nhập';
            }
        } catch (error) {
            errorMessage.textContent = 'Lỗi: ' + error.message;
            errorMessage.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Đăng nhập';
        }
    });
}
