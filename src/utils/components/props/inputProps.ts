import { findRadiusToken } from '../../tokens/radiusUtils';

export function extractInputProps(node: SceneNode): Record<string, any> {
  const props: Record<string, any> = {
    disabled: false,
    error: false,
    onClear: {
      __type: 'function',
      value: '() => {}'
    }
  };

  // 너비 설정
  if (node.width) {
    if (node.type === 'FRAME' && 'layoutSizingHorizontal' in node && node.layoutSizingHorizontal === 'FILL') {
      props.width = '100%';
    } else {
      props.width = `${Math.round(node.width)}px`;
    }
  }

  // 최소 너비 설정 (기본값: 64px)
  if ('minWidth' in node && typeof node.minWidth === 'number') {
    const minWidth = Math.max(64, Math.round(node.minWidth));
    props.minWidth = `${minWidth}px`;
  }

  // 크기 variant 설정 (S: 32px 이하, M: 그 외)
  props.sizeVar = node.height <= 32 ? 'S' : 'M';

  // border radius 설정
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    const radiusToken = findRadiusToken(node.cornerRadius);
    if (radiusToken) props.borderRadius = radiusToken;
  }

  // placeholder 및 maxLength 설정
  props.placeholder = '입력해주세요';
  props.maxLength = 50;

  // 상태 설정 (disabled, error)
  if ('name' in node) {
    const nameLower = node.name.toLowerCase();
    if (nameLower.includes('disabled')) {
      props.disabled = true;
    }
    if (nameLower.includes('error')) {
      props.error = true;
    }
  }

  return props;
} 