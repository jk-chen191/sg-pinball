// 游戏配置
const config = {
    gravity: 0.3,
    friction: 0.98,
    bounceFactor: 0.75,
    maxPower: 35,
    powerChargeRate: 0.3,
    powerDecayRate: 0.3,
    trailLength: 50,
    ballRadius: 10,
    pinRandomness: 0.8  // 细针碰撞随机因子
};

// 缩放比例
let scaleFactor = 1;

// 弹珠游戏主逻辑
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const powerBar = document.getElementById('powerBar');
const scoreDisplay = document.getElementById('score');
const ballsDisplay = document.getElementById('balls');
const fireBtn = document.getElementById('fireBtn');
const mobileScore = document.getElementById('mobileScore');
const mobileBalls = document.getElementById('mobileBalls');
const mobileInfo = document.querySelector('.mobile-info');

// 检测移动设备
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 设置画布大小（自适应）
function resizeCanvas() {
    const maxWidth = window.innerWidth > 768 ? 600 : window.innerWidth - 40;
    const maxHeight = window.innerHeight > 768 ? 700 : window.innerHeight * 0.65;
    scaleFactor = Math.min(maxWidth / 600, maxHeight / 700);

    canvas.width = 600 * scaleFactor;
    canvas.height = 700 * scaleFactor;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    // 重新初始化游戏
    initGame();
    resetBall();
}

// 显示移动端信息
if (isMobile || window.innerWidth <= 768) {
    mobileInfo.style.display = 'flex';
}

// 弹珠对象（需要在 initGame 之前定义）
const ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: config.ballRadius
};

// 起始位置
const startPos = { x: 0, y: 0 };

// 游戏状态
const GameState = {
    AIMING: 'aiming',
    CHARGING: 'charging',
    FLYING: 'flying',
    LANDED: 'landed',
    GAME_OVER: 'gameOver'
};

// 游戏变量
let gameState = GameState.AIMING;
let power = 0;
let powerDirection = 1;
let score = 0;
let ballsRemaining = 5;
let trail = [];
let particles = [];
let launchPower = 0; // 保存发射时的力道

// 阻挡物 - 在 initObstacles 中初始化
let obstacles = [];

// 分数格子 - 7 个格子与细针对齐
let slots = [];

