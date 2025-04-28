export function getModalSizeVar(width: number): string {
  const MODAL_SIZE_XXS = 400;
  const MODAL_SIZE_XS = 500;
  const MODAL_SIZE_S = 560;
  const MODAL_SIZE_M = 640;
  const MODAL_SIZE_L = 768;
  const MODAL_SIZE_XL = 1040;
  const MODAL_SIZE_XXL = 1280;
  const MODAL_SIZE_XXXL = 1600;

  if (width <= MODAL_SIZE_XXS) return 'XXS';
  if (width <= MODAL_SIZE_XS) return 'XS';
  if (width <= MODAL_SIZE_S) return 'S';
  if (width <= MODAL_SIZE_M) return 'M';
  if (width <= MODAL_SIZE_L) return 'L';
  if (width <= MODAL_SIZE_XL) return 'XL';
  if (width <= MODAL_SIZE_XXL) return 'XXL';
  if (width <= MODAL_SIZE_XXXL) return 'XXXL';
  return 'FULL';
} 