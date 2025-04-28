import { findColorToken } from '../../tokens/colorUtils';
import { findTypographyToken } from '../../tokens/typographyUtils';

export function extractTextProps(node: TextNode): Record<string, any> {
  const props: Record<string, any> = {};

  const fills = node.fills as Paint[];
  if (fills && fills.length > 0 && fills[0].type === 'SOLID') {
    const colorToken = findColorToken(fills[0].color);
    if (colorToken) props.color = colorToken;

    const typographyToken = findTypographyToken(node);
    if (typographyToken) props.typography = typographyToken;
  }

  return props;
} 