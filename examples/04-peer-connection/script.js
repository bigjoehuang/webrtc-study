/**
 * 示例 4：建立 P2P 连接
 * 
 * 这个示例演示了如何使用 RTCPeerConnection 建立点对点连接
 * 支持两种信令方式：
 * 1. localStorage（简单，无需服务器）
 * 2. WebSocket（实时，需要服务器）
 */

// 获取 DOM 元素
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localPlaceholder = document.getElementById('localPlaceholder');
const remotePlaceholder = document.getElementById('remotePlaceholder');
const offererBtn = document.getElementById('offererBtn');
const answererBtn = document.getElementById('answererBtn');
const resetRoleBtn = document.getElementById('resetRoleBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const roleInfo = document.getElementById('roleInfo');
const connectionStatus = document.getElementById('connectionStatus');
const signalingInfo = document.getElementById('signalingInfo');
const iceInfo = document.getElementById('iceInfo');
const copyIceBtn = document.getElementById('copyIceBtn');
const securityWarning = document.getElementById('securityWarning');
const currentUrl = document.getElementById('currentUrl');
const securityStatus = document.getElementById('securityStatus');
const localStorageBtn = document.getElementById('localStorageBtn');
const websocketBtn = document.getElementById('websocketBtn');
const signalingStatus = document.getElementById('signalingStatus');

// 存储状态
let localStream = null;
let peerConnection = null;
let currentRole = null; // 'offerer' 或 'answerer'
let signalingInterval = null;
let iceCandidateCount = 0;
let currentSignalingType = 'localStorage'; // 'localStorage' 或 'websocket'
let websocketSignaling = null; // WebSocket 信令实例

// localStorage 键名
const SIGNALING_KEYS = {
    OFFER: 'webrtc_offer',
    ANSWER: 'webrtc_answer',
    ICE_CANDIDATE_OFFERER: 'webrtc_ice_offerer',
    ICE_CANDIDATE_ANSWERER: 'webrtc_ice_answerer'
};

// WebSocket 服务器地址（可以根据实际情况修改）
const WS_SERVER_URL = 'ws://localhost:8080';

/**
 * WebSocket 信令客户端类
 */
class WebSocketSignaling {
    constructor(url, onMessage, onStatusChange) {
        this.url = url;
        this.ws = null;
        this.onMessage = onMessage;
        this.onStatusChange = onStatusChange;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.clientId = null;
        this.roomId = null;
        this.role = null;
    }
    
    /**
     * 连接到 WebSocket 服务器
     */
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log('WebSocket 连接已建立');
                this.reconnectAttempts = 0;
                this.onStatusChange('connected', '已连接到信令服务器');
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
                this.onStatusChange('disconnected', '连接已断开');
                this.attemptReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket 错误:', error);
                this.onStatusChange('error', '连接错误，请检查服务器是否运行');
            };
        } catch (error) {
            console.error('创建 WebSocket 连接失败:', error);
            this.onStatusChange('error', '无法连接到服务器: ' + error.message);
        }
    }
    
    /**
     * 处理接收到的消息
     */
    handleMessage(data) {
        console.log('handleMessage:', data);

        const { type, payload, message } = data;
        
        switch (type) {
            case 'welcome':
                this.clientId = data.clientId;
                console.log('收到欢迎消息，客户端ID:', this.clientId);
                this.onStatusChange('connected', `已连接 (ID: ${this.clientId})`);
                break;
                
            case 'joined':
                this.roomId = data.roomId;
                this.role = data.role;
                console.log('已加入房间:', this.roomId, '角色:', this.role);
                this.onStatusChange('connected', `房间: ${this.roomId}, 角色: ${this.role}`);
                break;
                
            case 'ready':
                console.log('房间已就绪');
                this.onStatusChange('ready', '房间已就绪，可以开始连接');
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
                console.log('对方已断开连接');
                this.onStatusChange('disconnected', '对方已断开连接');
                if (this.onMessage) {
                    this.onMessage('peer-disconnected', null);
                }
                break;
                
            case 'error':
                console.error('服务器错误:', message);
                this.onStatusChange('error', '服务器错误: ' + message);
                break;
                
            default:
                console.warn('未知消息类型:', type);
        }
    }
    
    /**
     * 发送消息到服务器
     */
    send(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: type,
                payload: payload
            }));
            return true;
        } else {
            console.warn('WebSocket 未连接，无法发送消息');
            return false;
        }
    }
    
    /**
     * 加入房间
     */
    join(role) {
        this.role = role;
        return this.send('join', { role });
    }
    
    /**
     * 发送 Offer
     */
    sendOffer(offer) {
        return this.send('offer', offer);
    }
    
    /**
     * 发送 Answer
     */
    sendAnswer(answer) {
        return this.send('answer', answer);
    }
    
    /**
     * 发送 ICE 候选
     */
    sendIceCandidate(candidate) {
        return this.send('ice-candidate', candidate);
    }
    
    /**
     * 尝试重连
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            console.log(`${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            this.onStatusChange('connecting', `${delay}ms 后尝试重连...`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('达到最大重连次数，停止重连');
            this.onStatusChange('error', '连接失败，请检查服务器');
        }
    }
    
    /**
     * 关闭连接
     */
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.clientId = null;
        this.roomId = null;
        this.role = null;
    }
}

