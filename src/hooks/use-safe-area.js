import { useState, useEffect } from 'react';

export function useSafeArea() {
  const [safeAreaSupport, setSafeAreaSupport] = useState({
    constant: false,
    env: false,
  });

  useEffect(() => {
    // 创建一个临时的 div 元素来测试
    const testDiv = document.createElement('div');
    
    // 测试 constant() 支持
    testDiv.style.paddingTop = 'constant(safe-area-inset-top)';
    const constantSupported = testDiv.style.paddingTop !== '';
    
    // 测试 env() 支持
    testDiv.style.paddingTop = 'env(safe-area-inset-top)';
    const envSupported = testDiv.style.paddingTop !== '';
    
    setSafeAreaSupport({
      constant: constantSupported,
      env: envSupported,
    });
    
    // 清理
    testDiv.remove();
  }, []);

  return safeAreaSupport;
} 