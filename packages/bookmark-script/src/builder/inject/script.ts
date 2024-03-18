import script from 'inject:script';

const scriptDom = document.createElement('script');
scriptDom.src = script.src;
/**
 * 异常错误提示
 * 
 * 1. CSP 安全策略阻止
 * 2. 网络链接异常 (CDN未同步, 链接错误等)
 */
scriptDom.onerror = function () {
  alert(`Bookmarklet ${script.name} Error !!!
  1. Content Security Policy
  2. Network Error
You can copy and paste the content of:
"${script.src}"
into your console instead(link is in console already)`);
  console.log(script.src);
};

document.head.appendChild(scriptDom);
