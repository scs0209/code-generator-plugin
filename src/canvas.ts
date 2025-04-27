// Figma UI 표시
import tokens from './utils/tokens.json';

figma.showUI(__html__, { themeColors: true, width: 256, height: 344 });

// RGB ➔ HEX 변환
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number): string => {
    const v = Math.round(value * 255).toString(16);
    return v.length === 1 ? '0' + v : v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Node 타입으로 컴포넌트 매칭
function matchComponent(node: SceneNode): string {
  if (node.type === 'TEXT') {
    return 'Text';
  }
  if (node.type === 'FRAME') {
    const name = node.name.toLowerCase();
    if (name.includes('modal')) {
      return 'Modal';
    }
  }
  // 매칭되는 컴포넌트가 없으면 StackContainer로 처리
  return 'StackContainer';
}

interface ColorToken {
  value: string;
  type: 'color';
}

interface TypographyValue {
  fontFamily: string;
  fontWeight: string;
  lineHeight: string;
  fontSize: string;
}

interface TypographyToken {
  value: TypographyValue;
  type: 'typography';
}

interface TokenCategory {
  [key: string]: ColorToken | TypographyToken | { value: string; type: string };
}

interface TokensData {
  shoplflow: {
    [key: string]: TokenCategory;
  };
  shopl: TokenCategory;
  hada: TokenCategory;
  $themes: never[];
  $metadata: {
    tokenSetOrder: string[];
  };
}

// 폰트 사이즈 ➔ typography 토큰 매핑
function findTypographyToken(fontSize: number, fontWeight: number): string {
  const typographyTokens = (tokens as any).shopl;

  // fontSize와 가장 가까운 토큰을 찾음
  let closestToken = 'body1_400';
  let minDiff = Infinity;

  for (const [tokenName, token] of Object.entries(typographyTokens)) {
    const typographyToken = token as {
      type: string;
      value: { fontSize: string; fontWeight: string };
    };
    if (typographyToken.type === 'typography') {
      const tokenSize = parseFloat(typographyToken.value.fontSize);
      const tokenWeight = parseInt(typographyToken.value.fontWeight);

      // fontSize가 같고 fontWeight가 가장 가까운 것을 선택
      if (tokenSize === fontSize) {
        const weightDiff = Math.abs(tokenWeight - fontWeight);
        if (weightDiff < minDiff) {
          minDiff = weightDiff;
          closestToken = tokenName;
        }
      }
    }
  }

  return closestToken;
}

// 색상 ➔ color 토큰 매핑
function findColorToken(color: RGB): string {
  const hexColor = rgbToHex(color.r, color.g, color.b);

  // 모든 색상 토큰을 순회하며 정확히 일치하는 색상 찾기
  for (const category of [
    'neutral',
    'coolgray',
    'navy',
    'red',
    'ocean',
    'purple',
    'yellow',
    'green',
    'shopl',
    'hada',
  ]) {
    const categoryTokens = (tokens as any).shoplflow[category];
    if (categoryTokens) {
      for (const [tokenName, token] of Object.entries(categoryTokens)) {
        const colorToken = token as { type: string; value: string };
        if (
          colorToken.type === 'color' &&
          colorToken.value.toLowerCase() === hexColor.toLowerCase()
        ) {
          return tokenName;
        }
      }
    }
  }

  return 'neutral700'; // 기본값 - 가장 어두운 텍스트 색상 (#333333)
}

// Node 정보 ➔ 컴포넌트 props 추출
function extractProps(
  node: SceneNode,
  componentName: string
): Record<string, string | number | boolean> {
  const props: Record<string, string | number | boolean> = {};

  if (componentName === 'Text' && node.type === 'TEXT') {
    // fills가 있고 첫 번째 fill이 solid type인 경우에만 처리
    const fills = node.fills as Paint[];
    if (fills && fills.length > 0 && fills[0].type === 'SOLID') {
      const colorToken = findColorToken(fills[0].color);
      // fontSize와 fontWeight가 mixed가 아닌 경우에만 처리
      if (
        typeof node.fontSize === 'number' &&
        typeof node.fontWeight === 'number'
      ) {
        const typographyToken = findTypographyToken(
          node.fontSize,
          node.fontWeight
        );
        props.typography = typographyToken;
      } else {
        props.typography = 'body1_400'; // 기본값
      }
      props.color = colorToken;
      props.textAlign = node.textAlignHorizontal.toLowerCase();
    }
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
    console.log(node);
    const componentName = matchComponent(node);
    console.log(componentName);
    if (!componentName) {
      figma.ui.postMessage({
        type: 'error',
        message: '매칭되는 컴포넌트를 찾을 수 없습니다.',
      });
      return;
    }

    const props = extractProps(node, componentName);
    const innerText = 'characters' in node ? node.characters : undefined;
    const code = buildComponentCode(componentName, props, innerText);

    figma.ui.postMessage({
      type: 'code-generated',
      code,
    });
  }
};
