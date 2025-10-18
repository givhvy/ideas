const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Default route redirects to login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('   💡 MY IDEAS - Server Running!');
    console.log('========================================');
    console.log('');
    console.log(`   🌐 Open: http://localhost:${PORT}`);
    console.log('');
    console.log('   📱 Test Cross-Browser:');
    console.log('   1. Login and add ideas');
    console.log('   2. Click "☁️ Đồng bộ lên Cloud"');
    console.log('   3. Open Incognito/another browser');
    console.log('   4. Login with same account');
    console.log('   5. Click "⬇️ Tải từ Cloud"');
    console.log('');
    console.log('   ⏹️  Press Ctrl+C to stop');
    console.log('========================================');
    console.log('');
});
