/**
 * themeswitcher.js
 * 控制亮暗色 / 自动颜色
 * 自动读取 <div id="theme-switcher"> 内的按钮（data-theme 属性）
 * 记忆到 localStorage，跟随系统偏好
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'ice-theme';
    const root = document.documentElement;
    let currentTheme = localStorage.getItem(STORAGE_KEY) || 'auto';

    function applyTheme(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', theme);
        }
        try {
            window.parent.postMessage({ type: 'themeChange', theme: root.getAttribute('data-theme') }, '*');
        } catch (e) {}

        // 同步按钮激活状态
        document.querySelectorAll('#theme-switcher button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        currentTheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
    }

    function init() {
        const switcher = document.getElementById('theme-switcher');
        if (!switcher) {
            console.warn('themeswitcher: 找不到 #theme-switcher');
            return;
        }

        // 绑定按钮点击
        switcher.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
        });

        // 初始化
        applyTheme(currentTheme);

        // 监听系统主题变化（自动模式下）
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
                if (currentTheme === 'auto') applyTheme('auto');
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();