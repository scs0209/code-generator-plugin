import { findColorToken } from '../../tokens/colorUtils';
import { findRadiusToken } from '../../tokens/radiusUtils';

interface StackContainerProps {
  direction?: 'horizontal' | 'vertical';
  spacing?: number;
  justify?: 'start' | 'end' | 'center' | 'space-between';
  align?: 'start' | 'end' | 'center' | 'baseline';
  wrap?: boolean;
  width?: string;
  height?: string;
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
}

export function extractStackContainerProps(node: FrameNode): StackContainerProps {
  const props: StackContainerProps = {};

  // Direction
  if (node.layoutMode === 'HORIZONTAL') {
    props.direction = 'horizontal';
  } else if (node.layoutMode === 'VERTICAL') {
    props.direction = 'vertical';
  }

  // Spacing
  if (typeof node.itemSpacing === 'number') {
    props.spacing = node.itemSpacing;
  }

  // Justify
  if (node.primaryAxisAlignItems === 'MIN') {
    props.justify = 'start';
  } else if (node.primaryAxisAlignItems === 'MAX') {
    props.justify = 'end';
  } else if (node.primaryAxisAlignItems === 'CENTER') {
    props.justify = 'center';
  } else if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
    props.justify = 'space-between';
  }

  // Align
  if (node.counterAxisAlignItems === 'MIN') {
    props.align = 'start';
  } else if (node.counterAxisAlignItems === 'MAX') {
    props.align = 'end';
  } else if (node.counterAxisAlignItems === 'CENTER') {
    props.align = 'center';
  } else if (node.counterAxisAlignItems === 'BASELINE') {
    props.align = 'baseline';
  }

  // Wrap
  if (node.layoutWrap === 'WRAP') {
    props.wrap = true;
  }

  // Size
  if (typeof node.width === 'number') {
    props.width = `${node.width}px`;
  }
  if (typeof node.height === 'number') {
    props.height = `${node.height}px`;
  }

  // Padding
  const padding = [
    node.paddingTop,
    node.paddingRight,
    node.paddingBottom,
    node.paddingLeft,
  ].filter((p): p is number => typeof p === 'number');

  if (padding.length > 0) {
    props.padding = padding.map(p => `${p}px`).join(' ');
  }

  // Background Color
  const fills = node.fills as Paint[];
  if (fills && fills.length > 0) {
    const fill = fills[0];
    if (fill.type === 'SOLID' && fill.visible !== false) {
      const colorToken = findColorToken({
        r: fill.color.r,
        g: fill.color.g,
        b: fill.color.b,
      });
      if (colorToken) {
        props.backgroundColor = colorToken;
      }
    }
  }

  // Border Radius
  if (typeof node.cornerRadius === 'number') {
    const radiusToken = findRadiusToken(node.cornerRadius);
    if (radiusToken) {
      props.borderRadius = radiusToken;
    }
  }

  return props;
} 