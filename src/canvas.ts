// Figma UI 표시
import tokens from './utils/tokens.json';
import componentLibrary from './utils/component-library.json';

figma.showUI(__html__, { themeColors: true, width: 256, height: 344 });

function normalizeComponentName(name: string): string {
  return name
    .replace(/\s*\/\s*/g, '') // 슬래시와 공백 모두 삭제
    .replace(/\s+/g, '') // 남은 공백 삭제
    .replace(/[^a-zA-Z0-9]/g, ''); // 알파벳, 숫자만 허용
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
  // if (node.name) {
  //   return normalizeComponentName(node.name);
  // }
  // 매칭되는 컴포넌트가 없으면 StackContainer로 처리
  return 'StackContainer';
}

// RGB ➔ HEX 변환
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number): string => {
    const v = Math.round(value * 255).toString(16);
    return v.length === 1 ? '0' + v : v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 폰트 사이즈 ➔ typography 토큰 매핑
export function findTypographyToken(node: any): string {
  const typographyTokens = (tokens as any).shopl;


  // Comparing with token: title1_700 {tokenSize: 18, tokenWeight: '{fontWeight.bold}', tokenFamily: 'Pretendard', tokenLineHeight: 22}
  // Node typography: {fontSize: 18, fontWeight: 'Bold', fontFamily: 'Pretendard', lineHeightPx: 22}
  const { fontSize, fontWeight, fontFamily, lineHeightPx } = {
    fontSize: node.fontSize,
    fontWeight: `{fontWeight.${node.fontName.style.toLowerCase()}}`,
    fontFamily: node.fontName.family,
    lineHeightPx: node.lineHeight.value
  };

  if (!fontSize || !fontWeight || !fontFamily || !lineHeightPx) {
    return 'body1_400'; // fallback
  }

  console.log('Node typography:', { fontSize, fontWeight, fontFamily, lineHeightPx });

  for (const [tokenName, token] of Object.entries(typographyTokens)) {
    const typographyToken = token as {
      type: string;
      value: {
        fontSize: string;
        fontWeight: string;
        fontFamily: string;
        lineHeight: string;
      };
    };

    console.log('typographyToken', typographyToken.type);
    if (typographyToken.type === 'typography') {
      const tokenSize = parseFloat(typographyToken.value.fontSize);
      const tokenWeight = typographyToken.value.fontWeight;
      const tokenFamily = typographyToken.value.fontFamily;
      const tokenLineHeight = parseFloat(typographyToken.value.lineHeight);

      console.log('Comparing with token:', tokenName, {
        tokenSize,
        tokenWeight,
        tokenFamily,
        tokenLineHeight
      });

      const isFontSizeMatch = tokenSize === fontSize;
      const isFontWeightMatch = tokenWeight === fontWeight;
      const isFontFamilyMatch = tokenFamily === fontFamily;
      const isLineHeightMatch = tokenLineHeight === lineHeightPx;

      if (isFontSizeMatch && isFontWeightMatch && isFontFamilyMatch && isLineHeightMatch) {
        return tokenName;
      }
    }
  }

  console.log('No matching typography token found');
  return 'body1_400'; // fallback
}

// 색상 ➔ color 토큰 매핑
export function findColorToken(color: RGB): string {
  const hexColor = rgbToHex(color.r, color.g, color.b);

  const shoplflowTokens = (tokens as any).shoplflow;

  for (const [groupName, groupTokens] of Object.entries(shoplflowTokens)) {
    if (typeof groupTokens === 'object' && groupTokens !== null) {
      for (const [tokenName, tokenValue] of Object.entries(groupTokens as object)) {
        const colorToken = tokenValue as { type: string; value: string };
        if (
          colorToken.type === 'color' &&
          colorToken.value.toLowerCase() === hexColor.toLowerCase()
        ) {
          return tokenName; // ✅ token 이름만 반환
        }
      }
    }
  }

  return 'neutral700'; // 기본값 (예외처리)
}

export function findRadiusToken(value: number | string): string | null {
  for (const [key, token] of Object.entries(tokens.shoplflow)) {
    const radiusToken = token as { value: string };
    if (key.startsWith('borderRadius') && radiusToken.value === String(value)) {
      return key;  // ✅ token 이름만
    }
  }
  return null;
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
        componentInfo.props.typography
      ) {
        const typographyToken = findTypographyToken(node);
        props.typography = typographyToken;
      }
    }
  }

  if (componentName === 'StackContainer' && node.type === 'FRAME') {
    // 레이아웃 관련 props
    if ('layoutMode' in node) {
      props.direction = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
      if (node.primaryAxisAlignItems === 'CENTER') props.justify = 'center';
      else if (node.primaryAxisAlignItems === 'MAX') props.justify = 'flex-end';
      else if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') props.justify = 'space-between';
      else props.justify = 'flex-start';

      if (node.counterAxisAlignItems === 'CENTER') props.align = 'center';
      else if (node.counterAxisAlignItems === 'MAX') props.align = 'flex-end';
      else props.align = 'flex-start';
    }

    // 간격 관련 props
    if ('itemSpacing' in node && node.itemSpacing > 0) {
      const spacingValue = node.itemSpacing;
      const spacingTokens = (tokens as any).shoplflow.spacing;
      
      // 가장 가까운 spacing 토큰 찾기
      let closestToken = '';
      let minDiff = Infinity;

      for (const [tokenName, token] of Object.entries(spacingTokens)) {
        const tokenValue = parseInt((token as { value: string }).value, 10);
        const diff = Math.abs(spacingValue - tokenValue);
        
        if (diff < minDiff) {
          minDiff = diff;
          closestToken = tokenName;
        }
      }

      if (closestToken) {
        props.spacing = closestToken;
      }
    }

    // 크기 관련 props
    if (node.width) props.width = `${Math.round(node.width)}px`;
    if (node.height) props.height = `${Math.round(node.height)}px`;

    // 패딩 관련 props
    if ('paddingTop' in node || 'paddingBottom' in node || 'paddingLeft' in node || 'paddingRight' in node) {
      const top = node.paddingTop || 0;
      const right = node.paddingRight || 0;
      const bottom = node.paddingBottom || 0;
      const left = node.paddingLeft || 0;
      props.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    }

    // 배경색 관련 props
    if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && 'color' in fill) {
        const colorToken = findColorToken(fill.color);
        if (colorToken) props.background = colorToken;
      }
    }

    // border radius 관련 props
    if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
      const radiusToken = findRadiusToken(node.cornerRadius);
      if (radiusToken) props.radius = radiusToken;
    }
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
function buildComponentRecursive(node: SceneNode): string {
  const componentName = matchComponent(node);
  if (!componentName) return '';

  const props = extractProps(node, componentName);
  console.log('props', props);
  const innerText = 'characters' in node ? node.characters : undefined;

  let childrenCode = '';

  if ('children' in node && node.children.length > 0) {
    childrenCode = node.children.map(buildComponentRecursive).join('\n');
  }

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

  const openingTag = `<${componentName}${propsString}>`;
  const closingTag = `</${componentName}>`;

  // Text 컴포넌트는 innerText를 넣고, 그 외에는 children 넣기
  const content = componentName === 'Text' && innerText
    ? innerText
    : childrenCode;

  return `${openingTag}
${indent(content)}
${closingTag}`;
}

// 들여쓰기 함수
function indent(text: string, space: number = 2): string {
  return text
    .split('\n')
    .map((line) => ' '.repeat(space) + line)
    .join('\n');
}

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