// 初始化画布大小
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 初始化障碍物和弹珠位置
function initGame() {
    // 弹珠起始位置（右侧发射通道）
    ball.x = canvas.width - 30 * scaleFactor;
    ball.y = canvas.height - 50 * scaleFactor;
    startPos.x = ball.x;
    startPos.y = ball.y;
    ball.radius = config.ballRadius * scaleFactor;

    // 阻挡物 - 发射轨道护墙 + 顶部导向障碍物 + 3 层细针
    obstacles = [
        // 发射轨道护墙（右侧，防止弹珠过早偏出）
        { x: canvas.width - 45 * scaleFactor, y: 80 * scaleFactor, width: 4 * scaleFactor, height: 120 * scaleFactor, type: 'wall' },

        // 顶部方向转换障碍物（将弹珠转为水平向左运动）
        { x: canvas.width - 70 * scaleFactor, y: 25 * scaleFactor, width: 80 * scaleFactor, height: 10 * scaleFactor, type: 'angle', angle: -90 },

        // 左侧反弹障碍物 - 增加弧度帮助弹珠向右扩散
        { x: 10 * scaleFactor, y: 25 * scaleFactor, width: 60 * scaleFactor, height: 10 * scaleFactor, type: 'wall' },

        // 第一层 (y=220) - 细针障碍物（主区域）
        { x: 60 * scaleFactor, y: 220 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 140 * scaleFactor, y: 220 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 220 * scaleFactor, y: 220 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 300 * scaleFactor, y: 220 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 380 * scaleFactor, y: 220 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 460 * scaleFactor, y: 220 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 540 * scaleFactor, y: 220 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },

        // 第二层 (y=370) - 细针障碍物（交错排列）
        { x: 20 * scaleFactor, y: 370 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 100 * scaleFactor, y: 370 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 180 * scaleFactor, y: 370 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 260 * scaleFactor, y: 370 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 340 * scaleFactor, y: 370 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 420 * scaleFactor, y: 370 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 500 * scaleFactor, y: 370 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },

        // 第三层 (y=520) - 细针障碍物（与第一层对齐）
        { x: 60 * scaleFactor, y: 520 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 140 * scaleFactor, y: 520 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 220 * scaleFactor, y: 520 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 300 * scaleFactor, y: 520 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 380 * scaleFactor, y: 520 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 460 * scaleFactor, y: 520 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' },
        { x: 540 * scaleFactor, y: 520 * scaleFactor, width: 4 * scaleFactor, height: 30 * scaleFactor, type: 'pin' }
    ];

    // 分数格子 - 调整布局使概率更均匀
    slots = [
        { x: 10 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 100, color: '#ffd700', label: '100' },
        { x: 90 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 50, color: '#c0c0c0', label: '50' },
        { x: 170 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 200, color: '#e94560', label: '200' },
        { x: 250 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 50, color: '#c0c0c0', label: '50' },
        { x: 330 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 500, color: '#ff00ff', label: '500' },
        { x: 410 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 50, color: '#c0c0c0', label: '50' },
        { x: 490 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 200, color: '#e94560', label: '200' },
        { x: 570 * scaleFactor, y: 620 * scaleFactor, width: 70 * scaleFactor, height: 60 * scaleFactor, points: 100, color: '#ffd700', label: '100' }
    ];
}

// 粒子效果
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5 * scaleFactor;
        this.vy = (Math.random() - 0.5) * 5 * scaleFactor;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.color = color;
        this.size = (3 + Math.random() * 3) * scaleFactor;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1 * scaleFactor;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 创建爆炸效果
function createExplosion(x, y, color, count = 10) {
    const actualCount = Math.floor(count * scaleFactor);
    for (let i = 0; i < actualCount; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 绘制背景
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.1)';
    ctx.lineWidth = 1 * scaleFactor;
    const gridSize = 50 * scaleFactor;
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// 绘制弹珠
function drawBall() {
    const r = ball.radius;
    // 发光效果
    const gradient = ctx.createRadialGradient(
        ball.x - r * 0.2, ball.y - r * 0.2, 0,
        ball.x, ball.y, r + r * 0.5
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#e94560');
    gradient.addColorStop(1, 'rgba(233, 69, 96, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 主体
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(ball.x - r * 0.3, ball.y - r * 0.3, ball.radius / 3, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制轨迹
function drawTrail() {
    if (trail.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
    }

    ctx.strokeStyle = 'rgba(233, 69, 96, 0.6)';
    ctx.lineWidth = 3 * scaleFactor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 绘制轨迹点
    for (let i = 0; i < trail.length; i += 3) {
        const alpha = i / trail.length;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, 2 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// 绘制阻挡物
function drawObstacles() {
    obstacles.forEach(obs => {
        if (obs.type === 'pin') {
            // 绘制细针
            const gradient = ctx.createLinearGradient(
                obs.x, obs.y,
                obs.x + obs.width, obs.y + obs.height
            );
            gradient.addColorStop(0, '#e94560');
            gradient.addColorStop(1, '#8b0000');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2 + scaleFactor, 0, Math.PI * 2);
            ctx.fill();

            // 针尖
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (obs.type === 'angle') {
            // 绘制角度障碍物
            ctx.save();
            ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
            ctx.rotate(obs.angle * Math.PI / 180);

            const gradient = ctx.createLinearGradient(-obs.width / 2, 0, obs.width / 2, 0);
            gradient.addColorStop(0, '#4a4a6a');
            gradient.addColorStop(1, '#6a6a8a');

            ctx.fillStyle = gradient;
            ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

            // 边框
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 2 * scaleFactor;
            ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

            ctx.restore();
        } else if (obs.type === 'wall') {
            // 绘制护墙
            const gradient = ctx.createLinearGradient(
                obs.x, obs.y,
                obs.x + obs.width, obs.y + obs.height
            );
            gradient.addColorStop(0, 'rgba(233, 69, 96, 0.3)');
            gradient.addColorStop(1, 'rgba(233, 69, 96, 0.1)');

            ctx.fillStyle = gradient;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // 边框
            ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
            ctx.lineWidth = 1 * scaleFactor;
            ctx.setLineDash([3 * scaleFactor, 3 * scaleFactor]);
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
            ctx.setLineDash([]);
        } else {
            // 普通障碍物
            const gradient = ctx.createLinearGradient(
                obs.x, obs.y,
                obs.x + obs.width, obs.y + obs.height
            );
            gradient.addColorStop(0, '#4a4a6a');
            gradient.addColorStop(1, '#2a2a4a');

            ctx.fillStyle = gradient;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // 边框
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 2 * scaleFactor;
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

            // 内部装饰
            ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
            if (obs.type === 'horizontal') {
                ctx.fillRect(obs.x + 5 * scaleFactor, obs.y + obs.height/2 - 2 * scaleFactor, obs.width - 10 * scaleFactor, 4 * scaleFactor);
            } else if (obs.type === 'vertical') {
                ctx.fillRect(obs.x + obs.width/2 - 2 * scaleFactor, obs.y + 5 * scaleFactor, 4 * scaleFactor, obs.height - 10 * scaleFactor);
            } else {
                ctx.beginPath();
                ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, 10 * scaleFactor, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

// 绘制分数格子
function drawSlots() {
    slots.forEach(slot => {
        const gradient = ctx.createLinearGradient(slot.x, slot.y, slot.x, slot.y + slot.height);
        gradient.addColorStop(0, slot.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);

        // 边框
        ctx.strokeStyle = slot.color;
        ctx.lineWidth = 3 * scaleFactor;
        ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);

        // 分数文字
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${20 * scaleFactor}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(slot.label, slot.x + slot.width/2, slot.y + slot.height/2);
    });
}

// 绘制瞄准线
function drawAimLine() {
    if (gameState !== GameState.CHARGING) return;

    const aimLength = Math.min(power * 8 * scaleFactor, 150 * scaleFactor);
    // 垂直向上显示瞄准线
    const endX = ball.x;
    const endY = ball.y - aimLength;

    ctx.save();
    ctx.setLineDash([5 * scaleFactor, 5 * scaleFactor]);
    ctx.strokeStyle = `rgba(233, 69, 96, ${0.5 + power / config.maxPower * 0.5})`;
    ctx.lineWidth = 2 * scaleFactor;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y - 20 * scaleFactor);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// 检测碰撞
function checkCollision(x, y, radius) {
    // 墙壁碰撞
    if (x - radius < 0) {
        ball.vx = -ball.vx * config.bounceFactor;
        ball.x = radius;
        createExplosion(ball.x, ball.y, '#e94560', 3);
    }
    if (x + radius > canvas.width) {
        ball.vx = -ball.vx * config.bounceFactor;
        ball.x = canvas.width - radius;
        createExplosion(ball.x, ball.y, '#e94560', 3);
    }
    if (y - radius < 0) {
        ball.vy = -ball.vy * config.bounceFactor;
        ball.y = radius;
        createExplosion(ball.x, ball.y, '#e94560', 3);
    }

    // 阻挡物碰撞
    obstacles.forEach(obs => {
        if (obs.type === 'pin') {
            // 细针碰撞（圆形）
            const pinX = obs.x + obs.width / 2;
            const pinY = obs.y + obs.height / 2;
            const dx = x - pinX;
            const dy = y - pinY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const pinRadius = 6 * scaleFactor;

            if (distance < radius + pinRadius) {
                // 计算反弹方向
                const nx = dx / distance;
                const ny = dy / distance;

                // 反弹并添加随机性 - 增加随机性使落点更均匀
                const dot = ball.vx * nx + ball.vy * ny;
                const randomFactor = (Math.random() - 0.5) * 8 * scaleFactor;
                const randomVy = (Math.random() - 0.5) * 4 * scaleFactor;
                ball.vx = (ball.vx - 2 * dot * nx) * config.bounceFactor + randomFactor;
                ball.vy = (ball.vy - 2 * dot * ny) * config.bounceFactor + randomVy;

                // 移出碰撞区域
                const overlap = radius + pinRadius - distance;
                ball.x += nx * overlap;
                ball.y += ny * overlap;

                createExplosion(pinX, pinY, '#e94560', 3);
            }
        } else if (obs.type === 'angle') {
            // 角度障碍物碰撞（改变方向）
            const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.width));
            const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.height));

            const dx = x - closestX;
            const dy = y - closestY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                // 根据角度障碍物设置反弹方向 - 添加随机性使落点更均匀
                if (obs.angle === -90) {
                    // 顶部障碍物：将垂直向上的弹珠转为水平向左运动
                    // 添加随机因子，避免弹道过于线性
                    const randomAngle = (Math.random() - 0.5) * 0.4; // ±20 度随机角度
                    const baseSpeed = launchPower * 0.4 * scaleFactor;
                    ball.vx = -baseSpeed * Math.cos(randomAngle) + (Math.random() - 0.5) * 5 * scaleFactor;
                    ball.vy = baseSpeed * Math.sin(randomAngle) + 2 * scaleFactor;
                }

                // 移出碰撞区域
                const nx = dx / distance || 0;
                const ny = dy / distance || 1;
                ball.x += nx * 3 * scaleFactor;
                ball.y += ny * 3 * scaleFactor;

                createExplosion(closestX, closestY, '#ffd700', 8);
            }
        } else if (obs.type === 'wall') {
            // 护墙碰撞
            const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.width));
            const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.height));

            const dx = x - closestX;
            const dy = y - closestY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const nx = dx / distance || (x < obs.x + obs.width/2 ? -1 : 1);
                const ny = dy / distance || 0;

                // 左侧墙壁碰撞后，弹珠向下掉落进入主区域
                if (nx < 0 && ball.vx < 0) {
                    ball.vx = (2 + Math.random() * 3) * scaleFactor;  // 向右反弹
                    ball.vy = 3 * scaleFactor;  // 向下加速
                } else {
                    const dot = ball.vx * nx + ball.vy * ny;
                    ball.vx = (ball.vx - 2 * dot * nx) * config.bounceFactor;
                    ball.vy = (ball.vy - 2 * dot * ny) * config.bounceFactor;
                }

                const overlap = radius - distance;
                ball.x += nx * overlap;
                ball.y += ny * overlap;

                createExplosion(closestX, closestY, 'rgba(233, 69, 96, 0.5)', 3);
            }
        } else {
            // 普通障碍物碰撞
            const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.width));
            const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.height));

            const dx = x - closestX;
            const dy = y - closestY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const nx = dx / distance || (x < obs.x + obs.width/2 ? -1 : 1);
                const ny = dy / distance || (y < obs.y + obs.height/2 ? -1 : 1);

                const dot = ball.vx * nx + ball.vy * ny;
                ball.vx = (ball.vx - 2 * dot * nx) * config.bounceFactor;
                ball.vy = (ball.vy - 2 * dot * ny) * config.bounceFactor;

                const overlap = radius - distance;
                ball.x += nx * overlap;
                ball.y += ny * overlap;

                createExplosion(closestX, closestY, '#e94560', 5);
            }
        }
    });

    // 检查是否落入格子（在掉出底部检测之前）
    for (let slot of slots) {
        if (x > slot.x && x < slot.x + slot.width &&
            y > slot.y - 20 && y < slot.y + slot.height &&
            ball.vy > 0) {
            return { slot, landed: true };
        }
    }

    // 掉出底部
    if (y > canvas.height + 50) {
        return { landed: false };
    }

    return { landed: false };
}

