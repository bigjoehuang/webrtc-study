/**
 * 示例 2：视频滤镜和效果
 * 
 * 这个示例演示了如何使用 Canvas 对视频流应用实时滤镜效果
 */

// 获取 DOM 元素
const originalVideo = document.getElementById('originalVideo');
const filteredCanvas = document.getElementById('filteredCanvas');
const placeholder = document.getElementById('placeholder');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

// 存储当前的媒体流和状态
let currentStream = null;
let animationFrameId = null;
let currentFilter = 'none';
let canvasContext = null;

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
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('获取用户媒体失败:', error);
        handleError(error);
        return null;
    }
}

/**
 * 初始化 Canvas
 * 设置 Canvas 尺寸与视频元素相同
 */
function initCanvas() {
    // 获取 Canvas 的 2D 渲染上下文（如果还没有获取）
    if (!canvasContext) {
        canvasContext = filteredCanvas.getContext('2d');
    }
    
    // 设置 Canvas 尺寸与视频元素相同
    // 注意：这里需要等待视频元数据加载后才能获取正确的尺寸
    if (originalVideo.videoWidth > 0 && originalVideo.videoHeight > 0) {
        filteredCanvas.width = originalVideo.videoWidth;
        filteredCanvas.height = originalVideo.videoHeight;
        console.log(`Canvas 尺寸设置为: ${filteredCanvas.width} x ${filteredCanvas.height}`);
    } else {
        // 如果视频尺寸还未加载，使用默认值
        filteredCanvas.width = 640;
        filteredCanvas.height = 480;
        console.log('使用默认 Canvas 尺寸');
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
    const constraints = {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false // 这个示例只处理视频
    };

    // 如果已经有流在运行，先停止它
    if (currentStream) {
        stopMedia();
    }

    // 获取媒体流
    const stream = await requestUserMedia(constraints);
    
    if (stream) {
        currentStream = stream;
        
        // 将流赋值给 video 元素
        originalVideo.srcObject = stream;
        
        // 等待视频元数据加载后初始化 Canvas
        // loadedmetadata 事件在视频的元数据（如尺寸、时长）加载完成后触发
        originalVideo.addEventListener('loadedmetadata', () => {
            initCanvas();
            // 开始绘制循环
            drawFrame();
        }, { once: true });
        
        // 如果元数据已经加载（某些情况下可能立即可用）
        if (originalVideo.readyState >= originalVideo.HAVE_METADATA) {
            initCanvas();
            drawFrame();
        }
        
        // 显示视频和 Canvas，隐藏占位符
        originalVideo.style.display = 'block';
        filteredCanvas.style.display = 'block';
        placeholder.classList.add('hidden');
        
        // 更新按钮状态
        startBtn.disabled = true;
        stopBtn.disabled = false;
    }
}

/**
 * 停止媒体流
 */
function stopMedia() {
    // 停止动画循环
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (currentStream) {
        // 停止流中的所有轨道
        currentStream.getTracks().forEach(track => {
            track.stop();
            console.log('已停止轨道:', track.kind, track.label);
        });
        
        currentStream = null;
        
        // 清除 video 元素的源
        originalVideo.srcObject = null;
        
        // 隐藏视频和 Canvas，显示占位符
        originalVideo.style.display = 'none';
        filteredCanvas.style.display = 'none';
        placeholder.classList.remove('hidden');
        
        // 清除 Canvas
        if (canvasContext) {
            canvasContext.clearRect(0, 0, filteredCanvas.width, filteredCanvas.height);
        }
        
        // 更新按钮状态
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

/**
 * 获取滤镜的 CSS 滤镜字符串
 * @param {string} filterName - 滤镜名称
 * @returns {string} CSS 滤镜字符串
 */
function getFilterString(filterName) {
    const filters = {
        'none': 'none',
        'grayscale': 'grayscale(100%)',
        'sepia': 'sepia(100%)',
        'blur': 'blur(5px)',
        'brightness': 'brightness(150%)',
        'contrast': 'contrast(150%)',
        'invert': 'invert(100%)',
        'saturate': 'saturate(200%)'
    };
    
    return filters[filterName] || 'none';
}

/**
 * 绘制视频帧到 Canvas
 * 
 * 这是实现实时滤镜的核心函数：
 * 1. 将视频的当前帧绘制到 Canvas
 * 2. 应用选定的滤镜效果
 * 3. 使用 requestAnimationFrame 持续更新
 * 
 * 【工作原理】
 * - requestAnimationFrame 会在浏览器每一帧渲染前调用此函数
 * - 每次调用时，drawImage 会捕获 video 元素的当前帧
 * - 通过 canvasContext.filter 应用 CSS 滤镜效果
 * - 形成连续的动画循环，实现实时滤镜
 */
function drawFrame() {
    // 检查视频是否已加载且正在播放
    // HAVE_ENOUGH_DATA 表示有足够的数据可以开始播放
    if (originalVideo.readyState >= originalVideo.HAVE_ENOUGH_DATA && canvasContext) {
        // 更新 Canvas 尺寸（如果视频尺寸改变了）
        if (filteredCanvas.width !== originalVideo.videoWidth || 
            filteredCanvas.height !== originalVideo.videoHeight) {
            filteredCanvas.width = originalVideo.videoWidth;
            filteredCanvas.height = originalVideo.videoHeight;
        }
        
        // 清除上一帧的内容（可选，因为新帧会覆盖）
        // canvasContext.clearRect(0, 0, filteredCanvas.width, filteredCanvas.height);
        
        // 设置滤镜效果
        // Canvas 2D Context 的 filter 属性支持 CSS 滤镜语法
        // 这会在绘制时应用滤镜效果
        canvasContext.filter = getFilterString(currentFilter);
        
        // 将视频的当前帧绘制到 Canvas
        // drawImage 可以绘制 video 元素，会自动使用当前播放的帧
        // 这是实现实时视频处理的关键 API
        canvasContext.drawImage(
            originalVideo,  // 源图像（video 元素）
            0,              // 目标 x 坐标
            0,              // 目标 y 坐标
            filteredCanvas.width,   // 目标宽度
            filteredCanvas.height   // 目标高度
        );
        
        // 重置滤镜（避免影响后续绘制）
        // 注意：filter 属性会影响所有后续绘制，所以需要重置
        canvasContext.filter = 'none';
    }
    
    // 请求下一帧继续绘制（形成动画循环）
    // 这样就能实现实时的视频滤镜效果
    // 浏览器通常以 60fps 的速度刷新，所以滤镜也会以 60fps 更新
    animationFrameId = requestAnimationFrame(drawFrame);
}

/**
 * 切换滤镜
 * @param {string} filterName - 滤镜名称
 */
function switchFilter(filterName) {
    currentFilter = filterName;
    
    // 更新按钮的激活状态
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filterName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    console.log('切换到滤镜:', filterName);
}

/**
 * 处理错误
 * @param {Error} error - 错误对象
 */
function handleError(error) {
    let errorMessage = '获取媒体失败: ';
    
    switch (error.name) {
        case 'NotAllowedError':
            errorMessage += '用户拒绝了摄像头权限请求';
            break;
        case 'NotFoundError':
            errorMessage += '未找到摄像头设备';
            break;
        case 'NotReadableError':
            errorMessage += '摄像头被其他应用占用';
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

// 为每个滤镜按钮绑定点击事件
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const filterName = btn.dataset.filter;
        switchFilter(filterName);
    });
});

// 默认激活"无滤镜"按钮
switchFilter('none');

// 页面加载时检查支持情况
if (!checkSupport()) {
    startBtn.disabled = true;
}

