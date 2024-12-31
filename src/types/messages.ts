export type ShapeType = 'RECTANGLE' | 'ELLIPSE';

export interface GenerateShapesMessage {
    type: 'generate-shapes';
    numberOfShapes: number;
    shapeType: 'RECTANGLE' | 'ELLIPSE';
    color: {
      r: number;
      g: number;
      b: number;
    };
}
  
export type PluginMessage = GenerateShapesMessage;