import { normalizeComponentName } from './nameNormalizer';

export function matchComponent(node: SceneNode): string {
  const name = node.name.toLowerCase();
  if (node.name === 'input') {
    return 'Input';
  }
  if (node.name === 'Icon Button') {
    return 'IconButton';
  }
  if (node.name.includes('Button')) {
    return 'Button';
  }
  if (node.name === 'Text Area') {
    return 'TextArea';
  }
  if (node.type === 'TEXT') {
    return 'Text';
  }
  if (node.type === 'FRAME' || name.includes('modal') || name.includes('confirm')) {
    return 'Modal';
  }
   // if (node.name) {
  //   return normalizeComponentName(node.name);
  // }
  return 'StackContainer';
} 