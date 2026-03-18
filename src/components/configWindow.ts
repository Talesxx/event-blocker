import { events, eventTypeIcons } from '../constants/events';
import { t, toggleLanguage, getCurrentLanguage } from '../utils/i18n';
import { setConfigWindowElements } from '../core/eventHandler';
import { setEnhancedModeConfigWindowElements } from '../core/enhancedEventBlocker';
import { saveConfig, EventConfig, getCurrentDomain, getSubdomain, getAllConfigs, saveGlobalConfig, saveDomainConfig, deleteDomainConfig, getEffectiveConfig } from '../utils/config';
import { generalBlockEvents, generalUnblockEvents } from '../core/eventHandler';
import { enableEnhancedMode, disableEnhancedMode } from '../core/enhancedEventBlocker';

// 配置窗口元素
let configWindow: HTMLElement | null = null;
let overlay: HTMLElement | null = null;

// 关闭配置窗口的函数
export function closeConfigWindow(): void {
    if (configWindow && overlay) {
        document.body.removeChild(configWindow);
        document.body.removeChild(overlay);
        configWindow = null;
        overlay = null;
    }
}

// 应用增强模式
function applyEnhancedMode(config: EventConfig): void {
    const effectiveConfig = getEffectiveConfig();
    if (effectiveConfig.enhancedMode) {
        const enabledTypes: string[] = [];
        for (const [eventType, eventList] of Object.entries(events)) {
            eventList.forEach(eventName => {
                if (effectiveConfig[eventType] && effectiveConfig[eventType][eventName]) {
                    enabledTypes.push(eventName);
                }
            });
        }
        generalUnblockEvents();
        generalBlockEvents(effectiveConfig);
        enableEnhancedMode(enabledTypes);
    } else {
        disableEnhancedMode();
        generalUnblockEvents();
        generalBlockEvents(effectiveConfig);
    }
}
// 移除禁用事件
function removeDisabledEvents(): void {
    disableEnhancedMode();
    generalUnblockEvents();
}

