import { translations } from '../constants/events';

// 切换语言
export function toggleLanguage(currentLanguage) {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    GM_setValue('eventBlockerLanguage', currentLanguage);
    
    // 更新菜单命令
    const menuCommand = document.querySelector('.event-blocker-menu-command');
    if (menuCommand) {
        menuCommand.textContent = t(currentLanguage, 'menuCommand');
    }
    
    return currentLanguage;
}

export function getCurrentLanguage() {
    return GM_getValue('eventBlockerLanguage', 'zh');
}
// 获取翻译文本
export function t(language, key) {
    return translations[language][key] || key;
}