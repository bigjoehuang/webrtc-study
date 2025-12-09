# WebRTC 学习项目开发者指南

## 目录

1. [开发环境搭建](#开发环境搭建)
2. [项目结构详解](#项目结构详解)
3. [开发规范](#开发规范)
4. [代码贡献指南](#代码贡献指南)
5. [测试指南](#测试指南)
6. [部署指南](#部署指南)
7. [性能优化](#性能优化)
8. [安全考虑](#安全考虑)

## 开发环境搭建

### 1. 基础环境要求

```bash
# 必需环境
Node.js >= 14.0.0
npm >= 6.0.0
Git >= 2.20.0

# 推荐编辑器
VS Code + 推荐插件
WebStorm
```

### 2. VS Code 推荐插件

```json
{
  "recommendations": [
    "ms-vscode.vscode-js-debug",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.live-server"
  ]
}
```

### 3. 开发环境配置

```bash
# 克隆项目
git clone https://github.com/your-username/webrtc-study.git
cd webrtc-study

# 安装依赖
npm install

# 安装开发依赖
npm install --save-dev eslint prettier husky lint-staged

# 安装全局工具
npm install -g nodemon http-server
```

### 4. Git 配置

```bash
# 配置 Git
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 设置换行符（Windows）
git config core.autocrlf true

# 设置换行符（macOS/Linux）
git config core.autocrlf input
```

## 项目结构详解

### 1. 目录结构

```
web-rtc-study/
├── examples/                    # 示例代码
│   ├── 01-get-user-media/      # 示例1：获取用户媒体
│   │   ├── index.html          # HTML 结构
│   │   ├── script.js           # JavaScript 逻辑
│   │   ├── style.css           # 样式文件
│   │   └── README.md           # 示例说明
│   ├── 02-video-filters/       # 示例2：视频滤镜
│   ├── 03-screen-share/        # 示例3：屏幕共享
│   ├── 04-peer-connection/     # 示例4：P2P连接
│   ├── 05-simple-chat/         # 示例5：视频通话
│   ├── 06-data-channel/        # 示例6：数据通道
│   └── 07-complete-app/        # 示例7：完整应用
├── shared/                      # 共享资源
│   ├── utils.js                # 工具函数
│   ├── constants.js            # 常量定义
│   └── styles/                 # 共享样式
├── scripts/                     # 脚本文件
│   ├── start-signaling.js      # 信令服务器
│   ├── build.js                # 构建脚本
│   └── deploy.js               # 部署脚本
├── docs/                        # 文档
│   ├── API.md                  # API 文档
│   ├── ARCHITECTURE.md         # 架构文档
│   ├── USER_GUIDE.md           # 用户指南
│   └── DEVELOPER_GUIDE.md      # 开发者指南
├── tests/                       # 测试文件
│   ├── unit/                   # 单元测试
│   ├── integration/            # 集成测试
│   └── e2e/                    # 端到端测试
├── .github/                     # GitHub 配置
│   ├── workflows/              # CI/CD 工作流
│   └── ISSUE_TEMPLATE/         # Issue 模板
├── config/                      # 配置文件
│   ├── eslint.config.js        # ESLint 配置
│   ├── prettier.config.js      # Prettier 配置
│   └── jest.config.js          # Jest 配置
├── package.json                 # 项目配置
├── .gitignore                   # Git 忽略文件
├── .editorconfig               # 编辑器配置
├── LICENSE                     # 许可证
└── README.md                   # 项目说明
```

### 2. 示例结构规范

每个示例遵循统一的目录结构：

```
examples/XX-example-name/
├── index.html          # 主页面
├── script.js           # 主要逻辑
├── style.css           # 样式
├── config.js           # 配置文件（可选）
├── components/         # 组件（可选）
│   ├── VideoPlayer.js
│   └── Controls.js
├── utils/              # 工具函数（可选）
│   └── helpers.js
├── assets/             # 静态资源（可选）
│   ├── images/
│   └── sounds/
└── README.md           # 示例说明
```

### 3. 代码组织原则

#### 模块化设计
```javascript
// utils/media.js - 媒体相关工具函数
export const MediaUtils = {
    async getUserMedia(constraints) {
        // 获取用户媒体
    },

    stopStream(stream) {
        // 停止媒体流
    },

    switchCamera() {
        // 切换摄像头
    }
};

// components/VideoPlayer.js - 视频播放器组件
export class VideoPlayer {
    constructor(element) {
        this.element = element;
        this.stream = null;
    }

    play(stream) {
        this.stream = stream;
        this.element.srcObject = stream;
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}
```

#### 关注点分离
```javascript
// 分离业务逻辑和 UI 逻辑
class VideoCallManager {
    constructor(signaling) {
        this.signaling = signaling;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
    }

    // 业务逻辑
    async startCall(roomId) {
        this.localStream = await this.getLocalStream();
        this.peerConnection = this.createPeerConnection();
        // ... 其他逻辑
    }

    // 纯业务方法，不涉及 UI
    createPeerConnection() {
        const pc = new RTCPeerConnection(CONFIG.webrtc);
        pc.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.emit('remoteStream', this.remoteStream);
        };
        return pc;
    }
}

// UI 控制器
class VideoCallUI {
    constructor(manager) {
        this.manager = manager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.manager.on('remoteStream', (stream) => {
            this.remoteVideo.srcObject = stream;
        });
    }
}
```

## 开发规范

### 1. 代码风格

#### JavaScript 规范
```javascript
// 使用 ESLint + Prettier
// .eslintrc.js
module.exports = {
    extends: ['eslint:recommended', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        'no-console': 'warn',
        'no-unused-vars': 'error',
        'prefer-const': 'error',
        'no-var': 'error'
    }
};

// .prettierrc
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 4
}
```

#### HTML 规范
```html
<!-- 语义化 HTML -->
<article class="video-call-container">
    <header class="call-header">
        <h1 class="call-title">视频通话</h1>
        <div class="call-status" data-status="connecting">
            <span class="status-indicator"></span>
            <span class="status-text">正在连接...</span>
        </div>
    </header>

    <main class="call-content">
        <section class="video-section">
            <video class="local-video" autoplay muted playsinline></video>
            <video class="remote-video" autoplay playsinline></video>
        </section>
    </main>
</article>
```

#### CSS 规范
```css
/* BEM 命名规范 */
.video-call {}
.video-call__header {}
.video-call__content {}
.video-call__status {}
.video-call__status--connecting {}
.video-call__status--connected {}

/* CSS 变量 */
:root {
    --color-primary: #007bff;
    --color-success: #28a745;
    --color-danger: #dc3545;
    --spacing-unit: 8px;
    --border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .video-call__content {
        flex-direction: column;
    }
}
```

### 2. 命名规范

#### 文件命名
```
// 小写字母 + 连字符
get-user-media.js
video-player.js
webrtc-utils.js

// 避免使用
getUserMedia.js    // 驼峰命名
video_player.js    // 下划线
webrtcUtils.js     // 驼峰命名
```

#### 变量命名
```javascript
// 语义化命名
const localVideoElement = document.getElementById('localVideo');
const remoteStream = new MediaStream();
let isVideoMuted = false;

// 布尔值前缀
const hasCameraPermission = true;
const canStartCall = false;
const shouldShowControls = true;

// 常量全大写
const MAX_RETRY_ATTEMPTS = 3;
const ICE_GATHERING_TIMEOUT = 5000;
const DEFAULT_CONSTRAINTS = { video: true, audio: true };
```

### 3. 注释规范

#### 文件头部注释
```javascript
/**
 * @file 文件功能描述
 * @author 作者名称
 * @version 1.0.0
 * @date 2024-01-01
 */
```

#### 函数注释
```javascript
/**
 * 建立 P2P 连接
 * @param {Object} config - 连接配置
 * @param {string} config.roomId - 房间 ID
 * @param {MediaStream} config.localStream - 本地媒体流
 * @param {RTCIceServer[]} config.iceServers - ICE 服务器列表
 * @returns {Promise<RTCPeerConnection>} 返回连接对象
 * @throws {Error} 当连接失败时抛出错误
 */
async function createPeerConnection(config) {
    // 实现代码
}
```

#### 复杂逻辑注释
```javascript
// 计算最优的 ICE 候选
// 优先级：host > srflx > relay
function selectOptimalIceCandidate(candidates) {
    return candidates.sort((a, b) => {
        const priorityMap = { host: 3, srflx: 2, relay: 1 };
        return priorityMap[b.type] - priorityMap[a.type];
    })[0];
}
```

## 代码贡献指南

### 1. 开发流程

#### Fork & Pull Request 流程
```bash
# 1. Fork 项目到个人账户

# 2. 克隆 fork 的项目
git clone https://github.com/YOUR_USERNAME/webrtc-study.git
cd webrtc-study

# 3. 添加上游仓库
git remote add upstream https://github.com/original/webrtc-study.git

# 4. 创建功能分支
git checkout -b feature/your-feature-name

# 5. 开发并提交
git add .
git commit -m "feat: 添加新功能描述"

# 6. 推送到 fork 仓库
git push origin feature/your-feature-name

# 7. 创建 Pull Request
```

#### 分支命名规范
```
feature/新功能名称      # 新功能开发
fix/修复描述          # Bug 修复
docs/文档更新         # 文档更新
refactor/重构描述     # 代码重构
test/测试描述         # 测试相关
style/样式调整        # 代码格式调整
```

#### 提交信息规范
```
类型(范围): 简短描述

详细描述...

Closes #123
```

**提交类型**：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**提交示例**：
```
feat(examples): 添加屏幕共享示例

- 实现 getDisplayMedia API 的封装
- 添加屏幕共享切换功能
- 支持共享音频选项

Closes #45
```

### 2. 代码审查标准

#### 功能审查清单
- [ ] 代码符合项目规范
- [ ] 功能实现正确
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 通过了所有测试
- [ ] 没有引入新的 bug

#### 性能审查要点
```javascript
// 避免内存泄漏
function setupEventListeners() {
    const element = document.getElementById('video');

    // ✅ 正确：可以移除的事件监听器
    element.addEventListener('click', this.handleClick);

    // ❌ 错误：匿名函数无法移除
    element.addEventListener('click', () => {
        console.log('clicked');
    });
}

// 正确移除
cleanup() {
    const element = document.getElementById('video');
    element.removeEventListener('click', this.handleClick);
}
```

#### 安全审查要点
```javascript
// 输入验证
function sanitizeInput(input) {
    // 移除可能的 XSS 攻击代码
    return input.replace(/\u003cscript[^\u003e]*\u003e[\s\S]*?\u003c\/script\u003e/gi, '');
}

// 避免注入攻击
function createMessage(userInput) {
    const div = document.createElement('div');
    div.textContent = userInput; // ✅ 使用 textContent 而不是 innerHTML
    return div;
}
```

### 3. 示例开发指南

#### 创建新示例的步骤

1. **规划示例内容**
   ```markdown
   ## 示例 X：功能名称

   ### 学习目标
   - 目标 1
   - 目标 2
   - 目标 3

   ### 涉及 API
   - API 1
   - API 2

   ### 实现步骤
   1. 步骤 1
   2. 步骤 2
   3. 步骤 3
   ```

2. **创建目录结构**
   ```bash
   mkdir examples/XX-feature-name
   cd examples/XX-feature-name
   touch index.html script.js style.css README.md
   ```

3. **编写基础代码**
   ```html
   <!-- index.html -->
   <!DOCTYPE html>
   <html lang="zh-CN">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>示例 X：功能名称 - WebRTC 学习</title>
       <link rel="stylesheet" href="style.css">
   </head>
   <body>
       <div class="container">
           <!-- 页面内容 -->
       </div>
       <script type="module" src="script.js"></script>
   </body>
   </html>
   ```

4. **实现核心功能**
   ```javascript
   // script.js
   import { Utils } from '../../shared/utils.js';

   class FeatureDemo {
       constructor() {
           this.initializeElements();
           this.setupEventListeners();
       }

       initializeElements() {
           // 初始化 DOM 元素
       }

       setupEventListeners() {
           // 设置事件监听器
       }

       // 实现具体功能
   }

   // 启动应用
   document.addEventListener('DOMContentLoaded', () => {
       new FeatureDemo();
   });
   ```

5. **添加样式**
   ```css
   /* style.css */
   :root {
       /* 使用项目统一的 CSS 变量 */
   }

   .container {
       /* 统一的容器样式 */
   }

   /* 功能特定的样式 */
   ```

6. **编写文档**
   ```markdown
   # 示例 X：功能名称

   ## 学习目标

   ## 核心代码

   ## 注意事项

   ## 扩展练习
   ```

## 测试指南

### 1. 单元测试

#### 测试框架配置
```javascript
// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '<rootDir>/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'examples/**/*.js',
        'shared/**/*.js',
        '!**/node_modules/**',
        '!**/test/**'
    ]
};
```

#### 测试示例
```javascript
// tests/unit/media.test.js
import { MediaUtils } from '../../shared/utils/media.js';

describe('MediaUtils', () => {
    describe('getUserMedia', () => {
        it('应该成功获取媒体流', async () => {
            // Mock getUserMedia
            const mockStream = new MediaStream();
            global.navigator.mediaDevices = {
                getUserMedia: jest.fn().mockResolvedValue(mockStream)
            };

            const stream = await MediaUtils.getUserMedia({ video: true });
            expect(stream).toBe(mockStream);
        });

        it('应该处理权限被拒绝的情况', async () => {
            const error = new Error('Permission denied');
            error.name = 'NotAllowedError';

            global.navigator.mediaDevices = {
                getUserMedia: jest.fn().mockRejectedValue(error)
            };

            await expect(MediaUtils.getUserMedia({ video: true }))
                .rejects.toThrow('Permission denied');
        });
    });
});
```

### 2. 集成测试

```javascript
// tests/integration/peer-connection.test.js
describe('P2P Connection', () => {
    let pc1, pc2;

    beforeEach(() => {
        pc1 = new RTCPeerConnection();
        pc2 = new RTCPeerConnection();
    });

    afterEach(() => {
        pc1.close();
        pc2.close();
    });

    it('应该成功建立连接', async () => {
        // 交换 offer/answer
        const offer = await pc1.createOffer();
        await pc1.setLocalDescription(offer);
        await pc2.setRemoteDescription(offer);

        const answer = await pc2.createAnswer();
        await pc2.setLocalDescription(answer);
        await pc1.setRemoteDescription(answer);

        // 验证连接状态
        expect(pc1.connectionState).toBe('connected');
        expect(pc2.connectionState).toBe('connected');
    });
});
```

### 3. 端到端测试

#### Cypress 配置
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:8080',
        specPattern: 'tests/e2e/**/*.cy.js',
        supportFile: 'tests/e2e/support/index.js'
    }
});
```

#### E2E 测试示例
```javascript
// tests/e2e/video-call.cy.js
describe('Video Call', () => {
    beforeEach(() => {
        cy.visit('/examples/05-simple-chat/');
    });

    it('应该建立视频通话', () => {
        // 输入房间号
        cy.get('#roomId').type('test-room-123');
        cy.get('#joinBtn').click();

        // 授予权限
        cy.get('[data-cy=grant-permission]').click();

        // 开始通话
        cy.get('#startCallBtn').click();

        // 验证视频元素
        cy.get('#localVideo').should('be.visible');
        cy.get('#remoteVideo').should('be.visible');
    });
});
```

### 4. 性能测试

```javascript
// tests/performance/media-performance.test.js
describe('Media Performance', () => {
    it('应该在 1 秒内获取媒体流', async () => {
        const startTime = performance.now();

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(duration).toBeLessThan(1000);

        // 清理
        stream.getTracks().forEach(track => track.stop());
    });

    it('内存使用应该在合理范围内', async () => {
        const initialMemory = performance.memory?.usedJSHeapSize;

        // 创建多个连接
        const connections = [];
        for (let i = 0; i < 10; i++) {
            const pc = new RTCPeerConnection();
            connections.push(pc);
        }

        const finalMemory = performance.memory?.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;

        // 每个连接内存增长应该小于 10MB
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024 * 10);

        // 清理
        connections.forEach(pc => pc.close());
    });
});
```

## 部署指南

### 1. 构建流程

#### 开发构建
```bash
# 开发模式
npm run dev

# 带热重载
npm run dev:hot
```

#### 生产构建
```javascript
// scripts/build.js
const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');

async function build() {
    console.log('🚀 开始构建...');

    // 清理构建目录
    await fs.remove('dist');

    // 复制静态文件
    await fs.copy('examples', 'dist/examples');
    await fs.copy('shared', 'dist/shared');

    // 压缩 JS 文件
    const jsFiles = await glob('dist/**/*.js');
    for (const file of jsFiles) {
        const code = await fs.readFile(file, 'utf8');
        const result = await minify(code);
        await fs.writeFile(file, result.code);
    }

    console.log('✅ 构建完成');
}

build().catch(console.error);
```

### 2. 环境配置

#### 开发环境
```javascript
// config/development.js
module.exports = {
    server: {
        port: 8080,
        host: 'localhost'
    },
    webrtc: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    },
    logging: {
        level: 'debug'
    }
};
```

#### 生产环境
```javascript
// config/production.js
module.exports = {
    server: {
        port: process.env.PORT || 3000,
        host: '0.0.0.0'
    },
    webrtc: {
        iceServers: [
            { urls: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302' },
            {
                urls: process.env.TURN_SERVER,
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_PASSWORD
            }
        ]
    },
    logging: {
        level: 'info'
    }
};
```

### 3. Docker 部署

#### Dockerfile
```dockerfile
# 构建阶段
FROM node:14-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
    app:
        build: .
        ports:
            - "80:80"
        volumes:
            - ./ssl:/etc/nginx/ssl:ro
        environment:
            - NGINX_HOST=your-domain.com
            - NGINX_PORT=80

    signaling:
        image: node:14-alpine
        working_dir: /app
        volumes:
            - ./scripts:/app
        command: node start-signaling.js
        ports:
            - "8080:8080"
        environment:
            - NODE_ENV=production
            - REDIS_URL=redis://redis:6379

    redis:
        image: redis:alpine
        volumes:
            - redis-data:/data

volumes:
    redis-data:
```

### 4. CI/CD 配置

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
    push:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '14'

            - name: Install dependencies
              run: npm ci

            - name: Run tests
              run: npm test

            - name: Run linting
              run: npm run lint

    deploy:
        needs: test
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Build project
              run: |
                  npm ci
                  npm run build

            - name: Deploy to server
              uses: appleboy/scp-action@master
              with:
                  host: ${{ secrets.HOST }}
                  username: ${{ secrets.USERNAME }}
                  key: ${{ secrets.SSH_KEY }}
                  source: "dist/"
                  target: "/var/www/webrtc-study"

            - name: Restart services
              uses: appleboy/ssh-action@master
              with:
                  host: ${{ secrets.HOST }}
                  username: ${{ secrets.USERNAME }}
                  key: ${{ secrets.SSH_KEY }}
                  script: |
                      sudo systemctl restart nginx
                      sudo systemctl restart webrtc-signaling
```

## 性能优化

### 1. 代码优化

#### 减少重绘和回流
```javascript
// ❌ 错误：多次修改样式
element.style.width = '100px';
element.style.height = '100px';
element.style.backgroundColor = 'red';

// ✅ 正确：批量修改样式
element.style.cssText = 'width: 100px; height: 100px; background-color: red;';

// 或使用 CSS 类
.element--modified {
    width: 100px;
    height: 100px;
    background-color: red;
}
```

#### 使用事件委托
```javascript
// ❌ 错误：为每个按钮添加监听器
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', handleClick);
});

// ✅ 正确：使用事件委托
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('button')) {
        handleClick(e);
    }
});
```

### 2. 媒体优化

#### 自适应码率
```javascript
class BitrateController {
    constructor(pc) {
        this.pc = pc;
        this.currentBitrate = 0;
    }

    async adjustBitrate(networkQuality) {
        const sender = this.pc.getSenders().find(s =>
            s.track && s.track.kind === 'video'
        );

        if (!sender) return;

        const params = sender.getParameters();
        if (!params.encodings || !params.encodings[0]) return;

        // 根据网络质量调整码率
        switch (networkQuality) {
            case 'poor':
                params.encodings[0].maxBitrate = 100000; // 100 kbps
                break;
            case 'good':
                params.encodings[0].maxBitrate = 500000; // 500 kbps
                break;
            case 'excellent':
                params.encodings[0].maxBitrate = 2000000; // 2 Mbps
                break;
        }

        await sender.setParameters(params);
        this.currentBitrate = params.encodings[0].maxBitrate;
    }
}
```

#### 视频编解码器选择
```javascript
// 优先使用硬件加速的编解码器
const codecs = [
    { mimeType: 'video/VP8' },
    { mimeType: 'video/VP9' },
    { mimeType: 'video/H264' }
];

const supportedCodecs = codecs.filter(codec =>
    RTCRtpSender.getCapabilities('video').codecs.some(
        c => c.mimeType === codec.mimeType
    )
);

// 应用编解码器偏好
const transceiver = pc.addTransceiver(stream.getVideoTracks()[0], {
    direction: 'sendonly',
    sendEncodings: [
        { rid: 'high', maxBitrate: 2000000 },
        { rid: 'medium', maxBitrate: 500000 },
        { rid: 'low', maxBitrate: 100000 }
    ]
});

transceiver.setCodecPreferences(supportedCodecs);
```

### 3. 网络优化

#### ICE 优化
```javascript
// ICE 配置优化
const iceConfig = {
    iceServers: [
        // 多个 STUN 服务器提高成功率
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // TURN 服务器作为后备
        {
            urls: 'turn:turnserver.com:3478',
            username: 'user',
            credential: 'pass'
        }
    ],
    iceTransportPolicy: 'all', // 允许所有类型的候选
    bundlePolicy: 'max-bundle', // 复用同一传输通道
    rtcpMuxPolicy: 'require' // 要求 RTCP 复用
};
```

#### 候选收集优化
```javascript
// 限制候选数量，减少收集时间
const pc = new RTCPeerConnection({
    ...iceConfig,
    iceCandidatePoolSize: 10 // 预收集候选
});

// 监听收集完成事件
let iceGatheringDone = false;
pc.onicegatheringstatechange = () => {
    if (pc.iceGatheringState === 'complete') {
        iceGatheringDone = true;
        console.log('ICE 收集完成');
    }
};

// 设置超时，避免无限等待
setTimeout(() => {
    if (!iceGatheringDone) {
        console.warn('ICE 收集超时，使用当前候选');
        // 继续流程
    }
}, 5000);
```

## 安全考虑

### 1. HTTPS 配置

#### Nginx SSL 配置
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # WebSocket 代理
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/webrtc-study;
        try_files $uri $uri/ /index.html;
    }
}
```

### 2. 输入验证

```javascript
// 数据验证中间件
function validateInput(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid input',
                details: error.details
            });
        }
        next();
    };
}

