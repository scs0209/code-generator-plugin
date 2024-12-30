// =============================================
// MESSAGE TYPES
// Replace these types with your own when building your plugin.
// =============================================

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
  
  export type ShapeType = 'RECTANGLE' | 'ELLIPSE';