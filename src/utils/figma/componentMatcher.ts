import { normalizeComponentName } from './nameNormalizer';

export function matchComponent(node: SceneNode): string {
  if (node.name === 'input') {
    return 'Input';
  }
  if (node.type === 'TEXT') {
    return 'Text';
  }
  if (node.type === 'FRAME') {
    const name = node.name.toLowerCase();
    if (name.includes('modal') || name.includes('confirm')) {
      return 'Modal';
    }
  }
   // if (node.name) {
  //   return normalizeComponentName(node.name);
  // }
  return 'StackContainer';
} 