import { events } from '../constants/events';

// 配置类型定义
export interface EventConfig {
    mouseEvents?: {
        [eventName: string]: boolean;
    };
    keyboardEvents?: {
        [eventName: string]: boolean;
    };
    touchEvents?: {
        [eventName: string]: boolean;
    };
    wheelEvents?: {
        [eventName: string]: boolean;
    };
    focusEvents?: {
        [eventName: string]: boolean;
    };
    formEvents?: {
        [eventName: string]: boolean;
    };
    clipboardEvents?: {
        [eventName: string]: boolean;
    };
    dragEvents?: {
        [eventName: string]: boolean;
    };
    enhancedMode?: boolean;
    [eventType: string]: any;
}

// 生成默认配置
export function generateDefaultConfig(): EventConfig {
    const defaultConfig: EventConfig = {};
    for (const [eventType, eventList] of Object.entries(events)) {
        defaultConfig[eventType] = {};
        eventList.forEach(eventName => {
            // 默认屏蔽鼠标、键盘、触摸和滚轮事件
            defaultConfig[eventType][eventName] = false;
        });
    }
    defaultConfig.enhancedMode = false;
    return defaultConfig;
}

// 保存配置
export function saveConfig(config: EventConfig) {
    // 保存配置
    for (const [eventType, eventList] of Object.entries(events)) {
        if (!config[eventType]) {
            config[eventType] = {};
        }
        eventList.forEach(eventName => {
            const checkbox = document.getElementById(`event-${eventType}-${eventName}`) as HTMLInputElement;
            if (checkbox) {
                config[eventType][eventName] = checkbox.checked;
            }
        });
    }
    GM_setValue('eventBlockerConfig', config);
    
    // 重新加载页面以应用新配置
    // location.reload();
}