// 更新物理
function updatePhysics() {
    if (gameState !== GameState.FLYING) return;

    // 添加轨迹点
    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > config.trailLength) {
        trail.shift();
    }

    // 应用重力（考虑缩放）
    ball.vy += config.gravity * scaleFactor;

    // 应用摩擦
    ball.vx *= config.friction;
    ball.vy *= config.friction;

    // 检查是否在格子区域内（增加阻尼）
    for (let slot of slots) {
        if (ball.x > slot.x && ball.x < slot.x + slot.width &&
            ball.y > slot.y && ball.y < slot.y + slot.height) {
            // 格子内阻尼效果
            ball.vx *= 0.85;
            ball.vy *= 0.85;
        }
    }

    // 更新位置
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 碰撞检测
    const result = checkCollision(ball.x, ball.y, ball.radius);

    if (result.slot) {
        // 成功落入格子
        score += result.slot.points;
        updateScoreDisplay();
        gameState = GameState.LANDED;
        createExplosion(ball.x, ball.y, result.slot.color, 20);

        // 显示浮动文字
        showFloatingText(`+${result.slot.points}`, ball.x, ball.y);

        setTimeout(resetBall, 1500);
    } else if (result.landed === false && ball.y > canvas.height + 50) {
        // 掉出底部
        gameState = GameState.LANDED;
        setTimeout(resetBall, 1000);
    }
}

