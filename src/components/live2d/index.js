// eslint-disable-next-line import/no-unresolved
import { useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-unresolved
import { Live2DSprite } from 'easy-live2d';
import { Application, Ticker } from 'pixi.js';

const PixiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    
    const app = new Application();
    const live2dSprite = new Live2DSprite();
    
    // 初始化精灵并设置模型路径
    live2dSprite.init({
      modelPath: '/character/tuanzi/团子.model3.json',
      ticker: Ticker.shared
    });
    
    const init = async () => {
      await app.init({
        view: canvasRef.current,
        backgroundAlpha: 0  // 透明背景
      });
      
      // Live2D精灵大小
      live2dSprite.width = (canvasRef.current?.clientWidth || 0) * window.devicePixelRatio;
      live2dSprite.height = (canvasRef.current?.clientHeight || 0) * window.devicePixelRatio;
      
      // 将精灵添加到舞台
      app.stage.addChild(live2dSprite);
      
      // 设置精灵居中
      live2dSprite.anchor.set(0.5, 0.5); // 设置锚点为中心
      live2dSprite.x = 0
      // live2dSprite.y = app.screen.height / 2; // 垂直居中
    };
    
    init();
    
    return () => {
      live2dSprite.destroy();
      app.destroy();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PixiCanvas;