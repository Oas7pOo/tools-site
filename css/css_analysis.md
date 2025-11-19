# style.css 详细分析文档

## 页面结构对照
基于 `_layouts/default.html` 的页面结构：
```
<body>
  <canvas id="bgCanvas"></canvas>
  <button class="hamburger-btn" id="toggleBtn">
  <div class="wrapper">
    <nav class="sidebar" id="sidebar">
      <ul class="nav-list">
        <li><a>索引</a></li>
        <li><span>工具</span>
          <ul class="sub-nav">
            <li><a>工具链接</a></li>
          </ul>
        </li>
      </ul>
    </nav>
    <div class="main-wrapper">
      <header class="header">
        <h1>标题</h1>
        <p>描述</p>
      </header>
      <div class="content">
        {{ content }} <!-- 页面主要内容 -->
      </div>
      <footer>
        <p>版权信息</p>
      </footer>
    </div>
  </div>
</body>
```

---

## CSS样式详细分析

### 1. 全局样式 (第1-25行)
```css
/* 全局重置 */
* { margin: 0; padding: 0; box-sizing: border-box; }
```
**作用位置**: 全局所有元素
**功能**: 重置所有元素的默认外边距、内边距，设置盒模型为border-box

```css
/* 全屏 canvas 固定于背景 */
#bgCanvas {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: -1;
}
```
**作用位置**: `<canvas id="bgCanvas">` 背景画布
**功能**: 将背景画布固定在页面最底层，不随滚动移动，作为动态背景

```css
html, body { height: 100%; }
```
**作用位置**: html和body元素
**功能**: 确保页面高度占满整个视窗

```css
body {
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, Helvetica, sans-serif;
  line-height: 2;
  background-color: #f0f0f0;
  color: #333;
}
```
**作用位置**: 页面主体
**功能**: 设置中文字体、行高、背景色和文字颜色

---

### 2. 段落样式 (第27-40行)
```css
/* 全局段落样式 */
p { margin-top: 1em; }
```
**作用位置**: 所有`<p>`标签
**功能**: 设置段落顶部间距

```css
/* 为 header 与 footer 内的 p 设置居中 */
header p, footer p { text-align: center; }
```
**作用位置**: header和footer内的段落
**功能**: 页眉页脚文字居中显示

---

### 3. 布局容器 (第42-60行)
```css
/* 主内容区域整体容器 */
.main-wrapper {
  margin-left: 240px;
  width: calc(100% - 240px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```
**作用位置**: `<div class="main-wrapper">`
**功能**: 
- 左侧留出240px给侧边栏
- 使用flexbox垂直排列header、content、footer
- 最小高度为视窗高度

```css
/* 菜单展开状态样式 */
li.expanded > .sub-nav { display: block; }
```
**作用位置**: 展开的菜单项
**功能**: 控制子菜单的显示状态

```css
/* 外层容器 */
.wrapper { display: flex; min-height: 100vh; }
```
**作用位置**: `<div class="wrapper">`
**功能**: 水平排列侧边栏和主内容区域

---

### 4. 侧边栏样式 (第62-120行)
```css
/* 默认桌面端：sidebar固定在左 */
.sidebar {
  width: 240px;
  background-color: #333;
  color: #fff;
  height: 100vh;
  max-height: 100vh;
  padding: 20px;
  position: fixed;
  top: 0; left: 0;
  overflow-y: auto;
  transition: transform 0.3s ease;
  transform: translateX(0);
  -webkit-overflow-scrolling: touch;
}
```
**作用位置**: `<nav class="sidebar">`
**功能**: 
- 固定在页面左侧
- 深色背景，白色文字
- 可滚动，带平滑过渡动画
- iOS滚动优化

```css
/* 顶级导航样式 */
.nav-list { list-style: none; padding: 0; margin: 0; }
.nav-list > li { margin-bottom: 15px; }
```
**作用位置**: `<ul class="nav-list">`及其直接子元素
**功能**: 清除列表默认样式，设置菜单项间距

