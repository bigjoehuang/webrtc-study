# WebRTC 学习项目 API 文档

## 概述

本文档描述了 WebRTC 学习项目中使用的核心 API 和接口规范。

## 核心 WebRTC API

### 1. getUserMedia API

用于获取用户的媒体设备（摄像头、麦克风）。

#### 语法
```javascript
navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    // 成功获取媒体流
  })
  .catch(function(error) {
    // 处理错误
  });
```

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| constraints | MediaStreamConstraints | 指定请求的媒体类型和参数 |

#### constraints 示例
```javascript
{
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user" // 或 "environment"
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true
  }
}
```

#### 返回值
- `Promise<MediaStream>`: 解析为 MediaStream 对象

#### 错误码
| 错误名称 | 描述 |
|----------|------|
| NotAllowedError | 用户拒绝了权限请求 |
| NotFoundError | 未找到指定媒体设备 |
| NotReadableError | 设备被其他应用占用 |
| OverconstrainedError | 无法满足指定的约束条件 |

---

### 2. getDisplayMedia API

用于获取屏幕共享流。

#### 语法
```javascript
navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
  .then(function(stream) {
    // 成功获取屏幕流
  })
  .catch(function(error) {
    // 处理错误
  });
```

#### 参数
| 参数 | 类型 | 描述 |
|------|------|------|
| displayMediaOptions | DisplayMediaStreamConstraints | 屏幕共享选项 |

#### 示例
```javascript
{
  video: {
    cursor: "always", // "always" | "motion" | "never"
    displaySurface: "monitor" // "monitor" | "window" | "application"
  },
  audio: true // 是否共享系统音频
}
```

---

### 3. RTCPeerConnection API

核心 API，用于建立和管理 P2P 连接。

#### 构造函数
```javascript
const pc = new RTCPeerConnection(configuration);
```

#### 配置参数
```javascript
const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:turnserver.example.org",
      username: "user",
      credential: "password"
    }
  ],
  iceTransportPolicy: "all", // "all" | "public" | "relay"
  bundlePolicy: "max-bundle"
};
```

#### 核心方法

##### createOffer()
创建 SDP offer，用于发起连接。
```javascript
const offer = await pc.createOffer(options);
await pc.setLocalDescription(offer);
```

##### createAnswer()
创建 SDP answer，用于响应连接。
```javascript
const answer = await pc.createAnswer(options);
await pc.setLocalDescription(answer);
```

##### addIceCandidate()
添加 ICE 候选。
```javascript
await pc.addIceCandidate(candidate);
```

##### addTrack()
添加媒体轨道到连接中。
```javascript
pc.addTrack(track, stream);
```

#### 核心事件

##### onicecandidate
当发现新的 ICE 候选时触发。
```javascript
pc.onicecandidate = (event) => {
  if (event.candidate) {
    // 发送候选到远端
  }
};
```

##### ontrack
当收到远端媒体流时触发。
```javascript
pc.ontrack = (event) => {
  const remoteStream = event.streams[0];
  remoteVideo.srcObject = remoteStream;
};
```

##### onconnectionstatechange
当连接状态改变时触发。
```javascript
pc.onconnectionstatechange = () => {
  console.log("连接状态:", pc.connectionState);
  // 状态值：new → connecting → connected → disconnected → closed
};
```

---

### 4. RTCDataChannel API

用于在 P2P 连接中传输任意数据。

#### 创建数据通道
```javascript
const dataChannel = pc.createDataChannel(label, options);
```

#### 配置选项
```javascript
const options = {
  ordered: true, // 是否保证顺序
  maxPacketLifeTime: 1000, // 最大包生存时间
  maxRetransmits: 3, // 最大重传次数
  protocol: "", // 子协议
  negotiated: false, // 是否预协商
  id: 0 // 通道ID
};
```

#### 事件处理
```javascript
// 接收消息
dataChannel.onmessage = (event) => {
  console.log("收到消息:", event.data);
};

// 通道打开
dataChannel.onopen = () => {
  console.log("数据通道已打开");
};

// 通道关闭
dataChannel.onclose = () => {
  console.log("数据通道已关闭");
};
```

#### 发送数据
```javascript
dataChannel.send("Hello WebRTC!");
```

---

## 信令系统 API

### WebSocket 信令协议

#### 消息格式
```json
{
  "type": "message_type",
  "payload": {},
  "timestamp": 1234567890
}
```

#### 消息类型

##### 加入房间
```json
{
  "type": "join",
  "payload": {
    "role": "offerer" // 或 "answerer"
  }
}
```

