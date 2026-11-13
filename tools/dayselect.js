/* tools/dayselect.js */
const DaySelect = (function() {
    let overlay, daysGrid, titleText, pickerGrid;
    let currentView = 'days'; // 'days' | 'months' | 'years'
    let currentDate = new Date();
    let selectedDate = null;
    let onSelectCallback = null;

    function init() {
        if(document.getElementById('ds-overlay')) return;
        
        overlay = document.createElement('div');
        overlay.className = 'ds-overlay';
        overlay.id = 'ds-overlay';
        
        const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
        
        overlay.innerHTML = `
            <div class="ds-panel">
                <div class="ds-header">
                    <button type="button" id="ds-prev">◀</button>
                    <div class="ds-title" id="ds-title">
                        <span id="ds-title-text"></span>
                        <span class="arrow">▼</span>
                    </div>
                    <button type="button" id="ds-next">▶</button>
                </div>
                
                <!-- 正常日期视图 -->
                <div id="ds-days-view">
                    <div class="ds-weekdays">
                        ${daysOfWeek.map(d => `<div>${d}</div>`).join('')}
                    </div>
                    <div class="ds-days" id="ds-days"></div>
                </div>

                <!-- 快捷月/年选择视图 -->
                <div class="ds-picker" id="ds-picker"></div>

                <div class="ds-footer">
                    <button type="button" class="ds-today" id="ds-today">回到今日</button>
                    <div class="ds-actions">
                        <button type="button" class="ds-btn-cancel" id="ds-cancel">取消</button>
                        <button type="button" class="ds-btn-confirm" id="ds-confirm">确定</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        daysGrid = document.getElementById('ds-days');
        pickerGrid = document.getElementById('ds-picker');
        titleText = document.getElementById('ds-title-text');
        const titleBtn = document.getElementById('ds-title');

        // 切换视图
        titleBtn.onclick = () => {
            if (currentView === 'days') {
                currentView = 'months';
            } else if (currentView === 'months') {
                currentView = 'years';
            } else {
                currentView = 'days';
            }
            render();
        };

        document.getElementById('ds-prev').onclick = () => { 
            if (currentView === 'days') currentDate.setMonth(currentDate.getMonth() - 1);
            else if (currentView === 'months') currentDate.setFullYear(currentDate.getFullYear() - 1);
            else currentDate.setFullYear(currentDate.getFullYear() - 12);
            render(); 
        };
        document.getElementById('ds-next').onclick = () => { 
            if (currentView === 'days') currentDate.setMonth(currentDate.getMonth() + 1);
            else if (currentView === 'months') currentDate.setFullYear(currentDate.getFullYear() + 1);
            else currentDate.setFullYear(currentDate.getFullYear() + 12);
            render(); 
        };
        document.getElementById('ds-cancel').onclick = close;
        
        document.getElementById('ds-today').onclick = () => {
            selectedDate = new Date();
            currentDate = new Date();
            currentView = 'days';
            render();
        };

        overlay.onclick = (e) => { if(e.target === overlay) close(); };

        document.getElementById('ds-confirm').onclick = () => {
            if(selectedDate && onSelectCallback) {
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
        
        // 渲染顶部标题
        if (currentView === 'days') {
            titleText.textContent = `${year} 年 ${month + 1} 月`;
            document.getElementById('ds-days-view').style.display = 'block';
            pickerGrid.classList.remove('show');
            document.getElementById('ds-prev').style.display = 'block';
            document.getElementById('ds-next').style.display = 'block';
            renderDays(year, month);
        } else if (currentView === 'months') {
            titleText.textContent = `${year} 年`;
            document.getElementById('ds-days-view').style.display = 'none';
            pickerGrid.classList.add('show');
            document.getElementById('ds-prev').style.display = 'block';
            document.getElementById('ds-next').style.display = 'block';
            renderMonths(year);
        } else {
            // 年份视图（以 12 年为一个跨度）
            const startYear = year - (year % 12);
            titleText.textContent = `${startYear} - ${startYear + 11} 年`;
            document.getElementById('ds-days-view').style.display = 'none';
            pickerGrid.classList.add('show');
            
            // 恢复左右箭头
            document.getElementById('ds-prev').style.display = 'block';
            document.getElementById('ds-next').style.display = 'block';
            
            renderYears(startYear);
        }
    }

    function renderDays(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';
        for(let i = 0; i < firstDay; i++) html += `<div class="ds-day empty"></div>`;
        for(let i = 1; i <= daysInMonth; i++) {
            const isSelected = selectedDate && 
                               selectedDate.getFullYear() === year && 
                               selectedDate.getMonth() === month && 
                               selectedDate.getDate() === i;
            html += `<div class="ds-day ${isSelected ? 'selected' : ''}" data-day="${i}">${i}</div>`;
        }
        daysGrid.innerHTML = html;

        daysGrid.querySelectorAll('.ds-day:not(.empty)').forEach(el => {
            el.onclick = function() {
                selectedDate = new Date(year, month, parseInt(this.getAttribute('data-day')));
                currentDate = new Date(selectedDate);
                render();
            };
        });
    }

    function renderMonths(year) {
        let html = '';
        const selectedMonth = selectedDate && selectedDate.getFullYear() === year ? selectedDate.getMonth() : -1;
        
        for(let i = 0; i < 12; i++) {
            const isSel = i === selectedMonth;
            html += `<div class="ds-picker-item ${isSel ? 'selected' : ''}" data-month="${i}">${i + 1} 月</div>`;
        }
        pickerGrid.innerHTML = html;

        pickerGrid.querySelectorAll('.ds-picker-item').forEach(el => {
            el.onclick = function() {
                currentDate.setFullYear(year);
                currentDate.setMonth(parseInt(this.getAttribute('data-month')));
                currentView = 'days';
                render();
            };
        });
    }

    function renderYears(startYear) {
        let html = '';
        const selectedYear = selectedDate ? selectedDate.getFullYear() : -1;

        for(let i = 0; i < 12; i++) {
            const y = startYear + i;
            const isSel = y === selectedYear;
            html += `<div class="ds-picker-item ${isSel ? 'selected' : ''}" data-year="${y}">${y}</div>`;
        }
        pickerGrid.innerHTML = html;

        pickerGrid.querySelectorAll('.ds-picker-item').forEach(el => {
            el.onclick = function() {
                currentDate.setFullYear(parseInt(this.getAttribute('data-year')));
                currentView = 'months'; // 选完年自动切回月份
                render();
            };
        });
    }

    function open(initialDateStr, callback) {
        init();
        onSelectCallback = callback;
        currentView = 'days';
        
        if(initialDateStr) {
            selectedDate = new Date(initialDateStr);
            if(isNaN(selectedDate)) selectedDate = null;
        } else {
            selectedDate = null;
        }
        
        currentDate = selectedDate ? new Date(selectedDate) : new Date();
        render();
        
        overlay.style.display = 'flex';
        void overlay.offsetWidth;
        overlay.classList.add('show');
    }

    function close() {
        overlay.classList.remove('show');
        setTimeout(() => { overlay.style.display = 'none'; }, 200);
    }

    return { open };
})();