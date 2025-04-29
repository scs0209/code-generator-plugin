import componentLibrary from '../component-library.json';
import { extractInputProps } from './props/inputProps';
import { extractTextAreaProps } from './props/textAreaProps';
import { extractTextProps } from './props/textProps';
import { extractStackContainerProps } from './props/stackContainerProps';
import { extractModalProps } from './props/modalProps';
import { extractButtonProps } from './props/buttonProps';

interface FunctionProp {
  __type: 'function';
  value: string;
}

type PropValue = string | number | boolean | FunctionProp | any[];

interface ModalChild {
  type: string;
  children: any[];
}

type ModalProps = Record<string, PropValue> & {
  sizeVar?: string;
  children: ModalChild[];
};

export function extractProps(
  node: SceneNode,
  componentName: string
): Record<string, PropValue> {
  const props: Record<string, PropValue> = {};
  const componentInfo = (componentLibrary as any).components[componentName];

  if (!componentInfo) return props;

  switch (componentName) {
    case 'Input':
      return extractInputProps(node);
    case 'Button':
      return extractButtonProps(node);
    case 'TextArea':
      return extractTextAreaProps(node);
    case 'Text':
      if (node.type === 'TEXT') {
        return extractTextProps(node);
      }
      break;
    case 'StackContainer':
      if (node.type === 'FRAME') {
        return extractStackContainerProps(node);
      }
      break;
    case 'confirm':
    case 'Modal':
        const modalProps = extractModalProps(node) as unknown as ModalProps;
        // Modal의 children을 Header, Body, Footer 구조로 변환
        if (modalProps.children) {
          modalProps.children = modalProps.children.map((child: ModalChild) => {
            if (child.type === 'Header') {
              return {
                type: 'Modal.Header',
                children: child.children,
              };
            } else if (child.type === 'Body') {
              return {
                type: 'Modal.Body',
                isIncludeHeader: modalProps.children.some(
                  (c: ModalChild) => c.type === 'Header'
                ),
                isIncludeFooter: modalProps.children.some(
                  (c: ModalChild) => c.type === 'Footer'
                ),
                children: child.children,
              };
            } else if (child.type === 'Footer') {
              return {
                type: 'Modal.Footer',
                children: child.children,
              };
            }
            return child;
          });
        
        return modalProps;
      }
      break;
  }

  return props;
}
