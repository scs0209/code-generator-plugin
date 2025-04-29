import { matchComponent } from '../figma/componentMatcher';
import { extractProps } from './propsExtractor';

interface ModalChild {
  type: string;
  children: any[];
  [key: string]: any;
}

function convertIconNameToComponentName(iconName: string): string {
  // shopl/ic-check -> CheckIcon
  // shopl/ic-arrow-right -> ArrowRightIcon
  const nameParts = iconName.split('/');
  const iconPart = nameParts[nameParts.length - 1];
  return iconPart
    .split('-')
    .slice(1) // 'ic' 제거
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('') + 'Icon';
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
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      } else if (typeof value === 'object' && value && value.__type === 'function') {
        // 함수 props 일관되게 처리
        return `${key}={() => {}}`;
      } else if (typeof value === 'boolean') {
        return value ? `${key}={${value}}` : '';
      } else if (typeof value === 'object') {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}={${value}}`;
    })
    .filter(Boolean)
    .join(' ');
}

function renderFromJsonNode(
  node: { type: string; props: Record<string, any>; children?: any[] },
  depth = 0
): string {
  console.log("node", node);
  const indent = '  '.repeat(depth);
  const { type, props = {}, children = [] } = node;

  const propString = Object.entries(props)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? `${key}={${value}}` : '';
      if (typeof value === 'object' && value && value.__type === 'function') {
        return `${key}={() => {}}`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean)
    .join(' ');

  // Input과 TextArea만 self-closing 처리
  if (['Input', 'TextArea'].includes(type)) {
    return `${indent}<${type} ${propString} />`;
  }

  if (children.length > 0) {
    const childrenContent = children
      .map((child) => renderFromJsonNode(child, depth + 1))
      .join('\n');
    return `${indent}<${type} ${propString}>\n${childrenContent}\n${indent}</${type}>`;
  }

  const innerText = typeof props.children === 'string' ? props.children : '';
  if (!innerText) {
    return `${indent}<${type} ${propString}>${innerText}</${type}>`;
  }
  return `${indent}<${type} ${propString}>${innerText}</${type}>`;
}

export function buildComponentRecursive(
  node: SceneNode,
  depth: number = 0
): string {
  const componentName = matchComponent(node);
  const props = extractProps(node, componentName);
  const indent = '  '.repeat(depth);
  const propsString = formatProps(props, ['children']);

  // Modal 컴포넌트의 경우 특별 처리
  if (componentName === 'Modal') {
    let children = '';
    if (props.children) {
      console.log("props.children", props.children);
      children = (props.children as ModalChild[])
        .map((child) => {
          const { type, children: childChildren } = child;
          const childProps = Object.fromEntries(
            Object.entries(child).filter(
              ([key]) => key !== 'type' && key !== 'children'
            )
          );
          console.log("childProps", childProps);
          const formattedProps = formatProps(childProps, ['children']);
          let childContent = '';
          
          if (childChildren && childChildren.length > 0) {
            console.log("childChildren", childChildren);
            childContent = childChildren
              .map((grandChild: any) => {
                if (typeof grandChild === 'string') {
                  return grandChild;
                }
                console.log("grandChild", grandChild);
                const grandChildProps = formatProps(grandChild.props || {}, ['children']);
                
                // IconButton 특별 처리
                if (grandChild.type === 'IconButton') {
                  let iconContent = '';
                  if (grandChild.props && grandChild.props.children.length > 0) {
                    const iconNode = grandChild.props.children[0];
                    if (iconNode && iconNode.name) {
                      const iconComponentName = convertIconNameToComponentName(iconNode.name);
                      iconContent = `\n${indent}      <Icon iconSource={${iconComponentName}} />\n${indent}    `;
                    }
                  }
                  return `${indent}    <${grandChild.type} ${grandChildProps}>${iconContent}</${grandChild.type}>`;
                }
                
                if (grandChild.children && grandChild.children.length > 0) {
                  const nestedContent = grandChild.children
                    .map((nestedChild: any) => renderFromJsonNode(nestedChild, depth + 2))
                    .filter(Boolean)
                    .join('\n');
                  return `${indent}    <${grandChild.type} ${grandChildProps}>\n${nestedContent}\n${indent}    </${grandChild.type}>`;
                }
                
                if (['Input', 'TextArea'].includes(grandChild.type)) {
                  return `${indent}    <${grandChild.type} ${grandChildProps} />`;
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
    const children = props.children || '';
    return `${indent}<${componentName} ${propsString}>${children}</${componentName}>`;
  }

  // IconButton 컴포넌트의 경우 Icon 컴포넌트를 자식으로 처리
  if (componentName === 'IconButton') {
    let iconContent = '';
    
    const children = props.children as Array<{ type: string; name: string; props: Record<string, any> }>;
    if (Array.isArray(children) && children.length > 0) {
      const iconNode = children[0];
      if (iconNode && iconNode.name) {
        const iconComponentName = convertIconNameToComponentName(iconNode.name);
        iconContent = `\n${indent}  <Icon iconSource={${iconComponentName}} />\n${indent}`;
      }
    }
    
    return `${indent}<${componentName} ${propsString}>${iconContent}</${componentName}>`;
  }

  // Input과 TextArea 컴포넌트 처리
  if (componentName === 'Input' || componentName === 'TextArea') {
    // placeholder나 value가 있는 경우 추가
    if ('characters' in node && node.type === 'TEXT') {
      props.placeholder = node.characters;
    }
    const inputProps = formatProps(props);
    return `${indent}<${componentName} ${inputProps} />`;
  }

  // Text 컴포넌트 처리
  if (componentName === 'Text' && node.type === 'TEXT') {
    return `${indent}<${componentName} ${propsString}>${node.characters}</${componentName}>`;
  }

  // 일반적인 컴포넌트 처리
  if ('children' in node && node.children && node.children.length > 0) {
    const children = node.children
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

    if (children) {
      return `${indent}<${componentName} ${propsString}>\n${children}\n${indent}</${componentName}>`;
    }
  }

  // 자식이 없는 컴포넌트 처리
  return `${indent}<${componentName} ${propsString} />`;
}
