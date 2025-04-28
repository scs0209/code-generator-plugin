import tokens from '../tokens.json';

export function findRadiusToken(value: number | string): string | null {
  for (const [key, token] of Object.entries(tokens.shoplflow)) {
    const radiusToken = token as { value: string };
    if (key.startsWith('borderRadius') && radiusToken.value === String(value)) {
      return key;
    }
  }
  return null;
} 