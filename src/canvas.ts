// Figma UI 표시
figma.showUI(__html__, { themeColors: true, width: 256, height: 344 });
// HEX ➔ RGB 변환
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : null;
}

// RGB ➔ HEX 변환
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number): string => {
    const v = Math.round(value * 255).toString(16);
    return v.length === 1 ? '0' + v : v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Node 타입으로 컴포넌트 매칭
function matchComponent(node: SceneNode): string | null {
  if (node.type === 'TEXT') {
    return 'Text';
  }
  if (
    node.type === 'FRAME' &&
    'layoutMode' in node &&
    node.layoutMode !== 'NONE'
  ) {
    return 'StackContainer';
  }
  if (
    node.type === 'FRAME' &&
    'width' in node &&
    'height' in node &&
    node.width > 300 &&
    node.height > 300
  ) {
    return 'Modal';
  }
  return null;
}

// 폰트 사이즈 ➔ typography 토큰 매핑
function fontSizeToTypographyToken(fontSize: number): string {
  if (fontSize <= 12) return 'body3_400';
  if (fontSize <= 13) return 'body2_400';
  if (fontSize <= 14) return 'body1_400';
  if (fontSize <= 16) return 'title2_400';
  if (fontSize <= 18) return 'title1_400';
  if (fontSize <= 20) return 'heading3_400';
  if (fontSize <= 24) return 'heading2_400';
  return 'heading1_400';
}

// Node 정보 ➔ 컴포넌트 props 추출
function extractProps(
  node: SceneNode,
  componentName: string
): Record<string, string | number | boolean> {
  const props: Record<string, string | number | boolean> = {};

  if (componentName === 'Text' && node.type === 'TEXT') {
    // 기본 props만 설정
    props.color = '#000000';
    props.typography = 'body1_400';
    props.textAlign = 'left';
  }

  if (componentName === 'StackContainer' && node.type === 'FRAME') {
    props.direction = 'vertical';
    props.spacing = 'spacing08';
    props.align = 'start';
    props.justify = 'start';
  }

  return props;
}

// 컴포넌트 코드 생성
function buildComponentCode(
  componentName: string,
  props: Record<string, string | number | boolean>,
  innerText?: string
): string {
  let propsString = '';

  for (const key in props) {
    const value = props[key];
    if (typeof value === 'string') {
      propsString += ` ${key}="${value}"`;
    } else {
      propsString += ` ${key}={${value}}`;
    }
  }

  // 기본 템플릿
  if (componentName === 'Text') {
    return `<Text${propsString}>\n  ${innerText || '텍스트 내용'}\n</Text>`;
  }
  if (componentName === 'StackContainer') {
    return `<StackContainer${propsString}>\n  {children}\n</StackContainer>`;
  }
  if (componentName === 'Modal') {
    return `<ModalContainer${propsString}>\n  <ModalHeader>제목</ModalHeader>\n  <ModalBody>\n    컨텐츠 내용\n  </ModalBody>\n  <ModalFooter>\n    <Button>확인</Button>\n  </ModalFooter>\n</ModalContainer>`;
  }

  return '';
}

// UI에서 오는 메시지를 처리하는 핸들러
figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'generate-code') {
    const selection = figma.currentPage.selection;
    console.log(selection);
    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: '선택된 컴포넌트가 없습니다.',
      });
      return;
    }

    console.log(selection[0]);

    const node = selection[0];
    const componentName = matchComponent(node);
    if (!componentName) {
      figma.ui.postMessage({
        type: 'error',
        message: '매칭되는 컴포넌트를 찾을 수 없습니다.',
      });
      return;
    }

    const props = extractProps(node, componentName);
    console.log(props);
    const innerText = 'characters' in node ? node.characters : undefined;
    const code = buildComponentCode(componentName, props, innerText);

    figma.ui.postMessage({
      type: 'code-generated',
      code,
    });
  }
};
