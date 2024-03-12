import { BookmarkScriptBuilder } from '@xiaohuohumax/bookmark-script';

const builder = new BookmarkScriptBuilder({
  plugins: [],
  definePluginOptions: {}
}, {
  'APP_NAME': 'custom'
});

(async () => {
  const bmScript = await builder.buildBookmarkScript({
    name: 'test',
    href: './src/index.ts'
  });

  console.log(bmScript);

  const cScript = await builder.buildConsoleScript({
    name: 'test',
    href: './src/index.ts'
  });

  console.log(cScript);
})();
