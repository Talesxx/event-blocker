// ==UserScript==
// @name         事件屏蔽器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  屏蔽浏览器中的鼠标、键盘等事件，可配置
// @author       You
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // 默认配置
    const defaultConfig = {
        mouseEvents: true,
        keyboardEvents: true,
        touchEvents: true,
        wheelEvents: true,
        focusEvents: false,
        formEvents: false,
        clipboardEvents: false,
        dragEvents: false
    };

    // 获取配置
    let config = GM_getValue('eventBlockerConfig', defaultConfig);

    // 事件列表
    const events = {
        mouseEvents: [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
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

    // 屏蔽事件的函数
    function blockEvents() {
        // 遍历所有事件类型
        for (const [eventType, eventList] of Object.entries(events)) {
            if (config[eventType]) {
                // 为每个事件添加监听器
                eventList.forEach(eventName => {
                    document.addEventListener(eventName, function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }, true);
                });
            }
        }
    }

    // 创建配置窗口
    function createConfigWindow() {
        // 创建配置窗口
        const configWindow = document.createElement('div');
        configWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 20px;
            z-index: 9999;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            min-width: 300px;
        `;

        // 创建标题
        const title = document.createElement('h2');
        title.textContent = '事件屏蔽配置';
        title.style.marginTop = '0';
        configWindow.appendChild(title);

        // 创建配置选项
        for (const [eventType, eventList] of Object.entries(events)) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = eventType;
            checkbox.checked = config[eventType];
            
            const label = document.createElement('label');
            label.htmlFor = eventType;
            label.textContent = eventType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            const div = document.createElement('div');
            div.style.marginBottom = '10px';
            div.appendChild(checkbox);
            div.appendChild(label);
            configWindow.appendChild(div);
        }

        // 创建保存按钮
        const saveButton = document.createElement('button');
        saveButton.textContent = '保存';
        saveButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        `;
        saveButton.addEventListener('click', function() {
            // 保存配置
            for (const eventType of Object.keys(events)) {
                config[eventType] = document.getElementById(eventType).checked;
            }
            GM_setValue('eventBlockerConfig', config);
            
            // 重新加载页面以应用新配置
            location.reload();
        });

        // 创建取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.cssText = `
            background: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        `;
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(configWindow);
            document.body.removeChild(overlay);
        });

        // 添加按钮到窗口
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '20px';
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);
        configWindow.appendChild(buttonContainer);

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
        `;
        overlay.addEventListener('click', function() {
            document.body.removeChild(configWindow);
            document.body.removeChild(overlay);
        });

        // 添加到页面
        document.body.appendChild(overlay);
        document.body.appendChild(configWindow);
    }

    // 注册菜单命令
    GM_registerMenuCommand('配置事件屏蔽', createConfigWindow);

    // 启动事件屏蔽
    blockEvents();

})();