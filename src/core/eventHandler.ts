import { events } from '../constants/events';
import { EventConfig } from '../utils/config';

// 配置窗口元素
let configWindow: HTMLElement | null = null;
let overlay: HTMLElement | null = null;

// 屏蔽事件的函数
function blockEvent(e: Event): boolean {
    // 检查事件目标是否是配置窗口或其子元素
    let target: EventTarget | null = e.target;
    while (target) {
        if (target === configWindow || target === overlay) {
            return false;
        }
        target = (target as HTMLElement).parentElement;
    }

    // e.preventDefault(); // 不阻止默认行为
    e.stopPropagation();
    return false;
}

let initStatus = false;
// 屏蔽事件的函数
export function generalBlockEvents(config: EventConfig): void {
    if (initStatus) return;
    initStatus = true;
    // 遍历所有事件类型
    for (const [eventType, eventList] of Object.entries(events)) {
        // 遍历该类型下的所有事件
        eventList.forEach(eventName => {
            // 检查该事件是否被配置为屏蔽
            if (config[eventType] && config[eventType][eventName]) {
                // 在捕获阶段添加监听器
                document.addEventListener(eventName, blockEvent, true);
            }
        });
    }
}

// 取消屏蔽事件的函数
export function generalUnblockEvents(): void {
    if (!initStatus) return;
    initStatus = false;
    // 遍历所有事件类型
    for (const [eventType, eventList] of Object.entries(events)) {
        // 遍历该类型下的所有事件
        eventList.forEach(eventName => {
            // 检查该事件是否被配置为屏蔽
            // if (config[eventType] && config[eventType][eventName]) {
                // 移除捕获阶段的监听器
                document.removeEventListener(eventName, blockEvent, true);
            // }
        });
    }
}

// 设置配置窗口元素
export function setConfigWindowElements(window: HTMLElement, overlayElement: HTMLElement): void {
    configWindow = window;
    overlay = overlayElement;
}

// 获取配置窗口元素
export function getConfigWindowElements(): { configWindow: HTMLElement | null; overlay: HTMLElement | null } {
    return { configWindow, overlay };
}