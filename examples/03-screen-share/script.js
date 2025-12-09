/**
 * 示例 3：屏幕共享
 * 
 * 这个示例演示了如何使用 getDisplayMedia() API 实现屏幕共享功能
 */

// 获取 DOM 元素
const localVideo = document.getElementById('localVideo');
const placeholder = document.getElementById('placeholder');
const shareScreenBtn = document.getElementById('shareScreenBtn');
const shareCameraBtn = document.getElementById('shareCameraBtn');
const stopBtn = document.getElementById('stopBtn');
const shareInfo = document.getElementById('shareInfo');

// 存储当前的媒体流
let currentStream = null;
let currentSource = null; // 'screen' 或 'camera'

/**
 * 检查浏览器是否支持 getDisplayMedia
 */
function checkSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('您的浏览器不支持 getDisplayMedia API');
        return false;
    }
    return true;
}

/**
 * 获取屏幕共享流
 * @param {Object} constraints - 媒体约束
 */
async function getDisplayMedia(constraints) {
    try {
        // getDisplayMedia 会弹出系统对话框，让用户选择要共享的内容
        // 可以共享：整个屏幕、特定窗口、浏览器标签页
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        return stream;
    } catch (error) {
        console.error('获取屏幕共享失败:', error);
        handleError(error);
        return null;
    }
}

/**
 * 获取摄像头流
 * @param {Object} constraints - 媒体约束
 */
async function getUserMedia(constraints) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('获取摄像头失败:', error);
        handleError(error);
        return null;
    }
}

/**
 * 开始屏幕共享
 */
async function startScreenShare() {
    if (!checkSupport()) {
        return;
    }

    // 定义屏幕共享约束
    // video: true 表示请求视频（屏幕内容）
    // audio: true 表示请求音频（系统音频，某些浏览器支持）
    const constraints = {
        video: {
            displaySurface: 'browser', // 可选：'monitor', 'window', 'browser', 'application'
            cursor: 'always' // 可选：'always', 'motion', 'never'
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
        }
    };

    // 如果已经有流在运行，先停止它
    if (currentStream) {
        stopSharing();
    }

    // 获取屏幕共享流
    // 这会弹出系统对话框，让用户选择要共享的内容
    const stream = await getDisplayMedia(constraints);
    
    if (stream) {
        currentStream = stream;
        currentSource = 'screen';
        
        // 将流赋值给 video 元素
        localVideo.srcObject = stream;
        
        // 显示视频，隐藏占位符
        localVideo.style.display = 'block';
        placeholder.classList.add('hidden');
        
        // 更新按钮状态
        shareScreenBtn.disabled = true;
        shareCameraBtn.disabled = false;
        stopBtn.disabled = false;
        
        // 显示共享信息
        displayShareInfo(stream, 'screen');
        
        // 监听共享停止事件
        // 当用户在系统对话框中点击"停止共享"时，会触发 ended 事件
        stream.getVideoTracks().forEach(track => {
            track.addEventListener('ended', () => {
                console.log('用户通过系统对话框停止了屏幕共享');
                stopSharing();
            });
        });
        
        // 如果包含音频轨道，也监听音频轨道的结束事件
        stream.getAudioTracks().forEach(track => {
            track.addEventListener('ended', () => {
                console.log('音频轨道已结束');
            });
        });
    }
}

/**
 * 切换到摄像头
 */
async function switchToCamera() {
    // 定义摄像头约束
    const constraints = {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: true
    };

    // 如果已经有流在运行，先停止它
    if (currentStream) {
        stopSharing();
    }

    // 获取摄像头流
    const stream = await getUserMedia(constraints);
    
    if (stream) {
        currentStream = stream;
        currentSource = 'camera';
        
        // 将流赋值给 video 元素
        localVideo.srcObject = stream;
        
        // 显示视频，隐藏占位符
        localVideo.style.display = 'block';
        placeholder.classList.add('hidden');
        
        // 更新按钮状态
        shareScreenBtn.disabled = false;
        shareCameraBtn.disabled = true;
        stopBtn.disabled = false;
        
        // 显示共享信息
        displayShareInfo(stream, 'camera');
    }
}

/**
 * 停止共享
 */
function stopSharing() {
    if (currentStream) {
        // 停止流中的所有轨道
        currentStream.getTracks().forEach(track => {
            track.stop();
            console.log('已停止轨道:', track.kind, track.label);
        });
        
        currentStream = null;
        currentSource = null;
        
        // 清除 video 元素的源
        localVideo.srcObject = null;
        
        // 隐藏视频，显示占位符
        localVideo.style.display = 'none';
        placeholder.classList.remove('hidden');
        
        // 更新按钮状态
        shareScreenBtn.disabled = false;
        shareCameraBtn.disabled = false;
        stopBtn.disabled = true;
        
        // 清除共享信息
        shareInfo.innerHTML = '<p>等待开始共享...</p>';
    }
}

