// 跨主题切换导航脚本
// 允许在 hugo-book 和 papermod 两个版本间无缝切换

(function() {
  const THEME_PREF_KEY = 'monkvan-theme-preference';
  const CURRENT_PATH = window.location.pathname;
  
  // 检测当前主题
  function getCurrentTheme() {
    if (CURRENT_PATH.startsWith('/hugo-book/')) return 'hugo-book';
    if (CURRENT_PATH.startsWith('/papermod/')) return 'papermod';
    return null;
  }

  // 获取另一个主题
  function getOtherTheme() {
    const current = getCurrentTheme();
    return current === 'hugo-book' ? 'papermod' : 'hugo-book';
  }

  // 转换 URL 到另一个主题
  function getOtherThemeUrl() {
    const current = getCurrentTheme();
    if (!current) return '/';

    // 获取相对路径
    const relativePath = CURRENT_PATH.replace(`/${current}/`, '');
    const otherTheme = getOtherTheme();
    
    return `/${otherTheme}/${relativePath}`;
  }

  // 创建切换按钮
  function createThemeSwitcher() {
    const btn = document.createElement('button');
    btn.id = 'theme-switcher-btn';
    btn.textContent = `🎨 切换到 ${getOtherTheme() === 'papermod' ? 'PaperMod' : 'Hugo Book'}`;
    
    btn.style.cssText = `
      padding: 8px 16px;
      background: var(--color-secondary-bg, #f0f0f0);
      border: 1px solid var(--color-secondary, #ddd);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95em;
      transition: all 0.3s;
      font-family: inherit;
    `;

    btn.addEventListener('click', switchTheme);
    btn.addEventListener('mouseover', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = 'none';
    });

    return btn;
  }

  // 切换主题
  function switchTheme() {
    const targetTheme = getOtherTheme();
    localStorage.setItem(THEME_PREF_KEY, targetTheme);
    
    // 导航到另一个主题
    const otherUrl = getOtherThemeUrl();
    window.location.href = otherUrl;
  }

  // 保存用户选择
  function saveThemePreference() {
    const current = getCurrentTheme();
    if (current) {
      localStorage.setItem(THEME_PREF_KEY, current);
    }
  }

  // 注入切换按钮到导航
  function injectSwitcherToNavigation() {
    // 尝试多种位置注入
    const possibleContainers = [
      document.querySelector('nav'),
      document.querySelector('header'),
      document.querySelector('[role="navigation"]'),
      document.querySelector('.book-header'),
      document.querySelector('.site-header')
    ];

    for (let container of possibleContainers) {
      if (container && !container.querySelector('#theme-switcher-btn')) {
        const btn = createThemeSwitcher();
        container.appendChild(btn);
        return;
      }
    }

    // 如果找不到合适的位置，添加到 body
    if (!document.querySelector('#theme-switcher-btn')) {
      const btn = createThemeSwitcher();
      btn.style.cssText += `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
      `;
      document.body.appendChild(btn);
    }
  }

  // 初始化
  function init() {
    if (getCurrentTheme()) {
      saveThemePreference();
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectSwitcherToNavigation);
      } else {
        injectSwitcherToNavigation();
      }
    }
  }

  // 暴露到全局作用域
  window.ThemeSwitcher = {
    getCurrentTheme,
    getOtherTheme,
    switchTheme,
    getOtherThemeUrl
  };

  init();
})();
