# Figma Plugin React (Starter)
Figma plugin starter with React, Vite, and SCSS.

### Install
Using `degit`:
```bash
npx degit planetabhi/figma-plugin-react your-plugin-name
cd your-plugin-name
pnpm i
```

Or using `git clone`:
```bash
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
```bash
pnpm build
```

### Import Plugin Manifest
Import into Figma from `dist/manifest.json`

---

### Plugin Structure
```bash
.
├── src
│   ├── assets/
│   ├── components/       # Reusable React components
│   ├── styles/           # SCSS/CSS styles
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helper functions and utilities
│   ├── canvas.ts         # Figma canvas logic
│   ├── plugin.html       # Entry HTML template
│   └── plugin.tsx        # Plugin entry point
├── .eslintrc.json
├── .gitignore
├── eslint.config.js
├── manifest.ts
├── package.json
├── README.md
├── tsconfig.json
├── vite.config.canvas.ts
└── vite.config.plugin.ts
```