/**
 * 初始化页面
 */
function initPage() {
    // 显示当前访问地址
    currentUrl.textContent = window.location.href;
    
    // 检查是否是安全环境
    const isSecureContext = window.isSecureContext || 
                           location.protocol === 'https:' || 
                           location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1';
    
    if (isSecureContext) {
        securityStatus.textContent = '✅ 安全环境（HTTPS 或 localhost）';
        securityStatus.className = 'security-status secure';
    } else {
        securityStatus.textContent = '⚠️ 非安全环境（可能需要 HTTPS）';
        securityStatus.className = 'security-status insecure';
        securityWarning.classList.add('unsafe');
    }
}

/**
 * 检查浏览器是否支持 WebRTC
 */
function checkSupport() {
    if (!window.RTCPeerConnection) {
        showSupportError('您的浏览器不支持 RTCPeerConnection');
        return false;
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isSecureContext = window.isSecureContext || 
                               location.protocol === 'https:' || 
                               location.hostname === 'localhost' || 
                               location.hostname === '127.0.0.1';
        
        if (!isSecureContext) {
            showSupportError(
                'getUserMedia 需要 HTTPS 环境（或 localhost）\n\n' +
                '当前访问地址：' + location.href + '\n\n' +
                '解决方案：\n' +
                '1. 使用 https:// 访问\n' +
                '2. 使用 localhost 或 127.0.0.1 访问\n' +
                '3. 配置本地 HTTPS 服务器'
            );
        } else {
            showSupportError('您的浏览器不支持 getUserMedia API');
        }
        return false;
    }
    
    return true;
}

/**
 * 显示支持错误信息
 */
