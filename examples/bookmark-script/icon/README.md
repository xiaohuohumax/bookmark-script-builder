# 书签添加图标

书签添加图标

### 图标配置支持格式

+ 网络链接: `http://..../xxx.png`

  ```ts
  /**
   * #name local file
   * #icon ./clock.png
   */
  ```
+ 本地资源: `./xxx.png` 会转换为 `base64`

  ```ts
  /**
   * #name local file
   * #icon ./clock.png
   */
   ```

注意: `#icon` 的值 `不是链接` 或 `不是本地资源` 则使用配置原内容不做修改