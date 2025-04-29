import { findColorToken } from '../../tokens/colorUtils';

interface FunctionProp {
  __type: 'function';
  value: string;
}

type PropValue = string | number | boolean | FunctionProp;

export interface IconButtonProps {
  sizeVar?: 'XS' | 'S' | 'M';
  styleVar?: 'PRIMARY' | 'SECONDARY' | 'SOLID' | 'GHOST';
  iconSizeVar?: 'XS' | 'S' | 'M';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function extractIconButtonProps(node: SceneNode): Record<string, PropValue> {
  const props: Record<string, PropValue> = {};
  console.log("node", node)

  if (
    'variantProperties' in node &&
    node.variantProperties &&
    typeof node.variantProperties.styleVar === 'string'
  ) {
    const style = node.variantProperties.styleVar.toLowerCase();
    // console.log("style", style)
  
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
    if (size.includes('xs')) {
      props.sizeVar = 'XS';
      props.iconSizeVar = 'XS';
    } else if (size.includes('s')) {
      props.sizeVar = 'S';
      props.iconSizeVar = 'S';
    } else {
      props.sizeVar = 'M';
      props.iconSizeVar = 'M';
    }
  } else {
    props.styleVar = 'PRIMARY';
    props.sizeVar = 'M';
    props.iconSizeVar = 'M';
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

  if ('opacity' in node && node.opacity < 1) {
    props.disabled = true;
  }

  return props;
} 