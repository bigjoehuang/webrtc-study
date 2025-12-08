/**
 * 示例 1：获取用户媒体
 * 
 * 这个示例演示了如何使用 getUserMedia() API 获取用户的摄像头和麦克风
 */

// 获取 DOM 元素
const localVideo = document.getElementById('localVideo');
const placeholder = document.getElementById('placeholder');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const mediaInfo = document.getElementById('mediaInfo');

// 存储当前的媒体流
let currentStream = null;
let currentFacingMode = 'user'; // 'user' 前置摄像头, 'environment' 后置摄像头

/**
 * 检查浏览器是否支持 getUserMedia
 */
function checkSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的浏览器不支持 getUserMedia API');
        return false;
    }
    return true;
}

/**
 * 获取用户媒体流
 * @param {Object} constraints - 媒体约束
 */
async function requestUserMedia(constraints) {
    try {
        // 请求用户媒体权限并获取流
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('获取用户媒体失败:', error);
        handleError(error);
        return null;
    }
}

/**
 * 开始获取媒体流
 */
async function startMedia() {
    if (!checkSupport()) {
        return;
    }

    // 定义媒体约束
    // video: true 表示请求视频，也可以指定更详细的约束
    // audio: true 表示请求音频
    const constraints = {
        video: {
            facingMode: currentFacingMode, // 指定使用前置或后置摄像头
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: true
    };

    // 如果已经有流在运行，先停止它
    if (currentStream) {
        stopMedia();
    }

    // 获取媒体流
    const stream = await requestUserMedia(constraints);
    
    if (stream) {
        currentStream = stream;
        
        // 将流赋值给 video 元素的 srcObject 属性
        // 这是现代浏览器推荐的方式（替代 src 属性）
        localVideo.srcObject = stream;
        
        // 显示视频，隐藏占位符
        localVideo.style.display = 'block';
        placeholder.classList.add('hidden');
        
        // 更新按钮状态
        startBtn.disabled = true;
        stopBtn.disabled = false;
        switchCameraBtn.disabled = false;
        
        // 显示媒体信息
        displayMediaInfo(stream);
    }
}

/**
 * 停止媒体流
 */
function stopMedia() {
    if (currentStream) {
        // 停止流中的所有轨道（视频轨道和音频轨道）
        currentStream.getTracks().forEach(track => {
            track.stop();
            console.log('已停止轨道:', track.kind, track.label);
        });
        
        currentStream = null;
        
        // 清除 video 元素的源
        localVideo.srcObject = null;
        
        // 隐藏视频，显示占位符
        localVideo.style.display = 'none';
        placeholder.classList.remove('hidden');
        
        // 更新按钮状态
        startBtn.disabled = false;
        stopBtn.disabled = true;
        switchCameraBtn.disabled = true;
        
        // 清除媒体信息
        mediaInfo.innerHTML = '<p>等待获取媒体流...</p>';
    }
}

/**
 * 切换摄像头（前置/后置）
 */
async function switchCamera() {
    if (!currentStream) {
        return;
    }

    // 切换摄像头方向
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    // 停止当前流
    stopMedia();
    
    // 等待一小段时间后重新获取
    setTimeout(() => {
        startMedia();
    }, 100);
}

/**
 * 显示媒体流信息
 * @param {MediaStream} stream - 媒体流
 */
function displayMediaInfo(stream) {
    const tracks = stream.getTracks();
    let infoHTML = '<p><strong>媒体流信息：</strong></p>';
    
    tracks.forEach((track, index) => {
        const settings = track.getSettings();
        infoHTML += `<p><strong>轨道 ${index + 1} (${track.kind}):</strong></p>`;
        infoHTML += `<p>  - 标签: ${track.label || '未知'}</p>`;
        infoHTML += `<p>  - 启用: ${track.enabled ? '是' : '否'}</p>`;
        infoHTML += `<p>  - 静音: ${track.muted ? '是' : '否'}</p>`;
        
        if (track.kind === 'video') {
            infoHTML += `<p>  - 分辨率: ${settings.width || '未知'} x ${settings.height || '未知'}</p>`;
            infoHTML += `<p>  - 帧率: ${settings.frameRate || '未知'} fps</p>`;
            infoHTML += `<p>  - 摄像头: ${settings.facingMode || '未知'}</p>`;
        } else if (track.kind === 'audio') {
            infoHTML += `<p>  - 采样率: ${settings.sampleRate || '未知'} Hz</p>`;
            infoHTML += `<p>  - 声道数: ${settings.channelCount || '未知'}</p>`;
        }
    });
    
    mediaInfo.innerHTML = infoHTML;
}

/**
 * 处理错误
 * @param {Error} error - 错误对象
 */
function handleError(error) {
    let errorMessage = '获取媒体失败: ';
    
    switch (error.name) {
        case 'NotAllowedError':
            errorMessage += '用户拒绝了摄像头/麦克风权限请求';
            break;
        case 'NotFoundError':
            errorMessage += '未找到摄像头或麦克风设备';
            break;
        case 'NotReadableError':
            errorMessage += '摄像头或麦克风被其他应用占用';
            break;
        case 'OverconstrainedError':
            errorMessage += '设备不支持请求的约束条件';
            break;
        case 'SecurityError':
            errorMessage += '由于安全限制，无法访问媒体设备';
            break;
        default:
            errorMessage += error.message || '未知错误';
    }
    
    alert(errorMessage);
    console.error('错误详情:', error);
}

// 绑定事件监听器
startBtn.addEventListener('click', startMedia);
stopBtn.addEventListener('click', stopMedia);
switchCameraBtn.addEventListener('click', switchCamera);

// 页面加载时检查支持情况
if (!checkSupport()) {
    startBtn.disabled = true;
    mediaInfo.innerHTML = '<p style="color: red;">您的浏览器不支持 getUserMedia API</p>';
}

