import { findColorToken } from '../../tokens/colorUtils';
import { findTypographyToken } from '../../tokens/typographyUtils';

interface FunctionProp {
  __type: 'function';
  value: string;
}

type PropValue = string | number | boolean | FunctionProp;

export interface ButtonProps {
  sizeVar?: 'small' | 'medium' | 'large';
  styleVar?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  color?: string;
  textColor?: string;
  typography?: string;
  children?: string;
}

export function extractButtonProps(node: SceneNode): Record<string, PropValue> {
  const props: Record<string, PropValue> = {};

  // Style variant based on name
  if (node.name.toLowerCase().includes('secondary')) {
    props.styleVar = 'secondary';
  } else if (node.name.toLowerCase().includes('tertiary')) {
    props.styleVar = 'tertiary';
  } else {
    props.styleVar = 'primary';
  }

  // Size variant based on height
  if ('height' in node) {
    const height = node.height;
    if (height <= 32) {
      props.sizeVar = 'small';
    } else if (height <= 40) {
      props.sizeVar = 'medium';
    } else {
      props.sizeVar = 'large';
    }
  }

  if ('fills' in node && node.fills) {
    const fills = node.fills as Paint[];
    if (fills && fills.length > 0) {
      const fill = fills[0];
      if (fill.type === 'SOLID') {
        props.color = findColorToken({
          r: fill.color.r,
          g: fill.color.g,
          b: fill.color.b,
        });
      }
    }
  }

  if ('width' in node && node.width === Infinity) {
    props.fullWidth = true;
  }

  if ('opacity' in node && node.opacity < 1) {
    props.disabled = true;
  }

  if ('children' in node) {
    const textNode = node.children.find(child => child.type === 'TEXT');
    if (textNode && textNode.type === 'TEXT') {
      props.typography = findTypographyToken(textNode);
      props.children = textNode.characters;
      
      // Extract text color
      const textFills = textNode.fills as Paint[];
      if (textFills && textFills.length > 0) {
        const textFill = textFills[0];
        if (textFill.type === 'SOLID') {
          props.textColor = findColorToken({
            r: textFill.color.r,
            g: textFill.color.g,
            b: textFill.color.b,
          });
        }
      }
    }
  }

  return props;
} 