// 显示浮动文字
function showFloatingText(text, x, y) {
    const msg = document.createElement('div');
    msg.className = 'message';
    msg.textContent = text;
    msg.style.fontSize = (24 * scaleFactor) + 'px';
    const rect = canvas.getBoundingClientRect();
    msg.style.left = (rect.left + x) + 'px';
    msg.style.top = (rect.top + y) + 'px';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

// 重置弹珠
function resetBall() {
    if (ballsRemaining > 0) {
        ball.x = startPos.x;
        ball.y = startPos.y;
        ball.vx = 0;
        ball.vy = 0;
        trail = [];
        gameState = GameState.AIMING;
        power = 0;
    } else {
        gameState = GameState.GAME_OVER;
    }
    updateScoreDisplay();
}

// 更新蓄力
function updatePower() {
    if (gameState === GameState.CHARGING) {
        power += powerDirection * config.powerChargeRate;

        if (power >= config.maxPower) {
            power = config.maxPower;
            powerDirection = -1;
        } else if (power <= 0) {
            power = 0;
            powerDirection = 1;
        }

        powerBar.style.height = (power / config.maxPower * 100) + '%';
    }
}

// 发射弹珠
function launchBall() {
    if (gameState !== GameState.CHARGING || power <= 0) return;

    ball.vy = -power * scaleFactor;
    ball.vx = 0; // 垂直发射
    launchPower = power; // 保存发射力道
    gameState = GameState.FLYING;
    ballsRemaining--;
    updateScoreDisplay();
    powerBar.style.height = '0%';
}

// 绘制游戏结束
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e94560';
    ctx.font = `bold ${48 * scaleFactor}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30 * scaleFactor);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${32 * scaleFactor}px Arial`;
    ctx.fillText(`最终得分：${score}`, canvas.width / 2, canvas.height / 2 + 20 * scaleFactor);

    ctx.font = `${20 * scaleFactor}px Arial`;
    ctx.fillText('按 R 重新开始', canvas.width / 2, canvas.height / 2 + 70 * scaleFactor);
}