function showSupportError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 600px;
        white-space: pre-line;
        text-align: left;
        font-size: 14px;
        line-height: 1.6;
    `;
    errorDiv.innerHTML = '<strong>⚠️ 错误：</strong><br>' + message;
    document.body.appendChild(errorDiv);
    
    // 同时更新页面上的状态显示
    connectionStatus.innerHTML = '<p style="color: red;">❌ 浏览器不支持或需要 HTTPS 环境</p>';
}

/**
 * 创建 RTCPeerConnection
 */
function createPeerConnection() {
    // RTCPeerConnection 配置
    // iceServers 用于 NAT 穿透（STUN/TURN 服务器）
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };
    
    // 创建 RTCPeerConnection 实例
    const pc = new RTCPeerConnection(configuration);
    
    // 监听 ICE 候选事件
    // ICE 候选用于建立网络连接（找到对方的网络地址）
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            iceCandidateCount++;
            console.log('ICE 候选 #' + iceCandidateCount + ':', event.candidate);
            addIceInfo('本地 ICE 候选 #' + iceCandidateCount + ': ' + event.candidate.candidate);
            // 通过信令服务器发送 ICE 候选
            sendIceCandidate(event.candidate);
        } else {
            console.log('ICE 候选收集完成');
            addIceInfo('✅ ICE 候选收集完成');
        }
    };
    
    // 监听连接状态变化
    pc.onconnectionstatechange = () => {
        console.log('连接状态:', pc.connectionState);
        updateConnectionStatus(pc.connectionState);
    };
    
    // 监听 ICE 连接状态变化
    pc.oniceconnectionstatechange = () => {
        console.log('ICE 连接状态:', pc.iceConnectionState);
        addIceInfo('ICE 连接状态: ' + pc.iceConnectionState);
    };
    
    // 监听 ICE 收集状态变化
    pc.onicegatheringstatechange = () => {
        console.log('ICE 收集状态:', pc.iceGatheringState);
        addIceInfo('ICE 收集状态: ' + pc.iceGatheringState);
    };
    
    // ============================================
    // 【关键】接收远程媒体流
    // ============================================
    // 当对方通过 addTrack 添加了媒体轨道后，会触发 ontrack 事件
    // 此时远程的媒体流已经通过 P2P 连接传输过来了
    // WebRTC 会自动处理解码、渲染等，我们只需要将流赋值给 video 元素
    pc.ontrack = (event) => {
        console.log('✅ 收到远程流:', event.streams[0]);
        const remoteStream = event.streams[0];
        
        // 显示接收到的远程流信息
        remoteStream.getTracks().forEach(track => {
            console.log('  远程轨道:', track.kind, track.label);
            addIceInfo(`收到远程轨道: ${track.kind} (${track.label})`);
        });
        
        // 将远程流显示在 video 元素中
        // 此时流已经通过 P2P 连接传输完成，可以直接播放
        remoteVideo.srcObject = remoteStream;
        remoteVideo.style.display = 'block';
        remotePlaceholder.classList.add('hidden');
        addIceInfo('✅ 远程媒体流已显示');
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
 * 选择信令方式
 */
function selectSignalingType(type) {
    if (peerConnection || localStream) {
        if (!confirm('当前有活动连接，切换信令方式将断开连接，确定继续吗？')) {
            return;
        }
        stopConnection();
    }
    
    currentSignalingType = type;
    
    // 更新按钮状态
    localStorageBtn.classList.toggle('active', type === 'localStorage');
    websocketBtn.classList.toggle('active', type === 'websocket');
    
    // 关闭之前的 WebSocket 连接
    if (websocketSignaling) {
        websocketSignaling.close();
        websocketSignaling = null;
    }
    
    // 如果是 WebSocket，尝试连接
    if (type === 'websocket') {
        connectWebSocket();
    } else {
        updateSignalingStatus('info', '使用 localStorage 信令（无需服务器）');
    }
}

/**
 * 连接 WebSocket 服务器
 */
function connectWebSocket() {
    console.log('connectWebSocket...');

    updateSignalingStatus('connecting', '正在连接 WebSocket 服务器...');
    
    websocketSignaling = new WebSocketSignaling(
        WS_SERVER_URL,
        handleWebSocketMessage,
        (status, message) => {
            updateSignalingStatus(status, message);
        }
    );
    
    websocketSignaling.connect();
}

/**
 * 处理 WebSocket 消息
 */
function handleWebSocketMessage(type, payload) {
    switch (type) {
        case 'offer':
            if (currentRole === 'answerer') {
                handleOffer(payload);
            }
            break;
            
        case 'answer':
            if (currentRole === 'offerer') {
                handleAnswer(payload);
            }
            break;
            
        case 'ice-candidate':
            handleWebSocketIceCandidate(payload);
            break;
            
        case 'peer-disconnected':
            alert('对方已断开连接');
            stopConnection();
            break;
    }
}

/**
 * 处理 WebSocket ICE 候选
 */
async function handleWebSocketIceCandidate(candidate) {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('WebSocket ICE 候选已添加');
            addIceInfo('收到远程 ICE 候选: ' + candidate.candidate);
        } catch (error) {
            console.error('添加 ICE 候选失败:', error);
        }
    }
}

/**
 * 更新信令状态显示
 */
function updateSignalingStatus(status, message) {
    signalingStatus.textContent = message || '';
    signalingStatus.className = 'signaling-status ' + status;
}

/**
 * 选择角色（发起者或接收者）
 */
function selectRole(role) {
    if (currentRole) {
        alert('角色已选择，请点击"重置角色"按钮重新选择');
        return;
    }
    
    currentRole = role;
    
    // 更新 UI
    offererBtn.disabled = true;
    answererBtn.disabled = true;
    resetRoleBtn.style.display = 'inline-block';
    startBtn.disabled = false;
    
    if (role === 'offerer') {
        roleInfo.textContent = '✅ 您是发起者（Offerer）- 将创建 Offer';
        roleInfo.className = 'role-info offerer';
    } else {
        roleInfo.textContent = '✅ 您是接收者（Answerer）- 将创建 Answer';
        roleInfo.className = 'role-info answerer';
    }
    
    // 如果是 WebSocket 信令，加入房间
    if (currentSignalingType === 'websocket' && websocketSignaling) {
        websocketSignaling.join(role);
    }
    
    updateConnectionStatus('new');
    updateSignalingInfo('角色已选择，点击"开始连接"按钮');
}

/**
 * 重置角色
 */
function resetRole() {
    if (peerConnection || localStream) {
        if (!confirm('当前有活动连接，确定要重置角色吗？')) {
            return;
        }
        stopConnection();
    }
    
    currentRole = null;
    offererBtn.disabled = false;
    answererBtn.disabled = false;
    resetRoleBtn.style.display = 'none';
    startBtn.disabled = true;
    roleInfo.textContent = '';
    roleInfo.className = 'role-info';
    updateConnectionStatus('new');
    updateSignalingInfo('等待选择角色...');
    iceInfo.innerHTML = '<p>等待 ICE 候选...</p>';
    iceCandidateCount = 0;
}

/**
 * 开始连接流程
 */
async function startConnection() {
    if (!checkSupport()) {
        return;
    }
    
    // 获取本地媒体流
    updateSignalingInfo('正在获取本地媒体流...');
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
    
    // ============================================
    // 【关键】添加本地媒体流到 RTCPeerConnection
    // ============================================
    // 这一步会将本地的视频/音频轨道添加到 P2P 连接中
    // addTrack 后，这些轨道会自动通过 RTCPeerConnection 传输给对方
    // 不需要手动传输，WebRTC 会自动处理编码、打包、网络传输等
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
        console.log('✅ 添加本地轨道:', track.kind, track.label);
        addIceInfo(`添加本地轨道: ${track.kind} (${track.label})`);
    });
    
    // 更新按钮状态
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    // 根据角色执行不同的流程
    if (currentRole === 'offerer') {
        await createOffer();
    } else {
        await waitForOffer();
    }
    
    // 开始监听信令
    startSignalingListener();
}

/**
 * 创建 Offer（发起者）
 */
async function createOffer() {
    try {
        updateSignalingInfo('创建 Offer...');
        
        // 创建 Offer
        const offer = await peerConnection.createOffer();
        
        // 设置本地描述（Local Description）
        await peerConnection.setLocalDescription(offer);
        
        console.log('Offer 创建成功:', offer);
        
        // 通过信令发送 Offer
        if (currentSignalingType === 'websocket' && websocketSignaling) {
            if (websocketSignaling.sendOffer(offer)) {
                updateSignalingInfo('✅ Offer 已发送（WebSocket），等待 Answer...');
            } else {
                updateSignalingInfo('❌ 发送 Offer 失败，WebSocket 未连接');
            }
        } else {
            // localStorage 方式
            localStorage.setItem(SIGNALING_KEYS.OFFER, JSON.stringify(offer));
            localStorage.setItem('webrtc_offer_timestamp', Date.now().toString());
            updateSignalingInfo('✅ Offer 已发送（localStorage），等待 Answer...');
            localStorage.removeItem(SIGNALING_KEYS.ANSWER);
        }
    } catch (error) {
        console.error('创建 Offer 失败:', error);
        alert('创建 Offer 失败: ' + error.message);
    }
}

/**
 * 等待并处理 Offer（接收者）
 */
async function waitForOffer() {
    updateSignalingInfo('等待 Offer...');
    
    // WebSocket 方式不需要轮询，直接等待消息
    if (currentSignalingType === 'websocket') {
        // WebSocket 消息会在 handleWebSocketMessage 中处理
        return;
    }
    
    // localStorage 方式需要轮询检查
    const checkOffer = () => {
        const offerData = localStorage.getItem(SIGNALING_KEYS.OFFER);
        const timestamp = localStorage.getItem('webrtc_offer_timestamp');
        
        if (offerData && timestamp) {
            const offerTime = parseInt(timestamp);
            const now = Date.now();
            
            // 只处理最近 30 秒内的 Offer（避免处理旧的）
            if (now - offerTime < 30000) {
                handleOffer(JSON.parse(offerData));
                return true;
            }
        }
        return false;
    };
    
    // 立即检查一次
    if (!checkOffer()) {
        // 如果还没有 Offer，每 500ms 检查一次
        const checkInterval = setInterval(() => {
            if (checkOffer()) {
                clearInterval(checkInterval);
            }
        }, 500);
        
        // 30 秒后停止检查
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!peerConnection?.remoteDescription) {
                updateSignalingInfo('⏱️ 等待 Offer 超时，请确保另一个标签页已选择"发起者"并点击"开始连接"');
            }
        }, 30000);
    }
}

/**
 * 处理 Offer（接收者）
 */
async function handleOffer(offer) {
    try {
        // 如果 offer 是字符串，解析它
        const offerObj = typeof offer === 'string' ? JSON.parse(offer) : offer;
        
        updateSignalingInfo('收到 Offer，创建 Answer...');
        
        // 设置远程描述（Remote Description）
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offerObj));
        
        // 创建 Answer
        const answer = await peerConnection.createAnswer();
        
        // 设置本地描述
        await peerConnection.setLocalDescription(answer);
        
        console.log('Answer 创建成功:', answer);
        
        // 通过信令发送 Answer
        if (currentSignalingType === 'websocket' && websocketSignaling) {
            if (websocketSignaling.sendAnswer(answer)) {
                updateSignalingInfo('✅ Answer 已发送（WebSocket）');
            } else {
                updateSignalingInfo('❌ 发送 Answer 失败，WebSocket 未连接');
            }
        } else {
            // localStorage 方式
            localStorage.setItem(SIGNALING_KEYS.ANSWER, JSON.stringify(answer));
            localStorage.setItem('webrtc_answer_timestamp', Date.now().toString());
            updateSignalingInfo('✅ Answer 已发送（localStorage）');
            localStorage.removeItem(SIGNALING_KEYS.OFFER);
        }
    } catch (error) {
        console.error('处理 Offer 失败:', error);
        alert('处理 Offer 失败: ' + error.message);
    }
}

/**
 * 发送 ICE 候选
 */
function sendIceCandidate(candidate) {
    if (currentSignalingType === 'websocket' && websocketSignaling) {
        // WebSocket 方式
        websocketSignaling.sendIceCandidate(candidate);
    } else {
        // localStorage 方式
        const key = currentRole === 'offerer' 
            ? SIGNALING_KEYS.ICE_CANDIDATE_OFFERER 
            : SIGNALING_KEYS.ICE_CANDIDATE_ANSWERER;
        
        // 将候选添加到数组中
        let candidates = [];
        const existing = localStorage.getItem(key);
        if (existing) {
            try {
                candidates = JSON.parse(existing);
            } catch (e) {
                candidates = [];
            }
        }
        
        candidates.push(candidate);
        localStorage.setItem(key, JSON.stringify(candidates));
        localStorage.setItem(key + '_timestamp', Date.now().toString());
    }
}

/**
 * 处理 ICE 候选
 */
async function handleIceCandidate(candidate) {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE 候选已添加');
        addIceInfo('收到远程 ICE 候选: ' + candidate.candidate);
    } catch (error) {
        console.error('添加 ICE 候选失败:', error);
    }
}

/**
 * 开始监听信令
 */
function startSignalingListener() {
    // WebSocket 方式不需要轮询
    if (currentSignalingType === 'websocket') {
        return;
    }
    
    // localStorage 方式需要轮询
    if (signalingInterval) {
        clearInterval(signalingInterval);
    }
    
    // 每 500ms 检查一次信令消息
    signalingInterval = setInterval(() => {
        if (currentRole === 'offerer') {
            // 发起者：检查 Answer 和接收者的 ICE 候选
            checkAnswer();
            checkIceCandidates(SIGNALING_KEYS.ICE_CANDIDATE_ANSWERER);
        } else {
            // 接收者：检查发起者的 ICE 候选
            checkIceCandidates(SIGNALING_KEYS.ICE_CANDIDATE_OFFERER);
        }
    }, 500);
}

/**
 * 处理 Answer（发起者）
 */
async function handleAnswer(answer) {
    try {
        // 如果 answer 是字符串，解析它
        const answerObj = typeof answer === 'string' ? JSON.parse(answer) : answer;
        
        if (peerConnection.remoteDescription === null) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answerObj));
            console.log('Answer 已设置');
            updateSignalingInfo('✅ Answer 已接收，连接建立中...');
        }
    } catch (error) {
        console.error('设置 Answer 失败:', error);
    }
}

/**
 * 检查 Answer（发起者）- localStorage 方式
 */
async function checkAnswer() {
    const answerData = localStorage.getItem(SIGNALING_KEYS.ANSWER);
    const timestamp = localStorage.getItem('webrtc_answer_timestamp');
    
    if (answerData && timestamp) {
        const answerTime = parseInt(timestamp);
        const now = Date.now();
        
        // 只处理最近 30 秒内的 Answer
        if (now - answerTime < 30000 && peerConnection.remoteDescription === null) {
            await handleAnswer(JSON.parse(answerData));
            // 清除 Answer
            localStorage.removeItem(SIGNALING_KEYS.ANSWER);
        }
    }
}

/**
 * 检查 ICE 候选
 */
async function checkIceCandidates(key) {
    const candidatesData = localStorage.getItem(key);
    const timestamp = localStorage.getItem(key + '_timestamp');
    
    if (candidatesData && timestamp) {
        const candidateTime = parseInt(timestamp);
        const now = Date.now();
        
        // 只处理最近 30 秒内的候选
        if (now - candidateTime < 30000) {
            try {
                const candidates = JSON.parse(candidatesData);
                
                // 处理所有候选
                for (const candidate of candidates) {
                    await handleIceCandidate(candidate);
                }
                
                // 清除已处理的候选
                localStorage.removeItem(key);
                localStorage.removeItem(key + '_timestamp');
            } catch (error) {
                console.error('处理 ICE 候选失败:', error);
            }
        }
    }
}

/**
 * 停止连接
 */
function stopConnection() {
    // 停止信令监听
    if (signalingInterval) {
        clearInterval(signalingInterval);
        signalingInterval = null;
    }
    
    // 关闭 WebSocket 连接（不断开，保持连接以便下次使用）
    // if (websocketSignaling) {
    //     websocketSignaling.close();
    //     websocketSignaling = null;
    // }
    
    // 关闭 RTCPeerConnection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    // 停止本地媒体流
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
        });
        localStream = null;
    }
    
    // 清除 video 元素
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    
    // 更新 UI
    localVideo.style.display = 'none';
    remoteVideo.style.display = 'none';
    localPlaceholder.classList.remove('hidden');
    remotePlaceholder.classList.remove('hidden');
    
    // 更新按钮状态
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    // 清除 localStorage 信令数据
    Object.values(SIGNALING_KEYS).forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(key + '_timestamp');
    });
    localStorage.removeItem('webrtc_offer_timestamp');
    localStorage.removeItem('webrtc_answer_timestamp');
    
    updateConnectionStatus('disconnected');
    updateSignalingInfo('连接已断开');
    iceInfo.innerHTML = '<p>等待 ICE 候选...</p>';
    iceCandidateCount = 0;
}

/**
 * 更新连接状态显示
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
    const roleText = currentRole === 'offerer' ? '发起者' : currentRole === 'answerer' ? '接收者' : '未选择';
    connectionStatus.innerHTML = `
        <p><strong>状态：</strong><span class="status ${status.class}">${status.text}</span></p>
        <p><strong>角色：</strong>${roleText}</p>
    `;
}

/**
 * 更新信令信息显示
 */
function updateSignalingInfo(message) {
    signalingInfo.innerHTML = `<p>${message}</p>`;
}

/**
 * 添加 ICE 信息
 */
function addIceInfo(message) {
    const p = document.createElement('p');
    p.className = 'ice-candidate';
    p.textContent = new Date().toLocaleTimeString() + ' - ' + message;
    iceInfo.appendChild(p);
    
    // 保持最多 20 条记录
    const children = iceInfo.children;
    if (children.length > 20) {
        iceInfo.removeChild(children[0]);
    }
    
    // 自动滚动到底部
    iceInfo.scrollTop = iceInfo.scrollHeight;
}

/**
 * 复制 ICE 信息到剪贴板
 */
async function copyIceInfo() {
    try {
        // 收集所有 ICE 信息文本
        const iceTexts = [];
        const children = iceInfo.children;
        
        for (let i = 0; i < children.length; i++) {
            const text = children[i].textContent;
            if (text && text.trim()) {
                iceTexts.push(text);
            }
        }
        
        // 如果没有内容，提示用户
        if (iceTexts.length === 0) {
            showCopyFeedback('暂无 ICE 信息可复制', false);
            return;
        }
        
        // 组合所有文本
        const textToCopy = iceTexts.join('\n');
        
        // 使用 Clipboard API 复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
            showCopyFeedback('✅ 已复制到剪贴板', true);
        } else {
            // 降级方案：使用传统的 execCommand
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                showCopyFeedback('✅ 已复制到剪贴板', true);
            } catch (err) {
                showCopyFeedback('❌ 复制失败，请手动选择文本复制', false);
            }
            
            document.body.removeChild(textarea);
        }
    } catch (error) {
        console.error('复制失败:', error);
        showCopyFeedback('❌ 复制失败: ' + error.message, false);
    }
}

/**
 * 显示复制反馈
 */
function showCopyFeedback(message, success) {
    // 更新按钮状态
    if (success) {
        copyIceBtn.classList.add('copied');
        copyIceBtn.textContent = '✅ 已复制';
        
        // 2秒后恢复
        setTimeout(() => {
            copyIceBtn.classList.remove('copied');
            copyIceBtn.textContent = '📋 复制';
        }, 2000);
    } else {
        // 显示错误提示
        const originalText = copyIceBtn.textContent;
        copyIceBtn.textContent = '❌ 失败';
        copyIceBtn.style.background = '#fee2e2';
        copyIceBtn.style.borderColor = '#ef4444';
        copyIceBtn.style.color = '#991b1b';
        
        setTimeout(() => {
            copyIceBtn.textContent = originalText;
            copyIceBtn.style.background = '';
            copyIceBtn.style.borderColor = '';
            copyIceBtn.style.color = '';
        }, 2000);
    }
    
    // 也可以显示一个临时提示
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${success ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
    `;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 3000);
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
        case 'OverconstrainedError':
            errorMessage += '设备不支持请求的约束条件';
            break;
        case 'SecurityError':
            errorMessage += '由于安全限制，无法访问媒体设备（可能需要 HTTPS）';
            break;
        default:
            errorMessage += error.message || '未知错误';
    }
    
    alert(errorMessage);
    console.error('错误详情:', error);
}

// 绑定事件监听器
localStorageBtn.addEventListener('click', () => selectSignalingType('localStorage'));
websocketBtn.addEventListener('click', () => selectSignalingType('websocket'));
offererBtn.addEventListener('click', () => selectRole('offerer'));
answererBtn.addEventListener('click', () => selectRole('answerer'));
resetRoleBtn.addEventListener('click', resetRole);
startBtn.addEventListener('click', startConnection);
stopBtn.addEventListener('click', stopConnection);
copyIceBtn.addEventListener('click', copyIceInfo);

// 初始化页面
initPage();

// 初始化信令方式
updateSignalingStatus('info', '使用 localStorage 信令（无需服务器）');

// 页面加载时检查支持情况
if (!checkSupport()) {
    offererBtn.disabled = true;
    answererBtn.disabled = true;
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    stopConnection();
});

