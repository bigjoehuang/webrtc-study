/**
 * 示例 5：简单视频通话
 * 
 * 完整的视频通话应用，使用 WebSocket 信令服务器
 */

// WebSocket 服务器地址
const WS_SERVER_URL = 'ws://localhost:8080';

// 获取 DOM 元素
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localPlaceholder = document.getElementById('localPlaceholder');
const remotePlaceholder = document.getElementById('remotePlaceholder');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const startCallBtn = document.getElementById('startCallBtn');
const endCallBtn = document.getElementById('endCallBtn');
const toggleVideoBtn = document.getElementById('toggleVideoBtn');
const toggleAudioBtn = document.getElementById('toggleAudioBtn');
const connectionStatus = document.getElementById('connectionStatus');
const wsStatus = document.getElementById('wsStatus');
const wsStatusText = document.getElementById('wsStatusText');
const callInfo = document.getElementById('callInfo');
const signalingLog = document.getElementById('signalingLog');

// 状态变量
let ws = null;
let peerConnection = null;
let localStream = null;
let isConnected = false;
let isInCall = false;
let clientId = null;
let roomId = null;

/**
 * WebSocket 信令客户端类
 */
class SignalingClient {
    constructor(url, onMessage) {
        this.url = url;
        this.ws = null;
        this.onMessage = onMessage;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log('WebSocket 连接已建立');
                this.reconnectAttempts = 0;
                updateWSStatus('connected', '已连接');
                addLog('WebSocket 连接成功', 'success');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('消息解析失败:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket 连接已关闭');
                updateWSStatus('disconnected', '已断开');
                addLog('WebSocket 连接已关闭', 'warning');
                if (isConnected) {
                    this.attemptReconnect();
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket 错误:', error);
                updateWSStatus('disconnected', '连接错误');
                addLog('WebSocket 连接错误', 'error');
            };
            
            return this.ws;
        } catch (error) {
            console.error('创建 WebSocket 连接失败:', error);
            updateWSStatus('disconnected', '连接失败');
            return null;
        }
    }
    
    handleMessage(data) {
        const { type, payload, message } = data;
        
        switch (type) {
            case 'welcome':
                clientId = data.clientId;
                addLog(`收到欢迎消息，客户端ID: ${clientId}`, 'success');
                break;
                
            case 'joined':
                roomId = data.roomId;
                addLog(`已加入房间: ${roomId}，角色: ${data.role}`, 'success');
                updateCallInfo(`房间: ${roomId}`);
                break;
                
            case 'ready':
                addLog('房间已就绪，可以开始通话', 'success');
                startCallBtn.disabled = false;
                break;
                
            case 'offer':
                if (this.onMessage) {
                    this.onMessage('offer', payload);
                }
                break;
                
            case 'answer':
                if (this.onMessage) {
                    this.onMessage('answer', payload);
                }
                break;
                
            case 'ice-candidate':
                if (this.onMessage) {
                    this.onMessage('ice-candidate', payload);
                }
                break;
                
            case 'peer-disconnected':
                addLog('对方已断开连接', 'warning');
                if (this.onMessage) {
                    this.onMessage('peer-disconnected', null);
                }
                break;
                
            case 'error':
                addLog(`服务器错误: ${message}`, 'error');
                break;
        }
    }
    
    send(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: type,
                payload: payload
            }));
            return true;
        }
        return false;
    }
    
    join(role) {
        return this.send('join', { role });
    }
    
    sendOffer(offer) {
        return this.send('offer', offer);
    }
    
    sendAnswer(answer) {
        return this.send('answer', answer);
    }
    
    sendIceCandidate(candidate) {
        return this.send('ice-candidate', candidate);
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            addLog(`${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`, 'warning');
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            addLog('达到最大重连次数，停止重连', 'error');
        }
    }
    
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

let signalingClient = null;

/**
 * 连接 WebSocket 服务器
 */
function connectToServer() {
    if (signalingClient) {
        signalingClient.close();
    }
    
    signalingClient = new SignalingClient(WS_SERVER_URL, handleSignalingMessage);
    ws = signalingClient.connect();
    
    if (ws) {
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        isConnected = true;
    }
}

/**
 * 断开 WebSocket 连接
 */
