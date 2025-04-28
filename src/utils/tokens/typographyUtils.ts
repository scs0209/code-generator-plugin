import tokens from '../tokens.json';

export function findTypographyToken(node: any): string {
  const typographyTokens = (tokens as any).shopl;

  const { fontSize, fontWeight, fontFamily, lineHeightPx } = {
    fontSize: node.fontSize,
    fontWeight: `{fontWeight.${node.fontName.style.toLowerCase()}}`,
    fontFamily: node.fontName.family,
    lineHeightPx: node.lineHeight.value
  };

  if (!fontSize || !fontWeight || !fontFamily || !lineHeightPx) {
    return 'body1_400';
  }

  for (const [tokenName, token] of Object.entries(typographyTokens)) {
    const typographyToken = token as {
      type: string;
      value: {
        fontSize: string;
        fontWeight: string;
        fontFamily: string;
        lineHeight: string;
      };
    };

    if (typographyToken.type === 'typography') {
      const tokenSize = parseFloat(typographyToken.value.fontSize);
      const tokenWeight = typographyToken.value.fontWeight;
      const tokenFamily = typographyToken.value.fontFamily;
      const tokenLineHeight = parseFloat(typographyToken.value.lineHeight);

      const isFontSizeMatch = tokenSize === fontSize;
      const isFontWeightMatch = tokenWeight === fontWeight;
      const isFontFamilyMatch = tokenFamily === fontFamily;
      const isLineHeightMatch = tokenLineHeight === lineHeightPx;

      if (isFontSizeMatch && isFontWeightMatch && isFontFamilyMatch && isLineHeightMatch) {
        return tokenName;
      }
    }
  }

  return 'body1_400';
} 