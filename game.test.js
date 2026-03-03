/**
 * 弹珠游戏自动测试
 * 使用 Jest + JSDOM 测试浏览器游戏逻辑
 */

// 加载游戏代码并解构导出的变量
const game = require('./game.js');

describe('弹珠游戏测试', () => {
    // 从模块中解构变量
    let {
        config, GameState, ball, startPos, obstacles, slots, scaleFactor,
        Particle, initGame, resetBall, launchBall, updatePower,
        updateScoreDisplay, checkCollision, updatePhysics, render,
        showFloatingText, drawBackground, drawBall, drawTrail,
        drawObstacles, drawSlots, drawAimLine, drawGameOver, createExplosion,
        createExplosion: createExplosionFn
    } = game;

    beforeEach(() => {
        // 清理 DOM
        document.querySelectorAll('.message').forEach(el => el.remove());
        // 重新解构以获取最新状态
        const freshGame = require('./game.js');
    });

    describe('游戏配置测试', () => {
        test('游戏配置对象存在', () => {
            expect(typeof game.config).toBe('object');
        });

        test('重力配置合理', () => {
            expect(game.config.gravity).toBeGreaterThan(0);
            expect(game.config.gravity).toBeLessThan(1);
        });

        test('摩擦系数合理', () => {
            expect(game.config.friction).toBeGreaterThan(0.9);
            expect(game.config.friction).toBeLessThanOrEqual(1);
        });

        test('弹力系数合理', () => {
            expect(game.config.bounceFactor).toBeGreaterThan(0);
            expect(game.config.bounceFactor).toBeLessThan(1);
        });

        test('最大蓄力值存在', () => {
            expect(game.config.maxPower).toBeGreaterThan(0);
        });

        test('蓄力速率存在', () => {
            expect(game.config.powerChargeRate).toBeGreaterThan(0);
        });

        test('轨迹长度配置合理', () => {
            expect(game.config.trailLength).toBeGreaterThan(10);
        });

        test('弹珠半径配置合理', () => {
            expect(game.config.ballRadius).toBeGreaterThan(0);
            expect(game.config.ballRadius).toBeLessThan(50);
        });
    });

    describe('游戏状态测试', () => {
        test('游戏状态枚举存在', () => {
            expect(game.GameState).toBeDefined();
        });

        test('所有游戏状态已定义', () => {
            expect(game.GameState.AIMING).toBe('aiming');
            expect(game.GameState.CHARGING).toBe('charging');
            expect(game.GameState.FLYING).toBe('flying');
            expect(game.GameState.LANDED).toBe('landed');
            expect(game.GameState.GAME_OVER).toBe('gameOver');
        });
    });

    describe('游戏初始化测试', () => {
        test('initGame 函数存在', () => {
            expect(typeof game.initGame).toBe('function');
        });

        test('障碍物数组已初始化', () => {
            expect(Array.isArray(game.obstacles)).toBe(true);
        });

        test('分数格子数组已初始化', () => {
            expect(Array.isArray(game.slots)).toBe(true);
        });

        test('障碍物数量正确', () => {
            expect(game.obstacles.length).toBe(24);
        });

        test('分数格子数量正确', () => {
            expect(game.slots.length).toBe(8);
        });

        test('障碍物类型正确', () => {
            const types = game.obstacles.map(o => o.type);
            expect(types).toContain('wall');
            expect(types).toContain('pin');
            expect(types).toContain('angle');
        });

        test('每个分数格子都有分数', () => {
            game.slots.forEach(slot => {
                expect(slot.points).toBeGreaterThan(0);
                expect(slot.label).toBeDefined();
                expect(slot.color).toBeDefined();
            });
        });

        test('500 分格子存在', () => {
            const maxSlot = game.slots.find(s => s.points === 500);
            expect(maxSlot).toBeDefined();
        });
    });

    describe('弹珠对象测试', () => {
        test('弹珠对象存在', () => {
            expect(game.ball).toBeDefined();
        });

        test('弹珠位置属性存在', () => {
            expect(game.ball.x).toBeDefined();
            expect(game.ball.y).toBeDefined();
        });

        test('弹珠速度属性存在', () => {
            expect(game.ball.vx).toBeDefined();
            expect(game.ball.vy).toBeDefined();
        });

        test('弹珠半径属性存在', () => {
            expect(game.ball.radius).toBeDefined();
        });

        test('起始位置对象存在', () => {
            expect(game.startPos).toBeDefined();
            expect(game.startPos.x).toBeDefined();
            expect(game.startPos.y).toBeDefined();
        });
    });

    describe('粒子系统测试', () => {
        test('Particle 类存在', () => {
            expect(typeof game.Particle).toBe('function');
        });

        test('可以创建粒子实例', () => {
            const particle = new game.Particle(100, 100, '#ff0000');
            expect(particle).toBeDefined();
            expect(particle.x).toBe(100);
            expect(particle.y).toBe(100);
        });

        test('粒子有生命周期', () => {
            const particle = new game.Particle(100, 100, '#ff0000');
            expect(particle.life).toBeGreaterThan(0);
            expect(particle.life).toBeLessThanOrEqual(1);
        });

        test('粒子有衰减率', () => {
            const particle = new game.Particle(100, 100, '#ff0000');
            expect(particle.decay).toBeGreaterThan(0);
            expect(particle.decay).toBeLessThan(1);
        });

        test('粒子更新方法存在', () => {
            const particle = new game.Particle(100, 100, '#ff0000');
            expect(typeof particle.update).toBe('function');
        });

        test('粒子绘制方法存在', () => {
            const particle = new game.Particle(100, 100, '#ff0000');
            expect(typeof particle.draw).toBe('function');
        });

        test('粒子更新后位置改变', () => {
            const particle = new game.Particle(100, 100, '#ff0000');
            const oldY = particle.y;
            particle.update();
            expect(particle.y).not.toBe(oldY);
        });

        test('粒子更新后生命值减少', () => {
            const particle = new game.Particle(100, 100, '#ff0000');
            const oldLife = particle.life;
            particle.update();
            expect(particle.life).toBeLessThan(oldLife);
        });
    });

    describe('爆炸效果测试', () => {
        test('createExplosion 函数存在', () => {
            expect(typeof game.createExplosion).toBe('function');
        });

        test('可以创建爆炸效果', () => {
            const initialCount = game.particles.length;
            game.createExplosion(100, 100, '#ff0000', 10);
            expect(game.particles.length).toBeGreaterThan(initialCount);
        });
    });

    describe('游戏功能函数测试', () => {
        test('resetBall 函数存在', () => {
            expect(typeof game.resetBall).toBe('function');
        });

        test('launchBall 函数存在', () => {
            expect(typeof game.launchBall).toBe('function');
        });

        test('updatePower 函数存在', () => {
            expect(typeof game.updatePower).toBe('function');
        });

        test('updateScoreDisplay 函数存在', () => {
            expect(typeof game.updateScoreDisplay).toBe('function');
        });

        test('checkCollision 函数存在', () => {
            expect(typeof game.checkCollision).toBe('function');
        });

        test('updatePhysics 函数存在', () => {
            expect(typeof game.updatePhysics).toBe('function');
        });

        test('render 函数存在', () => {
            expect(typeof game.render).toBe('function');
        });

        test('showFloatingText 函数存在', () => {
            expect(typeof game.showFloatingText).toBe('function');
        });

        test('drawBackground 函数存在', () => {
            expect(typeof game.drawBackground).toBe('function');
        });

        test('drawBall 函数存在', () => {
            expect(typeof game.drawBall).toBe('function');
        });

        test('drawTrail 函数存在', () => {
            expect(typeof game.drawTrail).toBe('function');
        });

        test('drawObstacles 函数存在', () => {
            expect(typeof game.drawObstacles).toBe('function');
        });

        test('drawSlots 函数存在', () => {
            expect(typeof game.drawSlots).toBe('function');
        });

        test('drawAimLine 函数存在', () => {
            expect(typeof game.drawAimLine).toBe('function');
        });

        test('drawGameOver 函数存在', () => {
            expect(typeof game.drawGameOver).toBe('function');
        });
    });

    describe('蓄力系统测试', () => {
        beforeEach(() => {
            game.power = 0;
            game.powerDirection = 1;
            game.gameState = game.GameState.CHARGING;
        });

        test('蓄力值可以增加', () => {
            const initialPower = game.power;
            game.updatePower();
            expect(game.power).toBeGreaterThan(initialPower);
        });

        test('蓄力值不超过最大值', () => {
            game.power = game.config.maxPower - 1;
            game.powerDirection = 1;
            game.gameState = game.GameState.CHARGING;

            for (let i = 0; i < 10; i++) {
                game.updatePower();
            }
            expect(game.power).toBeLessThanOrEqual(game.config.maxPower);
        });

        test('蓄力值不低于零', () => {
            game.power = 1;
            game.powerDirection = -1;
            game.gameState = game.GameState.CHARGING;

            for (let i = 0; i < 10; i++) {
                game.updatePower();
            }
            expect(game.power).toBeGreaterThanOrEqual(0);
        });

        test('蓄力方向会自动反转', () => {
            game.power = game.config.maxPower - 1;
            game.powerDirection = 1;
            game.gameState = game.GameState.CHARGING;

            for (let i = 0; i < 20; i++) {
                game.updatePower();
            }
            expect(game.powerDirection).toBe(-1);
        });
    });

    describe('发射系统测试', () => {
        beforeEach(() => {
            game.gameState = game.GameState.AIMING;
            game.ballsRemaining = 5;
            game.power = 10;
            game.ball.x = game.startPos.x;
            game.ball.y = game.startPos.y;
            game.ball.vx = 0;
            game.ball.vy = 0;
        });

        test('发射后游戏状态变为飞行', () => {
            game.gameState = game.GameState.CHARGING;
            game.launchBall();
            expect(game.gameState).toBe(game.GameState.FLYING);
        });

        test('发射后弹珠数量减少', () => {
            const initialBalls = game.ballsRemaining;
            game.gameState = game.GameState.CHARGING;
            game.launchBall();
            expect(game.ballsRemaining).toBe(initialBalls - 1);
        });

        test('发射后弹珠获得向上的速度', () => {
            game.gameState = game.GameState.CHARGING;
            game.power = 20;
            game.launchBall();
            expect(game.ball.vy).toBeLessThan(0);
        });

        test('没有蓄力时无法发射', () => {
            game.gameState = game.GameState.CHARGING;
            game.power = 0;
            const initialBalls = game.ballsRemaining;
            game.launchBall();
            expect(game.ballsRemaining).toBe(initialBalls);
        });
    });

    describe('重置弹珠测试', () => {
        beforeEach(() => {
            game.ballsRemaining = 3;
            game.gameState = game.GameState.LANDED;
        });

        test('重置后弹珠回到起始位置', () => {
            game.ball.x = 100;
            game.ball.y = 100;
            game.resetBall();
            expect(game.ball.x).toBe(game.startPos.x);
            expect(game.ball.y).toBe(game.startPos.y);
        });

        test('重置后速度清零', () => {
            game.ball.vx = 10;
            game.ball.vy = 10;
            game.resetBall();
            expect(game.ball.vx).toBe(0);
            expect(game.ball.vy).toBe(0);
        });

        test('重置后游戏状态为瞄准', () => {
            game.gameState = game.GameState.LANDED;
            game.resetBall();
            expect(game.gameState).toBe(game.GameState.AIMING);
        });

        test('没有弹珠时游戏结束', () => {
            game.ballsRemaining = 0;
            game.resetBall();
            expect(game.gameState).toBe(game.GameState.GAME_OVER);
        });
    });

    describe('碰撞检测测试', () => {
        beforeEach(() => {
            game.ball.vx = 5;
            game.ball.vy = 5;
        });

        test('左边界碰撞', () => {
            game.ball.x = 5;
            game.ball.y = 100;
            game.checkCollision(game.ball.x, game.ball.y, game.ball.radius);
            expect(game.ball.x).toBe(game.ball.radius);
        });

        test('右边界碰撞', () => {
            game.ball.x = game.canvas.width - 5;
            game.ball.y = 100;
            game.checkCollision(game.ball.x, game.ball.y, game.ball.radius);
            expect(game.ball.x).toBe(game.canvas.width - game.ball.radius);
        });

        test('上边界碰撞', () => {
            game.ball.x = 100;
            game.ball.y = 5;
            game.checkCollision(game.ball.x, game.ball.y, game.ball.radius);
            expect(game.ball.y).toBe(game.ball.radius);
        });

        test('边界碰撞后速度反向', () => {
            const initialVx = game.ball.vx;
            game.ball.x = 5;
            game.ball.y = 100;
            game.checkCollision(game.ball.x, game.ball.y, game.ball.radius);
            expect(game.ball.vx).toBeLessThan(initialVx);
        });
    });

    describe('分数系统测试', () => {
        test('分数显示函数存在', () => {
            expect(typeof game.updateScoreDisplay).toBe('function');
        });

        test('浮动文字函数可以创建元素', () => {
            const initialCount = document.querySelectorAll('.message').length;
            game.showFloatingText('+100', 100, 100);
            const newCount = document.querySelectorAll('.message').length;
            expect(newCount).toBeGreaterThan(initialCount);
        });
    });

    describe('物理系统测试', () => {
        beforeEach(() => {
            game.gameState = game.GameState.FLYING;
            game.ball.vx = 5;
            game.ball.vy = 0;
            game.ball.x = 100;
            game.ball.y = 100;
        });

        test('飞行状态下应用重力', () => {
            const initialVy = game.ball.vy;
            game.updatePhysics();
            expect(game.ball.vy).toBeGreaterThan(initialVy);
        });

        test('飞行状态下应用摩擦', () => {
            const initialVx = game.ball.vx;
            game.updatePhysics();
            expect(Math.abs(game.ball.vx)).toBeLessThanOrEqual(Math.abs(initialVx * game.config.friction) + 0.01);
        });

        test('非飞行状态下不更新物理', () => {
            game.gameState = game.GameState.AIMING;
            const initialVy = game.ball.vy;
            game.updatePhysics();
            expect(game.ball.vy).toBe(initialVy);
        });
    });

    describe('游戏结束状态测试', () => {
        test('按 R 可以重置游戏', () => {
            const event = new KeyboardEvent('keydown', { code: 'KeyR' });
            game.gameState = game.GameState.GAME_OVER;
            game.score = 100;
            game.ballsRemaining = 0;

            document.dispatchEvent(event);

            expect(game.score).toBe(0);
            expect(game.ballsRemaining).toBe(5);
        });
    });

    describe('移动端支持测试', () => {
        test('移动端检测存在', () => {
            expect(typeof game.isMobile).toBe('boolean');
        });

        test('触摸事件监听器存在', () => {
            const fireBtn = document.getElementById('fireBtn');
            expect(fireBtn).toBeDefined();
        });
    });

    describe('缩放比例测试', () => {
        test('缩放比例存在', () => {
            expect(typeof game.scaleFactor).toBe('number');
        });

        test('缩放比例大于 0', () => {
            expect(game.scaleFactor).toBeGreaterThan(0);
        });
    });
});
