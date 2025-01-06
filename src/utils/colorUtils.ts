// This is a placeholder for color conversion functions. Delete this or replace this with your own implementation when building your plugin.

export const hexToRgb = (hex: string) => {
    const hexWithoutHash = hex.replace('#', '');
    const r = parseInt(hexWithoutHash.substring(0, 2), 16) / 255;
    const g = parseInt(hexWithoutHash.substring(2, 4), 16) / 255;
    const b = parseInt(hexWithoutHash.substring(4, 6), 16) / 255;
    return { r, g, b };
};