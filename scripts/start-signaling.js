/**
 * 启动信令服务器
 * 这个脚本用于启动 WebSocket 信令服务器
 */

const path = require('path');
const { spawn } = require('child_process');

// 获取信令服务器文件路径
const signalingServerPath = path.join(__dirname, '../examples/04-peer-connection/signaling-server.js');

// 启动服务器
const server = spawn('node', [signalingServerPath], {
    stdio: 'inherit',
    shell: true
});

server.on('error', (error) => {
    console.error('启动信令服务器失败:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    process.exit(code);
});

// 处理进程退出
process.on('SIGINT', () => {
    server.kill('SIGINT');
});

process.on('SIGTERM', () => {
    server.kill('SIGTERM');
});





