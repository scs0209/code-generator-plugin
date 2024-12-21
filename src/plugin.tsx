import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import "./base.scss";

type ShapeType = 'RECTANGLE' | 'ELLIPSE';

const ShapeGenerator = () => {
  const [numberOfShapes, setNumberOfShapes] = useState(5);
  const [shapeType, setShapeType] = useState<ShapeType>('RECTANGLE');
  const [color, setColor] = useState('#ffcd75');

  const shapeTypes: ShapeType[] = ['RECTANGLE', 'ELLIPSE'];

  const handleGenerateShapes = () => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    parent.postMessage({
      pluginMessage: {
        type: 'generate-shapes',
        numberOfShapes,
        shapeType,
        color: { r, g, b }
      }
    }, '*');
  };

  return (
    <div>
      <div>

        <div>
          <label>
            Number of Shapes
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={numberOfShapes}
            onChange={(e) => setNumberOfShapes(Number(e.target.value))}
          />
        </div>

        <div>
          <label>
            Shape Type
          </label>
          <select
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value as ShapeType)}
          >
            {shapeTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            Shape Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleGenerateShapes}
      >
        Generate
      </button>

    </div>
  );
};


console.log('Initialization...');

try {
  const container = document.getElementById('react-page');
  console.log('Container element:', container);
  
  if (container) {
    const root = createRoot(container);
    root.render(<ShapeGenerator />);
    console.log('Rendered successfully');
  } else {
    console.error('Container element not found');
  }
} catch (error) {
  console.error('Error initializing:', error);
}