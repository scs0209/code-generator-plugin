# Figma Plugin React (Starter)
Figma plugin starter with React, Vite, and SCSS.

### Install
Using degit:
```
npx degit planetabhi/figma-plugin-react your-plugin-name
cd your-plugin-name
pnpm i
```

Or using git clone:
```
git clone https://github.com/planetabhi/figma-plugin-react.git your-plugin-name
cd your-plugin-name
pnpm i
```

### Build Your Plugin
Update the `manifest.ts` file
```js
export default {
  name: "Figma Plugin React", // Replace with your plugin name
  id: "0000000000000000000",  // Replace with your plugin ID
};
```

Run the build
```
pnpm build
```

### Import Plugin Manifest
Import into Figma from `dist/manifest.json`