function disconnectFromServer() {
    if (signalingClient) {
        signalingClient.close();
        signalingClient = null;
    }
    
    if (isInCall) {
        endCall();
    }
    
    ws = null;
    isConnected = false;
    clientId = null;
    roomId = null;
    
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
    startCallBtn.disabled = true;
    
    updateWSStatus('disconnected', '未连接');
    updateConnectionStatus('disconnected');
    updateCallInfo('等待连接...');
}

/**
 * 处理信令消息
 */
function handleSignalingMessage(type, payload) {
    switch (type) {
        case 'offer':
            handleOffer(payload);
            break;
            
        case 'answer':
            handleAnswer(payload);
            break;
            
        case 'ice-candidate':
            handleIceCandidate(payload);
            break;
            
        case 'peer-disconnected':
            addLog('对方已断开连接', 'warning');
            endCall();
            break;
    }
}

/**
 * 创建 RTCPeerConnection
 */
function createPeerConnection() {
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };
    
    const pc = new RTCPeerConnection(configuration);
    
    // 监听 ICE 候选
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            addLog(`ICE 候选: ${event.candidate.candidate}`, 'success');
            if (signalingClient) {
                signalingClient.sendIceCandidate(event.candidate);
            }
        } else {
            addLog('ICE 候选收集完成', 'success');
        }
    };
    
    // 监听连接状态
    pc.onconnectionstatechange = () => {
        console.log('连接状态:', pc.connectionState);
        updateConnectionStatus(pc.connectionState);
        addLog(`连接状态: ${pc.connectionState}`, 'success');
    };
    
    // 监听 ICE 连接状态
    pc.oniceconnectionstatechange = () => {
        console.log('ICE 连接状态:', pc.iceConnectionState);
        addLog(`ICE 连接状态: ${pc.iceConnectionState}`, 'success');
    };
    
    // 监听远程流
    pc.ontrack = (event) => {
        console.log('收到远程流:', event.streams[0]);
        const remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
        remoteVideo.style.display = 'block';
        remotePlaceholder.classList.add('hidden');
        addLog('收到远程媒体流', 'success');
        updateCallInfo('通话中...');
    };
    
    return pc;
}

/**
 * 获取本地媒体流
 */
async function getLocalStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });
        return stream;
    } catch (error) {
        console.error('获取本地媒体失败:', error);
        handleError(error);
        return null;
    }
}

/**
 * 开始通话
 */
async function startCall() {
    if (!isConnected || !signalingClient) {
        alert('请先连接到服务器');
        return;
    }
    
    addLog('开始通话...', 'success');
    
    // 获取本地媒体流
    localStream = await getLocalStream();
    if (!localStream) {
        return;
    }
    
    // 显示本地视频
    localVideo.srcObject = localStream;
    localVideo.style.display = 'block';
    localPlaceholder.classList.add('hidden');
    
    // 创建 RTCPeerConnection
    peerConnection = createPeerConnection();
    
    // 添加本地轨道
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
        addLog(`添加本地轨道: ${track.kind}`, 'success');
    });
    
    // 加入房间（作为发起者）
    signalingClient.join('offerer');
    
    // 创建 Offer
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        addLog('创建 Offer 成功', 'success');
        
        signalingClient.sendOffer(offer);
        addLog('发送 Offer', 'success');
    } catch (error) {
        console.error('创建 Offer 失败:', error);
        addLog(`创建 Offer 失败: ${error.message}`, 'error');
    }
    
    isInCall = true;
    startCallBtn.disabled = true;
    endCallBtn.disabled = false;
    updateCallInfo('等待对方响应...');
}

/**
 * 结束通话
 */
function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
        });
        localStream = null;
    }
    
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    
    localVideo.style.display = 'none';
    remoteVideo.style.display = 'none';
    localPlaceholder.classList.remove('hidden');
    remotePlaceholder.classList.remove('hidden');
    
    isInCall = false;
    startCallBtn.disabled = false;
    endCallBtn.disabled = true;
    
    updateCallInfo('通话已结束');
    addLog('通话已结束', 'warning');
}

/**
 * 处理 Offer
 */