/**
 * 显示共享信息
 * @param {MediaStream} stream - 媒体流
 * @param {string} source - 来源类型 ('screen' 或 'camera')
 */
function displayShareInfo(stream, source) {
    const tracks = stream.getTracks();
    let infoHTML = '';
    
    if (source === 'screen') {
        infoHTML += '<p><strong>共享类型：</strong>屏幕共享 <span class="status sharing">共享中</span></p>';
    } else {
        infoHTML += '<p><strong>共享类型：</strong>摄像头 <span class="status camera">使用中</span></p>';
    }
    
    infoHTML += '<p><strong>轨道信息：</strong></p>';
    
    tracks.forEach((track, index) => {
        const settings = track.getSettings();
        const constraints = track.getConstraints();
        
        infoHTML += `<p><strong>轨道 ${index + 1} (${track.kind}):</strong></p>`;
        infoHTML += `<p>  - 标签: ${track.label || '未知'}</p>`;
        infoHTML += `<p>  - 启用: ${track.enabled ? '是' : '否'}</p>`;
        infoHTML += `<p>  - 静音: ${track.muted ? '是' : '否'}</p>`;
        infoHTML += `<p>  - 状态: ${track.readyState}</p>`;
        
        if (track.kind === 'video') {
            if (source === 'screen') {
                // 屏幕共享的特殊属性
                if (settings.displaySurface) {
                    infoHTML += `<p>  - 显示表面: ${settings.displaySurface}</p>`;
                }
                if (settings.cursor) {
                    infoHTML += `<p>  - 光标显示: ${settings.cursor}</p>`;
                }
            }
            infoHTML += `<p>  - 分辨率: ${settings.width || '未知'} x ${settings.height || '未知'}</p>`;
            infoHTML += `<p>  - 帧率: ${settings.frameRate || '未知'} fps</p>`;
        } else if (track.kind === 'audio') {
            infoHTML += `<p>  - 采样率: ${settings.sampleRate || '未知'} Hz</p>`;
            infoHTML += `<p>  - 声道数: ${settings.channelCount || '未知'}</p>`;
            if (settings.echoCancellation !== undefined) {
                infoHTML += `<p>  - 回声消除: ${settings.echoCancellation ? '是' : '否'}</p>`;
            }
            if (settings.noiseSuppression !== undefined) {
                infoHTML += `<p>  - 噪声抑制: ${settings.noiseSuppression ? '是' : '否'}</p>`;
            }
        }
    });
    
    shareInfo.innerHTML = infoHTML;
}

/**
 * 处理错误
 * @param {Error} error - 错误对象
 */
function handleError(error) {
    let errorMessage = '操作失败: ';
    
    switch (error.name) {
        case 'NotAllowedError':
            if (currentSource === 'screen') {
                errorMessage += '用户拒绝了屏幕共享权限请求';
            } else {
                errorMessage += '用户拒绝了摄像头/麦克风权限请求';
            }
            break;
        case 'NotFoundError':
            if (currentSource === 'screen') {
                errorMessage += '未找到可共享的屏幕或窗口';
            } else {
                errorMessage += '未找到摄像头或麦克风设备';
            }
            break;
        case 'NotReadableError':
            errorMessage += '设备被其他应用占用';
            break;
        case 'OverconstrainedError':
            errorMessage += '设备不支持请求的约束条件';
            break;
        case 'SecurityError':
            errorMessage += '由于安全限制，无法访问媒体设备';
            break;
        case 'AbortError':
            errorMessage += '用户取消了操作';
            break;
        case 'NotSupportedError':
            errorMessage += '浏览器不支持此功能';
            break;
        default:
            errorMessage += error.message || '未知错误';
    }
    
    alert(errorMessage);
    console.error('错误详情:', error);
}

// 绑定事件监听器
shareScreenBtn.addEventListener('click', startScreenShare);
shareCameraBtn.addEventListener('click', switchToCamera);
stopBtn.addEventListener('click', stopSharing);

// 页面加载时检查支持情况
if (!checkSupport()) {
    shareScreenBtn.disabled = true;
    shareInfo.innerHTML = '<p style="color: red;">您的浏览器不支持 getDisplayMedia API</p>';
}


