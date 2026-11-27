/* tools/userat.js */
const UserAt = (function() {
    let dropdown, targetInput;

    function init() {
        if(document.getElementById('ua-dropdown')) return;
        dropdown = document.createElement('div');
        dropdown.className = 'ua-dropdown';
        dropdown.id = 'ua-dropdown';
        document.body.appendChild(dropdown);

        // 点击空白处隐藏
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target) && e.target !== targetInput) {
                dropdown.classList.remove('show');
            }
        });
    }

    function attach(inputElement, apiBase) {
        init();
        targetInput = inputElement;

        async function showDropdown(query, val, cursorPos) {
            const rect = this.getBoundingClientRect();
            // 定位到输入框正下方
            dropdown.style.top = (rect.bottom + window.scrollY + 5) + 'px';
            dropdown.style.left = (rect.left + window.scrollX) + 'px';
            
            try {
                const res = await fetch(`${apiBase}/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                
                if (data.data && data.data.length > 0) {
                    dropdown.innerHTML = '';
                    data.data.forEach(u => {
                        const item = document.createElement('div');
                        item.className = 'ua-item';
                        const imgSrc = u.avatar_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23666" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                        item.innerHTML = `<img src="${imgSrc}"> <span>@${u.username} (${u.nickname || u.username})</span>`;
                        
                        item.onclick = () => {
                            const beforeAt = val.substring(0, val.lastIndexOf('@'));
                            const afterAt = val.substring(cursorPos);
                            targetInput.value = beforeAt + '@' + u.username + ' ' + afterAt;
                            dropdown.classList.remove('show');
                            targetInput.focus();
                        };
                        dropdown.appendChild(item);
                    });
                    dropdown.classList.add('show');
                } else {
                    dropdown.classList.remove('show');
                }
            } catch (e) {
                dropdown.classList.remove('show');
            }
        }

        // 监听输入事件
        inputElement.addEventListener('input', function(e) {
            const val = this.value;
            const cursorPos = this.selectionStart;
            const textBeforeCursor = val.substring(0, cursorPos);
            
            // 正则匹配：找到光标前最后一个 @ 及其后面的字符
            const match = textBeforeCursor.match(/@([a-zA-Z0-9_\u4e00-\u9fa5]*)$/);
            
            if (match) {
                const query = match[1];
                // 触发搜索
                showDropdown.call(this, query, val, cursorPos);
            } else {
                dropdown.classList.remove('show');
            }
        });
        
        // 监听失焦隐藏
        inputElement.addEventListener('blur', () => {
            setTimeout(() => dropdown.classList.remove('show'), 200);
        });
    }

    return { attach };
})();