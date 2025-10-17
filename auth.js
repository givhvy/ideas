// Authentication Manager
class AuthManager {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Wait for Firebase config
        await this.loadFirebaseConfig();
        this.setupAuthListener();
    }

    async loadFirebaseConfig() {
        const config = localStorage.getItem('firebase_config');

        if (config) {
            try {
                const parsedConfig = JSON.parse(config);
                if (!firebase.apps.length) {
                    firebase.initializeApp(parsedConfig);
                }
                this.auth = firebase.auth();

                // Check remember me setting
                const rememberMe = localStorage.getItem('rememberMe') === 'true';
                const persistence = rememberMe ?
                    firebase.auth.Auth.Persistence.LOCAL :
                    firebase.auth.Auth.Persistence.SESSION;

                await this.auth.setPersistence(persistence);
            } catch (error) {
                console.error('Error loading Firebase config:', error);
            }
        }
    }

    setupAuthListener() {
        if (!this.auth) return;

        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;

            // If on login page and user is logged in, redirect to app
            if (window.location.pathname.includes('login.html') && user) {
                window.location.href = 'index.html';
            }
            // If on app page and user is not logged in, redirect to login
            else if (window.location.pathname.includes('index.html') && !user) {
                window.location.href = 'login.html';
            }
        });
    }

    async login(email, password, rememberMe) {
        if (!this.auth) {
            throw new Error('Firebase chưa được cấu hình. Vui lòng cấu hình Firebase trước.');
        }

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
            await this.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
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
