import { translations } from '../constants/events';

// 语言类型
type Language = 'zh' | 'en';

// 切换语言
export function toggleLanguage(currentLanguage: Language): Language {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    GM_setValue('eventBlockerLanguage', currentLanguage);
    
    // 更新菜单命令
    const menuCommand = document.querySelector('.event-blocker-menu-command');
    if (menuCommand) {
        menuCommand.textContent = t(currentLanguage, 'menuCommand');
    }
    
    return currentLanguage;
}

export function getCurrentLanguage(): Language {
    return GM_getValue('eventBlockerLanguage', 'zh');
}
// 获取翻译文本
export function t(language: Language, key: string): string {
    return (translations[language] as any)[key] || key;
}