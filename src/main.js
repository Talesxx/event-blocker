import { events } from './constants/events';
import { generateDefaultConfig, saveConfig } from './utils/config';
import { getCurrentLanguage, t } from './utils/i18n';
import { generalBlockEvents, generalUnblockEvents } from './core/eventHandler';
import { createConfigWindow, closeConfigWindow } from './components/configWindow';
import { initEnhancedEventBlocker, enableEnhancedMode, disableEnhancedMode } from './core/enhancedEventBlocker';

(function () {
    'use strict';

    // 确保GM_*函数存在（用于开发测试）
    if (typeof GM_getValue === 'undefined') {
        // 模拟GM_getValue函数
        window.GM_getValue = function (key, defaultValue) {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        };
    }

    if (typeof GM_setValue === 'undefined') {
        // 模拟GM_setValue函数
        window.GM_setValue = function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        };
    }

    if (typeof GM_registerMenuCommand === 'undefined') {
        // 模拟GM_registerMenuCommand函数
        window.GM_registerMenuCommand = function (name, callback) {
            console.log('GM_registerMenuCommand:', name);
        };
    }

    // 获取配置
    let config = GM_getValue('eventBlockerConfig', generateDefaultConfig());
    const currentLanguage = getCurrentLanguage();

    // 应用增强模式
    function applyEnhancedMode() {
        if (config.enhancedMode) {
            const enabledTypes = [];
            for (const [eventType, eventList] of Object.entries(events)) {
                eventList.forEach(eventName => {
                    if (config[eventType] && config[eventType][eventName]) {
                        enabledTypes.push(eventName);
                    }
                });
            }
            generalBlockEvents(config);
            // 初始化增强模式事件阻止器
            initEnhancedEventBlocker();
            enableEnhancedMode(enabledTypes);
        } else {
            disableEnhancedMode();
            generalBlockEvents(config);
        }
    }

    // 注册菜单命令
    GM_registerMenuCommand(t(currentLanguage, 'menuCommand'), function () {
        createConfigWindow(config);
    });

    applyEnhancedMode();

    // 监听DOMContentLoaded事件，确保在DOM加载完成后再次执行
    document.addEventListener('DOMContentLoaded', function () {
        applyEnhancedMode();
    });

    // 监听load事件，确保在所有资源加载完成后再次执行
    window.addEventListener('load', function () {
        applyEnhancedMode();
    });

    // 暴露全局变量，用于测试页面调用
    window.createConfigWindow = createConfigWindow;
    window.currentLanguage = currentLanguage;
    window.config = config;

})();