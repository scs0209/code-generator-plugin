// This is a placeholder for shape generation message types. Delete this or replace this with your own implementation when building your plugin.

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