```css
/* 顶级导航链接和标签 */
.nav-list > li > a,
.nav-list > li > span {
  color: #fff;
  text-decoration: none;
  font-size: 1.1em;
  display: block;
  padding: 5px 0;
}
```
**作用位置**: 一级菜单链接和分组标题
**功能**: 设置菜单项的文字样式和间距

```css
/* 鼠标悬停效果 */
.nav-list > li > a:hover,
.nav-list > li > span:hover { color: #4CAF50; }
```
**作用位置**: 一级菜单项
**功能**: 鼠标悬停时变为绿色

```css
/* 子菜单样式 */
.sub-nav {
  list-style: none;
  padding-left: 15px;
  margin-top: 5px;
}
.sub-nav li a {
  color: #ccc;
  text-decoration: none;
  display: block;
  padding: 3px 0;
  font-size: 0.95em;
}
.sub-nav li a:hover { color: #4CAF50; }
```
**作用位置**: `<ul class="sub-nav">`子菜单
**功能**: 
- 缩进显示，较小字体
- 灰色文字，悬停变绿色
- 较小的间距

```css
/* 激活状态 */
a.active { color: #4CAF50; font-weight: bold; }
```
**作用位置**: 当前页面的导航链接
**功能**: 高亮显示当前页面，绿色加粗

---

### 5. 主内容区域 (第122-150行)
```css
/* 主内容区域 */
.content {
  margin: 0;
  padding: 20px;
  flex: 1;
  background-color: rgba(255, 255, 255, 0.5);
  max-width: none;
  width: 100%;
}
```
**作用位置**: `<div class="content">`
**功能**: 
- 占据剩余空间
- 半透明白色背景
- 20px内边距
- 无外边距（紧贴边缘）

```css
/* 响应式设计 */
@media (min-width: 800px) {
  .content {
    max-width: 36em;
    margin: 0 auto;
  }
}
```
**作用位置**: 宽屏时的主内容区域
**功能**: 限制最大宽度为36字符，居中显示，提升阅读体验

---

### 6. 表单和容器样式 (第152-170行)
```css
.container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
}
```
**作用位置**: 工具页面的容器元素
**功能**: 限制表单宽度，居中显示，圆角边框

```css
label {
  display: block;
  margin: 10px 0 5px;
  font-weight: bold;
}
```
**作用位置**: 表单标签
**功能**: 块级显示，设置间距和粗体

```css
input[type="file"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```
**作用位置**: 文件上传输入框
**功能**: 全宽显示，内边距，边框样式

---

### 7. 按钮样式 (第172-220行)
```css
/* 全局按钮样式 */
button {
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}
```
**作用位置**: 所有`<button>`元素
**功能**: 蓝色背景，白色文字，圆角，过渡动画

```css
button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```
**作用位置**: 可用按钮的悬停状态
**功能**: 深蓝色背景，上移1px，阴影效果

```css
button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}
```
**作用位置**: 按下按钮时的状态
**功能**: 回到原位置，去除阴影

```css
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
```
**作用位置**: 禁用按钮
**功能**: 灰色背景，禁用光标，半透明

---

### 8. 按钮加载状态 (第222-250行)
```css
/* 按钮加载状态样式 */
button.loading {
  position: relative;
  color: transparent;
}
button.loading::after {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  top: 50%; left: 50%;
  margin-top: -8px; margin-left: -8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
```
**作用位置**: 带有`.loading`类的按钮
**功能**: 
- 隐藏文字
- 显示旋转的加载动画
- 白色圆形进度指示器

```css
@keyframes spin { to { transform: rotate(360deg); } }
```
**作用位置**: 加载动画
**功能**: 360度旋转动画

```css
/* 防重复点击按钮专用样式 */
.disable-on-click { position: relative; overflow: hidden; }
.disable-on-click.loading { background-color: #0056b3 !important; }
```
**作用位置**: 带有`.disable-on-click`类的按钮
**功能**: 防止重复点击，加载时深蓝色背景

---

### 9. 正文样式 (第252-265行)
```css
/* 正文多栏容器 */
.main-text { column-count: 1; }
```
**作用位置**: 正文内容容器
**功能**: 设置为单栏布局（预留多栏功能）

