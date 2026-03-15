import { events } from '../constants/events';

// 生成默认配置
export function generateDefaultConfig() {
    const defaultConfig = {};
    for (const [eventType, eventList] of Object.entries(events)) {
        defaultConfig[eventType] = {};
        eventList.forEach(eventName => {
            // 默认屏蔽鼠标、键盘、触摸和滚轮事件
                defaultConfig[eventType][eventName] = false;
        });
    }
    return defaultConfig;
}

// 保存配置
export function saveConfig(config) {
    // 保存配置
    for (const [eventType, eventList] of Object.entries(events)) {
        if (!config[eventType]) {
            config[eventType] = {};
        }
        eventList.forEach(eventName => {
            const checkbox = document.getElementById(`event-${eventType}-${eventName}`);
            if (checkbox) {
                config[eventType][eventName] = checkbox.checked;
            }
        });
    }
    GM_setValue('eventBlockerConfig', config);
    
    // 重新加载页面以应用新配置
    location.reload();
}