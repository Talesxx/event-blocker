// ==UserScript==
// @name         事件屏蔽器
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  屏蔽浏览器中的鼠标、键盘等事件，可配置
// @author       You
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // 事件列表
    const events = {
        mouseEvents: [
            // 'click',
            //  'dblclick', 
             
             'mousedown', 'mouseup', 'mousemove',
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'
        ],
        keyboardEvents: [
            'keydown', 'keyup', 'keypress'
        ],
        touchEvents: [
            'touchstart', 'touchmove', 'touchend', 'touchcancel'
        ],
        wheelEvents: [
            'wheel', 'mousewheel', 'DOMMouseScroll'
        ],
        focusEvents: [
            'focus', 'blur', 'focusin', 'focusout'
        ],
        formEvents: [
            'submit', 'change', 'input', 'reset'
        ],
        clipboardEvents: [
            'copy', 'cut', 'paste'
        ],
        dragEvents: [
            'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'
        ]
    };

    // 生成默认配置
    function generateDefaultConfig() {
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

    // 获取配置
    let config = GM_getValue('eventBlockerConfig', generateDefaultConfig());
    
    // 语言配置
    let currentLanguage = GM_getValue('eventBlockerLanguage', 'zh');
    
    // 多语言翻译
    const translations = {
        zh: {
            title: '⚙️ 事件屏蔽配置',
            mouseEvents: '鼠标事件',
            keyboardEvents: '键盘事件',
            touchEvents: '触摸事件',
            wheelEvents: '滚轮事件',
            focusEvents: '焦点事件',
            formEvents: '表单事件',
            clipboardEvents: '剪贴板事件',
            dragEvents: '拖拽事件',
            cancel: '取消',
            save: '💾 保存配置',
            mousedown: '鼠标按下',
            mouseup: '鼠标抬起',
            mousemove: '鼠标移动',
            mouseover: '鼠标悬停',
            mouseout: '鼠标移出',
            mouseenter: '鼠标进入',
            mouseleave: '鼠标离开',
            contextmenu: '右键菜单',
            keydown: '按键按下',
            keyup: '按键抬起',
            keypress: '按键输入',
            touchstart: '触摸开始',
            touchmove: '触摸移动',
            touchend: '触摸结束',
            touchcancel: '触摸取消',
            wheel: '滚轮滚动',
            mousewheel: '鼠标滚轮',
            DOMMouseScroll: 'DOM滚轮',
            focus: '获得焦点',
            blur: '失去焦点',
            focusin: '焦点进入',
            focusout: '焦点离开',
            submit: '表单提交',
            change: '内容改变',
            input: '输入内容',
            reset: '表单重置',
            copy: '复制',
            cut: '剪切',
            paste: '粘贴',
            drag: '拖拽中',
            dragstart: '开始拖拽',
            dragend: '结束拖拽',
            dragover: '拖拽经过',
            dragenter: '拖拽进入',
            dragleave: '拖拽离开',
            drop: '放置',
            menuCommand: '配置事件屏蔽'
        },
        en: {
            title: '⚙️ Event Blocker Config',
            mouseEvents: 'Mouse Events',
            keyboardEvents: 'Keyboard Events',
            touchEvents: 'Touch Events',
            wheelEvents: 'Wheel Events',
            focusEvents: 'Focus Events',
            formEvents: 'Form Events',
            clipboardEvents: 'Clipboard Events',
            dragEvents: 'Drag Events',
            cancel: 'Cancel',
            save: '💾 Save Config',
            mousedown: 'Mouse Down',
            mouseup: 'Mouse Up',
            mousemove: 'Mouse Move',
            mouseover: 'Mouse Over',
            mouseout: 'Mouse Out',
            mouseenter: 'Mouse Enter',
            mouseleave: 'Mouse Leave',
            contextmenu: 'Context Menu',
            keydown: 'Key Down',
            keyup: 'Key Up',
            keypress: 'Key Press',
            touchstart: 'Touch Start',
            touchmove: 'Touch Move',
            touchend: 'Touch End',
            touchcancel: 'Touch Cancel',
            wheel: 'Wheel',
            mousewheel: 'Mouse Wheel',
            DOMMouseScroll: 'DOM Mouse Scroll',
            focus: 'Focus',
            blur: 'Blur',
            focusin: 'Focus In',
            focusout: 'Focus Out',
            submit: 'Submit',
            change: 'Change',
            input: 'Input',
            reset: 'Reset',
            copy: 'Copy',
            cut: 'Cut',
            paste: 'Paste',
            drag: 'Drag',
            dragstart: 'Drag Start',
            dragend: 'Drag End',
            dragover: 'Drag Over',
            dragenter: 'Drag Enter',
            dragleave: 'Drag Leave',
            drop: 'Drop',
            menuCommand: 'Configure Event Blocker'
        }
    };
    
    // 获取翻译文本
    function t(key) {
        return translations[currentLanguage][key] || key;
    }
    
    // 切换语言
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
        GM_setValue('eventBlockerLanguage', currentLanguage);
        
        // 更新菜单命令
        const menuCommand = document.querySelector('.event-blocker-menu-command');
        if (menuCommand) {
            menuCommand.textContent = t('menuCommand');
        }
        
        // 重新创建配置窗口
        closeConfigWindow();
        createConfigWindow();
    }
    
    // 配置窗口元素
    let configWindow = null;
    let overlay = null;

    // 屏蔽事件的函数
    function blockEvents() {
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

    // 保存配置的函数
    function saveConfig() {
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

    // 关闭配置窗口的函数
    function closeConfigWindow() {
        if (configWindow && overlay) {
            document.body.removeChild(configWindow);
            document.body.removeChild(overlay);
            configWindow = null;
            overlay = null;
        }
    }

    // 创建配置窗口
    function createConfigWindow() {
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
            min-width: 500px;
            max-width: 85vw;
            max-height: 85vh;
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
        title.textContent = t('title');
        title.style.cssText = `
            margin: 0;
            color: white;
            font-size: 24px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        header.appendChild(title);

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
        langButton.onmouseover = function() {
            this.style.background = 'rgba(255,255,255,0.3)';
            this.style.borderColor = 'rgba(255,255,255,0.5)';
        };
        langButton.onmouseout = function() {
            this.style.background = 'rgba(255,255,255,0.2)';
            this.style.borderColor = 'rgba(255,255,255,0.3)';
        };
        langButton.onclick = toggleLanguage;
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
            typeCard.onmouseover = function() {
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                this.style.transform = 'translateY(-2px)';
            };
            typeCard.onmouseout = function() {
                this.style.boxShadow = 'none';
                this.style.transform = 'translateY(0)';
            };

            // 创建事件类型标题
            const typeTitle = document.createElement('h3');
            typeTitle.textContent = t(eventType);
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
            const icons = {
                mouseEvents: '🖱️',
                keyboardEvents: '⌨️',
                touchEvents: '👆',
                wheelEvents: '🔄',
                focusEvents: '👁️',
                formEvents: '📝',
                clipboardEvents: '📋',
                dragEvents: '🎯'
            };
            typeTitle.innerHTML = `<span style="font-size: 18px;">${icons[eventType] || '•'}</span> ${typeTitle.textContent}`;
            
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
                checkbox.checked = config[eventType] && config[eventType][eventName] || false;
                checkbox.style.cssText = `
                    display: none;
                `;
                
                const label = document.createElement('label');
                label.htmlFor = `event-${eventType}-${eventName}`;
                label.textContent = t(eventName);
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
                label.onmouseover = function() {
                    this.style.borderColor = '#667eea';
                };
                label.onmouseout = function() {
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
        cancelButton.textContent = t('cancel');
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
        cancelButton.onmouseover = function() {
            this.style.background = '#e9ecef';
            this.style.borderColor = '#ced4da';
        };
        cancelButton.onmouseout = function() {
            this.style.background = '#f8f9fa';
            this.style.borderColor = '#dee2e6';
        };
        cancelButton.onclick = closeConfigWindow;

        // 创建保存按钮
        const saveButton = document.createElement('button');
        saveButton.textContent = t('save');
        saveButton.style.cssText = `
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
        saveButton.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
        };
        saveButton.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        };
        saveButton.onclick = saveConfig;

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);

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
        requestAnimationFrame(function() {
            configWindow.style.opacity = '1';
            configWindow.style.transform = 'translate(-50%, -50%) scale(1)';
            overlay.style.opacity = '1';
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
    }

    // 注册菜单命令
    GM_registerMenuCommand(t('menuCommand'), createConfigWindow);

    // 立即执行一次事件屏蔽
    blockEvents();

    // 监听DOMContentLoaded事件，确保在DOM加载完成后再次执行
    document.addEventListener('DOMContentLoaded', function() {
        blockEvents();
    });

    // 监听load事件，确保在所有资源加载完成后再次执行
    window.addEventListener('load', function() {
        blockEvents();
    });

})();