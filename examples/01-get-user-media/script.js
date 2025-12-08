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
const audioLevelFill = document.getElementById('audioLevelFill');
const audioLevelValue = document.getElementById('audioLevelValue');

// 存储当前的媒体流
let currentStream = null;
let currentFacingMode = 'user'; // 'user' 前置摄像头, 'environment' 后置摄像头

// 音频分析相关
let audioContext = null;
let analyser = null;
let microphone = null;
let animationFrameId = null;

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
        
        // 开始音频分析
        startAudioAnalysis(stream);
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
        
        // 停止音频分析
        stopAudioAnalysis();
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

/**
 * 开始音频分析
 * @param {MediaStream} stream - 媒体流
 */
function startAudioAnalysis(stream) {
    // 停止之前的分析（如果存在）
    stopAudioAnalysis();
    
    try {
        // 创建 AudioContext（如果不存在）
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // 创建 AnalyserNode 用于分析音频
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // 快速傅里叶变换大小，影响分析精度
        analyser.smoothingTimeConstant = 0.8; // 平滑系数，0-1之间，值越大越平滑
        
        // 从媒体流中获取音频轨道
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            console.warn('媒体流中没有音频轨道');
            return;
        }
        
        // 创建 MediaStreamAudioSourceNode，将媒体流连接到音频上下文
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        // 开始实时更新音量显示
        updateAudioLevel();
    } catch (error) {
        console.error('启动音频分析失败:', error);
    }
}

/**
 * 停止音频分析
 */
function stopAudioAnalysis() {
    // 停止动画帧
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // 断开音频连接
    if (microphone) {
        try {
            microphone.disconnect();
        } catch (e) {
            // 忽略断开连接时的错误
        }
        microphone = null;
    }
    
    if (analyser) {
        try {
            analyser.disconnect();
        } catch (e) {
            // 忽略断开连接时的错误
        }
        analyser = null;
    }
    
    // 重置音量显示
    audioLevelFill.style.width = '0%';
    audioLevelValue.textContent = '-∞';
}

/**
 * 更新音频音量显示
 * 
 * 这个函数会被 requestAnimationFrame 反复调用，形成动画循环
 * 每次调用都会：
 * 1. 从 AnalyserNode 获取最新的音频数据
 * 2. 计算当前音量级别（RMS 和分贝值）
 * 3. 更新页面上的进度条和数值显示
 * 4. 请求浏览器在下一帧继续调用此函数（形成循环）
 */
function updateAudioLevel() {
    
    if (!analyser) {
        return;
    }
    
    // 创建数据数组来存储音频数据
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // 获取时域数据（音频波形数据）
    analyser.getByteTimeDomainData(dataArray);
    
    // 计算音量级别（RMS - Root Mean Square，均方根）
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        // 将 0-255 的值转换为 -1 到 1 的音频样本值
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
    }
    
    // 计算 RMS
    const rms = Math.sqrt(sum / dataArray.length);
    
    // 将 RMS 转换为分贝 (dB)
    // 
    // 【为什么分贝是负数到0？】
    // 分贝（dB）是一个对数单位，用于表示相对强度。
    // 
    // 1. 0dB 通常定义为"参考电平"（最大不失真电平）
    //    - 在数字音频中，0dB 表示满量程（full scale）
    //    - 这是系统能处理的最大不失真信号
    // 
    // 2. 负数表示低于参考电平
    //    - -20dB 表示信号强度是参考电平的 1/10（10^(-20/20) = 0.1）
    //    - -40dB 表示信号强度是参考电平的 1/100（10^(-40/20) = 0.01）
    //    - -60dB 表示信号强度是参考电平的 1/1000（10^(-60/20) = 0.001）
    // 
    // 3. 实际麦克风输入通常是负数
    //    - 因为实际声音输入远小于系统的最大处理能力
    //    - 安静环境：-50dB 到 -40dB
    //    - 正常说话：-30dB 到 -20dB
    //    - 大声说话：-20dB 到 -10dB
    //    - 接近0dB 表示声音非常大，接近系统上限
    // 
    // 4. 分贝公式：dB = 20 * log10(amplitude / reference)
    //    - 当 amplitude < reference 时，结果是负数
    //    - 当 amplitude = reference 时，结果是 0
    //    - 当 amplitude > reference 时，结果是正数（但会被限制，避免失真）
    // 
    // 在我们的实现中：
    // - RMS 值范围是 0 到 1（归一化后的音频幅度）
    // - 当 RMS = 1 时，dB = 20 * log10(1) = 0dB（最大）
    // - 当 RMS < 1 时，dB < 0（负数）
    // - 当 RMS 接近 0 时，dB 接近 -∞
    const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    
    // 限制分贝值范围（通常麦克风输入在 -60dB 到 0dB 之间）
    // -60dB 是常见的"静音阈值"（几乎听不到声音）
    // 0dB 是"满量程"（最大不失真电平）
    const minDb = -60;
    const maxDb = 0;
    const clampedDb = Math.max(minDb, Math.min(maxDb, db));
    
    // 将分贝值转换为百分比（用于显示进度条）
    const percentage = ((clampedDb - minDb) / (maxDb - minDb)) * 100;
    
    // 更新 UI
    audioLevelFill.style.width = percentage + '%';
    audioLevelValue.textContent = clampedDb === -Infinity ? '-∞' : clampedDb.toFixed(1);
    
    // 【继续下一帧更新 - 实现实时更新的关键】
    // 
    // requestAnimationFrame 是浏览器提供的 API，用于创建动画循环
    // 
    // 工作原理：
    // 1. requestAnimationFrame(callback) 告诉浏览器："在下一帧渲染之前调用这个函数"
    // 2. 浏览器通常以 60fps（每秒60帧）的速度刷新屏幕，即每 16.67ms 一帧
    // 3. 每次调用 updateAudioLevel() 时：
    //    - 读取最新的音频数据
    //    - 计算音量级别
    //    - 更新 UI 显示
    //    - 然后再次调用 requestAnimationFrame，请求"下一帧继续更新"
    // 
    // 这样就形成了一个循环：
    // updateAudioLevel() → 更新显示 → requestAnimationFrame() → 
    // 浏览器下一帧 → updateAudioLevel() → 更新显示 → requestAnimationFrame() → ...
    // 
    // 为什么不用 setInterval？
    // - setInterval 是固定时间间隔，可能和屏幕刷新不同步，导致卡顿
    // - requestAnimationFrame 会自动与浏览器刷新率同步，更流畅
    // - 当标签页不可见时，requestAnimationFrame 会自动暂停，节省资源
    // 
    // 返回值 animationFrameId 用于取消动画（在 stopAudioAnalysis 中使用）
    animationFrameId = requestAnimationFrame(updateAudioLevel);
}

// 页面加载时检查支持情况
if (!checkSupport()) {
    startBtn.disabled = true;
    mediaInfo.innerHTML = '<p style="color: red;">您的浏览器不支持 getUserMedia API</p>';
}

