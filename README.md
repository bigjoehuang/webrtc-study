# WebRTC 渐进式学习项目 🎓

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![WebRTC Support](https://img.shields.io/badge/WebRTC-Supported-brightgreen.svg)](https://webrtc.org/)

## 📖 项目简介

这是一个专为中文用户设计的 **WebRTC 渐进式学习教程项目**。通过 7 个由浅入深的实践示例，帮助开发者系统性地掌握 WebRTC 实时通信技术。项目采用纯前端技术实现，无需复杂框架，每个示例都配有详细的中文注释和说明。

## 🎯 学习目标

- ✅ 理解 WebRTC 核心概念和工作原理
- ✅ 掌握媒体流获取和处理技术
- ✅ 学会建立 P2P 连接和 NAT 穿透
- ✅ 实现视频通话和数据通道传输
- ✅ 了解信令服务器的设计与实现

## 🚀 快速开始

### 环境要求

- **浏览器**: Chrome 60+ / Firefox 55+ / Safari 11+
- **Node.js**: 14.0.0 或更高版本
- **操作系统**: Windows / macOS / Linux

### 安装与运行

1. **克隆项目**
```bash
git clone https://github.com/bigjoehuang/webrtc-study.git
cd webrtc-study
```

2. **安装依赖**
```bash
npm install
```

3. **启动项目**
```bash
# 同时启动静态文件服务器和信令服务器
npm start
```

4. **访问项目**
- 打开浏览器访问: `http://localhost:8080`
- 选择示例开始学习

## 📚 教程目录

### 基础阶段 - 媒体流获取和处理

| 示例 | 标题 | 学习内容 | 难度 |
|------|------|----------|------|
| [示例 1](./examples/01-get-user-media/) | 获取用户媒体 | `getUserMedia` API、摄像头/麦克风访问 | ⭐ |
| [示例 2](./examples/02-video-filters/) | 视频滤镜效果 | Canvas 处理、滤镜算法实现 | ⭐⭐ |
| [示例 3](./examples/03-screen-share/) | 屏幕共享 | `getDisplayMedia` API、屏幕捕获 | ⭐⭐ |

### 连接阶段 - P2P 连接建立

| 示例 | 标题 | 学习内容 | 难度 |
|------|------|----------|------|
| [示例 4](./examples/04-peer-connection/) | 建立 P2P 连接 | `RTCPeerConnection`、SDP 交换、ICE 候选 | ⭐⭐⭐ |
| [示例 5](./examples/05-simple-chat/) | 简单视频通话 | 完整通话流程、信令系统设计 | ⭐⭐⭐⭐ |
| [示例 6](./examples/06-data-channel/) | 数据通道传输 | `RTCDataChannel`、P2P 数据传输 | ⭐⭐⭐⭐ |
| [示例 7](./examples/07-complete-app/) | 完整应用 | 综合实战、项目最佳实践 | ⭐⭐⭐⭐⭐ |

## 🛠️ 技术栈

### 核心技术
- **WebRTC API**: 实时通信核心
- **HTML5/CSS3/JavaScript**: 前端基础技术
- **Canvas API**: 视频流处理
- **WebSocket**: 实时信令通信

### 开发工具
- **Node.js**: 后端运行时环境
- **ws**: WebSocket 库
- **http-server**: 静态文件服务器
- **concurrently**: 并行任务管理

## 💡 核心概念

### WebRTC 基础
- **媒体流 (MediaStream)**: 音视频数据流
- **RTCPeerConnection**: P2P 连接管理
- **RTCDataChannel**: 数据传输通道
- **信令 (Signaling)**: 协调通信过程

### 关键技术
- **STUN/TURN**: NAT 穿透和中继
- **SDP**: 会话描述协议
- **ICE**: 交互式连接建立
- **DTLS/SRTP**: 安全传输

## 🌟 项目特色

- 📝 **全中文注释**: 代码和文档完全中文化
- 🎯 **渐进式学习**: 从基础到高级逐步深入
- 🔧 **双信令模式**: 支持 localStorage 和 WebSocket
- 📱 **响应式设计**: 适配各种设备
- 🎨 **可视化界面**: 实时显示连接状态

## 📖 使用说明

### 本地开发

1. **单独启动示例**
```bash
# 进入示例目录
cd examples/01-get-user-media

# 启动静态服务器
npx http-server -p 8081
```

2. **启动信令服务器**
```bash
# 运行信令服务器（用于 WebSocket 模式）
node scripts/start-signaling.js
```

### 注意事项

- 🔒 **HTTPS 要求**: 部分 API 需要 HTTPS 环境
- 🌐 **跨域支持**: 确保服务器支持 CORS
- 🔧 **浏览器权限**: 允许摄像头/麦克风访问

## 🗂️ 项目结构

```
webrtc-study/
├── examples/                  # 示例代码
│   ├── 01-get-user-media/    # 示例1：获取用户媒体
│   ├── 02-video-filters/     # 示例2：视频滤镜
│   ├── 03-screen-share/      # 示例3：屏幕共享
│   ├── 04-peer-connection/   # 示例4：P2P连接
│   └── ...                   # 其他示例
├── shared/                   # 共享资源
│   └── utils.js             # 工具函数
├── scripts/                  # 脚本文件
│   └── start-signaling.js   # 信令服务器
├── docs/                     # 文档
├── index.html               # 导航主页
├── package.json             # 项目配置
└── README.md               # 项目说明
```

## 📖 学习建议

1. **按顺序学习**: 建议按照示例编号顺序学习，每个示例都建立在前一个的基础上
2. **理解概念**: 不要只是复制代码，理解每个 API 的作用和原理
3. **动手实践**: 尝试修改代码，添加新功能，加深理解
4. **查看注释**: 每个示例都包含详细的中文注释，帮助你理解代码

## 🎪 示例预览

### 示例1：获取用户媒体
![获取用户媒体预览](./docs/images/preview-01.png)

### 示例2：视频滤镜效果
![视频滤镜预览](./docs/images/preview-02.png)

### 示例4：P2P连接建立
![P2P连接预览](./docs/images/preview-04.png)

## 🔍 常见问题

### Q: 为什么需要 HTTPS？
A: WebRTC 的 `getUserMedia` API 在非安全环境（非 HTTPS）下会被浏览器限制。本地开发可以使用 `localhost`。

### Q: 浏览器兼容性如何？
A: 支持所有现代浏览器，包括 Chrome、Firefox、Edge、Safari 的最新版本。

### Q: 可以部署到生产环境吗？
A: 可以，但需要配置 HTTPS 和信令服务器。详见 [部署指南](./docs/deployment.md)。

## 🤝 贡献指南

我们欢迎社区贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与项目开发。

### 贡献类型
- 🐛 报告和修复 Bug
- 💡 提出新功能建议
- 📝 改进文档和注释
- 🌐 翻译和本地化
- 🎨 UI/UX 改进

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE) 开源，详见 LICENSE 文件。

## 🙏 致谢

感谢以下项目和社区的支持：
- [WebRTC 官方文档](https://webrtc.org/)
- [MDN Web 文档](https://developer.mozilla.org/)
- [Node.js 社区](https://nodejs.org/)

## 📞 联系方式

- 📧 邮箱: your-email@example.com
- 💬 讨论区: [GitHub Discussions](https://github.com/your-username/webrtc-study/discussions)
- 🐛 问题报告: [GitHub Issues](https://github.com/your-username/webrtc-study/issues)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！


