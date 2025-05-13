// eslint-disable-next-line import/no-unresolved
import { useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-unresolved
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

window.PIXI = PIXI;

const PixiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      view: document.getElementById('live2d'),
      autoStart: true,
      resizeTo: window
    });

    async function loadModel() {
      const model = await Live2DModel.from(
        'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json'
      );
      app.stage.addChild(model);
      model.on('hit', (hitAreas) => {
        if (hitAreas.includes('body')) {
          model.motion('tap_body');
        }
      });
    }

    loadModel();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <canvas ref={canvasRef} id="live2d" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PixiCanvas;