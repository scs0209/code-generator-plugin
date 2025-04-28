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
                      }
                    }
                    return null;
                  })
                : [];
              return {
                type: 'StackContainer',
                props: stackProps,
                children: stackChildren,
              };
            } else if (grandChild.type === 'INSTANCE') {
              if (grandChild.name.includes('Input')) {
                const inputProps = extractInputProps(grandChild);
                return { type: 'Input', props: inputProps };
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
              return { type: 'Button', props: buttonProps };
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
