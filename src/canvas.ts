import { buildComponentRecursive } from './utils/components/codeGenerator';

figma.showUI(__html__, { themeColors: true, width: 256, height: 344 });


// UI에서 오는 메시지를 처리하는 핸들러
figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'generate-code') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: '선택된 컴포넌트가 없습니다.',
      });
      return;
    }

    const node = selection[0];
    const code = buildComponentRecursive(node);

    figma.ui.postMessage({
      type: 'code-generated',
      code,
    });
  }
};
