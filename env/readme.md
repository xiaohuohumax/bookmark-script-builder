# 环境变量文件

## 加载文件说明

```text
.env                # 所有情况下都会加载
.env.local          # 所有情况下都会加载，但会被 git 忽略
.env.[mode]         # 只在指定模式下加载
.env.[mode].local   # 只在指定模式下加载，但会被 git 忽略
```

## 变量优先级

```text
.env < .env.local < .env.[mode] < .env.[mode].local
```