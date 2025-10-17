// Ideas Manager Application
class IdeasManager {
    constructor() {
        this.ideas = [];
        this.currentEditId = null;
        this.activeFilter = null;
        this.encryption = null;
        this.firebase = null;
        this.realtimeSyncUnsubscribe = null;
        this.init();
    }

    init() {
        // Initialize encryption
        this.encryption = new EncryptionManager();

        // Initialize Firebase
        this.firebase = new FirebaseManager(this.encryption);

        this.loadIdeas();
        this.setupEventListeners();
        this.renderIdeas();
        this.updateStats();
        this.renderFilterTags();
        this.updateSyncStatus();
    }

    // Local Storage Operations
    loadIdeas() {
        const stored = localStorage.getItem('myIdeas');
        this.ideas = stored ? JSON.parse(stored) : [];
    }

    saveIdeas() {
        localStorage.setItem('myIdeas', JSON.stringify(this.ideas));
    }

    // Event Listeners
    setupEventListeners() {
        // Add/Update idea
        document.getElementById('addBtn').addEventListener('click', () => this.addOrUpdateIdea());
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelEdit());

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterIdeas(e.target.value);
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveEditedIdea());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteIdea());

        // Close modal on outside click
        document.getElementById('ideaModal').addEventListener('click', (e) => {
            if (e.target.id === 'ideaModal') {
                this.closeModal();
            }
        });

        // Enter key shortcuts
        document.getElementById('ideaTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addOrUpdateIdea();
            }
        });

        // Firebase config modal
        document.getElementById('openFirebaseConfig').addEventListener('click', () => this.openFirebaseConfigModal());
        document.getElementById('closeConfigModal').addEventListener('click', () => this.closeFirebaseConfigModal());
        document.getElementById('saveFirebaseConfig').addEventListener('click', () => this.saveFirebaseConfig());
        document.getElementById('testConnection').addEventListener('click', () => this.testFirebaseConnection());

        // Sync buttons
        document.getElementById('syncNowBtn').addEventListener('click', () => this.syncNow());
        document.getElementById('loadFromFirebaseBtn').addEventListener('click', () => this.loadFromFirebase());
        document.getElementById('toggleRealtimeSync').addEventListener('click', () => this.toggleRealtimeSync());
    }

    // Create/Update Idea
    addOrUpdateIdea() {
        const title = document.getElementById('ideaTitle').value.trim();

        if (!title) {
            this.showNotification('Vui lòng nhập ý tưởng!', 'warning');
            return;
        }

        if (this.currentEditId) {
            // Update existing idea
            const idea = this.ideas.find(i => i.id === this.currentEditId);
            if (idea) {
                idea.title = title;
                idea.content = '';
                idea.tags = [];
                idea.updatedAt = new Date().toISOString();
                this.showNotification('Đã cập nhật!', 'success');
            }
        } else {
            // Create new idea
            const newIdea = {
                id: Date.now(),
                title,
                content: '',
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.ideas.unshift(newIdea);
            this.showNotification('Đã thêm!', 'success');
        }

        this.saveIdeas();
        this.renderIdeas();
        this.updateStats();
        this.clearInputs();
        this.cancelEdit();
    }

    cancelEdit() {
        this.currentEditId = null;
        document.getElementById('addBtn').innerHTML = '<span class="btn-icon">+</span> Thêm';
        document.getElementById('cancelBtn').style.display = 'none';
        this.clearInputs();
    }

    // Open Modal for viewing/editing
    openModal(id) {
        const idea = this.ideas.find(i => i.id === id);
        if (!idea) return;

        this.currentEditId = id;

        document.getElementById('editTitle').value = idea.title;
        document.getElementById('modalDate').textContent = `Tạo: ${this.formatDate(idea.createdAt)}`;

        document.getElementById('ideaModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('ideaModal').classList.remove('show');
        this.currentEditId = null;
    }

    saveEditedIdea() {
        const idea = this.ideas.find(i => i.id === this.currentEditId);
        if (!idea) return;

        const title = document.getElementById('editTitle').value.trim();

        if (!title) {
            this.showNotification('Vui lòng nhập ý tưởng!', 'warning');
            return;
        }

        idea.title = title;
        idea.content = '';
        idea.tags = [];
        idea.updatedAt = new Date().toISOString();

        this.saveIdeas();
        this.renderIdeas();
        this.updateStats();
        this.closeModal();
        this.showNotification('Đã lưu!', 'success');
    }

    // Delete Idea
    deleteIdea() {
        if (!confirm('Bạn có chắc muốn xóa?')) return;

        this.ideas = this.ideas.filter(i => i.id !== this.currentEditId);
        this.saveIdeas();
        this.renderIdeas();
        this.updateStats();
        this.closeModal();
        this.showNotification('Đã xóa!', 'success');
    }

    // Render Ideas
    renderIdeas(filteredIdeas = null) {
        const ideasToRender = filteredIdeas || this.ideas;
        const grid = document.getElementById('ideasGrid');
        const emptyState = document.getElementById('emptyState');

        if (ideasToRender.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');

        grid.innerHTML = ideasToRender.map(idea => `
            <div class="idea-card" data-id="${idea.id}">
                <div class="idea-header">
                    <div class="idea-title">${this.escapeHtml(idea.title)}</div>
                    <div class="idea-date">${this.formatDate(idea.createdAt)}</div>
                </div>
            </div>
        `).join('');

        // Add click event listeners to cards
        document.querySelectorAll('.idea-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                this.openModal(id);
            });
        });
    }

    // Filter Ideas
    filterIdeas(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = this.ideas.filter(idea => {
            return idea.title.toLowerCase().includes(term);
        });

        this.renderIdeas(filtered);
    }

    // Update Statistics
    updateStats() {
        const total = this.ideas.length;
        const today = new Date().toDateString();
        const todayCount = this.ideas.filter(idea =>
            new Date(idea.createdAt).toDateString() === today
        ).length;

        document.getElementById('totalIdeas').textContent = total;
        document.getElementById('todayIdeas').textContent = todayCount;
    }

    // Utility Functions
    clearInputs() {
        document.getElementById('ideaTitle').value = '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hôm nay';
        if (diffDays === 2) return 'Hôm qua';
        if (diffDays <= 7) return `${diffDays - 1} ngày trước`;

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#6366f1'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Firebase Configuration Modal
    openFirebaseConfigModal() {
        const savedConfig = localStorage.getItem('firebase_config');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            document.getElementById('firebaseApiKey').value = config.apiKey || '';
            document.getElementById('firebaseAuthDomain').value = config.authDomain || '';
            document.getElementById('firebaseProjectId').value = config.projectId || '';
            document.getElementById('firebaseStorageBucket').value = config.storageBucket || '';
            document.getElementById('firebaseMessagingSenderId').value = config.messagingSenderId || '';
            document.getElementById('firebaseAppId').value = config.appId || '';
        }

        document.getElementById('firebaseConfigModal').classList.add('show');
    }

    closeFirebaseConfigModal() {
        document.getElementById('firebaseConfigModal').classList.remove('show');
    }

    async saveFirebaseConfig() {
        const config = {
            apiKey: document.getElementById('firebaseApiKey').value.trim(),
            authDomain: document.getElementById('firebaseAuthDomain').value.trim(),
            projectId: document.getElementById('firebaseProjectId').value.trim(),
            storageBucket: document.getElementById('firebaseStorageBucket').value.trim(),
            messagingSenderId: document.getElementById('firebaseMessagingSenderId').value.trim(),
            appId: document.getElementById('firebaseAppId').value.trim()
        };

        if (!config.apiKey || !config.projectId) {
            this.showNotification('Vui lòng nhập đầy đủ thông tin!', 'warning');
            return;
        }

        try {
            this.firebase.saveConfig(config);
            await this.firebase.initializeFirebase(config);
            this.showNotification('Đã lưu cấu hình Firebase!', 'success');
            this.updateSyncStatus();
            this.closeFirebaseConfigModal();
        } catch (error) {
            this.showNotification('Lỗi: ' + error.message, 'warning');
        }
    }

    async testFirebaseConnection() {
        if (!this.firebase.isReady()) {
            this.showNotification('Vui lòng cấu hình Firebase trước!', 'warning');
            return;
        }

        try {
            this.showNotification('Đang kiểm tra kết nối...', 'info');
            await this.firebase.syncToFirebase([]);
            this.showNotification('Kết nối Firebase thành công!', 'success');
        } catch (error) {
            this.showNotification('Lỗi kết nối: ' + error.message, 'warning');
        }
    }

    // Firebase Sync Operations
    async syncNow() {
        if (!this.firebase.isReady()) {
            this.showNotification('Vui lòng cấu hình Firebase trước!', 'warning');
            this.openFirebaseConfigModal();
            return;
        }

        try {
            this.updateSyncStatus('syncing');
            const result = await this.firebase.syncToFirebase(this.ideas);
            this.showNotification(`Đã đồng bộ ${result.count} ý tưởng!`, 'success');
            this.updateSyncStatus('synced');
            localStorage.setItem('lastSyncTime', new Date().toISOString());
            this.updateSyncStatus();
        } catch (error) {
            this.showNotification('Lỗi đồng bộ: ' + error.message, 'warning');
            this.updateSyncStatus('error');
        }
    }

    async loadFromFirebase() {
        if (!this.firebase.isReady()) {
            this.showNotification('Vui lòng cấu hình Firebase trước!', 'warning');
            this.openFirebaseConfigModal();
            return;
        }

        if (!confirm('Tải dữ liệu từ Firebase sẽ thay thế dữ liệu hiện tại. Bạn có chắc không?')) {
            return;
        }

        try {
            this.updateSyncStatus('syncing');
            const result = await this.firebase.loadFromFirebase();

            if (result.ideas.length === 0) {
                this.showNotification('Không có dữ liệu trên Firebase', 'info');
                this.updateSyncStatus();
                return;
            }

            this.ideas = result.ideas;
            this.saveIdeas();
            this.renderIdeas();
            this.updateStats();
            this.showNotification(`Đã tải ${result.ideas.length} ý tưởng!`, 'success');
            this.updateSyncStatus('synced');
            localStorage.setItem('lastSyncTime', new Date().toISOString());
            this.updateSyncStatus();
        } catch (error) {
            this.showNotification('Lỗi tải dữ liệu: ' + error.message, 'warning');
            this.updateSyncStatus('error');
        }
    }

    toggleRealtimeSync() {
        if (!this.firebase.isReady()) {
            this.showNotification('Vui lòng cấu hình Firebase trước!', 'warning');
            this.openFirebaseConfigModal();
            return;
        }

        if (this.realtimeSyncUnsubscribe) {
            // Disable realtime sync
            this.realtimeSyncUnsubscribe();
            this.realtimeSyncUnsubscribe = null;
            this.showNotification('Đã tắt đồng bộ realtime', 'info');
            document.getElementById('toggleRealtimeSync').textContent = '🔄 Bật Sync Realtime';
            document.getElementById('toggleRealtimeSync').classList.remove('active');
        } else {
            // Enable realtime sync
            try {
                this.realtimeSyncUnsubscribe = this.firebase.setupRealtimeSync((ideas, lastSync) => {
                    this.ideas = ideas;
                    this.saveIdeas();
                    this.renderIdeas();
                    this.updateStats();
                    this.showNotification('Dữ liệu đã được cập nhật từ Firebase', 'info');
                });

                this.showNotification('Đã bật đồng bộ realtime', 'success');
                document.getElementById('toggleRealtimeSync').textContent = '⏸️ Tắt Sync Realtime';
                document.getElementById('toggleRealtimeSync').classList.add('active');
            } catch (error) {
                this.showNotification('Lỗi: ' + error.message, 'warning');
            }
        }
    }

    updateSyncStatus(status = null) {
        const statusElement = document.getElementById('syncStatus');
        const encryptionInfo = this.encryption.getEncryptionInfo();

        if (status === 'syncing') {
            statusElement.innerHTML = '<span style="color: #f59e0b;">⏳ Đang đồng bộ...</span>';
        } else if (status === 'synced') {
            statusElement.innerHTML = '<span style="color: #10b981;">✓ Đã đồng bộ</span>';
        } else if (status === 'error') {
            statusElement.innerHTML = '<span style="color: #ef4444;">✗ Lỗi đồng bộ</span>';
        } else {
            const lastSync = localStorage.getItem('lastSyncTime');
            if (this.firebase.isReady()) {
                if (lastSync) {
                    const syncDate = new Date(lastSync);
                    statusElement.innerHTML = `
                        <span style="color: #10b981;">🔒 Mã hóa: ${encryptionInfo.algorithm}</span> |
                        <span style="color: #6366f1;">Lần cuối: ${this.formatDate(lastSync)}</span>
                    `;
                } else {
                    statusElement.innerHTML = `<span style="color: #f59e0b;">⚠️ Chưa đồng bộ | 🔒 Mã hóa: ${encryptionInfo.algorithm}</span>`;
                }
            } else {
                statusElement.innerHTML = '<span style="color: #94a3b8;">❌ Chưa cấu hình Firebase | 🔒 Local: ' + encryptionInfo.algorithm + '</span>';
            }
        }

        // Update button states
        const syncBtns = document.querySelectorAll('.sync-btn');
        syncBtns.forEach(btn => {
            if (this.firebase.isReady()) {
                btn.disabled = false;
                btn.style.opacity = '1';
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
        });
    }
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
const app = new IdeasManager();
