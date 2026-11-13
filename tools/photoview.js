/* tools/photoview.js */
const PhotoView = (function() {
    let overlay, imgElement, downloadBtn, closeBtn;

    function init() {
        if (document.getElementById('pv-overlay')) return;

        overlay = document.createElement('div');
        overlay.className = 'pv-overlay';
        overlay.id = 'pv-overlay';

        overlay.innerHTML = `
            <button class="pv-close" id="pv-close">×</button>
            <div class="pv-img-wrapper" id="pv-wrapper">
                <img id="pv-img" src="" alt="预览图片">
            </div>
            <div class="pv-toolbar">
                <a class="pv-btn" id="pv-download" download="image.png">
                    <span>⬇️</span> 保存图片
                </a>
            </div>
        `;
        document.body.appendChild(overlay);

        imgElement = document.getElementById('pv-img');
        downloadBtn = document.getElementById('pv-download');
        closeBtn = document.getElementById('pv-close');

        // 关闭逻辑
        closeBtn.onclick = close;
        overlay.onclick = (e) => {
            if (e.target === overlay || e.target.id === 'pv-wrapper') {
                close();
            }
        };
        
        // 监听 Esc 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('show')) {
                close();
            }
        });
    }

    function open(src) {
        init();
        if (!src) return;

        imgElement.src = src;
        downloadBtn.href = src;

        // 尝试从 URL 中提取文件名作为默认下载名
        let fileName = 'photo.jpg';
        if (src.startsWith('data:image')) {
            fileName = 'base64-photo.png';
        } else {
            const urlParts = src.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart) fileName = lastPart.split('?')[0]; // 去除可能带的参数
        }
        downloadBtn.setAttribute('download', fileName);

        overlay.style.display = 'flex';
        void overlay.offsetWidth;
        overlay.classList.add('show');
    }

    function close() {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.style.display = 'none';
            imgElement.src = ''; // 释放内存
        }, 300);
    }

    return { open };
})();