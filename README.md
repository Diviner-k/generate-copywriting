# 文案大师 — 部署指南

## 前置条件

1. 微信小程序 AppID（在 [mp.weixin.qq.com](https://mp.weixin.qq.com) 注册）
2. 通义千问 API Key（在 [dashscope.aliyun.com](https://dashscope.aliyun.com) 获取）
3. 微信开发者工具（[下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）
4. HBuilderX（[下载](https://www.dcloud.io/hbuilderx.html)），用于 UniApp 编译

---

## 部署步骤

### 1. 填 AppID

在以下两个文件中，把 `你的小程序AppID` 替换为实际 AppID：

- `project.config.json` → `"appid"`
- `manifest.json` → `"mp-weixin.appid"`

### 2. 用 HBuilderX 打开项目

```
文件 → 打开目录 → 选择 E:\kanggen\1111
运行 → 运行到小程序模拟器 → 微信开发者工具
```

### 3. 开通云开发

在微信开发者工具中：
```
云开发 → 开通 → 创建环境（选择"小程序·云开发"）
记下环境 ID（格式类似 cloud-xxxxx）
```

### 4. 填云环境 ID

在 `App.vue` 中，把 `你的云环境ID` 替换为实际环境 ID。

### 5. 上传云函数

```
微信开发者工具 → 左侧文件树 → 右键 cloudfunctions/generate-text
→ "上传并部署：云端安装依赖"
```

### 6. 设置 API Key

```
CloudBase 控制台 → 云函数 → generate-text → 环境变量
添加：DASHSCOPE_API_KEY = sk-xxxxxxxxxxxxx（你的通义千问 Key）
```

### 7. 预览测试

```
微信开发者工具 → 预览 → 扫码在手机上测试
```

---

## 测试清单

| # | 测试项 | 预期 |
|---|--------|------|
| 1 | 空输入点生成 | 按钮灰色不可点 |
| 2 | 只输入主题不选风格 | 按钮灰色不可点 |
| 3 | 输入主题 + 选风格 → 点生成 | 按钮变灰显示"生成中..." |
| 4 | 生成完成 | 跳转到结果页，显示小红书文案 + 朋友圈文案 |
| 5 | 点"一键复制" | Toast "已复制"，剪贴板有完整内容 |
| 6 | 点单条朋友圈"复制" | Toast "已复制" |
| 7 | 点"重新生成" | 返回输入页，保留之前输入 |

---

## 项目文件结构

```
project/
├── App.vue                          # 根组件（CloudBase 初始化）
├── main.js                          # 入口
├── manifest.json                    # UniApp 配置
├── pages.json                       # 路由
├── project.config.json              # 微信小程序配置
├── pages/
│   ├── index/index.vue              # 输入页
│   └── result/result.vue            # 结果页
├── components/
│   └── StyleSelect.vue              # 风格卡片组件
└── cloudfunctions/
    └── generate-text/
        ├── index.js                 # 云函数（通义千问调用）
        └── package.json
```
