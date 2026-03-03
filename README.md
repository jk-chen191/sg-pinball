# 弹珠游戏 (Pinball Game)

一个基于 HTML5 Canvas 的经典弹珠游戏，支持桌面端和移动端。

## 🎮 游戏说明

### 玩法
1. 按住 **空格键**（或触摸屏幕）蓄力
2. 松开按键发射弹珠
3. 弹珠会显示运动轨迹
4. 避开阻挡物，落入分数格子
5. 不同格子有不同分数

### 分数格子
| 分数 | 颜色 | 位置 |
|------|------|------|
| 50 | 银色 | 第 2、4、6 格 |
| 100 | 金色 | 第 1、8 格 |
| 200 | 红色 | 第 3、7 格 |
| 500 | 紫色 | 第 5 格（中心）|

## 🚀 快速开始

### 在浏览器中运行
直接打开 `index.html` 文件即可开始游戏。

```bash
# 使用任意静态服务器
npx http-server .

# 或使用 Python
python -m http.server 8000
```

然后在浏览器中访问 `http://localhost:8000`

## 🛠️ 开发

### 安装依赖
```bash
npm install
```

### 运行测试
```bash
npm test
```

### 查看测试覆盖率
```bash
npm test -- --coverage
```

## 📁 项目结构

```
sg-pinball/
├── index.html      # 游戏主页面
├── game.js         # 游戏逻辑
├── game.test.js    # 测试文件
├── jest.setup.js   # Jest 测试配置
├── package.json    # NPM 配置
└── README.md       # 项目文档
```

## 🎯 游戏配置

可以在 `game.js` 中修改游戏参数：

```javascript
const config = {
    gravity: 0.3,              // 重力
    friction: 0.98,            // 摩擦力
    bounceFactor: 0.75,        // 弹力系数
    maxPower: 35,              // 最大蓄力
    powerChargeRate: 0.3,      // 蓄力速率
    trailLength: 50,           // 轨迹长度
    ballRadius: 10             // 弹珠半径
};
```

## 📱 移动端支持

- 自动检测移动设备
- 触摸控制发射
- 响应式布局
- 禁用双击缩放

## 🧪 测试覆盖

项目包含 74 个自动化测试，覆盖：

- 游戏配置验证
- 物理系统（重力、摩擦、碰撞）
- 游戏状态管理
- 粒子系统
- 蓄力和发射系统
- 分数系统

## 🎨 特性

- ✨ 发光弹珠效果
- 🌟 粒子爆炸效果
- 📍 运动轨迹显示
- 📱 移动端适配
- 🎯 随机落点分布
- 🏆 8 个不同分数的目标格子

## 📝 技术栈

- HTML5 Canvas
- 原生 JavaScript (ES6+)
- Jest + JSDOM (测试)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
