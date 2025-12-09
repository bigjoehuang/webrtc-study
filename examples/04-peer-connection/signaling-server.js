/**
 * WebSocket 信令服务器
 * 
 * 这是一个简单的 WebSocket 服务器，用于 WebRTC 信令交换
 * 支持多个客户端连接，转发 Offer、Answer 和 ICE 候选
 */

const WebSocket = require('ws');

// 服务器配置
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ 
    port: PORT,
    host: HOST
});

// 存储连接的客户端
const clients = new Map(); // key: clientId, value: { ws, role, roomId }
const rooms = new Map();   // key: roomId, value: [clientId1, clientId2]

// 生成唯一的客户端ID
function generateClientId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 生成房间ID
function generateRoomId() {
    return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 处理客户端连接
wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    const clientIp = req.socket.remoteAddress;
    
    console.log(`[${new Date().toLocaleTimeString()}] 新客户端连接: ${clientId} (${clientIp})`);
    
    // 存储客户端信息
    clients.set(clientId, {
        ws: ws,
        role: null,
        roomId: null,
        connectedAt: Date.now()
    });
    
    // 发送欢迎消息，包含客户端ID
    ws.send(JSON.stringify({
        type: 'welcome',
        clientId: clientId,
        message: '已连接到信令服务器'
    }));
    
    // 处理接收到的消息
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            handleMessage(clientId, data);
        } catch (error) {
            console.error(`[${clientId}] 消息解析失败:`, error);
            sendError(ws, '消息格式错误');
        }
    });
    
    // 处理连接关闭
    ws.on('close', () => {
        console.log(`[${new Date().toLocaleTimeString()}] 客户端断开: ${clientId}`);
        handleDisconnect(clientId);
    });
    
    // 处理错误
    ws.on('error', (error) => {
        console.error(`[${clientId}] WebSocket 错误:`, error);
    });
});

/**
 * 处理客户端消息
 */
function handleMessage(clientId, data) {
    console.log(`handleMessage,clientId= [${clientId}], 收到消息:`, data);

    const client = clients.get(clientId);
    if (!client) {
        console.error(`客户端 ${clientId} 不存在`);
        return;
    }
    
    const { type, payload } = data;
    
    switch (type) {
        case 'join':
            handleJoin(clientId, payload);
            break;
            
        case 'offer':
            handleOffer(clientId, payload);
            break;
            
        case 'answer':
            handleAnswer(clientId, payload);
            break;
            
        case 'ice-candidate':
            handleIceCandidate(clientId, payload);
            break;
            
        case 'ping':
            // 心跳检测
            client.ws.send(JSON.stringify({ type: 'pong' }));
            break;
            
        default:
            console.warn(`[${clientId}] 未知消息类型: ${type}`);
            sendError(client.ws, `未知消息类型: ${type}`);
    }
}

/**
 * 处理客户端加入房间
 */
function handleJoin(clientId, payload) {
    console.log(`handleJoin [${clientId}] 加入房间 ${payload.roomId}，角色: ${payload.role}`);

    const client = clients.get(clientId);
    let { role } = payload; // 'offerer' 或 'answerer'，使用let以便可以修改
    
    if (!role || (role !== 'offerer' && role !== 'answerer')) {
        sendError(client.ws, '无效的角色，必须是 offerer 或 answerer');
        return;
    }
    
    // 查找或创建房间
    let roomId = null;
    let existingClientRole = null;
    
    for (const [rid, roomClients] of rooms.entries()) {
        if (roomClients.length === 1) {
            // 找到只有一个客户端的房间
            const existingClientId = roomClients[0];
            const existingClient = clients.get(existingClientId);
            
            if (existingClient && existingClient.role) {
                existingClientRole = existingClient.role;
                
                // 如果角色相同，自动调整为另一个角色
                if (role === existingClientRole) {
                    role = role === 'offerer' ? 'answerer' : 'offerer';
                    console.log(`[${clientId}] 角色冲突，自动调整为: ${role}`);
                }
            }
            
            roomId = rid;
            roomClients.push(clientId);
            break;
        }
    }
    
    // 如果没有找到房间，创建新房间
    if (!roomId) {
        roomId = generateRoomId();
        rooms.set(roomId, [clientId]);
    }
    
    client.role = role;
    client.roomId = roomId;
    
    console.log(`[${clientId}] 加入房间 ${roomId}，角色: ${role}`);
    
    // 通知客户端已加入房间（发送实际使用的角色）
    client.ws.send(JSON.stringify({
        type: 'joined',
        roomId: roomId,
        role: role,
        message: `已加入房间 ${roomId}，角色: ${role}`
    }));
    
    // 如果房间有两个客户端，通知双方可以开始连接
    const roomClients = rooms.get(roomId);
    if (roomClients.length === 2) {
        roomClients.forEach(cid => {
            const c = clients.get(cid);
            if (c) {
                c.ws.send(JSON.stringify({
                    type: 'ready',
                    message: '房间已满，可以开始连接'
                }));
            }
        });
    }
}

