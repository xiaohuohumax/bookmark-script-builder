declare module 'inject:script' {
  const script: import('./src/builder').InjectScript;
  export default script;
}

declare module '@babel/preset-typescript' {
  const plugin: import('@babel/core').PluginItem;
  export default plugin;
}