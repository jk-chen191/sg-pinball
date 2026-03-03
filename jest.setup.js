/**
 * Jest 测试设置文件
 * 在加载测试文件之前设置 DOM 环境
 */

// 禁用 document.write
document.write = () => {};

// 创建模拟 Canvas
const mockCanvas = document.createElement('canvas');
mockCanvas.id = 'gameCanvas';
mockCanvas.width = 600;
mockCanvas.height = 700;
mockCanvas.getContext = () => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: () => ({ data: new Array(4) }),
    fillText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    setLineDash: jest.fn(),
    measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: jest.fn() }),
    createRadialGradient: () => ({ addColorStop: jest.fn() }),
    lineTo: jest.fn(),
    strokeRect: jest.fn(),
    fillRect: jest.fn()
});
document.body.appendChild(mockCanvas);
global.canvas = mockCanvas;

// 创建其他必需的 DOM 元素
const elements = ['powerBar', 'score', 'balls', 'fireBtn', 'mobileScore', 'mobileBalls'];
elements.forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    el.textContent = '0';
    document.body.appendChild(el);
});

// 创建 mobile-info 元素
const mobileInfo = document.createElement('div');
mobileInfo.className = 'mobile-info';
mobileInfo.style.display = 'none';
document.body.appendChild(mobileInfo);

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);

// Mock 移动设备检测
Object.defineProperty(navigator, 'userAgent', {
    value: 'Jest',
    configurable: true
});