// 创建配置窗口
export function createConfigWindow(config: EventConfig): { configWindow: HTMLElement; overlay: HTMLElement } | undefined {
    const currentLanguage = getCurrentLanguage();
    const effectiveConfig = getEffectiveConfig();
    config = effectiveConfig;
    // 检查配置窗口是否已经存在
    if (configWindow && overlay) {
        // 窗口已存在，直接返回
        return;
    }

    // 检查页面上是否已经存在配置窗口元素
    const existingWindow = document.getElementById('event-blocker-config-window');
    const existingOverlay = document.getElementById('event-blocker-overlay');

    if (existingWindow || existingOverlay) {
        // 清理已存在的元素
        if (existingWindow) {
            document.body.removeChild(existingWindow);
        }
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }
    }

    // 创建配置窗口
    configWindow = document.createElement('div');
    configWindow.id = 'event-blocker-config-window';
    configWindow.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 0;
        z-index: 9999;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        min-width: 700px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        opacity: 0;
        transition: all 0.3s ease;
    `;

    // 创建标题栏
    const header = document.createElement('div');
    header.style.cssText = `
        background: rgba(255,255,255,0.1);
        padding: 20px 25px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
    `;

    const title = document.createElement('h2');
    title.textContent = t(currentLanguage, 'title');
    title.style.cssText = `
        margin: 0;
        color: white;
        font-size: 24px;
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        text-align: center;
    `;
    header.appendChild(title);

    // 创建增强模式开关
    const enhancedModeContainer = document.createElement('div');
    enhancedModeContainer.style.cssText = `
        position: absolute;
        left: 25px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const enhancedModeLabel = document.createElement('span');
    enhancedModeLabel.textContent = t(currentLanguage, 'enhancedMode');
    enhancedModeLabel.style.cssText = `
        color: white;
        font-size: 14px;
        font-weight: 500;
    `;

    const enhancedModeSwitch = document.createElement('label');
    enhancedModeSwitch.style.cssText = `
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        cursor: pointer;
    `;

    const enhancedModeInput = document.createElement('input');
    enhancedModeInput.type = 'checkbox';
    enhancedModeInput.id = 'enhanced-mode-toggle';
    enhancedModeInput.checked = effectiveConfig.enhancedMode || false;
    enhancedModeInput.style.cssText = `
        opacity: 0;
        width: 0;
        height: 0;
    `;

    const enhancedModeSlider = document.createElement('span');
    enhancedModeSlider.style.cssText = `
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${effectiveConfig.enhancedMode ? '#4CAF50' : '#ccc'};
        transition: .3s;
        border-radius: 24px;
    `;

    const enhancedModeKnob = document.createElement('span');
    enhancedModeKnob.style.cssText = `
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        transform: ${effectiveConfig.enhancedMode ? 'translateX(20px)' : 'translateX(0)'};
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    `;

    enhancedModeSlider.appendChild(enhancedModeKnob);
    enhancedModeSwitch.appendChild(enhancedModeInput);
    enhancedModeSwitch.appendChild(enhancedModeSlider);

    // 切换事件
    enhancedModeInput.addEventListener('change', function (e: Event) {
        const isEnabled = (e.target as HTMLInputElement).checked;
        config.enhancedMode = isEnabled;

        // 更新UI
        enhancedModeSlider.style.backgroundColor = isEnabled ? '#4CAF50' : '#ccc';
        enhancedModeKnob.style.transform = isEnabled ? 'translateX(20px)' : 'translateX(0)';
    });

    enhancedModeContainer.appendChild(enhancedModeLabel);
    enhancedModeContainer.appendChild(enhancedModeSwitch);
    header.appendChild(enhancedModeContainer);

    // 创建语言切换按钮
    const langButton = document.createElement('button');
    langButton.textContent = currentLanguage === 'zh' ? '🇺🇸 EN' : '🇨🇳 中文';
    langButton.style.cssText = `
        position: absolute;
        right: 25px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.2);
        color: white;
        border: 2px solid rgba(255,255,255,0.3);
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    langButton.onmouseover = function (this: any) {
        this.style.background = 'rgba(255,255,255,0.3)';
        this.style.borderColor = 'rgba(255,255,255,0.5)';
    };
    langButton.onmouseout = function (this: any) {
        this.style.background = 'rgba(255,255,255,0.2)';
        this.style.borderColor = 'rgba(255,255,255,0.3)';
    };
    header.style.position = 'relative';
    header.appendChild(langButton);

    // 创建内容容器
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 25px;
        max-height: 60vh;
        overflow-y: auto;
    `;

    const currentDomain = getCurrentDomain();
    const allConfigs = getAllConfigs();
    
    let configType = 'global';
    let configSource = t(currentLanguage, 'globalConfig');
    
    const existingDomainConfig = Object.keys(allConfigs.domains).find(key => {
        const domainConfig = allConfigs.domains[key];
        if (domainConfig.type === 'domain') {
            if (key === currentDomain) {
                configType = 'domain';
                configSource = `${t(currentLanguage, 'domainTypeConfig')}: ${key}`;
                return true;
            }
        } else {
            try {
                const regex = new RegExp(key);
                if (regex.test(currentDomain)) {
                    configType = 'regex';
                    configSource = `${t(currentLanguage, 'regexTypeConfig')}: ${key}`;
                    return true;
                }
            } catch (e) {
                return false;
            }
        }
        return false;
    });

    const domainSection = document.createElement('div');
    domainSection.style.cssText = `
        background: #f8f9fa;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid #e9ecef;
    `;

    const domainTitle = document.createElement('h3');
    domainTitle.textContent = t(currentLanguage, 'currentConfig');
    domainTitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #495057;
        font-size: 16px;
        font-weight: 600;
    `;
    domainSection.appendChild(domainTitle);

    const infoContainer = document.createElement('div');
    infoContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    const currentTypeInfo = document.createElement('div');
    currentTypeInfo.style.cssText = `
        font-size: 14px;
        color: #495057;
    `;
    currentTypeInfo.innerHTML = `<strong>${t(currentLanguage, 'currentType')}:</strong> ${configSource}`;
    infoContainer.appendChild(currentTypeInfo);

    const currentUrlInfo = document.createElement('div');
    currentUrlInfo.style.cssText = `
        font-size: 14px;
        color: #495057;
    `;
    currentUrlInfo.innerHTML = `<strong>${t(currentLanguage, 'currentUrl')}:</strong> ${currentDomain}`;
    infoContainer.appendChild(currentUrlInfo);

    domainSection.appendChild(infoContainer);

    const priorityInfo = document.createElement('div');
    priorityInfo.textContent = t(currentLanguage, 'configPriority');
    priorityInfo.style.cssText = `
        margin-top: 12px;
        padding: 8px 12px;
        background: #e7f3ff;
        border-left: 3px solid #007bff;
        border-radius: 4px;
        font-size: 12px;
        color: #0056b3;
    `;
    domainSection.appendChild(priorityInfo);

    content.appendChild(domainSection);

    // 创建配置选项
    for (const [eventType, eventList] of Object.entries(events)) {
        // 创建事件类型卡片
        const typeCard = document.createElement('div');
        typeCard.style.cssText = `
            background: #f8f9fa;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #e9ecef;
            transition: all 0.2s ease;
        `;
        typeCard.onmouseover = function (this: any) {
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            this.style.transform = 'translateY(-2px)';
        };
        typeCard.onmouseout = function (this: any) {
            this.style.boxShadow = 'none';
            this.style.transform = 'translateY(0)';
        };

        // 创建事件类型标题
        const typeTitle = document.createElement('h3');
        typeTitle.textContent = t(currentLanguage, eventType);
        typeTitle.style.cssText = `
            margin: 0 0 12px 0;
            color: #495057;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // 添加图标
        typeTitle.innerHTML = `<span style="font-size: 18px;">${(eventTypeIcons as any)[eventType] || '•'}</span> ${typeTitle.textContent}`;

        typeCard.appendChild(typeTitle);

        // 创建事件列表容器
        const eventContainer = document.createElement('div');
        eventContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 10px;
        `;

        // 为每个事件创建复选框
        eventList.forEach(eventName => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `event-${eventType}-${eventName}`;
            checkbox.checked = effectiveConfig[eventType] && effectiveConfig[eventType][eventName] || false;
            checkbox.style.cssText = `
                display: none;
            `;

            const label = document.createElement('label');
            label.htmlFor = `event-${eventType}-${eventName}`;
            label.textContent = t(currentLanguage, eventName);
            label.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: white;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                color: #495057;
                transition: all 0.2s ease;
                user-select: none;
            `;
            label.onmouseover = function (this: any) {
                this.style.borderColor = '#667eea';
            };
            label.onmouseout = function (this: any) {
                if (!checkbox.checked) {
                    this.style.borderColor = '#dee2e6';
                }
            };

            // 创建自定义复选框
            const customCheckbox = document.createElement('span');
            customCheckbox.style.cssText = `
                width: 18px;
                height: 18px;
                border: 2px solid #667eea;
                border-radius: 4px;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
            `;

            // 添加选中标记
            const checkmark = document.createElement('span');
            checkmark.textContent = '✓';
            checkmark.style.cssText = `
                color: white;
                font-size: 14px;
                font-weight: bold;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            customCheckbox.appendChild(checkmark);

            // 更新复选框状态
            function updateCheckboxState() {
                if (checkbox.checked) {
                    label.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    label.style.borderColor = '#667eea';
                    label.style.color = 'white';
                    customCheckbox.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    customCheckbox.style.borderColor = 'rgba(255,255,255,0.3)';
                    checkmark.style.opacity = '1';
                } else {
                    label.style.background = 'white';
                    label.style.borderColor = '#dee2e6';
                    label.style.color = '#495057';
                    customCheckbox.style.background = 'white';
                    customCheckbox.style.borderColor = '#667eea';
                    checkmark.style.opacity = '0';
                }
            }

            updateCheckboxState();
            checkbox.addEventListener('change', updateCheckboxState);

            label.insertBefore(customCheckbox, label.firstChild);
            eventContainer.appendChild(checkbox);
            eventContainer.appendChild(label);
        });

        typeCard.appendChild(eventContainer);
        content.appendChild(typeCard);
    }

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        background: white;
        padding: 20px 25px;
        border-top: 1px solid #e9ecef;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    `;

    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = t(currentLanguage, 'cancel');
    cancelButton.style.cssText = `
        background: #f8f9fa;
        color: #6c757d;
        border: 2px solid #dee2e6;
        padding: 12px 28px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    cancelButton.onmouseover = function (this: any) {
        this.style.background = '#e9ecef';
        this.style.borderColor = '#ced4da';
    };
    cancelButton.onmouseout = function (this: any) {
        this.style.background = '#f8f9fa';
        this.style.borderColor = '#dee2e6';
    };
    cancelButton.onclick = closeConfigWindow;
       if (existingDomainConfig) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = t(currentLanguage, 'deleteConfig');
        deleteButton.style.cssText = `
            background: #dc3545;
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
            transition: all 0.2s ease;
        `;
        deleteButton.onmouseover = function (this: any) {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.5)';
        };
        deleteButton.onmouseout = function (this: any) {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
        };
        deleteButton.onclick = function () {
            if (confirm('确定要删除此配置吗？')) {
                deleteDomainConfig(existingDomainConfig);
                closeConfigWindow();
            }
        };
        buttonContainer.appendChild(deleteButton);
    }

    const saveGlobalButton = document.createElement('button');
    saveGlobalButton.textContent = t(currentLanguage, 'saveGlobal');
    saveGlobalButton.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 28px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        transition: all 0.2s ease;
    `;
    saveGlobalButton.onmouseover = function (this: any) {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
    };
    saveGlobalButton.onmouseout = function (this: any) {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    };

    const savePageButton = document.createElement('button');
    savePageButton.textContent = t(currentLanguage, 'savePage');
    savePageButton.style.cssText = `
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        border: none;
        padding: 12px 28px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        transition: all 0.2s ease;
    `;
    savePageButton.onmouseover = function (this: any) {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.5)';
    };
    savePageButton.onmouseout = function (this: any) {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveGlobalButton);
    buttonContainer.appendChild(savePageButton);
    
 

    // 组装窗口
    configWindow.appendChild(header);
    configWindow.appendChild(content);
    configWindow.appendChild(buttonContainer);

    // 创建遮罩层
    overlay = document.createElement('div');
    overlay.id = 'event-blocker-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        z-index: 9998;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    overlay.onclick = closeConfigWindow;

    // 添加到页面
    document.body.appendChild(overlay);
    document.body.appendChild(configWindow);

    // 触发动画
    requestAnimationFrame(function () {
        if (configWindow && overlay) {
            configWindow.style.opacity = '1';
            configWindow.style.transform = 'translate(-50%, -50%) scale(1)';
            overlay.style.opacity = '1';
        }
    });

    // 添加滚动条样式
    const style = document.createElement('style');
    style.textContent = `
        #event-blocker-config-window > div:nth-child(2)::-webkit-scrollbar {
            width: 8px;
        }
        #event-blocker-config-window > div:nth-child(2)::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        #event-blocker-config-window > div:nth-child(2)::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
        }
        #event-blocker-config-window > div:nth-child(2)::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
    `;
    document.head.appendChild(style);

    // 设置配置窗口元素到事件处理模块
    if (configWindow && overlay) {
        setConfigWindowElements(configWindow, overlay);

        // 设置配置窗口元素到增强模式模块
        setEnhancedModeConfigWindowElements(configWindow, overlay);
    }

    // 绑定语言切换事件
    langButton.onclick = function () {
        toggleLanguage(currentLanguage);
        closeConfigWindow();
        createConfigWindow(effectiveConfig);
    };

    saveGlobalButton.onclick = function () {
        removeDisabledEvents();
        saveConfig(config);
        saveGlobalConfig(config);
        applyEnhancedMode(config);
        closeConfigWindow();
    };

    savePageButton.onclick = function () {
        const domainKey = currentDomain;
        const configType: 'domain' = 'domain';
        
        removeDisabledEvents();
        saveConfig(config);
        saveDomainConfig(domainKey, config, configType);
        applyEnhancedMode(config);
        closeConfigWindow();
    };

    if (configWindow && overlay) {
        return {
            configWindow,
            overlay
        };
    }
}