import { events } from '../constants/events';

// 配置窗口元素
let configWindow = null;
let overlay = null;

// 屏蔽事件的函数
export function blockEvents(config) {
    // 遍历所有事件类型
    for (const [eventType, eventList] of Object.entries(events)) {
        // 遍历该类型下的所有事件
        eventList.forEach(eventName => {
            // 检查该事件是否被配置为屏蔽
            if (config[eventType] && config[eventType][eventName]) {
                // 在捕获阶段添加监听器
                document.addEventListener(eventName, function(e) {
                    // 检查事件目标是否是配置窗口或其子元素
                    let target = e.target;
                    while (target) {
                        if (target === configWindow || target === overlay) {
                            return;
                        }
                        target = target.parentElement;
                    }
                    
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }, true);
            }
        });
    }
}

// 设置配置窗口元素
export function setConfigWindowElements(window, overlayElement) {
    configWindow = window;
    overlay = overlayElement;
}

// 获取配置窗口元素
export function getConfigWindowElements() {
    return { configWindow, overlay };
}