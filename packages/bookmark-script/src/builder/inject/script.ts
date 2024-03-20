import script from 'inject:script';

/**
 * 带超时的 fetch
 * @param url 请求链接
 * @param timeout 超时时间 秒
 * @returns 
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<string> {
  const response = await Promise.race<Response>([
    // 请求脚本
    fetch(url),
    // 超时竞争
    new Promise((_, reject) => setTimeout(() => reject(''), timeout * 1000))
  ]);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.text();
}

/**
 * 将代码注入 body 执行
 * @param data 代码
 */
function appendScript(data: string) {
  const scriptDom = document.createElement('script');
  scriptDom.innerHTML = data;
  document.body.appendChild(scriptDom);
}

/**
 * 异常错误提示
 * 
 * 1. CSP 安全策略阻止
 * 2. 网络链接异常 (CDN未同步, 链接错误等)
 */
function showError() {
  alert(`Bookmarklet ${script.name} Error !!!
 1. Content Security Policy
 2. Network Error
You can copy and paste the content of:
"${script.src}"
into your console instead(link is in console already)`);
  console.log(script.src);
}

// 请求CDN脚本
fetchWithTimeout(script.src, script.timeout ?? 5)
  .then(appendScript)
  .catch(showError);