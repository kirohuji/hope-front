import { useState, useEffect } from 'react';

const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightChange = initialHeight - currentHeight;
      if (heightChange > 0) {
        setKeyboardHeight(heightChange);
      } else {
        setKeyboardHeight(0);
      }
    };

    window.addEventListener('resize', handleResize);

    // 初始调用以确保视图在组件加载时正确
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
};

export { useKeyboardHeight };
