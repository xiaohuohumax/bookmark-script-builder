# 浏览器书签


## ℹ 书签脚本


```txt
<!-- js -->
alert("Hello, World!");

<!-- 书签代码 -->
javascript:(function(){alert("Hello, World!");})();void(0);
```

## 🔖 书签构建

按照配置生成浏览器可导入书签 `favorites.html` 格式数据 

**详见:** [书签构建](./packages/bookmark/README.md)

## 📦 书签脚本打包工具 cli

将代码打包成书签脚本

**详见:** [书签脚本构建工具](./packages/bookmark-script/README.md)

## 📄 Todo

+ [ ] 打包模式修改
  + [x] **离线:** (打包完无需请求任何资源)书签URL长可离线
  + [ ] **在线:** (打包完需要请求额外资源)书签URL短需在线

## 最后

**PS:** 原来的书签脚本已经迁移至 [bookmark-script](https://github.com/xiaohuohumax/bookmark-script)

玩的开心 🎉🎉🎉🎉