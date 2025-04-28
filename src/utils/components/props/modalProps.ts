import { getModalSizeVar } from '../modalUtils';
import { extractStackContainerProps } from './stackContainerProps';
import { extractTextProps } from './textProps';
import { extractInputProps } from './inputProps';
import { extractButtonProps } from './buttonProps';

interface ModalContent {
  children: any[];
}

interface ModalChild {
  type: 'Modal.Header' | 'Modal.Body' | 'Modal.Footer';
  children: any[];
}

interface ModalProps {
  sizeVar?: string;
  children: ModalChild[];
}

export function extractModalProps(node: FrameNode): ModalProps {
  const props: ModalProps = {
    children: [],
  };

  if (node.width) {
    props.sizeVar = getModalSizeVar(node.width);
  }

  // 자식 노드들을 순회하며 Modal 구조 파악
  const children = (node as any).children || [];
  const headerContent: ModalContent = { children: [] };
  const bodyContent: ModalContent = { children: [] };
  const footerContent: ModalContent = { children: [] };

  // Header, Body, Footer를 이름으로 구분
  children.forEach((child: any) => {
    if (child.name.includes('Modal Header')) {
      if (child.children) {
        headerContent.children = child.children
          .map((grandChild: any) => {
            if (grandChild.type === 'TEXT') {
              const textProps = extractTextProps(grandChild);
              const props = Object.assign({}, textProps);
              props.children = grandChild.characters;
              return { 
                type: 'Text', 
                props: props
              };
            }
            return null;
          })
          .filter(Boolean);
      }
    } else if (child.name.includes('body')) {
      if (child.children) {
        const bodyChildren = child.children
          .map((grandChild: any) => {
            if (grandChild.type === 'TEXT') {
              const textProps = extractTextProps(grandChild);
              const props = Object.assign({}, textProps);
              props.children = grandChild.characters;
              return { 
                type: 'Text', 
                props: props
              };
            } else if (grandChild.type === 'FRAME') {
              const stackProps = extractStackContainerProps(grandChild);
              const stackChildren = grandChild.children
                ? grandChild.children.map((stackChild: any) => {
                    if (stackChild.type === 'TEXT') {
                      const textProps = extractTextProps(stackChild);
                      const props = Object.assign({}, textProps);
                      props.children = stackChild.characters;
                      return { 
                        type: 'Text', 
                        props: props
                      };
                    } else if (stackChild.type === 'INSTANCE') {
                      if (stackChild.name.includes('Input')) {
                        const inputProps = extractInputProps(stackChild);
                        return { type: 'Input', props: inputProps };
                      } else if (stackChild.name.includes('Button')) {
                        const buttonProps = extractButtonProps(stackChild);
                        const props = Object.assign({}, buttonProps);
                        let buttonText = '';
                        if (stackChild.children && stackChild.children.length > 0 && stackChild.children[0]) {
                          buttonText = stackChild.children[0].characters || '';
                        }
                        props.children = buttonText;
                        return { type: 'Button', props: props };
                      }
                    } else if (stackChild.type === 'FRAME') {
                      const nestedStackProps = extractStackContainerProps(stackChild);
                      const nestedChildren = extractChildrenRecursively(stackChild);
                      return {
                        type: 'StackContainer',
                        props: nestedStackProps,
                        children: nestedChildren,
                      };
                    }
                    return null;
                  })
                : [];
              return {
                type: 'StackContainer',
                props: stackProps,
                children: stackChildren.filter(Boolean),
              };
            } else if (grandChild.type === 'INSTANCE') {
              if (grandChild.name.includes('Input')) {
                const inputProps = extractInputProps(grandChild);
                return { type: 'Input', props: inputProps };
              } else if (grandChild.name.includes('Button')) {
                const buttonProps = extractButtonProps(grandChild);
                const props = Object.assign({}, buttonProps);
                let buttonText = '';
                if (grandChild.children && grandChild.children.length > 0 && grandChild.children[0]) {
                  buttonText = grandChild.children[0].characters || '';
                }
                props.children = buttonText;
                return { type: 'Button', props: props };
              }
            }
            return null;
          })
          .filter(Boolean);
        bodyContent.children.push(...bodyChildren);
      }
    } else if (child.name.includes('Modal footer')) {
      if (child.children) {
        footerContent.children = child.children
          .map((grandChild: any) => {
            if (
              grandChild.type === 'INSTANCE' &&
              grandChild.name.includes('Button')
            ) {
              const buttonProps = extractButtonProps(grandChild);
              const props = Object.assign({}, buttonProps);
              let buttonText = '';
              if (grandChild.children && grandChild.children.length > 0 && grandChild.children[0]) {
                buttonText = grandChild.children[0].characters || '';
              }
              props.children = buttonText;
              return { type: 'Button', props: props };
            }
            return null;
          })
          .filter(Boolean);
      }
    }
  });

  // Body는 필수, Header와 Footer는 선택적
  if (bodyContent.children.length === 0) {
    throw new Error('Modal must have Body component');
  }

  // Header가 있으면 추가
  if (headerContent.children.length > 0) {
    props.children.push({ type: 'Modal.Header', children: headerContent.children });
  }

  // Body 추가
  props.children.push({ type: 'Modal.Body', children: bodyContent.children });

  // Footer가 있으면 추가
  if (footerContent.children.length > 0) {
    props.children.push({ type: 'Modal.Footer', children: footerContent.children });
  }

  return props;
}

function extractChildrenRecursively(node: any): any[] {
  if (!node.children) return [];

  return node.children.map((child: any) => {
    if (child.type === 'TEXT') {
      const textProps = extractTextProps(child);
      const props = Object.assign({}, textProps);
      props.children = child.characters;
      return { type: 'Text', props: props };
    } else if (child.type === 'INSTANCE') {
      if (child.name.includes('Input')) {
        const inputProps = extractInputProps(child);
        return { type: 'Input', props: inputProps };
      } else if (child.name.includes('Button')) {
        const buttonProps = extractButtonProps(child);
        const props = Object.assign({}, buttonProps);
        let buttonText = '';
        if (child.children && child.children.length > 0 && child.children[0]) {
          buttonText = child.children[0].characters || '';
        }
        props.children = buttonText;
        return { type: 'Button', props: props };
      }
    } else if (child.type === 'FRAME') {
      const stackProps = extractStackContainerProps(child);
      const children = extractChildrenRecursively(child);
      return {
        type: 'StackContainer',
        props: stackProps,
        children: children,
      };
    }
    return null;
  }).filter(Boolean);
}
