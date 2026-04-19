// 跨主题切换导航脚本
// 允许在 hugo-book 和 papermod 两个版本间无缝切换

(function() {
  const THEME_PREF_KEY = 'monkvan-theme-preference';
  const CURRENT_PATH = window.location.pathname;
  
  // 检测当前主题
  function getCurrentTheme() {
    const parts = CURRENT_PATH.split('/').filter(Boolean);
    const themeIndex = parts.findIndex(part => part === 'hugo-book' || part === 'papermod');
    if (themeIndex >= 0) {
      return parts[themeIndex];
    }
    return null;
  }

  // 获取另一个主题
  function getOtherTheme() {
    const current = getCurrentTheme();
    return current === 'hugo-book' ? 'papermod' : 'hugo-book';
  }

  // 获取基础路径（支持子目录仓库部署）
  function getBasePath() {
    const parts = CURRENT_PATH.split('/').filter(Boolean);
    const themeIndex = parts.findIndex(part => part === 'hugo-book' || part === 'papermod');
    if (themeIndex > 0) {
      return `/${parts.slice(0, themeIndex).join('/')}/`;
    }
    return '/';
  }

  // 转换 URL 到另一个主题
  function getOtherThemeUrl() {
    const current = getCurrentTheme();
    if (!current) return getBasePath();

    const parts = CURRENT_PATH.split('/').filter(Boolean);
    const themeIndex = parts.findIndex(part => part === current);
    const basePath = getBasePath();
    const relativeParts = parts.slice(themeIndex + 1);
    const relativePath = relativeParts.length ? relativeParts.join('/') + '/' : '';
    const otherTheme = getOtherTheme();

    return `${basePath}${otherTheme}/${relativePath}`;
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
      margin-right: 10px;
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

  // 创建返回主题选择按钮
  function createReturnChooserButton() {
    const btn = document.createElement('button');
    btn.id = 'return-chooser-btn';
    btn.textContent = '◀ 返回主题选择';

    btn.style.cssText = `
      padding: 8px 16px;
      background: var(--color-bg, #ffffff);
      border: 1px solid var(--color-secondary, #ddd);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95em;
      transition: all 0.3s;
      font-family: inherit;
    `;

    btn.addEventListener('click', () => {
      window.location.href = getBasePath();
    });
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

  // 创建按钮容器
  function createButtonContainer() {
    const wrapper = document.createElement('div');
    wrapper.id = 'theme-switcher-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      padding: 4px;
      pointer-events: auto;
    `;
    return wrapper;
  }

  // 注入切换按钮到页面
  function injectSwitcherToNavigation() {
    if (document.querySelector('#theme-switcher-wrapper')) {
      return;
    }

    const switchBtn = createThemeSwitcher();
    const returnBtn = createReturnChooserButton();
    const wrapper = createButtonContainer();

    wrapper.appendChild(returnBtn);
    wrapper.appendChild(switchBtn);
    document.body.appendChild(wrapper);
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
