export function normalizeComponentName(name: string): string {
  return name
    .replace(/\s*\/\s*/g, '') // 슬래시와 공백 모두 삭제
    .replace(/\s+/g, '') // 남은 공백 삭제
    .replace(/[^a-zA-Z0-9]/g, ''); // 알파벳, 숫자만 허용
} 