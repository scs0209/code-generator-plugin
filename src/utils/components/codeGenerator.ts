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
  return Object.entries(props)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      } else if (typeof value === 'object' && value.__type === 'function') {
        return `${key}={${value.value}}`;
      } else if (typeof value === 'object') {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}={${value}}`;
    })
    .join(' ');
}

function buildChildren(children: any[], depth: number): string {
  return children
    .map((child) => buildComponentRecursive(child, depth + 1))
    .filter(Boolean)
    .join('\n');
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
          const childContent = childChildren
            ? childChildren
                .map((grandChild: any) => {
                  const grandChildProps = formatProps(grandChild.props, [
                    'children',
                  ]);
                  let grandChildContent = '';
                  if (grandChild.type === 'Text') {
                    grandChildContent = grandChild.props.children || '';
                  }
                  return `${indent}  ${indent}<${grandChild.type} ${grandChildProps}>${grandChildContent}</${grandChild.type}>`;
                })
                .join('\n')
            : '';
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
        .map((child) => buildComponentRecursive(child, depth + 1))
        .filter(Boolean)
        .join('\n');
    }

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
