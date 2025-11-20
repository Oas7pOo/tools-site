# 冰兔的工具站

一个基于 Jekyll 构建的静态工具网站，提供各种实用的在线工具，所有操作均在浏览器本地完成，保护用户隐私。

## 🌟 项目简介

冰兔的工具站是一个完全在前端运行的工具集合网站，用户无需担心数据上传到服务器的问题。所有工具都在本地浏览器中运行，确保数据安全和隐私保护。

## 🏗️ 项目架构

### 技术栈

- **前端框架**: Jekyll (静态网站生成器)
- **样式**: CSS3 + 响应式设计
- **脚本**: 原生 JavaScript
- **API集成**: Google Drive API
- **部署**: 静态文件托管 (GitHub Pages)

### 目录结构

```
tools-site/
├── _layouts/           # Jekyll 布局模板
│   └── default.html    # 默认页面布局
├── tools/              # 工具页面目录
│   ├── binary_barcode.html      # 二维码生成器
│   ├── blind_watermark.html     # 盲水印工具
│   ├── hideQCcode.html          # 二维码隐藏工具
│   ├── img&zip.html             # 图片ZIP伪装工具
│   ├── low_jpeg.html            # 低质量JPEG生成器
│   ├── morse_code.html          # 摩斯电码工具
│   ├── phantom_tank.html        # 幻影坦克图片生成器
│   ├── text2png.html            # 文字转图片工具
│   └── video2img.html           # 视频帧提取工具
├── pdf/                # 猫猫头翻译组网盘
│   ├── pdf.html                 # 网盘主页面
│   └── drive-explorer.js        # Google Drive API 集成
├── css/                # 样式文件
│   ├── style.css       # 主样式文件
│   ├── tool_common.css # 工具页面通用样式
│   └── drive-explorer.css # 网盘专用样式
├── js/                 # JavaScript 文件
│   ├── common.js       # 通用 JavaScript 函数
│   ├── pinyin_data.js  # 拼音数据
│   └── [其他第三方库]
├── assets/             # 静态资源
│   └── js/             # 资源 JavaScript 文件
├── blogs/              # 博客文章
├── index.html          # 网站首页
└── _config.yml         # Jekyll 配置文件
```

## 🌐 部署信息

### 线上访问
- **主域名**: https://tomato.kagangtuya.top
- **GitHub Pages**: https://oas7poo.github.io/tools-site/

## 📚 猫猫头翻译组作品

### DND模组翻译
- 瓦罗的遇刺指南、沃达里、末日剑湾
- 尸鬼帝国、游龙之年、泰格尔庄园
- 海盗书、失落寰宇、嘎嘎结社
- DDAL09、塔莎的琐事坩埚、地狱之火
- 三龙牌、DND克苏鲁扩展等

### 其他作品
- **赛博朋克**: 赛博朋克红规则书
- **克苏鲁的呼唤**: 旧日支配者们、幻梦境五版扩展
- 黄印诅咒、奇特的五角区、伦敦扩
- 克苏鲁指南:惊悚冒险与广博异闻
- 钻地魔虫的诅咒、繁星归位了
- 克苏鲁案例汇编、CoC技能发展表汉化

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

- **QQ**: 3342894371
- **邮箱**: 3342894371@qq.com
- **翻译组网盘**: https://tomato.kagangtuya.top
- **GitHub**: https://github.com/Oas7pOo/tools-site

---

> 💡 **提示**: 除网盘功能外，所有工具都在您的浏览器本地运行，不会上传任何数据到服务器，请放心使用！
> 
> 🎯 **加入我们**: 如果您对翻译工作感兴趣，欢迎加入猫猫头翻译组共同建设乌托邦！