/**
 * 处理 Offer
 */
function handleOffer(clientId, payload) {
    console.log('handleOffer, clientId:' + clientId);

    const client = clients.get(clientId);
    if (!client || !client.roomId) {
        sendError(client.ws, '未加入房间');
        return;
    }
    
    const roomClients = rooms.get(client.roomId);
    if (!roomClients) {
        sendError(client.ws, '房间不存在');
        return;
    }
    
    // 发送给房间内的其他客户端
    roomClients.forEach(cid => {
        if (cid !== clientId) {
            const otherClient = clients.get(cid);
            if (otherClient) {
                otherClient.ws.send(JSON.stringify({
                    type: 'offer',
                    payload: payload
                }));
                console.log(`[${clientId}] Offer 已转发给 ${cid}`);
            }
        }
    });
}

/**
 * 处理 Answer
 */
function handleAnswer(clientId, payload) {
    console.log('handleAnswer, clientId:' + clientId);
    const client = clients.get(clientId);
    if (!client || !client.roomId) {
        sendError(client.ws, '未加入房间');
        return;
    }
    
    const roomClients = rooms.get(client.roomId);
    if (!roomClients) {
        sendError(client.ws, '房间不存在');
        return;
    }
    
    // 发送给房间内的其他客户端
    roomClients.forEach(cid => {
        if (cid !== clientId) {
            const otherClient = clients.get(cid);
            if (otherClient) {
                otherClient.ws.send(JSON.stringify({
                    type: 'answer',
                    payload: payload
                }));
                console.log(`[${clientId}] Answer 已转发给 ${cid}`);
            }
        }
    });
}

/**
 * 处理 ICE 候选
 */
function handleIceCandidate(clientId, payload) {
    const client = clients.get(clientId);
    if (!client || !client.roomId) {
        sendError(client.ws, '未加入房间');
        return;
    }
    
    const roomClients = rooms.get(client.roomId);
    if (!roomClients) {
        sendError(client.ws, '房间不存在');
        return;
    }
    
    // 发送给房间内的其他客户端
    roomClients.forEach(cid => {
        if (cid !== clientId) {
            const otherClient = clients.get(cid);
            if (otherClient) {
                otherClient.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    payload: payload
                }));
                console.log(`[${clientId}] ICE 候选已转发给 ${cid}`);
            }
        }
    });
}

/**
 * 处理客户端断开连接
 */
function handleDisconnect(clientId) {
    const client = clients.get(clientId);
    if (!client) return;
    
    // 从房间中移除
    if (client.roomId) {
        const roomClients = rooms.get(client.roomId);
        if (roomClients) {
            const index = roomClients.indexOf(clientId);
            if (index > -1) {
                roomClients.splice(index, 1);
            }
            
            // 如果房间为空，删除房间
            if (roomClients.length === 0) {
                rooms.delete(client.roomId);
            } else {
                // 通知房间内的其他客户端
                roomClients.forEach(cid => {
                    const c = clients.get(cid);
                    if (c) {
                        c.ws.send(JSON.stringify({
                            type: 'peer-disconnected',
                            message: '对方已断开连接'
                        }));
                    }
                });
            }
        }
    }
    
    // 从客户端列表中移除
    clients.delete(clientId);
}

/**
 * 发送错误消息
 */
function sendError(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'error',
            message: message
        }));
    }
}

// 服务器启动
wss.on('listening', () => {
    console.log('='.repeat(50));
    console.log('WebSocket 信令服务器已启动');
    console.log(`监听地址: ws://${HOST}:${PORT}`);
    console.log(`访问地址: http://${HOST}:${PORT}`);
    console.log('='.repeat(50));
    console.log('等待客户端连接...\n');
});

// 处理服务器错误
wss.on('error', (error) => {
    console.error('服务器错误:', error);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    wss.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

