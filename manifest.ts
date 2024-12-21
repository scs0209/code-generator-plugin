// https://www.figma.com/plugin-docs/manifest/

export default {
  name: "Figma Plugin React",
  id: "0000000000000000000",
  api: "1.0.0",
  editorType: ["figma", "figjam"],
  main: "./canvas.js",
  ui: "./plugin.html",
  documentAccess: "dynamic-page",
  networkAccess: {
    allowedDomains: ["none"],
  },
};
