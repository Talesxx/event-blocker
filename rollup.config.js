import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

// 用户脚本头
const userScriptHeader = `// ==UserScript==
// @name         事件屏蔽器
// @namespace    http://tampermonkey.net/
// @version      1.10
// @description  屏蔽浏览器中的鼠标、键盘等事件，可配置
// @author       Tales
// @license      MIT
// @git          https://github.com/Talesxx/event-blocker
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

`;

// 开发模式配置
const isDev = process.env.NODE_ENV === 'development';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/event-blocker.user.js',
    format: 'iife',
    banner: userScriptHeader, 
    name: 'eventBlocker',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};