import { matchComponent } from '../figma/componentMatcher';
import { extractProps } from './propsExtractor';

function formatProps(props: Record<string, any>, excludeKeys: string[] = []): string {
  return Object.entries(props)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      } else if (typeof value === 'object' && value.__type === 'function') {
        return `${key}={${value.value}}`;
      }
      return `${key}={${value}}`;
    })
    .join(' ');
}

export function buildComponentRecursive(node: SceneNode, depth: number = 0): string {
  const componentName = matchComponent(node);
  const props = extractProps(node, componentName);
  const indent = '  '.repeat(depth);

  // 버튼 컴포넌트의 경우 Text 컴포넌트를 생성하지 않음
  if (componentName === 'Button') {
    const propsString = formatProps(props, ['children']);
    const children = props.children || '';
    return `${indent}<${componentName} ${propsString}>${children}</${componentName}>`;
  }

  // 일반적인 컴포넌트 처리
  if ('children' in node) {
    const children = (node.children || [])
      .map(child => buildComponentRecursive(child, depth + 1))
      .filter(Boolean)
      .join('\n');

    if (children) {
      const propsString = formatProps(props);
      return `${indent}<${componentName} ${propsString}>\n${children}\n${indent}</${componentName}>`;
    }
  }

  // Text 컴포넌트 처리
  if (componentName === 'Text' && node.type === 'TEXT') {
    const propsString = formatProps(props);
    return `${indent}<${componentName} ${propsString}>${node.characters}</${componentName}>`;
  }

  // 자식이 없는 컴포넌트 처리
  const propsString = formatProps(props);
  return `${indent}<${componentName} ${propsString} />`;
} 
