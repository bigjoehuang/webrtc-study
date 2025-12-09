# WebRTC 学习项目用户指南

## 目录

1. [快速开始](#快速开始)
2. [基础教程](#基础教程)
3. [进阶教程](#进阶教程)
4. [常见问题](#常见问题)
5. [故障排除](#故障排除)
6. [最佳实践](#最佳实践)

## 快速开始

### 环境准备

#### 系统要求
- **操作系统**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **浏览器**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Node.js**: 14.0.0 或更高版本
- **网络**: 稳定的互联网连接（用于下载依赖和访问 STUN 服务器）

#### 安装步骤

1. **安装 Node.js**
   - 访问 [Node.js 官网](https://nodejs.org/)
   - 下载 LTS 版本（推荐）
   - 按照安装向导完成安装
   - 验证安装：`node --version`

2. **安装 Git（可选）**
   - 访问 [Git 官网](https://git-scm.com/)
   - 下载并安装
   - 验证安装：`git --version`

### 项目启动

#### 方法一：使用 npm（推荐）

```bash
# 克隆项目
git clone https://github.com/your-username/webrtc-study.git
cd webrtc-study

# 安装依赖
npm install

# 启动项目
npm start

# 访问 http://localhost:8080
```

#### 方法二：使用 Python

```bash
# 进入项目目录
cd web-rtc-study

# 启动 Python 静态服务器
python -m http.server 8000

# 访问 http://localhost:8000
```

#### 方法三：使用 Node.js http-server

```bash
# 全局安装 http-server
npm install -g http-server

# 进入项目目录
cd web-rtc-study

# 启动服务器
http-server -p 8080

# 访问 http://localhost:8080
```

## 基础教程

### 示例 1：获取用户媒体

#### 学习目标
- 了解 getUserMedia API
- 学会请求摄像头和麦克风权限
- 掌握媒体流的基本操作

#### 操作步骤

1. **打开示例**
   - 访问项目主页
   - 点击 "示例 1：获取用户媒体"

2. **授予权限**
   - 浏览器会弹出权限请求对话框
   - 点击 "允许" 授予摄像头和麦克风权限

3. **观察效果**
   - 左侧显示本地摄像头画面
   - 右侧显示控制台输出信息

4. **尝试操作**
   - 点击 "停止视频" 按钮
   - 点击 "开始视频" 按钮重新获取
   - 切换不同的摄像头（如果有多个）

#### 常见问题
- **黑屏或无画面**：检查摄像头是否被其他应用占用
- **权限被拒绝**：刷新页面重新授予权限
- **找不到设备**：确保摄像头已正确连接

### 示例 2：视频滤镜

#### 学习目标
- 学习 Canvas API 基础
- 实现实时视频滤镜效果
- 理解像素级图像处理

#### 操作步骤

1. **启动滤镜**
   - 进入示例 2 页面
   - 点击 "应用滤镜" 按钮

2. **选择滤镜效果**
   - 灰度效果：将彩色视频转为黑白
   - 反色效果：颜色反转
   - 模糊效果：高斯模糊处理
   - 锐化效果：增强边缘

3. **调整参数**
   - 使用滑块调整滤镜强度
   - 实时预览效果变化

4. **自定义滤镜**
   ```javascript
   // 示例：添加自定义滤镜
   function myFilter(pixels) {
       for (let i = 0; i < pixels.length; i += 4) {
           // 红色增强
           pixels[i] = pixels[i] * 1.5;
           // 绿色减弱
           pixels[i + 1] = pixels[i + 1] * 0.5;
       }
   }
   ```

### 示例 3：屏幕共享

#### 学习目标
- 掌握 getDisplayMedia API
- 实现屏幕捕获功能
- 了解屏幕共享的应用场景

#### 操作步骤

1. **开始屏幕共享**
   - 点击 "开始屏幕共享" 按钮
   - 选择要共享的屏幕或应用窗口
   - 点击 "分享" 确认

2. **切换共享源**
   - 点击 "切换共享源" 可以在不同窗口间切换
   - 支持共享整个屏幕或特定应用

3. **音频共享**
   - 勾选 "共享系统音频" 可以共享声音
   - 注意：并非所有浏览器都支持

4. **停止共享**
   - 点击 "停止共享" 按钮
   - 或点击浏览器自带的停止共享控件

#### 注意事项
- 某些浏览器可能不支持屏幕共享
- 共享时会有明显的 "共享中" 提示
- 性能要求较高，低配电脑可能卡顿

## 进阶教程

### 示例 4：建立 P2P 连接

#### 学习目标
- 理解 RTCPeerConnection 工作原理
- 掌握 SDP 交换流程
- 了解 ICE 候选收集过程

#### 准备工作

1. **打开两个浏览器标签页**
   - 右键点击示例 4 链接
   - 选择 "在新标签页中打开"

2. **选择信令方式**
   - **localStorage 模式**：适合本地测试，无需服务器
   - **WebSocket 模式**：需要先启动信令服务器

#### 操作步骤

1. **选择角色**
   - 标签页 1：选择 "我是发起者"
   - 标签页 2：选择 "我是接收者"

2. **开始连接**
   - 两个标签页都点击 "开始连接"
   - 观察连接状态变化

3. **查看详细信息**
   - **连接状态**：显示当前连接阶段
   - **信令信息**：显示 SDP 交换过程
   - **ICE 候选信息**：显示网络候选收集情况

4. **验证连接**
   - 发起者应该看到接收者的视频
   - 接收者应该看到发起者的视频

#### 理解关键概念

**SDP（会话描述协议）**
```
v=0
o=- 1234567890 2 IN IP4 127.0.0.1
s=-
t=0 0
m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102
...
```

**ICE 候选**
- **HOST**：本地网络地址
- **SRFLX**：NAT 映射后的地址
- **RELAY**：TURN 服务器中继地址

### 示例 5：简单视频通话

#### 学习目标
- 实现完整的视频通话
- 了解 WebSocket 信令
- 掌握生产级应用架构

#### 启动信令服务器

```bash
# 在项目根目录
node scripts/start-signaling.js

# 看到 "信令服务器启动在端口 8080" 表示成功
```

#### 测试通话

1. **在不同设备上打开**
   - 设备 A：http://localhost:8080/examples/05-simple-chat/
   - 设备 B：同一网络下访问设备 A 的 IP 地址

2. **加入同一房间**
   - 双方都输入相同的房间号（如：123456）
   - 点击 "加入房间"

3. **开始通话**
   - 点击 "开始通话"
   - 等待对方接受

4. **通话控制**
   - 静音/取消静音
   - 关闭/打开视频
   - 挂断通话

### 示例 6：数据通道

#### 学习目标
- 掌握 RTCDataChannel API
- 实现 P2P 文本聊天
- 了解文件传输原理

#### 操作步骤

1. **建立连接**
   - 按照示例 4 的方式建立 P2P 连接
   - 或使用已有的视频连接

2. **文本聊天**
   - 在聊天框中输入消息
   - 点击发送或按回车键
   - 观察消息传输状态

3. **文件传输**
   - 点击 "选择文件" 按钮
   - 选择要发送的文件
   - 等待传输完成

4. **传输统计**
   - 查看传输速度
   - 观察已传输字节数
   - 预估剩余时间

#### 技术细节

**数据通道配置**
```javascript
const dataChannel = peerConnection.createDataChannel("chat", {
    ordered: true,                    // 保证顺序
    maxRetransmits: 3,               // 最大重传次数
    protocol: "chat-protocol"        // 自定义协议
});
```

**文件分块传输**
```javascript
const CHUNK_SIZE = 16384; // 16KB 每块
let offset = 0;

while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    dataChannel.send(chunk);
    offset += CHUNK_SIZE;
}
```

### 示例 7：完整应用

#### 学习目标
- 综合运用所有 WebRTC 技术
- 了解完整应用架构
- 掌握 UI/UX 设计

#### 功能特性

1. **视频通话**
   - 高清视频通话
   - 语音通话
   - 屏幕共享

2. **即时通讯**
   - 文本聊天
   - 表情符号
   - 文件传输

3. **高级功能**
   - 录制通话
   - 美颜滤镜
   - 虚拟背景

#### 使用指南

1. **创建/加入房间**
   - 输入房间名称
   - 设置昵称
   - 选择音视频设备

2. **通话中操作**
   - 切换摄像头
   - 调整音量
   - 全屏显示

3. **聊天功能**
   - 发送消息
   - 分享文件
   - 查看历史记录

## 常见问题

### 1. 权限相关问题

**Q: 浏览器提示需要 HTTPS？**
A: WebRTC 的某些 API 需要在安全环境下运行：
- 生产环境必须使用 HTTPS
- 本地开发可以使用 http://localhost
- 可以使用 ngrok 等工具创建 HTTPS 隧道

**Q: 不小心拒绝了权限怎么办？**
A:
- Chrome: 点击地址栏左侧的锁图标 → 网站设置 → 权限 → 重置
- Firefox: 点击地址栏左侧的锁图标 → 清除此站点的 Cookie 和站点数据
- Safari: Safari → 偏好设置 → 网站 → 摄像头/麦克风 → 移除

### 2. 连接问题

**Q: P2P 连接失败？**
A: 可能的原因：
- 防火墙阻止了 UDP 端口
- 双方都在对称 NAT 后
- STUN/TURN 服务器不可用

解决方案：
```javascript
// 配置 TURN 服务器
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:your-turn-server.com:3478',
            username: 'user',
            credential: 'pass'
        }
    ]
};
```

**Q: 视频卡顿或延迟高？**
A: 优化建议：
- 降低视频分辨率
- 减少帧率
- 检查网络带宽
- 使用硬件加速

### 3. 兼容性问题

**Q: Safari 浏览器无法正常工作？**
A: Safari 的特殊处理：
```javascript
// Safari 需要特殊处理
if (navigator.userAgent.indexOf('Safari') !== -1 &&
    navigator.userAgent.indexOf('Chrome') === -1) {
    // Safari 特定代码
    stream.getTracks().forEach(track => {
        track.enabled = false;
        track.enabled = true;
    });
}
```

**Q: 移动端浏览器支持如何？**
A: 移动端支持情况：
- iOS Safari: 11.0+ 支持
- Chrome Android: 60+ 支持
- 注意：部分功能可能受限

## 故障排除

### 诊断工具

1. **浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 标签页的错误信息
   - 检查 Network 标签的网络请求

2. **chrome://webrtc-internals/**
   - 在 Chrome 地址栏输入
   - 查看详细的 WebRTC 统计信息
   - 导出诊断报告

3. **about:webrtc**
   - Firefox 的诊断页面
   - 查看连接日志
   - 分析 ICE 状态

### 常见错误及解决

#### Error: NotAllowedError
```
原因：用户拒绝了权限请求
解决：重新请求权限，解释为什么需要这些权限
```

#### Error: NotFoundError
```
原因：找不到指定的媒体设备
解决：检查设备是否连接，使用 devicechange 事件监听
```

#### Error: InvalidStateError
```
原因：RTCPeerConnection 状态不正确
解决：检查连接状态，确保按正确顺序调用 API
```

#### Error: NetworkError
```
原因：网络连接失败
解决：检查网络设置，配置 TURN 服务器
```

### 调试技巧

1. **添加详细日志**
```javascript
// 启用详细日志
localStorage.debug = '*';

// 监听所有事件
pc.addEventListener('icecandidate', (e) => {
    console.log('ICE candidate:', e.candidate);
});

pc.addEventListener('connectionstatechange', () => {
    console.log('Connection state:', pc.connectionState);
});
```

2. **使用断点调试**
   - 在关键代码处设置断点
   - 逐步执行代码
   - 检查变量值

3. **网络抓包**
   - 使用 Wireshark 抓包
   - 分析 STUN/TURN 流量
   - 检查 ICE 候选交换

## 最佳实践

### 1. 用户体验优化

**渐进式权限请求**
```javascript
// 先请求必要的权限
async function requestPermissions() {
    try {
        // 先获取音频（用户更容易接受）
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // 再请求视频
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

        // 合并流
        return new MediaStream([
            ...audioStream.getTracks(),
            ...videoStream.getTracks()
        ]);
    } catch (error) {
        handleError(error);
    }
}
```

**加载状态提示**
```javascript
// 显示加载状态
function showLoadingState() {
    const loading = document.createElement('div');
    loading.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>正在建立连接...</p>
        </div>
    `;
    document.body.appendChild(loading);
}
```

### 2. 错误处理

**统一的错误处理**
```javascript
class ErrorHandler {
    static handle(error) {
        const errorMessages = {
            'NotAllowedError': '请允许访问您的摄像头和麦克风',
            'NotFoundError': '未找到摄像头或麦克风设备',
            'NotReadableError': '设备被其他程序占用',
            'OverconstrainedError': '设备不支持请求的参数',
            'SecurityError': '请在 HTTPS 环境下使用'
        };

        const message = errorMessages[error.name] || error.message;
        this.showError(message);
    }

    static showError(message) {
        // 显示用户友好的错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}
```

### 3. 资源管理

**及时释放资源**
```javascript
// 停止所有媒体流
function stopAllStreams() {
    const streams = [];

    // 收集所有活动的流
    document.querySelectorAll('video').forEach(video => {
        if (video.srcObject) {
            streams.push(video.srcObject);
        }
    });

    // 停止所有轨道
    streams.forEach(stream => {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    });
}

// 关闭连接
function closeConnection(pc) {
    if (pc) {
        pc.close();
        pc = null;
    }
}
```

### 4. 网络适应性

**根据网络调整质量**
```javascript
// 监听网络变化
navigator.connection.addEventListener('change', () => {
    const { effectiveType } = navigator.connection;

    switch (effectiveType) {
        case '2g':
            // 2G 网络：只传输音频
            disableVideo();
            break;
        case '3g':
            // 3G 网络：低质量视频
            setVideoQuality('low');
            break;
        case '4g':
            // 4G 网络：中等质量
            setVideoQuality('medium');
            break;
        default:
            // WiFi/5G：高质量
            setVideoQuality('high');
    }
});
```

### 5. 移动端适配

**响应式设计**
```css
/* 移动端适配 */
@media (max-width: 768px) {
    .video-container {
        flex-direction: column;
        height: auto;
    }

    .local-video {
        width: 100px;
        height: 75px;
        position: absolute;
        top: 10px;
        right: 10px;
    }

    .remote-video {
        width: 100%;
        height: auto;
    }
}
```

**触摸事件处理**
```javascript
// 支持触摸操作
function addTouchSupport() {
    const buttons = document.querySelectorAll('.control-button');

    buttons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.click();
        });
    });
}
```

## 进阶技巧

### 1. 性能优化

**使用 Web Workers**
```javascript
// 视频处理工作线程
const worker = new Worker('video-processor.js');

worker.postMessage({
    type: 'applyFilter',
    data: imageData,
    filter: 'blur'
});

worker.onmessage = (e) => {
    const processedData = e.data;
    ctx.putImageData(processedData, 0, 0);
};
```

### 2. 安全加固

**使用 DTLS**
```javascript
// 强制使用 DTLS
const configuration = {
    iceServers: [...],
    certificates: [RTCCertificate],
    iceTransportPolicy: 'relay' // 强制使用 TURN
};
```

### 3. 统计分析

**收集使用数据**
```javascript
// 性能统计
const stats = {
    connectionTime: 0,
    iceCandidatesCollected: 0,
    bytesTransferred: 0,
    packetsLost: 0
};

// 定期上报
setInterval(() => {
    analytics.track('webrtc_stats', stats);
}, 60000);
```

---

## 获取帮助

- 📧 **邮箱支持**: support@webrtc-study.com
- 💬 **社区论坛**: [GitHub Discussions](https://github.com/your-username/webrtc-study/discussions)
- 🐛 **报告问题**: [GitHub Issues](https://github.com/your-username/webrtc-study/issues)
- 📖 **文档中心**: [项目 Wiki](https://github.com/your-username/webrtc-study/wiki)

## 下一步

完成所有示例后，你可以：

1. **构建自己的应用**
   - 视频通话应用
   - 在线教育平台
   - 远程协作工具

2. **深入学习**
   - 研究 WebRTC 源码
   - 了解编解码原理
   - 学习网络协议

3. **贡献社区**
   - 提交改进建议
   - 分享学习心得
   - 帮助其他学习者

---

🎉 **恭喜你完成了 WebRTC 学习之旅！**