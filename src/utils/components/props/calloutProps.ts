export function extractCalloutProps(node: any): Record<string, any> {
  const props: Record<string, any> = {
    styleVar: 'INFORMATION', // 기본값 설정
    children: []
  };

  // styleVar 추출
  if (node.variantProperties.styleVar.toLowerCase().includes('alert')) {
    props.styleVar = 'ALERT';
  }

  // children 추출
  if ('children' in node) {
    const children = (node as any).children || [];
    props.children = children.map((child: SceneNode) => {
      if (child.type === 'TEXT') {
        return {
          type: 'Callout.Text',
          children: child.characters
        };
      } else if (child.type === 'INSTANCE' || child.type === 'COMPONENT') {
        return {
          type: 'Callout.Icon',
          iconSource: child.name
        };
      }
      return null;
    }).filter(Boolean);
  }

  return props;
} 