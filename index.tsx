
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const MIN_LOAD_TIME = 3000;

// 获取基础元素
const rootElement = document.getElementById('root');
const loader = document.getElementById('initial-loader');
const statusText = document.getElementById('loader-status');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    
    // 立即开始渲染 React，不要等待计时器
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    if (statusText) statusText.innerText = "UI COMPONENT MOUNTED";

    // 处理加载动画移除
    const startTime = (window as any).__APP_START_TIME__ || Date.now();
    const cleanup = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOAD_TIME - elapsed);

      setTimeout(() => {
        if (loader) {
          if (statusText) statusText.innerText = "WELCOME TO LABORATORY";
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.visibility = 'hidden';
            document.body.style.overflow = 'auto';
          }, 800);
        }
      }, remaining);
    };

    // 无论 React 渲染是否报错，3秒后都尝试关闭加载层
    cleanup();

  } catch (error: any) {
    console.error("Mounting Error:", error);
    if (statusText) statusText.innerText = "MOUNTING FAILED";
  }
} else {
  console.error("Fatal: Root element not found");
}
