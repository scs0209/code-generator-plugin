import { getModalSizeVar } from '../modalUtils';
import { extractStackContainerProps } from './stackContainerProps';
import { extractTextProps } from './textProps';
import { extractInputProps } from './inputProps';
import { extractButtonProps } from './buttonProps';

type ModalSizeType = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'FULL';

interface ModalChild {
  type: 'Modal.Header' | 'Modal.Top' | 'Modal.Body' | 'Modal.Bottom' | 'Modal.Footer';
  props?: any;
  children: any[];
}

interface ModalProps {
  sizeVar?: ModalSizeType;
  height?: number;
  children: ModalChild[];
}

export function extractModalProps(node: FrameNode): ModalProps {
  const props: ModalProps = {
    children: [],
  };

  // 모달 크기 설정
  if (node.width) {
    const modalSize = getModalSizeVar(node.width) as ModalSizeType;
    props.sizeVar = modalSize;
  }

  // 모달 높이 설정
  if (node.height && node.height !== Infinity) {
    props.height = node.height;
  }

  // 자식 노드들을 순회하며 Modal 구조 파악
  const children = node.children || [];
  const headerContent: any[] = [];
  const topContent: any[] = [];
  const bodyContent: any[] = [];
  const bottomContent: any[] = [];
  const footerContent: any[] = [];

  children.forEach((child: any) => {
    if (child.name.toLowerCase().includes('header')) {
      const childContentArray = extractChildContent(child);
      for (let i = 0; i < childContentArray.length; i++) {
        headerContent.push(childContentArray[i]);
      }
    } else if (child.name.toLowerCase().includes('top')) {
      const childContentArray = extractChildContent(child);
      for (let i = 0; i < childContentArray.length; i++) {
        topContent.push(childContentArray[i]);
      }
    } else if (child.name.toLowerCase().includes('body')) {
      const childContentArray = extractChildContent(child);
      for (let i = 0; i < childContentArray.length; i++) {
        bodyContent.push(childContentArray[i]);
      }
    } else if (child.name.toLowerCase().includes('bottom')) {
      const childContentArray = extractChildContent(child);
      for (let i = 0; i < childContentArray.length; i++) {
        bottomContent.push(childContentArray[i]);
      }
    } else if (child.name.toLowerCase().includes('footer')) {
      const childContentArray = extractChildContent(child);
      for (let i = 0; i < childContentArray.length; i++) {
        footerContent.push(childContentArray[i]);
      }
    }
  });

  // Header 추가
  if (headerContent.length > 0) {
    props.children.push({ 
      type: 'Modal.Header',
      children: headerContent 
    });
  }

  // Top 추가
  if (topContent.length > 0) {
    props.children.push({ 
      type: 'Modal.Top',
      children: topContent 
    });
  }

  // Body 추가 (필수)
  props.children.push({ 
    type: 'Modal.Body',
    children: bodyContent 
  });

  // Bottom 추가
  if (bottomContent.length > 0) {
    props.children.push({ 
      type: 'Modal.Bottom',
      children: bottomContent 
    });
  }

  // Footer 추가
  if (footerContent.length > 0) {
    props.children.push({ 
      type: 'Modal.Footer',
      children: footerContent 
    });
  }

  return props;
}

function extractChildContent(node: any): any[] {
  if (!node.children) return [];

  return node.children.map((child: any) => {
    if (child.type === 'TEXT') {
      const textProps = extractTextProps(child);
      return { 
        type: 'Text', 
        props: Object.assign({}, textProps, {
          children: child.characters
        })
      };
    } 
    
    if (child.type === 'INSTANCE') {
      if (child.name.includes('Button')) {
        const buttonProps = extractButtonProps(child);
        let buttonText = '';
        if (child.children && child.children.length > 0) {
          if (child.children[0] && child.children[0].characters) {
            buttonText = child.children[0].characters;
          }
        }
        return { 
          type: 'Button', 
          props: Object.assign({}, buttonProps, {
            children: buttonText
          })
        };
      }
      
      if (child.name.includes('Input')) {
        const inputProps = extractInputProps(child);
        return { 
          type: 'Input', 
          props: Object.assign({}, inputProps)
        };
      }
    }
    
    if (child.type === 'FRAME') {
      const stackProps = extractStackContainerProps(child);
      const stackChildren = extractChildContent(child);
      return {
        type: 'Stack.Vertical',
        props: Object.assign({}, stackProps),
        children: stackChildren
      };
    }

    return null;
  }).filter(Boolean);
}
