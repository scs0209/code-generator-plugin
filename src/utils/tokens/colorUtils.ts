import tokens from '../tokens.json';

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number): string => {
    const v = Math.round(value * 255).toString(16);
    return v.length === 1 ? '0' + v : v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function findColorToken(color: RGB): string {
  const hexColor = rgbToHex(color.r, color.g, color.b);
  const shoplflowTokens = (tokens as any).shoplflow;

  for (const [groupName, groupTokens] of Object.entries(shoplflowTokens)) {
    if (typeof groupTokens === 'object' && groupTokens !== null) {
      for (const [tokenName, tokenValue] of Object.entries(groupTokens as object)) {
        const colorToken = tokenValue as { type: string; value: string };
        if (
          colorToken.type === 'color' &&
          colorToken.value.toLowerCase() === hexColor.toLowerCase()
        ) {
          return tokenName;
        }
      }
    }
  }

  return 'neutral700';
} 