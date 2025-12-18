
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 环境防御：确保在所有部署环境下 process 不会引起 ReferenceError
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
}

// 隐藏 Loader 的辅助函数
const hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.visibility = 'hidden';
    }, 600);
  }
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Critical Error: Root element '#root' not found.";
  console.error(errorMsg);
  // 如果找不到 root 节点，尝试报错到 loader 上
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.innerHTML = `<div style="color:red; font-weight:bold;">${errorMsg}</div>`;
  }
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    // 渲染应用
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // 在 React 挂载完成后延迟隐藏 loader，确保内容已渲染
    // 使用 requestAnimationFrame 确保在下一帧（即渲染后）执行
    requestAnimationFrame(() => {
      setTimeout(hideInitialLoader, 200);
    });

  } catch (err: any) {
    console.error("React Mounting Failed:", err);
    // 紧急回退 UI，解决黑屏问题
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px; background: #fff;">
        <div style="max-width: 400px;">
          <div style="width: 60px; height: 60px; background: #ff2442; color: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 30px; margin: 0 auto 20px;">!</div>
          <h1 style="color: #111; font-size: 20px; font-weight: 900; margin-bottom: 10px;">实验室初始化失败</h1>
          <p style="color: #666; font-size: 13px; line-height: 1.6;">${err.message || '未知错误，可能是网络波动或资源加载失败。'}</p>
          <button onclick="window.location.reload()" style="margin-top: 25px; padding: 12px 24px; background: #111; color: #fff; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 14px;">
            刷新页面重试
          </button>
        </div>
      </div>
    `;
    hideInitialLoader();
  }
}
