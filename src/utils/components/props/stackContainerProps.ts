import { findColorToken } from '../../tokens/colorUtils';
import { findRadiusToken } from '../../tokens/radiusUtils';
import tokens from '../../tokens.json';

interface TokenData {
  type: string;
  value: string;
}

export function extractStackContainerProps(node: FrameNode): Record<string, any> {
  const props: Record<string, any> = {};

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
    const spacingTokens = (tokens as any).shoplflow;

    for (const [tokenName, tokenData] of Object.entries(spacingTokens)) {
      const token = tokenData as TokenData;
      if (token.type === 'spacing') {
        const tokenSpacingValue = Number(token.value);

        if (tokenSpacingValue === spacingValue) {
          props.spacing = tokenName;
          break;
        }
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

  return props;
} 