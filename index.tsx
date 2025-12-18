
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 环境防御：确保在某些严苛的部署环境下 process 不会引起 ReferenceError
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Root element '#root' not found. The app cannot start.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("React Mounting Failed:", err);
    // 紧急回退 UI
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;">
        <div>
          <h1 style="color: #ff2442; font-size: 24px; font-weight: 900; margin-bottom: 10px;">Lab Initialization Failed</h1>
          <p style="color: #666; font-size: 14px;">应用启动失败。请检查控制台错误日志或刷新重试。</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">
            刷新页面
          </button>
        </div>
      </div>
    `;
  }
}
