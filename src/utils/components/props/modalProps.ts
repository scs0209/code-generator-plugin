import { getModalSizeVar } from '../modalUtils';

export function extractModalProps(node: FrameNode): Record<string, any> {
  const props: Record<string, any> = {};

  if (node.width) {
    props.sizeVar = getModalSizeVar(node.width);
  }

  return props;
} 