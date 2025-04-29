import { matchComponent } from '../figma/componentMatcher';
import { extractProps } from './propsExtractor';

interface ModalChild {
  type: string;
  children: any[];
  [key: string]: any;
}

function formatProps(
  props: Record<string, any>,
  excludeKeys: string[] = []
): string {
  if (!props) return '';

  const keysToExclude = excludeKeys || [];
  
  return Object.entries(props || {})
    .filter(([key]) => !keysToExclude.includes(key))
    .map(([key, value]) => {
      // 나머지 코드는 그대로 유지
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      } else if (typeof value === 'object' && value && value.__type === 'function') {
        return `${key}={${value.value}}`;
      } else if (typeof value === 'object') {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}={${value}}`;
    })
    .join(' ');
}

function renderFromJsonNode(
  node: { type: string; props: Record<string, any>; children?: any[] },
  depth = 0
): string {
  const indent = '  '.repeat(depth);
  const { type, props = {}, children = [] } = node;

  const propString = Object.entries(props)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? key : '';
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean)
    .join(' ');

  const openTag = propString ? `<${type} ${propString}>` : `<${type}>`;

  if (children.length > 0) {
    const childrenContent = children
      .map((child) => renderFromJsonNode(child, depth + 1))
      .join('\n');
    return `${indent}${openTag}\n${childrenContent}\n${indent}</${type}>`;
  }

  const innerText = typeof props.children === 'string' ? props.children : '';
  return `${indent}${openTag}${innerText}</${type}>`;
}

export function buildComponentRecursive(
  node: SceneNode,
  depth: number = 0
): string {
  const componentName = matchComponent(node);
  const props = extractProps(node, componentName);
  const indent = '  '.repeat(depth);

  // Modal 컴포넌트의 경우 특별 처리
  if (componentName === 'Modal') {
    const propsString = formatProps(props, ['children']);
    let children = '';
    if (props.children) {
      children = (props.children as ModalChild[])
        .map((child) => {
          const { type, children: childChildren } = child;
          const childProps = Object.fromEntries(
            Object.entries(child).filter(
              ([key]) => key !== 'type' && key !== 'children'
            )
          );
          const formattedProps = formatProps(childProps, ['children']);
          let childContent = '';
          
          if (childChildren && childChildren.length > 0) {
            childContent = childChildren
              .map((grandChild: any) => {
                if (typeof grandChild === 'string') {
                  return grandChild;
                }
                const grandChildProps = formatProps(grandChild.props || {}, ['children']);
                
                if (grandChild.children && grandChild.children.length > 0) {
                  const nestedContent = grandChild.children
                    .map((nestedChild: any) => renderFromJsonNode(nestedChild, depth + 2))
                    .filter(Boolean)
                    .join('\n');
                  return `${indent}    <${grandChild.type} ${grandChildProps}>\n${nestedContent}\n${indent}    </${grandChild.type}>`;
                }
                
                const grandChildContent = grandChild.props.children || '';
                return `${indent}    <${grandChild.type} ${grandChildProps}>${grandChildContent}</${grandChild.type}>`;
              })
              .filter(Boolean)
              .join('\n');
          }
          
          return `${indent}  <${type} ${formattedProps}>\n${childContent}\n${indent}  </${type}>`;
        })
        .join('\n');
    }
    return `${indent}<${componentName} ${propsString}>\n${children}\n${indent}</${componentName}>`;
  }

  // 버튼 컴포넌트의 경우 Text 컴포넌트를 생성하지 않음
  if (componentName === 'Button') {
    const propsString = formatProps(props, ['children']);
    const children = props.children || '';
    return `${indent}<${componentName} ${propsString}>${children}</${componentName}>`;
  }

  // 일반적인 컴포넌트 처리
  if ('children' in node) {
    let children = '';
    if (node.children) {
      children = node.children
        .map((child: any) => {
          if (typeof child === 'string') {
            return child;
          }
          const childProps = formatProps(child.props || {}, ['children']);
          const childContent = child.props.children || '';
          
          if (child.children && child.children.length > 0) {
            const nestedContent = child.children
              .map((nestedChild: any) => buildComponentRecursive(nestedChild, depth + 2))
              .filter(Boolean)
              .join('\n');
            return `${indent}  <${child.type} ${childProps}>\n${nestedContent}\n${indent}  </${child.type}>`;
          }
          
          return `${indent}  <${child.type} ${childProps}>${childContent}</${child.type}>`;
        })
        .filter(Boolean)
        .join('\n');
    }

    if (children) {
      const propsString = formatProps(props, ['children']);
      return `${indent}<${componentName} ${propsString}>\n${children}\n${indent}</${componentName}>`;
    }
  }

  // Text 컴포넌트 처리
  if (componentName === 'Text' && node.type === 'TEXT') {
    const propsString = formatProps(props, ['children']);
    return `${indent}<${componentName} ${propsString}>${node.characters}</${componentName}>`;
  }

  // 자식이 없는 컴포넌트 처리
  const propsString = formatProps(props, ['children']);
  return `${indent}<${componentName} ${propsString} />`;
}
