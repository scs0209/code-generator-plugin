export function extractTextAreaProps(node: SceneNode): Record<string, any> {
  const props: Record<string, any> = {
    disabled: false,
    isError: false,
    placeholder: '텍스트를 입력해주세요',
    maxLength: 999,
    minHeight: '100px'
  };

  // 너비 설정
  if (node.width) {
    if ('layoutSizingHorizontal' in node && node.layoutSizingHorizontal === 'FILL') {
      props.width = '100%';
    } else {
      props.width = `${Math.round(node.width)}px`;
    }
  }

  // 높이 설정
  if (node.height) {
    props.height = `${Math.round(node.height)}px`;
  }

  // 상태 설정 (disabled, error)
  if ('name' in node) {
    const nameLower = node.name.toLowerCase();
    if (nameLower.includes('disabled')) {
      props.disabled = true;
    }
    if (nameLower.includes('error')) {
      props.isError = true;
    }
  }

  return props;
} 