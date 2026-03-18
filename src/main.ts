import { events } from './constants/events';
import { generateDefaultConfig, EventConfig, getEffectiveConfig } from './utils/config';
import { getCurrentLanguage, t } from './utils/i18n';
import { generalBlockEvents, generalUnblockEvents } from './core/eventHandler';
import { createConfigWindow, closeConfigWindow } from './components/configWindow';
import { initEnhancedEventBlocker, enableEnhancedMode, disableEnhancedMode } from './core/enhancedEventBlocker';

// 扩展Window接口，添加GM_*函数和自定义属性
declare global {
    interface Window {
        GM_getValue: (key: string, defaultValue: any) => any;
        GM_setValue: (key: string, value: any) => void;
        GM_registerMenuCommand: (name: string, callback: () => void) => void;
        createConfigWindow: typeof createConfigWindow;
        currentLanguage: string;
        config: EventConfig;
    }
    
    // 声明GM_*函数
    function GM_getValue(key: string, defaultValue: any): any;
    function GM_setValue(key: string, value: any): void;
    function GM_registerMenuCommand(name: string, callback: () => void): void;
}

(function () {
    'use strict';

    // 确保GM_*函数存在（用于开发测试）
    if (typeof GM_getValue === 'undefined') {
        // 模拟GM_getValue函数
        window.GM_getValue = function (key: string, defaultValue: any): any {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        };
    }

    if (typeof GM_setValue === 'undefined') {
        // 模拟GM_setValue函数
        window.GM_setValue = function (key: string, value: any): void {
            localStorage.setItem(key, JSON.stringify(value));
        };
    }

    if (typeof GM_registerMenuCommand === 'undefined') {
        // 模拟GM_registerMenuCommand函数
        window.GM_registerMenuCommand = function (name: string, callback: () => void): void {
            console.log('GM_registerMenuCommand:', name);
        };
    }

    let config: EventConfig = getEffectiveConfig();
    const currentLanguage = getCurrentLanguage();

    function applyEnhancedMode(): void {
        config = getEffectiveConfig();
        if (config.enhancedMode) {
            const enabledTypes: string[] = [];
            for (const [eventType, eventList] of Object.entries(events)) {
                eventList.forEach(eventName => {
                    if (config[eventType] && config[eventType][eventName]) {
                        enabledTypes.push(eventName);
                    }
                });
            }
            generalBlockEvents(config);
            initEnhancedEventBlocker();
            enableEnhancedMode(enabledTypes);
        } else {
            disableEnhancedMode();
            generalBlockEvents(config);
        }
    }

    // 注册菜单命令
    GM_registerMenuCommand(t(currentLanguage, 'menuCommand'), function (): void {
        createConfigWindow(config);
    });

    applyEnhancedMode();

    // 监听DOMContentLoaded事件，确保在DOM加载完成后再次执行
    document.addEventListener('DOMContentLoaded', function (): void {
        applyEnhancedMode();
    });

    // 监听load事件，确保在所有资源加载完成后再次执行
    window.addEventListener('load', function (): void {
        applyEnhancedMode();
    });

    // 暴露全局变量，用于测试页面调用
    window.createConfigWindow = createConfigWindow;
    window.currentLanguage = currentLanguage;
    window.config = config;

})();