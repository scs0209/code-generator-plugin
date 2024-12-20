interface GenerateShapesMessage {
  type: 'generate-shapes';
  numberOfShapes: number;
  shapeType: 'RECTANGLE' | 'ELLIPSE';
  color: {
    r: number;
    g: number;
    b: number;
  };
}

type PluginMessage = GenerateShapesMessage;

figma.showUI(__html__, { height: 400, themeColors: true });

figma.ui.onmessage = (msg: PluginMessage) => {
  if (msg.type === 'generate-shapes') {
    try {
      const nodes: SceneNode[] = [];
      
      for (let i = 0; i < msg.numberOfShapes; i++) {
        let shape: RectangleNode | EllipseNode;
        
        if (msg.shapeType === 'ELLIPSE') {
          shape = figma.createEllipse();
        } else {
          shape = figma.createRectangle();
        }
        
        shape.x = i * 300;
        shape.resize(200, 100);
        shape.fills = [{
          type: 'SOLID',
          color: msg.color
        }];
        
        figma.currentPage.appendChild(shape);
        nodes.push(shape);
      }
      
      figma.viewport.scrollAndZoomIntoView(nodes);
      figma.currentPage.selection = nodes;
      figma.notify('Shapes created successfully!');
      
    } catch (error) {
      console.error('Error creating shapes:', error);
      figma.notify('Error creating shapes. Check console for details.');
    }
  }
};