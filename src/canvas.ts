/* This is a placeholder canvas logic. Replace this logic with your own when building your plugin. */

import { PluginMessage } from './types/messages';
figma.showUI(__html__, { themeColors: true, width: 280, height: 272 });

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
        shape.fills = [{ type: 'SOLID', color: msg.color }];
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