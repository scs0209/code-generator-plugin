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

type PropValue = string | number | boolean | FunctionProp;

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
    case 'Modal':
      if (node.type === 'FRAME') {
        return extractModalProps(node);
      }
      break;
  }

  return props;
} 