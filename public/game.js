const socket = io();

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// UI Elements
const loginPanel = document.getElementById('login-panel');
const hud = document.getElementById('hud');
const usernameInput = document.getElementById('username');
const joinBtn = document.getElementById('join-btn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Biến lưu trạng thái tất cả người chơi từ server
let frontendPlayers = {}; 

// Biến input chuột
const mouse = { x: 0, y: 0 };
let gameStarted = false;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Xử lý nút "Start Battle"
joinBtn.addEventListener('click', () => {
    const name = usernameInput.value;
    if (name.trim()) {
        socket.emit('joinGame', name);
        loginPanel.classList.add('hidden'); // Ẩn menu login
        hud.classList.remove('hidden');     // Hiện HUD
        gameStarted = true;
    }
});

// Nhận update từ server (quan trọng!)
socket.on('stateUpdate', (backendPlayers) => {
    frontendPlayers = backendPlayers;
});

// --- GAME LOOP ---
function update() {
    if (!gameStarted) return;

    // Thay vì tự tính toán vị trí, ta gửi vị trí chuột mong muốn lên server
    socket.emit('playerInput', { x: mouse.x, y: mouse.y });
}

function draw() {
    // 1. Xóa màn hình và vẽ nền tối
    ctx.fillStyle = '#111'; // Màu nền trùng với CSS
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vẽ Grid (Lưới) để tạo cảm giác di chuyển
    drawGrid();

    // 2. Vẽ TẤT CẢ người chơi từ dữ liệu Server gửi về
    for (const id in frontendPlayers) {
        const p = frontendPlayers[id];
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Vẽ tên người chơi
        ctx.fillStyle = 'white';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(p.username, p.x, p.y - p.radius - 10);
        ctx.closePath();
    }
}

// Hàm phụ trợ vẽ lưới nền (tạo hiệu ứng không gian)
function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const gridSize = 50;
    
    // Lưu ý: Đây là lưới tĩnh, sau này cần camera để lưới di chuyển theo
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();