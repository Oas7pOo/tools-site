/**
 * 背景动画组件
 * 创建全屏彩色波纹动画效果
 */
class BackgroundAnimation {
  constructor() {
    this.canvas = document.getElementById('bgCanvas');
    this.ctx = null;
    this.animationId = null;
    this.mouseX = -100;
    this.mouseY = -100;
    this.rippleIntensity = 0;
    this.time = 0;
    
    // 动画参数
    this.amplitude = 1;          // 正弦波基础振幅
    this.frequency = 0.005;      // 基础波动频率
    this.verticalSpacing = 10;  // 每条水平线间隔
    this.turbulenceAmplitude = 50; // 基础湍流扰动幅度
    
    this.init();
  }
  
  init() {
    if (!this.canvas) {
      console.warn('Background canvas not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.bindEvents();
    this.startAnimation();
  }
  
  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  bindEvents() {
    // 鼠标移动事件
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.rippleIntensity = 8; // 鼠标移动时给予扰动初始强度
    });
  }
  
  // 简单湍流函数，产生混沌扰动
  turbulence(x, y, t) {
    return (Math.sin(x * 0.01 + t * 0.1) + Math.sin(y * 0.02 + t * 0.1)) / 2 * this.turbulenceAmplitude;
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 使用 "lighter" 模式使颜色混合
    this.ctx.globalCompositeOperation = 'lighter';
    
    // 遍历每条水平线
    for (let y = 0; y < this.canvas.height; y += this.verticalSpacing) {
      this.ctx.beginPath();
      
      // 创建一个沿水平线的多色线性渐变
      let grad = this.ctx.createLinearGradient(0, y, this.canvas.width, y);
      grad.addColorStop(0, `hsl(${(this.time + y * 0.1) % 360}, 80%, 50%)`);
      grad.addColorStop(0.5, `hsl(${(this.time + y * 0.1 + 60) % 360}, 80%, 50%)`);
      grad.addColorStop(1, `hsl(${(this.time + y * 0.1 + 120) % 360}, 80%, 50%)`);
      this.ctx.strokeStyle = grad;
      
      // 绘制波纹线
      for (let x = 0; x <= this.canvas.width; x++) {
        let baseOffset = Math.sin(x * this.frequency + this.time + y * 0.005) * this.amplitude;
        let turb = this.turbulence(x, y, this.time);
        
        // 计算鼠标局部扰动效果
        const dx = x - this.mouseX;
        const dy = y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let ripple = 0;
        const rippleRadius = 100; // 鼠标影响半径
        
        if (dist < rippleRadius) {
          let decay = 1 - dist / rippleRadius;
          ripple = decay * this.rippleIntensity * Math.sin(x * 0.05 + this.time * 0.2);
        }
        
        let offset = baseOffset + turb + ripple;
        if (x === 0) {
          this.ctx.moveTo(x, y + offset);
        } else {
          this.ctx.lineTo(x, y + offset);
        }
      }
      
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    
    // 恢复默认合成模式
    this.ctx.globalCompositeOperation = 'source-over';
    
    // 叠加水平渐变遮罩：左侧完全透明，右侧25%不透明
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-in';
    let mask = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    mask.addColorStop(0, 'rgba(0,0,0,0)');       // 左侧：全透明
    mask.addColorStop(1, 'rgba(0,0,0,0.25)');    // 右侧：25%不透明
    this.ctx.fillStyle = mask;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    
    // 衰减鼠标扰动强度，使扰动逐渐消失
    this.rippleIntensity *= 0.98;
    
    this.time += 0.02;  // 平缓时间步长
    this.animationId = requestAnimationFrame(this.draw.bind(this));
  }
  
  startAnimation() {
    this.draw();
  }
  
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  destroy() {
    this.stopAnimation();
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }
}

// 自动初始化背景动画
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('bgCanvas')) {
    window.backgroundAnimation = new BackgroundAnimation();
  }
});
