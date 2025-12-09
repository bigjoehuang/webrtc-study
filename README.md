# WebRTC 渐进式学习项目

一个从基础到进阶的 WebRTC 学习项目，通过多个渐进式示例帮助你逐步掌握 WebRTC 的核心概念和实际应用。

## 什么是 WebRTC？

WebRTC (Web Real-Time Communication) 是一个强大的 Web API，允许浏览器之间进行实时音视频通信和数据传输，无需安装任何插件。

## 学习路径

### 基础阶段 - 媒体流获取和处理

1. **[示例 1：获取用户媒体](./examples/01-get-user-media/)**
   - 学习 `getUserMedia()` API
   - 获取摄像头和麦克风权限
   - 显示本地视频流

2. **[示例 2：视频滤镜和效果](./examples/02-video-filters/)**
   - 操作视频流
   - 使用 Canvas 应用实时滤镜
   - 灰度、模糊、反转等效果

3. **[示例 3：屏幕共享](./examples/03-screen-share/)**
   - 使用 `getDisplayMedia()` API
   - 共享屏幕或应用窗口
   - 切换摄像头和屏幕共享

### 连接阶段 - P2P 连接建立

4. **[示例 4：建立 P2P 连接](./examples/04-peer-connection/)**
   - 理解 RTCPeerConnection 基础
   - 在两个浏览器标签页之间建立连接
   - 使用简单的信令机制

5. **[示例 5：简单视频通话](./examples/05-simple-chat/)**
   - 完整的视频通话流程
   - ICE 候选、SDP 交换、媒体协商
   - WebSocket 信令服务器

### 进阶阶段 - 数据通道和完整应用

6. **[示例 6：数据通道](./examples/06-data-channel/)**
   - 使用 RTCDataChannel 传输数据
   - 文本聊天和文件传输
   - P2P 数据传输能力

7. **[示例 7：完整应用](./examples/07-complete-app/)**
   - 综合应用所有学到的知识
   - 完整的视频通话应用
   - 包含聊天、屏幕共享、文件传输

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

或者使用其他静态服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js http-server
npx http-server -p 8000
```

### 访问项目

打开浏览器访问 `http://localhost:8000`，你会看到导航页面，可以点击进入各个示例。

## 重要提示

1. **HTTPS 要求**：WebRTC 的某些功能（如 `getUserMedia`）在大多数浏览器中需要 HTTPS 环境。本地开发可以使用 `localhost`，但部署到生产环境需要 HTTPS。

2. **浏览器兼容性**：建议使用现代浏览器（Chrome、Firefox、Edge、Safari 最新版本）。

3. **权限请求**：首次访问需要授予摄像头和麦克风权限。

## 项目结构

```
web-rtc-study/
├── README.md                 # 项目说明和学习路径
├── index.html                # 导航页面，列出所有示例
├── examples/                 # 所有学习示例
│   ├── 01-get-user-media/    # 示例1：获取本地媒体流
│   ├── 02-video-filters/     # 示例2：视频滤镜和效果
│   ├── 03-screen-share/      # 示例3：屏幕共享
│   ├── 04-peer-connection/   # 示例4：建立 P2P 连接
│   ├── 05-simple-chat/       # 示例5：简单视频通话
│   ├── 06-data-channel/      # 示例6：数据通道
│   └── 07-complete-app/      # 示例7：完整应用
├── shared/                   # 共享工具函数
│   └── utils.js
└── package.json              # 项目配置
```

## 学习建议

1. **按顺序学习**：建议按照示例编号顺序学习，每个示例都建立在前一个的基础上。

2. **理解概念**：不要只是复制代码，理解每个 API 的作用和原理。

3. **动手实践**：尝试修改代码，添加新功能，加深理解。

4. **查看注释**：每个示例都包含详细的中文注释，帮助你理解代码。

## 技术栈

- 纯 HTML/CSS/JavaScript（无框架依赖）
- WebRTC API
- Canvas API（用于视频处理）
- WebSocket（用于信令服务器）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！


