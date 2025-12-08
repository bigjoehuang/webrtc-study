/**
 * WebRTC 共享工具函数
 */

/**
 * 获取用户媒体流
 * @param {Object} constraints - 媒体约束
 * @returns {Promise<MediaStream>}
 */
export async function getUserMedia(constraints = { video: true, audio: true }) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('获取用户媒体失败:', error);
        throw error;
    }
}

/**
 * 获取显示媒体流（屏幕共享）
 * @param {Object} constraints - 媒体约束
 * @returns {Promise<MediaStream>}
 */
export async function getDisplayMedia(constraints = { video: true, audio: true }) {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        return stream;
    } catch (error) {
        console.error('获取显示媒体失败:', error);
        throw error;
    }
}

/**
 * 停止媒体流中的所有轨道
 * @param {MediaStream} stream - 媒体流
 */
export function stopMediaStream(stream) {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

/**
 * 创建 RTCPeerConnection 配置
 * @returns {RTCConfiguration}
 */
export function getDefaultRTCConfiguration() {
    return {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };
}

/**
 * 创建 RTCPeerConnection
 * @param {RTCConfiguration} config - RTC 配置
 * @returns {RTCPeerConnection}
 */
export function createPeerConnection(config = null) {
    const rtcConfig = config || getDefaultRTCConfiguration();
    return new RTCPeerConnection(rtcConfig);
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 * @param {HTMLElement} container - 容器元素
 */
export function showError(message, container = document.body) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
    `;
    errorDiv.textContent = message;
    container.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * 显示成功消息
 * @param {string} message - 成功消息
 * @param {HTMLElement} container - 容器元素
 */
export function showSuccess(message, container = document.body) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
    `;
    successDiv.textContent = message;
    container.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 检查浏览器是否支持 WebRTC
 * @returns {boolean}
 */
export function isWebRTCSupported() {
    return !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        window.RTCPeerConnection
    );
}

/**
 * 获取错误消息的中文描述
 * @param {Error} error - 错误对象
 * @returns {string}
 */
export function getErrorMessage(error) {
    const errorMessages = {
        'NotAllowedError': '用户拒绝了摄像头/麦克风权限请求',
        'NotFoundError': '未找到摄像头或麦克风设备',
        'NotReadableError': '摄像头或麦克风被其他应用占用',
        'OverconstrainedError': '设备不支持请求的约束条件',
        'SecurityError': '由于安全限制，无法访问媒体设备',
        'TypeError': '参数类型错误',
        'AbortError': '操作被中止',
        'NotSupportedError': '浏览器不支持此功能'
    };

    return errorMessages[error.name] || error.message || '未知错误';
}

