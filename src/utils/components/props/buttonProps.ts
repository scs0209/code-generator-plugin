import { findColorToken } from '../../tokens/colorUtils';
import { findTypographyToken } from '../../tokens/typographyUtils';

interface FunctionProp {
  __type: 'function';
  value: string;
}

type PropValue = string | number | boolean | FunctionProp;

export interface ButtonProps {
  sizeVar?: 'S' | 'M';
  styleVar?: 'PRIMARY' | 'SECONDARY' | 'SOLID' | 'GHOST';
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
  if (
    'variantProperties' in node &&
    node.variantProperties &&
    typeof node.variantProperties.styleVar === 'string'
  ) {
    const style = node.variantProperties.styleVar.toLowerCase();
  
    if (style.includes('secondary')) {
      props.styleVar = 'SECONDARY';
    } else if (style.includes('ghost')) {
      props.styleVar = 'GHOST';
    } else if (style.includes('solid')) {
      props.styleVar = 'SOLID';
    } else {
      props.styleVar = 'PRIMARY';
    }
  
    const size = node.variantProperties.sizeVar.toLowerCase();
    if (size && size.includes('s')) {
      props.sizeVar = 'S';
    } else {
      props.sizeVar = 'M';
    }
  } else {
    props.styleVar = 'PRIMARY';
    props.sizeVar = 'M';
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