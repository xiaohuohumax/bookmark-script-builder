
# 🔖 bookmark script builder 🔖

**书签脚本打包工具**

📖本工具能够将JS代码打包构建成书签脚本格式, 打包好的书签能够通过浏览器直接导入到书签栏, 导入后到目标网页点击书签即可执行相应的代码

```text
# JS代码
alert("hello world!");

# 书签脚本 URL
javascript: alert("hello world!"); void(0);
```

## 📦 构建打包

### 下载项目,修改,打包构建

```shell
npm i
# 修改/添加模块
npm run build
```

### 预览脚本

浏览器直接打开 [🔖书签](./dist/favorites.html)

## 🌳 打包结果结构

```text
dist
 ├── ...            
 |   ├── bookmark.txt   // 书签-版本(自行创建标签, 将代码填写到URL)
 |   └── console.js     // 控制台-版本(复制代码F12执行)
 └── favorites.html     // 全部书签HTML(可全部导入浏览器书签, 也可按住链接单独拖入书签栏)
```

## 👇 已实现-书签脚本

+ [阿里巴巴矢量图标库一键下载](./src/script/pubilc%20script/www.iconfont.cn/save%20icons/index.js)

## 🪧 其他

模块格式参考: [阿里巴巴矢量图标库一键下载](./src/script/pubilc%20script/www.iconfont.cn/save%20icons/index.js)

最后, 玩的开心😄