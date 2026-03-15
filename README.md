# 事件屏蔽器油猴插件

这是一个油猴插件，用于屏蔽浏览器中的各种事件，包括鼠标、键盘、触摸等事件。

## 功能特性

- 可配置屏蔽的事件类型
- 提供直观的配置界面
- 支持多种事件类型的屏蔽

## 支持屏蔽的事件类型

- 鼠标事件（click, dblclick, mousedown, mouseup等）
- 键盘事件（keydown, keyup, keypress）
- 触摸事件（touchstart, touchmove, touchend等）
- 滚轮事件（wheel, mousewheel等）
- 焦点事件（focus, blur等）
- 表单事件（submit, change, input等）
- 剪贴板事件（copy, cut, paste）
- 拖拽事件（drag, dragstart, dragend等）

## 安装方法

1. 确保浏览器已安装Tampermonkey扩展
2. 打开`event-blocker.user.js`文件
3. 复制文件内容
4. 在Tampermonkey中点击"添加新脚本"
5. 粘贴复制的内容并保存
6. 刷新浏览器页面以启用插件

## 使用方法

1. 点击Tampermonkey图标
2. 选择"配置事件屏蔽"
3. 在弹出的配置窗口中选择要屏蔽的事件类型
4. 点击"保存"按钮应用配置
5. 页面会自动刷新以应用新的配置

## 注意事项

- 屏蔽某些事件可能会影响网站的正常功能
- 请根据实际需要选择性地屏蔽事件
- 如有问题，请尝试禁用插件或调整配置