```css
/* 正文多栏容器中的段落样式 */
.main-text p {
  margin-top: 1em;
  max-width: none;
}
```
**作用位置**: 正文中的段落
**功能**: 段落间距，无宽度限制

---

### 10. 页眉页脚 (第267-290行)
```css
/* 页眉 */
header {
  background-color: #4CAF50;
  color: #fff;
  padding: 20px;
  text-align: center;
}
```
**作用位置**: `<header class="header">`
**功能**: 绿色背景，白色文字，居中对齐

```css
/* Header 额外样式 */
.header {
  position: relative;
  padding: 20px;
  background-color: #4CAF50;
  color: #fff;
  text-align: center;
}
```
**作用位置**: 页眉容器
**功能**: 相对定位，为logo定位提供参考

```css
/* 大标题 */
.header h1 { margin-bottom: 10px; }
```
**作用位置**: 页眉主标题
**功能**: 标题底部间距

```css
/* Logo 样式 */
.header .logo {
  position: absolute;
  right: 20px; top: 20px;
  width: 50px; height: auto;
}
```
**作用位置**: 页眉中的logo
**功能**: 固定在右上角

```css
/* 页脚 */
footer {
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 10px;
  margin-top: auto;
}
```
**作用位置**: `<footer>`
**功能**: 深色背景，白色文字，居中，自动推到底部

---

### 11. 进度条 (第292-305行)
```css
#progressBar {
  width: 100%;
  height: 10px;
  background-color: #eee;
  margin-top: 20px;
}
#progressBar div {
  height: 100%;
  width: 0%;
  background-color: #4CAF50;
  transition: width 0.4s ease;
}
```
**作用位置**: 进度条容器和进度指示器
**功能**: 灰色背景，绿色进度条，平滑过渡动画

---

### 12. 汉堡按钮 (第307-330行)
```css
/* 汉堡按钮样式 - 固定在左上角 */
.hamburger-btn {
  position: fixed;
  top: 15px; left: 15px;
  z-index: 9999;
  display: none; /* 默认隐藏 */
  font-size: 24px;
  background: #333;
  color: #fff;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```
**作用位置**: `<button class="hamburger-btn">`
**功能**: 
- 固定在左上角
- 最高层级
- 默认隐藏（仅小屏显示）
- 深色背景，汉堡图标

```css
.hamburger-btn:hover {
  background: #555;
  transform: scale(1.05);
}
.hamburger-btn:active {
  transform: scale(0.95);
}
```
**作用位置**: 汉堡按钮交互状态
**功能**: 悬停放大，按下缩小

---

### 13. 响应式设计 (第332-373行)
```css
/* 响应式调整：屏幕宽度较小时，导航栏显示在顶部 */
@media (max-width: 768px) {
  .wrapper { flex-direction: column; }
  
  .sidebar {
    position: fixed;
    width: 240px;
    height: 100%;
    top: 0; left: 0;
    transform: translateX(-100%); /* 默认隐藏 */
    z-index: 9998;
    transition: transform 0.3s ease;
  }
  .sidebar.open {
    transform: translateX(0);     /* 显示状态 */
  }
  
  .content {
    margin-left: 0;
    margin-right: 0;
    padding: 15px;
  }
  
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
  
  .hamburger-btn {
    display: block; /* 小屏显示汉堡按钮 */
  }
}
```
**作用位置**: 小屏幕设备（≤768px）
**功能**: 
- 垂直布局
- 侧边栏默认隐藏，滑出式显示
- 主内容占满宽度
- 显示汉堡按钮

---

## 总结

这个CSS文件实现了一个完整的响应式网站布局，包含：

1. **背景系统**: 动态canvas背景
2. **导航系统**: 固定侧边栏 + 响应式汉堡菜单
3. **布局系统**: Flexbox布局，自适应宽度
4. **交互系统**: 按钮状态、加载动画、防重复点击
5. **响应式系统**: 桌面端和小屏幕端的不同布局
6. **视觉系统**: 统一的颜色方案、字体、间距

每个样式都有明确的作用位置和功能，形成了一个功能完整、体验良好的工具网站界面。