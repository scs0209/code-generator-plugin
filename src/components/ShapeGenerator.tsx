import React, { useState } from 'react';
import { ShapeType } from '@/types/messages';
import { hexToRgb } from '@/utils/colorUtils';

/* This is a placeholder UI for generating shapes. Replace this with your own UI implementation when building your plugin. */

const ShapeGenerator = () => {
  const [numberOfShapes, setNumberOfShapes] = useState(5);
  const [shapeType, setShapeType] = useState<ShapeType>('RECTANGLE');
  const [color, setColor] = useState('#ffcd75');

  const shapeTypes: ShapeType[] = ['RECTANGLE', 'ELLIPSE'];

  const handleGenerateShapes = () => {
    const rgbColor = hexToRgb(color);
    parent.postMessage({
      pluginMessage: {
        type: 'generate-shapes',
        numberOfShapes,
        shapeType,
        color: rgbColor,
      },
    }, '*');
  };

  return (
    <div>
      <div>
        <div>
          <label>Number of Shapes</label>
          <input
            type="number"
            min="2"
            max="10"
            value={numberOfShapes}
            onChange={(e) => setNumberOfShapes(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Shape Type</label>
          <select
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value as ShapeType)}
          >
            {shapeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Shape Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>
      <button onClick={handleGenerateShapes}>Generate</button>
    </div>
  );
};

export default ShapeGenerator;