##### 发送 Offer
```json
{
  "type": "offer",
  "payload": {
    "sdp": "v=0\r\no=-...",
    "type": "offer"
  }
}
```

##### 发送 Answer
```json
{
  "type": "answer",
  "payload": {
    "sdp": "v=0\r\no=-...",
    "type": "answer"
  }
}
```

##### 发送 ICE 候选
```json
{
  "type": "ice-candidate",
  "payload": {
    "candidate": "candidate:1 1 UDP...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

#### 服务器响应

##### 欢迎消息
```json
{
  "type": "welcome",
  "clientId": "client_123",
  "roomId": "room_456"
}
```

##### 房间就绪
```json
{
  "type": "ready",
  "message": "房间已就绪，可以开始连接"
}
```

##### 对等方断开
```json
{
  "type": "peer-disconnected",
  "message": "对方已断开连接"
}
```

---

## 工具函数 API

### 共享工具函数 (shared/utils.js)

#### generateUUID()
生成唯一标识符。
```javascript
const id = generateUUID(); // 返回: "550e8400-e29b-41d4-a716-446655440000"
```

#### copyToClipboard(text)
复制文本到剪贴板。
```javascript
copyToClipboard("Hello WebRTC!");
```

#### handleError(error)
统一错误处理。
```javascript
try {
  // 一些操作
} catch (error) {
  handleError(error);
}
```

#### getBrowserInfo()
获取浏览器信息。
```javascript
const info = getBrowserInfo();
// 返回: { name: "Chrome", version: "91.0.4472.124" }
```

#### isWebRTCSupported()
检查浏览器是否支持 WebRTC。
```javascript
if (isWebRTCSupported()) {
  // 执行 WebRTC 相关操作
}
```

---

## 错误处理

### 常见错误码表

| 错误名称 | 错误码 | 描述 | 解决方案 |
|----------|--------|------|----------|
| NotAllowedError | 用户拒绝 | 用户拒绝了权限请求 | 提示用户授予权限 |
| NotFoundError | 设备未找到 | 未找到指定媒体设备 | 检查设备是否连接 |
| NotReadableError | 设备不可用 | 设备被其他应用占用 | 关闭其他使用设备的应用 |
| OverconstrainedError | 约束错误 | 无法满足指定的约束条件 | 降低分辨率要求 |
| SecurityError | 安全错误 | 在非安全环境使用 API | 使用 HTTPS 或 localhost |
| InvalidStateError | 状态错误 | RTCPeerConnection 状态不正确 | 检查连接状态 |
| NetworkError | 网络错误 | 网络连接失败 | 检查网络设置 |

### 错误处理示例
```javascript
try {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
} catch (error) {
  switch (error.name) {
    case 'NotAllowedError':
      alert('请授予摄像头和麦克风权限');
      break;
    case 'NotFoundError':
      alert('未找到摄像头或麦克风设备');
      break;
    default:
      alert(`发生错误: ${error.message}`);
  }
}
```

---

## 浏览器兼容性

### WebRTC API 支持情况

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| getUserMedia | ✅ 60+ | ✅ 55+ | ✅ 11+ | ✅ 79+ |
| getDisplayMedia | ✅ 72+ | ✅ 66+ | ✅ 13+ | ✅ 79+ |
| RTCPeerConnection | ✅ 60+ | ✅ 55+ | ✅ 11+ | ✅ 79+ |
| RTCDataChannel | ✅ 60+ | ✅ 55+ | ✅ 11+ | ✅ 79+ |

### 检测兼容性代码
```javascript
function checkWebRTCSupport() {
  const support = {
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
    peerConnection: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection),
    dataChannel: (() => {
      if (!window.RTCPeerConnection) return false;
      const pc = new RTCPeerConnection();
      try {
        const dc = pc.createDataChannel('test');
        return !!dc;
      } catch (e) {
        return false;
      } finally {
        pc.close();
      }
    })()
  };

  return support;
}
```

---

## 最佳实践

### 1. 始终处理错误
```javascript
async function getUserMediaWithFallback() {
  try {
    // 先尝试高分辨率
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1920, height: 1080 },
      audio: true
    });
    return stream;
  } catch (error) {
    // 降级到标准分辨率
    console.warn('高分辨率失败，尝试标准分辨率:', error);
    return await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: true
    });
  }
}
```

### 2. 及时释放资源
```javascript
function stopStream(stream) {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
}
```

### 3. 使用合适的约束
```javascript
const constraints = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};
```

---

## 相关资源

- [WebRTC 官方文档](https://webrtc.org/)
- [MDN WebRTC API 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC 样本代码](https://webrtc.github.io/samples/)
- [WebRTC 规范](https://w3c.github.io/webrtc-pc/)