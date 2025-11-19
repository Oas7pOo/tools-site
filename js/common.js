// 通用工具函数库

// 创建全局common对象 - IIFE模式
(function(window) {
  // DOMContentLoaded 包装器
  function onDOMLoaded(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  // 显示加载指示器
  function showLoading(elementId) {
    // 使用默认值
    elementId = elementId || 'loadingIndicator';
    
    var loadingElement = document.getElementById(elementId);
    if (!loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.id = elementId;
      loadingElement.style.cssText = 
        'position: fixed;'
        + 'top: 50%;'
        + 'left: 50%;'
        + 'transform: translate(-50%, -50%);'
        + 'padding: 20px;'
        + 'background: rgba(255, 255, 255, 0.9);'
        + 'border-radius: 8px;'
        + 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);'
        + 'z-index: 10000;'
        + 'display: none;';
      loadingElement.innerHTML = '<div style="text-align:center;"><div style="border:4px solid #f3f3f3;border-top:4px solid #4CAF50;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto;"></div><p style="margin-top:10px;">处理中...</p></div>';
      
      // 添加旋转动画样式
      var style = document.createElement('style');
      style.textContent = 
        '@keyframes spin {'
        + ' 0% { transform: rotate(0deg); }'
        + ' 100% { transform: rotate(360deg); }'
        + '}';
      document.head.appendChild(style);
      document.body.appendChild(loadingElement);
    }
    loadingElement.style.display = 'block';
  }

  // 隐藏加载指示器
  function hideLoading(elementId) {
    // 使用默认值
    elementId = elementId || 'loadingIndicator';
    
    var loadingElement = document.getElementById(elementId);
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  // 显示消息
  function showMessage(message, type) {
    // 使用默认值
    type = type || 'info';
    
    var messageElement = document.getElementById('messageBox');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'messageBox';
      messageElement.style.cssText = 
        'position: fixed;'
        + 'top: 20px;'
        + 'right: 20px;'
        + 'padding: 15px 20px;'
        + 'border-radius: 4px;'
        + 'color: white;'
        + 'font-weight: bold;'
        + 'z-index: 10000;'
        + 'opacity: 0;'
        + 'transition: opacity 0.3s ease;'
        + 'max-width: 300px;';
      document.body.appendChild(messageElement);
    }
    
    // 根据消息类型设置背景色
    var bgColors = {
      info: '#2196F3',
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800'
    };
    
    messageElement.style.backgroundColor = bgColors[type] || bgColors.info;
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    
    // 3秒后自动隐藏
    setTimeout(function() {
      messageElement.style.opacity = '0';
    }, 3000);
  }

  // 文件下载工具
  function downloadFile(data, filename, mimeType) {
    try {
      var blob = new Blob([data], { type: mimeType });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('下载文件失败:', error);
      showMessage('下载文件失败: ' + error.message, 'error');
      return false;
    }
  }

  // 防抖函数
  function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
      var context = this;
      var args = arguments;
      var later = function() {
        clearTimeout(timeout);
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 节流函数
  function throttle(func, limit) {
    var inThrottle;
    return function() {
      if (!inThrottle) {
        func.apply(this, arguments);
        inThrottle = true;
        setTimeout(function() { inThrottle = false; }, limit);
      }
    };
  }

  // 安全的JSON解析
  function safeJSONParse(jsonString, defaultValue) {
    // 使用默认值
    defaultValue = defaultValue === undefined ? null : defaultValue;
    
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn('JSON解析失败:', e);
      return defaultValue;
    }
  }

  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 复制文本到剪贴板
  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(function() {
          return true;
        }).catch(function(error) {
          console.error('复制失败:', error);
          return false;
        });
      } else {
        // 降级方案
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        var result = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!result) {
          console.error('复制失败: execCommand返回false');
        }
        return result;
      }
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }

  // 检测元素是否在视口中
  function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // 简单的模板渲染
  function renderTemplate(template, data) {
    return template.replace(/{{(.*?)}}/g, function(match, key) {
      var value = key.trim().split('.').reduce(function(obj, prop) {
        return obj && obj[prop];
      }, data);
      return value !== undefined ? value : '';
    });
  }

  // 显示按钮加载状态
  function showLoadingIndicator(button) {
    var originalText = button.innerText;
    button.setAttribute('data-original-text', originalText);
    button.innerText = button.dataset.loadingText || '处理中...';
    
    // 添加加载状态类
    if (button.classList) {
      button.classList.add('loading');
    }
    
    return originalText;
  }
  
  // 隐藏按钮加载状态
  function hideLoadingIndicator(button, originalText) {
    button.innerText = originalText;
    button.removeAttribute('data-original-text');
    
    // 移除加载状态类
    if (button.classList) {
      button.classList.remove('loading');
    }
  }
  
  // 显示通知
  function showNotification(message, type) {
    // 使用默认值
    type = type || 'info';
    
    showMessage(message, type);
  }

  // 显示进度条
  function showProgress(progress) {
    var progressBar = document.getElementById('progressBar');
    if (!progressBar) {
      // 创建默认进度条
      progressBar = document.createElement('div');
      progressBar.id = 'progressBar';
      progressBar.style.cssText = 
        'position: fixed;' 
        + 'top: 0;' 
        + 'left: 0;' 
        + 'width: 100%;' 
        + 'height: 4px;' 
        + 'background: rgba(0,0,0,0.1);' 
        + 'z-index: 10001;' 
        + 'display: none;';
      
      var progressInner = document.createElement('div');
      progressInner.style.cssText = 
        'height: 100%;' 
        + 'background: #4CAF50;' 
        + 'transition: width 0.3s ease;';
      
      progressBar.appendChild(progressInner);
      document.body.appendChild(progressBar);
    }
    
    var progressInner = progressBar.querySelector('div');
    if (progressInner) {
      progressInner.style.width = progress + '%';
    }
    
    progressBar.style.display = 'block';
    
    // 100%时自动隐藏
    if (progress >= 100) {
      setTimeout(function() {
        progressBar.style.display = 'none';
      }, 1000);
    }
  }

  // 暴露公共API
  window.common = {
    onDOMLoaded: onDOMLoaded,
    showLoading: showLoading,
    hideLoading: hideLoading,
    showMessage: showMessage,
    downloadFile: downloadFile,
    debounce: debounce,
    throttle: throttle,
    safeJSONParse: safeJSONParse,
    safeJsonParse: safeJSONParse, // 别名，保持向后兼容性
    formatFileSize: formatFileSize,
    copyToClipboard: copyToClipboard,
    isElementInViewport: isElementInViewport,
    renderTemplate: renderTemplate,
    showLoadingIndicator: showLoadingIndicator,
    hideLoadingIndicator: hideLoadingIndicator,
    showNotification: showNotification,
    showProgress: showProgress
  };
})(window);