# 示例 4：建立 P2P 连接

这个示例演示了如何使用 RTCPeerConnection 建立点对点连接，支持两种信令方式。

## 信令方式

### 1. localStorage 信令（默认）

- **优点**：简单，无需服务器，适合本地测试
- **缺点**：只能在同一个浏览器的不同标签页之间使用
- **使用场景**：本地开发、学习演示

### 2. WebSocket 信令

- **优点**：实时通信，支持跨设备、跨浏览器
- **缺点**：需要运行信令服务器
- **使用场景**：实际应用、远程连接

## 使用步骤

### 使用 localStorage 信令

1. 打开两个浏览器标签页，都访问示例4页面
2. 确保选择"localStorage"信令方式（默认）
3. 第一个标签页：点击"我是发起者"
4. 第二个标签页：点击"我是接收者"
5. 两个标签页都点击"开始连接"按钮
6. 等待连接建立，可以看到对方的视频

### 使用 WebSocket 信令

1. **启动信令服务器**

```bash
# 安装依赖（如果还没有）
npm install

# 启动服务器
npm run signaling

# 或者直接运行
node examples/04-peer-connection/signaling-server.js
```

服务器默认监听 `ws://localhost:8080`

2. **配置服务器地址**

如果服务器运行在不同的地址或端口，需要修改 `script.js` 中的 `WS_SERVER_URL`：

```javascript
const WS_SERVER_URL = 'ws://your-server-ip:8080';
```

3. **连接步骤**

- 打开两个浏览器标签页（可以是不同设备）
- 选择"WebSocket"信令方式
- 等待显示"已连接到信令服务器"
- 第一个标签页：点击"我是发起者"
- 第二个标签页：点击"我是接收者"
- 两个标签页都点击"开始连接"按钮
- 等待连接建立

## 服务器配置

### 环境变量

可以通过环境变量配置服务器：

```bash
# 设置端口
PORT=8080 node signaling-server.js

# 设置主机
HOST=0.0.0.0 node signaling-server.js

# 同时设置
PORT=8080 HOST=0.0.0.0 node signaling-server.js
```

### 默认配置

- **端口**：8080
- **主机**：localhost

## 服务器功能

- ✅ 支持多个客户端连接
- ✅ 自动房间配对（两个客户端自动配对）
- ✅ 转发 Offer、Answer 和 ICE 候选
- ✅ 处理连接断开
- ✅ 心跳检测（ping/pong）
- ✅ 错误处理

## 故障排除

### WebSocket 连接失败

1. 检查服务器是否运行：`npm run signaling`
2. 检查防火墙设置
3. 检查服务器地址是否正确
4. 查看浏览器控制台的错误信息

### 连接建立失败

1. 确保两个标签页都选择了角色
2. 确保两个标签页都点击了"开始连接"
3. 检查 ICE 候选信息，查看是否有网络问题
4. 某些网络环境可能需要 TURN 服务器

### 视频不显示

1. 检查浏览器是否允许摄像头/麦克风权限
2. 检查控制台是否有错误
3. 确保使用 HTTPS 或 localhost（getUserMedia 要求）

## 技术说明

### 信令流程

1. **发起者（Offerer）**
   - 创建 RTCPeerConnection
   - 添加本地媒体流
   - 创建 Offer
   - 通过信令发送 Offer
   - 接收 Answer
   - 交换 ICE 候选

2. **接收者（Answerer）**
   - 创建 RTCPeerConnection
   - 添加本地媒体流
   - 接收 Offer
   - 创建 Answer
   - 通过信令发送 Answer
   - 交换 ICE 候选

### 消息格式

WebSocket 消息格式：

```javascript
// 发送消息
{
    type: 'offer' | 'answer' | 'ice-candidate' | 'join',
    payload: { ... }
}

// 接收消息
{
    type: 'welcome' | 'joined' | 'ready' | 'offer' | 'answer' | 'ice-candidate' | 'error',
    payload: { ... },
    message: '...'
}
```

## 扩展

### 添加 TURN 服务器

如果需要穿透复杂的 NAT，可以添加 TURN 服务器：

```javascript
const configuration = {
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

### 多房间支持

当前实现会自动配对两个客户端。如果需要支持多个房间，可以：

1. 在客户端发送房间ID
2. 服务器根据房间ID分组客户端
3. 只在同一房间内转发消息

