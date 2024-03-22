import { useState } from 'react';

function HelloWorld() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h2>
        <a href="https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/packages/bookmark-script" target="_blank"
          rel="bookmark-script readme">
          bookmark-script
        </a>
        +
        <a href="https://react.dev" target="_blank">React</a>
      </h2>
      <button type="button" onClick={() => setCount((count) => count + 1)}>Count {count}</button >
    </>
  );
}

export default HelloWorld;
