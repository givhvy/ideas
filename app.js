// Ideas Manager Application
class IdeasManager {
    constructor() {
        this.ideas = [];
        this.currentEditId = null;
        this.activeFilter = null;
        this.firebase = null;
        this.init();
    }

    init() {
        console.log('[App] Initializing...');

        // Initialize Firebase and setup realtime sync
        this.firebase = new FirebaseManager();

        this.setupEventListeners();
        this.renderIdeas();
        this.updateStats();

        // Setup automatic realtime sync when Firebase is ready
        this.waitForFirebaseAndSync();

        console.log('[App] Initialization complete');
    }

    async waitForFirebaseAndSync() {
        // Wait for Firebase to be ready
        const checkReady = setInterval(() => {
            if (this.firebase.isReady()) {
                clearInterval(checkReady);
                console.log('[App] Firebase ready, starting realtime sync');
                this.firebase.setupRealtimeSync((ideas) => {
                    this.ideas = ideas;
                    this.renderIdeas();
                    this.updateStats();
                });
            }
        }, 500);
    }

    // Event Listeners
    setupEventListeners() {
        // Add/Update idea
        document.getElementById('addBtn').addEventListener('click', () => this.addOrUpdateIdea());
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelEdit());

        // Test button to quickly add sample ideas
        document.getElementById('testAddBtn').addEventListener('click', () => this.addTestIdea());

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
    }

    // Test function to add sample idea
    async addTestIdea() {
        const testIdeas = [
            'Tạo ứng dụng quản lý tài chính cá nhân',
            'Học React Native để làm app mobile',
            'Viết blog về lập trình',
            'Tạo Chrome extension hữu ích',
            'Học Machine Learning cơ bản'
        ];

        const randomIdea = testIdeas[Math.floor(Math.random() * testIdeas.length)];
        const newIdea = {
            id: Date.now(),
            title: randomIdea + ' - Test ' + Date.now(),
            content: '',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('[App] Adding test idea:', newIdea.title);
        this.ideas.unshift(newIdea);
        await this.saveToFirebase();
        this.showNotification('Đã thêm ý tưởng test!', 'success');
    }

    // Create/Update Idea
    async addOrUpdateIdea() {
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

        await this.saveToFirebase();
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

    async saveEditedIdea() {
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

        await this.saveToFirebase();
        this.closeModal();
        this.showNotification('Đã lưu!', 'success');
    }

    // Delete Idea
    async deleteIdea() {
        if (!confirm('Bạn có chắc muốn xóa?')) return;

        this.ideas = this.ideas.filter(i => i.id !== this.currentEditId);
        await this.saveToFirebase();
        this.closeModal();
        this.showNotification('Đã xóa!', 'success');
    }

    // Render Ideas
    renderIdeas(filteredIdeas = null) {
        const ideasToRender = filteredIdeas || this.ideas;
        const grid = document.getElementById('ideasGrid');
        const emptyState = document.getElementById('emptyState');

        console.log('[App] Rendering ideas:', ideasToRender.length);

        if (ideasToRender.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.add('show');
            console.log('[App] No ideas to render, showing empty state');
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

    // Save to Firebase
    async saveToFirebase() {
        if (!this.firebase.isReady()) {
            console.log('[App] Firebase not ready yet, queuing save...');
            return;
        }

        try {
            await this.firebase.saveIdeas(this.ideas);
            console.log('[App] Saved to Firebase');
        } catch (error) {
            console.error('[App] Error saving to Firebase:', error);
            this.showNotification('Lỗi lưu dữ liệu: ' + error.message, 'warning');
        }
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

// Initialize app and expose globally
// Don't auto-initialize - wait for auth check first
window.initApp = function() {
    if (!window.app) {
        console.log('[App] Initializing app...');
        window.app = new IdeasManager();
    }
    return window.app;
};
