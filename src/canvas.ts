// Figma UI 표시
import tokens from './utils/tokens.json';
import componentLibrary from './utils/component-library.json';

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

// width에 따른 Modal sizeVar 매핑
function getModalSizeVar(width: number): string {
  const MODAL_SIZE_XXS = 400;
  const MODAL_SIZE_XS = 500;
  const MODAL_SIZE_S = 560;
  const MODAL_SIZE_M = 640;
  const MODAL_SIZE_L = 768;
  const MODAL_SIZE_XL = 1040;
  const MODAL_SIZE_XXL = 1280;
  const MODAL_SIZE_XXXL = 1600;

  if (width <= MODAL_SIZE_XXS) return 'XXS';
  if (width <= MODAL_SIZE_XS) return 'XS';
  if (width <= MODAL_SIZE_S) return 'S';
  if (width <= MODAL_SIZE_M) return 'M';
  if (width <= MODAL_SIZE_L) return 'L';
  if (width <= MODAL_SIZE_XL) return 'XL';
  if (width <= MODAL_SIZE_XXL) return 'XXL';
  if (width <= MODAL_SIZE_XXXL) return 'XXXL';
  return 'FULL';
}

// Node 정보 ➔ 컴포넌트 props 추출
function extractProps(
  node: SceneNode,
  componentName: string
): Record<string, string | number | boolean> {
  const props: Record<string, string | number | boolean> = {};
  const componentInfo = (componentLibrary as any).components[
    componentName
  ] as ComponentInfo;

  if (!componentInfo) return props;

  if (componentName === 'Text' && node.type === 'TEXT') {
    // fills가 있고 첫 번째 fill이 solid type인 경우에만 처리
    const fills = node.fills as Paint[];
    if (fills && fills.length > 0 && fills[0].type === 'SOLID') {
      // color prop이 정의되어 있는 경우에만 추가
      if (componentInfo.props.color) {
        const colorToken = findColorToken(fills[0].color);
        props.color = colorToken;
      }

      // typography prop이 정의되어 있는 경우에만 추가
      if (
        componentInfo.props.typography &&
        typeof node.fontSize === 'number' &&
        typeof node.fontWeight === 'number'
      ) {
        const typographyToken = findTypographyToken(
          node.fontSize,
          node.fontWeight
        );
        props.typography = typographyToken;
      }
    }
  }

  if (componentName === 'StackContainer' && node.type === 'FRAME') {
    // 각 prop이 정의되어 있는 경우에만 추가
    if (componentInfo.props.direction) props.direction = 'vertical';
    if (componentInfo.props.spacing) props.spacing = 'spacing08';
    if (componentInfo.props.align) props.align = 'start';
    if (componentInfo.props.justify) props.justify = 'start';
  }

  // Modal 컴포넌트 처리
  if (componentName === 'Modal' && node.type === 'FRAME') {
    if (componentInfo.props.sizeVar) {
      props.sizeVar = getModalSizeVar(node.width);
    }
  }

  return props;
}

interface ComponentInfo {
  name: string;
  type: string;
  props: Record<
    string,
    {
      type: string;
      required: boolean;
      description: string;
    }
  >;
  template: string;
  variants?: {
    size?: {
      default: string;
      values: string[];
    };
  };
}

// 컴포넌트 코드 생성
function buildComponentCode(
  componentName: string,
  props: Record<string, string | number | boolean>,
  innerText?: string
): string {
  const componentInfo = (componentLibrary as any).components[
    componentName
  ] as ComponentInfo;
  if (!componentInfo) return '';

  let propsString = '';
  for (const key in props) {
    const value = props[key];
    if (typeof value === 'string') {
      propsString += ` ${key}="${value}"`;
    } else {
      propsString += ` ${key}={${value}}`;
    }
  }

  // 템플릿을 줄바꿈으로 분리
  let code = componentInfo.template;
  const lines = code.split('\n');

  // 첫 번째 줄에서 태그 이름만 추출하고 완전히 새로운 opening 태그 생성
  const tagMatch = lines[0].match(/<([A-Za-z]+)/);
  if (tagMatch) {
    const tagName = tagMatch[1];
    lines[0] = `<${tagName}${propsString}>`;
  }

  // 두 번째 줄부터 첫 번째 닫는 태그가 나올 때까지 스킵
  let contentStartIndex = 1;
  while (
    contentStartIndex < lines.length &&
    !lines[contentStartIndex].trim().startsWith('</') &&
    !lines[contentStartIndex].trim().startsWith('<Modal')
  ) {
    contentStartIndex++;
  }

  // 컴포넌트 내용 부분만 추출
  const contentLines = lines.slice(contentStartIndex);

  // 최종 코드 조합
  code = [lines[0], ...contentLines].map((line) => line.trim()).join('\n');

  // Text 컴포넌트의 경우 내용 대체
  if (componentName === 'Text' && innerText) {
    code = code.replace(/텍스트 내용/, innerText);
  }

  return code;
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
