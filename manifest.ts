// https://www.figma.com/plugin-docs/manifest/

export default {
  name: "Figma Plugin React",
  id: "1451563571813291845",
  api: "1.0.0",
  main: "./canvas.js",
  ui: "./plugin.html",
  editorType: ["figma", "figjam"],
  networkAccess: {
    allowedDomains: ["none"],
  },
};
