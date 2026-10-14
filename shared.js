/**
 * OmniCourse Hub — Shared Logic & Interactivity
 * Theme switcher, study progress tracking, keyboard shortcuts & navigation.
 */

(function () {
    // 1. Theme Initialization
    const THEME_KEY = 'omni_portal_theme';
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const toggleBtns = document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
            btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        });
    }

    applyTheme(initialTheme);

    window.toggleTheme = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
    };

    // Attach listeners on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(document.documentElement.getAttribute('data-theme') || initialTheme);

        const toggleBtns = document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.toggleTheme();
            });
        });

        // 2. Track Module Visit
        const pathname = window.location.pathname;
        if (pathname.includes('module-')) {
            const isBlockchain = pathname.includes('blockchain-module-');
            const match = pathname.match(/module-(\d+)/);
            if (match) {
                const modNum = parseInt(match[1]);
                const subject = isBlockchain ? 'blockchain' : 'django';
                recordModuleVisit(subject, modNum);
            }
        }

        // 3. Global Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if active in input / textarea
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                const searchInput = document.getElementById('globalSearchInput');
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                }
            } else if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
                window.toggleTheme();
            }
        });
    });

    // 4. Progress Tracking Helpers
    function recordModuleVisit(subject, modNum) {
        try {
            const key = `omni_progress_${subject}`;
            const visited = JSON.parse(localStorage.getItem(key) || '[]');
            if (!visited.includes(modNum)) {
                visited.push(modNum);
                localStorage.setItem(key, JSON.stringify(visited));
            }
            // Update last visited module
            localStorage.setItem('omni_last_visited', JSON.stringify({
                subject,
                module: modNum,
                url: window.location.href,
                time: Date.now()
            }));
        } catch (err) {
            console.error('Progress storage error', err);
        }
    }

    window.getSubjectProgress = function (subject) {
        try {
            const key = `omni_progress_${subject}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            return [];
        }
    };

    window.toggleModuleCompletion = function (subject, modNum) {
        try {
            const key = `omni_progress_${subject}`;
            let list = JSON.parse(localStorage.getItem(key) || '[]');
            if (list.includes(modNum)) {
                list = list.filter(n => n !== modNum);
            } else {
                list.push(modNum);
            }
            localStorage.setItem(key, JSON.stringify(list));
            return list.includes(modNum);
        } catch (e) {
            return false;
        }
    };
})();