// Joi 验证模式
const messageSchema = Joi.object({
    type: Joi.string().valid('offer', 'answer', 'ice-candidate').required(),
    payload: Joi.object().required(),
    timestamp: Joi.number().integer().min(0).required()
});

// 使用
app.post('/signal', validateInput(messageSchema), handleSignal);
```

### 3. 认证授权

```javascript
// JWT 认证
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// 生成房间令牌
function generateRoomToken(roomId, userId) {
    return jwt.sign(
        { roomId, userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );
}
```

### 4. 速率限制

```javascript
const rateLimit = require('express-rate-limit');

// 通用速率限制
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 每个 IP 最多 100 次请求
    message: 'Too many requests from this IP'
});

// 严格速率限制（用于敏感操作）
const strictLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 分钟
    max: 5, // 每个 IP 最多 5 次请求
    skipSuccessfulRequests: true
});

// 应用速率限制
app.use('/api/', generalLimiter);
app.use('/api/join', strictLimiter);
```

### 5. 数据加密

```javascript
// 使用 crypto 模块进行数据加密
const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const secretKey = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, secretKey);
    cipher.setAAD(Buffer.from('webrtc-study'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

function decrypt(encryptedData) {
    const decipher = crypto.createDecipher(algorithm, secretKey);
    decipher.setAAD(Buffer.from('webrtc-study'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
```

---

## 总结

本开发者指南涵盖了 WebRTC 学习项目的完整开发流程，从环境搭建到部署优化，为开发者提供了全面的参考。遵循这些最佳实践，可以确保项目的可维护性、可扩展性和高性能。

### 后续规划

1. **扩展示例库**
   - 添加更多高级用例
   - 支持移动端特定功能
   - 集成 AI 功能（如背景虚化）

2. **工具链升级**
   - 迁移到 TypeScript
   - 集成现代化构建工具
   - 添加自动化测试覆盖率

3. **社区建设**
   - 建立贡献者指南
   - 组织线上/线下活动
   - 创建学习路径推荐系统

### 资源链接

- [项目仓库](https://github.com/your-username/webrtc-study)
- [问题追踪](https://github.com/your-username/webrtc-study/issues)
- [讨论区](https://github.com/your-username/webrtc-study/discussions)
- [Wiki 文档](https://github.com/your-username/webrtc-study/wiki)

---

🚀 **Happy coding!** 让我们一起构建更好的 WebRTC 学习平台！

## 附录

### A. 常用工具函数

```javascript
// shared/utils.js

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 深拷贝对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
}

/**
 * 格式化时间
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 下载文件
 */
function downloadFile(data, filename, type = 'application/octet-stream') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
```

### B. 调试技巧

#### Chrome DevTools 技巧

1. **断点调试异步代码**
```javascript
// 在 async/await 代码中设置断点
async function debugAsync() {
    const result = await fetchData(); // 在这里设置断点
    console.log(result); // 观察结果
}
```

2. **性能分析**
```javascript
// 标记性能测量点
console.time('ice-gathering');
pc.onicegatheringstatechange = () => {
    if (pc.iceGatheringState === 'complete') {
        console.timeEnd('ice-gathering');
    }
};
```

3. **网络请求分析**
```javascript
// 在 Network 面板中过滤 WebRTC 相关请求
// 使用过滤器：stun: || turn: || webrtc
```

#### 常见问题排查

1. **ICE 连接失败**
```javascript
// 启用详细 ICE 日志
window.RTCRtpReceiver.getCapabilities = () => {
    console.log('ICE gathering state:', pc.iceGatheringState);
    console.log('ICE connection state:', pc.iceConnectionState);
    return originalGetCapabilities.apply(this, arguments);
};
```

2. **媒体流问题**
```javascript
// 检查媒体轨道状态
stream.getTracks().forEach(track => {
    console.log('Track:', track.kind, track.label);
    console.log('Enabled:', track.enabled);
    console.log('Muted:', track.muted);
    console.log('Ready state:', track.readyState);
});
```

3. **权限问题**
```javascript
// 检查权限状态
navigator.permissions.query({ name: 'camera' })
    .then(result => console.log('Camera permission:', result.state));

navigator.permissions.query({ name: 'microphone' })
    .then(result => console.log('Microphone permission:', result.state));
```

### C. 性能监控

```javascript
// 性能监控工具
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            connectionTime: 0,
            iceGatheringTime: 0,
            mediaAccessTime: 0,
            bytesTransferred: 0,
            packetsLost: 0
        };
    }

    startConnectionTimer() {
        this.connectionStartTime = performance.now();
    }

    endConnectionTimer() {
        this.metrics.connectionTime = performance.now() - this.connectionStartTime;
        this.reportMetric('connectionTime', this.metrics.connectionTime);
    }

    async collectWebRTCStats(pc) {
        const stats = await pc.getStats();
        stats.forEach(report => {
            if (report.type === 'inbound-rtp' || report.type === 'outbound-rtp') {
                this.metrics.bytesTransferred += report.bytesTransferred || 0;
                this.metrics.packetsLost += report.packetsLost || 0;
            }
        });
    }

    reportMetric(name, value) {
        // 发送到分析服务
        console.log(`Metric: ${name} = ${value}`);

        // 实际项目中发送到分析服务
        // analytics.track(`webrtc_${name}`, { value });
    }
}
```

---

*最后更新：2024年1月* | *版本：v1.0.0* | *作者：WebRTC Study Team*