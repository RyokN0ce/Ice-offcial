/**
 * bgmswitcher.js
 * 播放/暂停 BGM + 自动读取 res/mainaudio/playlist.json 生成下拉列表
 * 记忆开关状态和选中的曲目
 */
(function () {
    'use strict';

    const STORAGE_ENABLED = 'ice-music-enabled';
    const STORAGE_SRC = 'ice-music-src';
    const AUDIO_DIR = 'res/mainaudio/';

    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicSelect = document.getElementById('musicSelect');

    let musicEnabled = localStorage.getItem(STORAGE_ENABLED) === 'true';
    let currentMusic = localStorage.getItem(STORAGE_SRC) || '';

    // ===== 读取播放列表 =====
    async function loadPlaylist() {
        try {
            const res = await fetch(AUDIO_DIR + 'playlist.json');
            if (!res.ok) throw new Error('playlist.json 不存在');
            const files = await res.json();

            musicSelect.innerHTML = '';

            if (!files.length) {
                musicSelect.innerHTML = '<option value="">（目录为空）</option>';
                return;
            }

            files.forEach(filename => {
                const option = document.createElement('option');
                option.value = AUDIO_DIR + filename;

                // 美化显示名：去扩展名，把 - _ 换空格
                let name = filename
                    .replace(/\.(mp3|wav|ogg|m4a|flac)$/i, '')
                    .replace(/[-_]/g, ' ');
                option.textContent = name;
                musicSelect.appendChild(option);
            });

            // 恢复选中项
            if (currentMusic) {
                for (let i = 0; i < musicSelect.options.length; i++) {
                    if (musicSelect.options[i].value === currentMusic) {
                        musicSelect.selectedIndex = i;
                        break;
                    }
                }
            }

            // 如果没选中，默认第一首
            if (!currentMusic && musicSelect.options.length > 0) {
                currentMusic = musicSelect.options[0].value;
                musicSelect.selectedIndex = 0;
                localStorage.setItem(STORAGE_SRC, currentMusic);
            }

            // 更新开关 UI
            musicToggle.classList.toggle('on', musicEnabled);

            // 如果音乐开启，设置源
            if (musicEnabled && currentMusic) {
                bgMusic.src = currentMusic;
                tryPlay();
            }

        } catch (err) {
            console.warn('bgmswitcher: 读取列表失败', err);
            musicSelect.innerHTML = '<option value="">（读取失败，请检查 playlist.json）</option>';
        }
    }

    // ===== 尝试播放（处理浏览器自动播放限制） =====
    function tryPlay() {
        if (!musicEnabled || !currentMusic) return;
        bgMusic.play().catch(() => {
            // 自动播放被阻止，用户首次点击后播放
            document.addEventListener('click', function playOnFirstClick() {
                if (musicEnabled && bgMusic.paused) {
                    bgMusic.play().catch(() => {});
                }
                document.removeEventListener('click', playOnFirstClick);
            }, { once: true });
        });
    }

    // ===== 初始化 =====
    function init() {
        if (!bgMusic || !musicToggle || !musicSelect) {
            console.warn('bgmswitcher: 缺少必要元素 #bgMusic / #musicToggle / #musicSelect');
            return;
        }

        loadPlaylist();

        // 开关
        musicToggle.addEventListener('click', function () {
            musicEnabled = !musicEnabled;
            this.classList.toggle('on', musicEnabled);
            localStorage.setItem(STORAGE_ENABLED, musicEnabled);

            if (musicEnabled && currentMusic) {
                bgMusic.src = currentMusic;
                tryPlay();
            } else {
                bgMusic.pause();
            }
        });

        // 下拉选择
        musicSelect.addEventListener('change', function () {
            if (!this.value) return;
            currentMusic = this.value;
            localStorage.setItem(STORAGE_SRC, currentMusic);
            bgMusic.src = currentMusic;
            if (musicEnabled) tryPlay();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();