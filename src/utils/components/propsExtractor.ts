import { findColorToken } from '../tokens/colorUtils';
import { findTypographyToken } from '../tokens/typographyUtils';
import { findRadiusToken } from '../tokens/radiusUtils';
import { getModalSizeVar } from './modalUtils';
import componentLibrary from '../component-library.json';

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

interface FunctionProp {
  __type: 'function';
  value: string;
}

type PropValue = string | number | boolean | FunctionProp;

export function extractProps(
  node: SceneNode,
  componentName: string
): Record<string, PropValue> {
  const props: Record<string, PropValue> = {};
  const componentInfo = (componentLibrary as any).components[
    componentName
  ] as ComponentInfo;

  console.log('componentInfo', componentInfo)
  if (!componentInfo) return props;

  // Input 컴포넌트 처리
  
  console.log('node', node, componentName)
  if (componentName === 'Input') {
    // 기본 props 설정
    props.disabled = false;
    props.error = false;
    props.onClear = {
      __type: 'function',
      value: '() => {}'
    } as FunctionProp;

    // 너비 설정
    if (node.width) {
      if (node.type === 'FRAME' && 'layoutSizingHorizontal' in node && node.layoutSizingHorizontal === 'FILL') {
        props.width = '100%';
      } else {
        props.width = `${Math.round(node.width)}px`;
      }
    }

    // 최소 너비 설정 (기본값: 64px)
    if ('minWidth' in node && typeof node.minWidth === 'number') {
      const minWidth = Math.max(64, Math.round(node.minWidth));
      props.minWidth = `${minWidth}px`;
    }

    // 크기 variant 설정 (S: 32px 이하, M: 그 외)
    props.sizeVar = node.height <= 32 ? 'S' : 'M';

    // border radius 설정
    if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
      const radiusToken = findRadiusToken(node.cornerRadius);
      if (radiusToken) props.borderRadius = radiusToken;
    }

    // placeholder 및 maxLength 설정
    if ('children' in node) {
      const textNode = node.children.find(child => 
        child.type === 'TEXT'
      );

      if (textNode && 'characters' in textNode) {
        // Text 노드의 내용을 placeholder로 사용
        props.placeholder = textNode.characters;

        // maxLength 설정 (기본값: 50)
        props.maxLength = 50;

        // Text 노드의 스타일이 neutral350이면 placeholder로 간주
        const fills = textNode.fills as Paint[];
        if (fills && fills.length > 0 && fills[0].type === 'SOLID') {
          const colorToken = findColorToken(fills[0].color);
          if (colorToken === 'neutral350') {
            props.placeholder = textNode.characters;
          }
        }
      }
    }

    // 상태 설정 (disabled, error)
    if ('name' in node) {
      const nameLower = node.name.toLowerCase();
      if (nameLower.includes('disabled')) {
        props.disabled = true;
      }
      if (nameLower.includes('error')) {
        props.error = true;
      }
    }
  }

  if (componentName === 'Text' && node.type === 'TEXT') {
    const fills = node.fills as Paint[];
    if (fills && fills.length > 0 && fills[0].type === 'SOLID') {
      if (componentInfo.props.color) {
        const colorToken = findColorToken(fills[0].color);
        props.color = colorToken;
      }

      if (componentInfo.props.typography) {
        const typographyToken = findTypographyToken(node);
        props.typography = typographyToken;
      }
    }
  }

  if (componentName === 'StackContainer' && node.type === 'FRAME') {
    if ('layoutMode' in node) {
      props.direction = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';

      switch (node.primaryAxisAlignItems) {
        case 'MIN':
          props.justify = 'flex-start';
          break;
        case 'CENTER':
          props.justify = 'center';
          break;
        case 'MAX':
          props.justify = 'flex-end';
          break;
        case 'SPACE_BETWEEN':
          props.justify = 'space-between';
          break;
      }

      switch (node.counterAxisAlignItems) {
        case 'MIN':
          props.align = 'flex-start';
          break;
        case 'CENTER':
          props.align = 'center';
          break;
        case 'MAX':
          props.align = 'flex-end';
          break;
      }

      if (node.layoutSizingHorizontal === 'FIXED') {
        props.width = `${Math.round(node.width)}px`;
      } else if (node.layoutSizingHorizontal === 'FILL') {
        props.width = '100%';
      }

      if (node.layoutSizingVertical === 'FIXED') {
        props.height = `${Math.round(node.height)}px`;
      } else if (node.layoutSizingVertical === 'FILL') {
        props.height = '100%';
      }
    }

    if ('itemSpacing' in node && node.itemSpacing > 0) {
      const spacingValue = node.itemSpacing;
      const spacingTokens = (componentLibrary as any).tokens.spacing;
      
      for (const [tokenName, value] of Object.entries(spacingTokens)) {
        if (value === spacingValue) {
          props.spacing = tokenName;
          break;
        }
      }
    }

    if ('paddingTop' in node || 'paddingBottom' in node || 'paddingLeft' in node || 'paddingRight' in node) {
      const top = node.paddingTop || 0;
      const right = node.paddingRight || 0;
      const bottom = node.paddingBottom || 0;
      const left = node.paddingLeft || 0;
      props.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    }

    if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && 'color' in fill) {
        const colorToken = findColorToken(fill.color);
        if (colorToken) props.background = colorToken;
      }
    }

    if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
      const radiusToken = findRadiusToken(node.cornerRadius);
      if (radiusToken) props.radius = radiusToken;
    }
  }

  if (componentName === 'Modal' && node.type === 'FRAME') {
    if (componentInfo.props.sizeVar) {
      props.sizeVar = getModalSizeVar(node.width);
    }
  }

  console.log('props', props)

  return props;
} 