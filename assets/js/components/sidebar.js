/**
 * 侧边栏组件
 * 处理侧边栏的显示/隐藏和响应式行为
 */
class SidebarComponent {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.toggleBtn = document.getElementById('toggleBtn');
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.sidebar || !this.toggleBtn) {
      console.warn('Sidebar elements not found');
      return;
    }
    
    this.bindEvents();
    this.handleResize(); // 初始检查屏幕尺寸
  }
  
  bindEvents() {
    // 切换按钮点击事件
    this.toggleBtn.addEventListener('click', this.toggle.bind(this));
    
    // 点击外部关闭侧边栏
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // 响应式处理
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // ESC 键关闭侧边栏
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.sidebar.classList.toggle('open', this.isOpen);
    
    // 更新按钮状态
    this.updateToggleButton();
  }
  
  open() {
    if (!this.isOpen) {
      this.toggle();
    }
  }
  
  close() {
    if (this.isOpen) {
      this.toggle();
    }
  }
  
  handleOutsideClick(event) {
    // 如果侧边栏是打开的，且点击的不是侧边栏或切换按钮
    if (this.isOpen && 
        !this.sidebar.contains(event.target) && 
        !this.toggleBtn.contains(event.target)) {
      this.close();
    }
  }
  
  handleResize() {
    // 在大屏幕上自动关闭侧边栏
    if (window.innerWidth > 768) {
      this.isOpen = false;
      this.sidebar.classList.remove('open');
      this.updateToggleButton();
    }
  }
  
  handleKeydown(event) {
    // ESC 键关闭侧边栏
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }
  
  updateToggleButton() {
    // 更新按钮的 aria-label 属性
    this.toggleBtn.setAttribute('aria-label', 
      this.isOpen ? '关闭导航菜单' : '打开导航菜单');
    
    // 更新按钮的 aria-expanded 属性
    this.toggleBtn.setAttribute('aria-expanded', this.isOpen);
  }
  
  destroy() {
    // 清理事件监听器
    this.toggleBtn.removeEventListener('click', this.toggle.bind(this));
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }
}

// 自动初始化侧边栏
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('sidebar') && document.getElementById('toggleBtn')) {
    window.sidebarComponent = new SidebarComponent();
  }
});
