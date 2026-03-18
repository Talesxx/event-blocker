// 增强模式事件阻止器

// 增强模式状态
let enhancedModeEnabled = false;
let blockedEventTypes = new Set<string>();
let configWindow: HTMLElement | null = null;
let overlay: HTMLElement | null = null;

// 保存原始的 addEventListener 方法
const originalAddEventListener = window.EventTarget.prototype.addEventListener;
const originalRemoveEventListener = window.EventTarget.prototype.removeEventListener;

// 存储被拦截的事件监听器
const interceptedListeners = new WeakMap<EventTarget, Map<string, Map<EventListenerOrEventListenerObject, EventListenerOrEventListenerObject>>>();

// 检查元素是否在配置窗口内
function isInsideConfigWindow(target: EventTarget | null): boolean {
    if (!configWindow && !overlay || !target) return false;

    let element: Node | null = target as Node;
    while (element) {
        if (element === configWindow || element === overlay) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
}

// 创建拦截的事件处理器
function createInterceptedHandler(originalHandler: EventListenerOrEventListenerObject, eventType: string): EventListenerOrEventListenerObject {
    if (typeof originalHandler !== 'function') {
        console.log("传入的监听器不是函数，无法创建拦截处理器。", originalHandler, eventType);
        return originalHandler;
    }

    return function interceptedHandler(this: EventTarget, event: Event): boolean | void {
        // 是否拦截 该事件类型
        let isBlocked = blockedEventTypes.has(eventType);

        // 如果增强模式未启用，直接执行原始处理器
        if (!enhancedModeEnabled) {
            isBlocked = false;
        }

        // 检查事件目标是否在配置窗口内
        if (isInsideConfigWindow(event.target)) {
            isBlocked = false;
        }

        // 检查事件类型是否被阻止
        if (isBlocked) {
            // event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        // 执行原始处理器
        return (originalHandler as EventListener).call(this, event);
    };
}

// 重写 addEventListener
function overrideAddEventListener(): void {
    window.EventTarget.prototype.addEventListener = function (type: string, listener: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean) {
        // 如果监听器是 null 或 undefined，直接调用原始方法
        if (!listener) {
           // console.log("监听器是 null 或 undefined。未拦截:", this, type, listener, options);
            return originalAddEventListener.call(this, type, listener, options);
        }

        // 检查 this 是否是对象，如果不是，直接调用原始方法
        if (typeof this !== 'object' || this === null) {
           // console.log("this 不是对象或 null，增强模式无法完美处理。未拦截:", this, type, listener, options);
            return originalAddEventListener.call(this, type, listener, options);
        }

        // 创建拦截的处理器
        const interceptedHandler = createInterceptedHandler(listener, type);

        // 存储映射关系
        if (!interceptedListeners.has(this)) {
            interceptedListeners.set(this, new Map());
        }
        const elementListeners = interceptedListeners.get(this);

        if (!elementListeners?.has(type)) {
            elementListeners?.set(type, new Map());
        }
        elementListeners?.get(type)?.set(listener, interceptedHandler);

        if (typeof listener === 'function' && typeof this === 'object' && this !== null) {
            // 调用原始方法，但使用拦截的处理器
            return originalAddEventListener.call(this, type, interceptedHandler, options);
        } else {
          //  console.log("警告，增强模式无法完美处理的事件。", this, type, listener, options);
            return originalAddEventListener.call(this, type, listener, options);
        }

    };
}

// 重写 removeEventListener
function overrideRemoveEventListener(): void {
    window.EventTarget.prototype.removeEventListener = function (type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) {
        // 检查 this 是否是对象，如果不是，直接调用原始方法
        if (typeof this !== 'object' || this === null) {
            return originalRemoveEventListener.call(this, type, listener, options);
        }

        // 获取存储的拦截处理器
        const elementListeners = interceptedListeners.get(this);
        if (elementListeners && elementListeners.has(type) && listener) {
            const typeListeners = elementListeners.get(type);
            const interceptedHandler = typeListeners?.get(listener);
            if (interceptedHandler) {
                // 使用拦截的处理器移除
                const result = originalRemoveEventListener.call(this, type, interceptedHandler, options);
                typeListeners?.delete(listener);
                return result;
            }
        }

        // 如果没有找到映射，直接调用原始方法
        return originalRemoveEventListener.call(this, type, listener, options);
    };
}

let initStatus = false;
// 初始化增强模式事件阻止器
export function initEnhancedEventBlocker(): void {
    if (initStatus) return;
    initStatus = true;
    overrideAddEventListener();
    overrideRemoveEventListener();
}

// 启用增强模式
export function enableEnhancedMode(eventTypes: string[]): void {
    if (enhancedModeEnabled) return;
    blockedEventTypes = new Set(eventTypes);
    enhancedModeEnabled = true;
}

// 禁用增强模式
export function disableEnhancedMode(): void {
    if (!enhancedModeEnabled) return;
    enhancedModeEnabled = false;
    blockedEventTypes.clear();
}

// 设置配置窗口元素
export function setEnhancedModeConfigWindowElements(window: HTMLElement, overlayElement: HTMLElement): void {
    configWindow = window;
    overlay = overlayElement;
}

// 检查增强模式是否启用
export function isEnhancedModeEnabled(): boolean {
    return enhancedModeEnabled;
}

// 获取增强模式状态
export function getEnhancedModeStatus(): { enabled: boolean; blockedTypes: string[] } {
    return {
        enabled: enhancedModeEnabled,
        blockedTypes: Array.from(blockedEventTypes)
    };
}
