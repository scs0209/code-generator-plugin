import { extractProps } from './propsExtractor';
import { matchComponent } from '../figma/componentMatcher';

function indent(text: string, space: number = 2): string {
  return text
    .split('\n')
    .map((line) => ' '.repeat(space) + line)
    .join('\n');
}

export function buildComponentRecursive(node: SceneNode): string {
  const componentName = matchComponent(node);
  if (!componentName) return '';

  const props = extractProps(node, componentName);
  const innerText = 'characters' in node ? node.characters : undefined;

  let childrenCode = '';

  if ('children' in node && node.children.length > 0 && componentName !== 'Input') {
    childrenCode = node.children.map(buildComponentRecursive).join('\n');
  }

  let propsString = '';
  for (const key in props) {
    const value = props[key];
    
    if (value && typeof value === 'object' && '__type' in value && value.__type === 'function') {
      propsString += ` ${key}={${value.value}}`;
    } else if (typeof value === 'string') {
      propsString += ` ${key}="${value}"`;
    } else {
      propsString += ` ${key}={${value}}`;
    }
  }

  if (componentName === 'Input') {
    return `<${componentName}${propsString} />`;
  }

  const openingTag = `<${componentName}${propsString}>`;
  const closingTag = `</${componentName}>`;

  const content = componentName === 'Text' && innerText
    ? innerText
    : childrenCode;

  return `${openingTag}
${indent(content)}
${closingTag}`;
} 