async function handleOffer(offer) {
    if (!isInCall) {
        // 如果还没有开始通话，自动开始
        localStream = await getLocalStream();
        if (!localStream) {
            return;
        }
        
        localVideo.srcObject = localStream;
        localVideo.style.display = 'block';
        localPlaceholder.classList.add('hidden');
        
        peerConnection = createPeerConnection();
        
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        // 加入房间（作为接收者）
        signalingClient.join('answerer');
        
        isInCall = true;
        startCallBtn.disabled = true;
        endCallBtn.disabled = false;
    }
    
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        addLog('收到 Offer，创建 Answer', 'success');
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        signalingClient.sendAnswer(answer);
        addLog('发送 Answer', 'success');
    } catch (error) {
        console.error('处理 Offer 失败:', error);
        addLog(`处理 Offer 失败: ${error.message}`, 'error');
    }
}

/**
 * 处理 Answer
 */
async function handleAnswer(answer) {
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        addLog('收到 Answer，连接建立中...', 'success');
    } catch (error) {
        console.error('处理 Answer 失败:', error);
        addLog(`处理 Answer 失败: ${error.message}`, 'error');
    }
}

/**
 * 处理 ICE 候选
 */
async function handleIceCandidate(candidate) {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            addLog('添加远程 ICE 候选', 'success');
        } catch (error) {
            console.error('添加 ICE 候选失败:', error);
        }
    }
}

/**
 * 切换视频
 */
function toggleVideo() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            toggleVideoBtn.classList.toggle('disabled', !videoTrack.enabled);
            addLog(`视频 ${videoTrack.enabled ? '开启' : '关闭'}`, 'success');
        }
    }
}

/**
 * 切换音频
 */
function toggleAudio() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            toggleAudioBtn.classList.toggle('disabled', !audioTrack.enabled);
            addLog(`音频 ${audioTrack.enabled ? '开启' : '关闭'}`, 'success');
        }
    }
}

/**
 * 更新连接状态
 */
function updateConnectionStatus(state) {
    const statusMap = {
        'new': { text: '新建', class: 'new' },
        'connecting': { text: '连接中', class: 'connecting' },
        'connected': { text: '已连接', class: 'connected' },
        'disconnected': { text: '已断开', class: 'disconnected' },
        'failed': { text: '连接失败', class: 'disconnected' },
        'closed': { text: '已关闭', class: 'disconnected' }
    };
    
    const status = statusMap[state] || { text: state, class: '' };
    connectionStatus.innerHTML = `
        <p><strong>P2P 连接：</strong><span class="status ${status.class}">${status.text}</span></p>
    `;
}

/**
 * 更新 WebSocket 状态
 */
function updateWSStatus(status, text) {
    wsStatusText.textContent = `WebSocket: ${text}`;
    wsStatus.className = 'ws-status ' + status;
}

/**
 * 更新通话信息
 */
function updateCallInfo(info) {
    callInfo.innerHTML = `<p>${info}</p>`;
}

/**
 * 添加日志
 */
function addLog(message, type = 'success') {
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    signalingLog.appendChild(entry);
    
    // 保持最多 50 条记录
    const children = signalingLog.children;
    if (children.length > 50) {
        signalingLog.removeChild(children[0]);
    }
    
    // 自动滚动到底部
    signalingLog.scrollTop = signalingLog.scrollHeight;
}

/**
 * 处理错误
 */
function handleError(error) {
    let errorMessage = '操作失败: ';
    
    switch (error.name) {
        case 'NotAllowedError':
            errorMessage += '用户拒绝了摄像头/麦克风权限请求';
            break;
        case 'NotFoundError':
            errorMessage += '未找到摄像头或麦克风设备';
            break;
        case 'NotReadableError':
            errorMessage += '设备被其他应用占用';
            break;
        default:
            errorMessage += error.message || '未知错误';
    }
    
    alert(errorMessage);
    addLog(errorMessage, 'error');
}

// 绑定事件监听器
connectBtn.addEventListener('click', connectToServer);
disconnectBtn.addEventListener('click', disconnectFromServer);
startCallBtn.addEventListener('click', startCall);
endCallBtn.addEventListener('click', endCall);
toggleVideoBtn.addEventListener('click', toggleVideo);
toggleAudioBtn.addEventListener('click', toggleAudio);

// 初始化
updateConnectionStatus('disconnected');
updateCallInfo('等待连接服务器...');

