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
│   ├── constants/        # Global config and values
│   ├── hooks/            # Shared React logic
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

### Examples
Below are a few public plugins I built to speed up daily design processes using this starter:

- **[Type Scale](https://www.figma.com/community/plugin/1462790095195108364/type-scale)** — Quickly generate a modular typography scale.
- **[Typeset](https://www.figma.com/community/plugin/1455117604583415830/typeset)** — Fix cases, quotes, dashes, spaces, and punctuation.
- **[Get Color Name](https://www.figma.com/community/plugin/1458188952030933252/get-color-name)** — GET the color name instantly.
- **[Cover Maker](https://www.figma.com/community/plugin/1460274736428830766/cover-maker)** — A cover generator with status, Jira, and YYQQ details.
- **[Layout Calculator](https://www.figma.com/community/plugin/1454833650234213095/layout-calculator)** — Simplify layout calculations, generate layouts.
- **[Percentage Calculator](https://www.figma.com/community/plugin/1457235675961983844/percentage-calculator)** — Compute percentages, rates, and base values.
- **[Piano](https://www.figma.com/community/plugin/1453662299129904150/piano)** — Play piano right in Figma ♪♪♪ ヽ(ˇ∀ˇ )ゞ