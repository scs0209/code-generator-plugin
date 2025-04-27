export default {
  name: 'Figma Plugin React',
  id: '0000000000000000000',
  api: '1.0.0',
  editorType: ['figma', 'dev'],
  capabilities: ['inspect'],
  main: './canvas.js',
  ui: './plugin.html',
  documentAccess: 'dynamic-page',
  networkAccess: {
    allowedDomains: ['none'],
  },
};
