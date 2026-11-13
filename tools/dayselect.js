/* tools/dayselect.js */
const DaySelect = (function() {
    let overlay, panel, daysGrid, titleText;
    let currentDate = new Date();
    let selectedDate = null;
    let onSelectCallback = null;

    function init() {
        if(document.getElementById('ds-overlay')) return;
        
        // 注入 HTML
        overlay = document.createElement('div');
        overlay.className = 'ds-overlay';
        overlay.id = 'ds-overlay';
        
        const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
        
        overlay.innerHTML = `
            <div class="ds-panel">
                <div class="ds-header">
                    <button type="button" id="ds-prev">◀</button>
                    <span id="ds-title"></span>
                    <button type="button" id="ds-next">▶</button>
                </div>
                <div class="ds-weekdays">
                    ${daysOfWeek.map(d => `<div>${d}</div>`).join('')}
                </div>
                <div class="ds-days" id="ds-days"></div>
                <div class="ds-footer">
                    <button type="button" class="ds-btn-cancel" id="ds-cancel">取消</button>
                    <button type="button" class="ds-btn-confirm" id="ds-confirm">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        daysGrid = document.getElementById('ds-days');
        titleText = document.getElementById('ds-title');

        // 绑定事件
        document.getElementById('ds-prev').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); render(); };
        document.getElementById('ds-next').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); render(); };
        document.getElementById('ds-cancel').onclick = close;
        
        // 点击遮罩层关闭
        overlay.onclick = (e) => { if(e.target === overlay) close(); };

        document.getElementById('ds-confirm').onclick = () => {
            if(selectedDate && onSelectCallback) {
                // 格式化为 YYYY-MM-DD
                const y = selectedDate.getFullYear();
                const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const d = String(selectedDate.getDate()).padStart(2, '0');
                onSelectCallback(`${y}-${m}-${d}`);
            }
            close();
        };
    }

    function render() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        titleText.textContent = `${year} 年 ${month + 1} 月`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';
        // 填充前面的空白
        for(let i = 0; i < firstDay; i++) {
            html += `<div class="ds-day empty"></div>`;
        }
        // 填充天数
        for(let i = 1; i <= daysInMonth; i++) {
            const isSelected = selectedDate && 
                               selectedDate.getFullYear() === year && 
                               selectedDate.getMonth() === month && 
                               selectedDate.getDate() === i;
            
            html += `<div class="ds-day ${isSelected ? 'selected' : ''}" data-day="${i}">${i}</div>`;
        }
        daysGrid.innerHTML = html;

        // 绑定日期点击
        daysGrid.querySelectorAll('.ds-day:not(.empty)').forEach(el => {
            el.onclick = function() {
                const day = parseInt(this.getAttribute('data-day'));
                selectedDate = new Date(year, month, day);
                render(); // 重新渲染以更新高亮
            };
        });
    }

    function open(initialDateStr, callback) {
        init();
        onSelectCallback = callback;
        
        if(initialDateStr) {
            selectedDate = new Date(initialDateStr);
            if(isNaN(selectedDate)) selectedDate = null;
        } else {
            selectedDate = null;
        }
        
        currentDate = selectedDate ? new Date(selectedDate) : new Date();
        render();
        
        overlay.style.display = 'flex';
        // 强制重绘以触发动画
        void overlay.offsetWidth;
        overlay.classList.add('show');
    }

    function close() {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 200); // 等待动画结束
    }

    return { open };
})();