// 主渲染循环
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawSlots();
    drawObstacles();
    drawTrail();
    drawBall();
    drawAimLine();

    // 绘制粒子
    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
    });

    if (gameState === GameState.GAME_OVER) {
        drawGameOver();
    }

    updatePhysics();
    updatePower();

    requestAnimationFrame(render);
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === GameState.AIMING && ballsRemaining > 0) {
            gameState = GameState.CHARGING;
            power = 0;
            powerDirection = 1;
        }
    }
    if (e.code === 'KeyR' && gameState === GameState.GAME_OVER) {
        score = 0;
        ballsRemaining = 5;
        updateScoreDisplay();
        initGame();
        resetBall();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        if (gameState === GameState.CHARGING) {
            launchBall();
        }
    }
});

// 触摸/鼠标事件（移动端支持）
let isTouching = false;

if (fireBtn) {
    // 触摸开始
    fireBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isTouching = true;
        if (gameState === GameState.AIMING && ballsRemaining > 0) {
            gameState = GameState.CHARGING;
            power = 0;
            powerDirection = 1;
        }
    });

    // 触摸结束
    fireBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        isTouching = false;
        if (gameState === GameState.CHARGING) {
            launchBall();
        }
    });

    // 鼠标支持（桌面端测试）
    fireBtn.addEventListener('mousedown', (e) => {
        isTouching = true;
        if (gameState === GameState.AIMING && ballsRemaining > 0) {
            gameState = GameState.CHARGING;
            power = 0;
            powerDirection = 1;
        }
    });

    fireBtn.addEventListener('mouseup', (e) => {
        isTouching = false;
        if (gameState === GameState.CHARGING) {
            launchBall();
        }
    });

    fireBtn.addEventListener('mouseleave', (e) => {
        isTouching = false;
    });
}

// 触摸发射（画布区域）
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === GameState.AIMING && ballsRemaining > 0) {
        gameState = GameState.CHARGING;
        power = 0;
        powerDirection = 1;
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameState === GameState.CHARGING) {
        launchBall();
    }
});

// 更新分数显示
function updateScoreDisplay() {
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (ballsDisplay) ballsDisplay.textContent = ballsRemaining;
    if (mobileScore) mobileScore.textContent = score;
    if (mobileBalls) mobileBalls.textContent = ballsRemaining;
}

// 开始游戏
render();

// 导出变量供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        config,
        GameState,
        ball,
        startPos,
        obstacles,
        slots,
        scaleFactor,
        get gameState() { return gameState; },
        set gameState(val) { gameState = val; },
        get power() { return power; },
        set power(val) { power = val; },
        get powerDirection() { return powerDirection; },
        set powerDirection(val) { powerDirection = val; },
        get score() { return score; },
        set score(val) { score = val; },
        get ballsRemaining() { return ballsRemaining; },
        set ballsRemaining(val) { ballsRemaining = val; },
        get trail() { return trail; },
        set trail(val) { trail = val; },
        get particles() { return particles; },
        set particles(val) { particles = val; },
        get launchPower() { return launchPower; },
        set launchPower(val) { launchPower = val; },
        get isMobile() { return isMobile; },
        get canvas() { return canvas; },
        Particle,
        initGame,
        resetBall,
        launchBall,
        updatePower,
        updateScoreDisplay,
        checkCollision,
        updatePhysics,
        render,
        showFloatingText,
        drawBackground,
        drawBall,
        drawTrail,
        drawObstacles,
        drawSlots,
        drawAimLine,
        drawGameOver,
        createExplosion
    };
}
