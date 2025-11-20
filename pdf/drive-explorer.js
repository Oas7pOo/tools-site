/**
 * Drive Explorer - 简洁网盘风版本（无左侧目录树）
 * 从 Google Drive 读取目录，在页面中以“文件网格 + 大号预览区”展示
 */

class DriveExplorer {
  constructor(options = {}) {
    // 配置
    this.apiKey = options.apiKey || 'AIzaSyCMkQj7OgwdXB5DutdFZmj2plixl-PElZA';
    this.rootFolderId = options.rootFolderId || '1KjVi0JTbIOBvls0Z-BjkPWy4d3FTpryi';
    this.rootPath = options.rootPath || '猫猫头翻译组';

    // DOM 引用
    this.treeContainer = null;          // 允许为 null（不再展示左侧树）
    this.fileGridContainer = null;
    this.previewFrame = null;
    this.previewFallback = null;
    this.currentFileNameEl = null;
    this.currentFilePathEl = null;
    this.openInDriveLink = null;
    this.downloadBtn = null;
    this.breadcrumbEl = null;
    this.mainPanelEl = null;            // .drive-explorer-main
    this.backBtn = null;                // 返回文件列表

    // 状态
    this.currentActiveRow = null;       // 如果以后恢复树可以继续使用
    this.isInitialized = false;
    this.rootNode = null;
    this.currentFolderNode = null;
    this.nodeMap = {};
  }

  /**
   * 初始化
   */
  async init() {
    try {
      this.initDOMElements();
      await this.initGoogleAPI();
      await this.loadDriveTree();
      this.isInitialized = true;
    } catch (err) {
      console.error('Drive Explorer 初始化失败:', err);
      this.showError('初始化失败，请检查网络或 API Key / 共享权限。');
    }
  }

  /**
   * 绑定 DOM 元素
   */
  initDOMElements() {
    this.treeContainer = document.getElementById('driveTree');      // 页面里已没有该元素，为 null 也没关系
    this.fileGridContainer = document.getElementById('driveFileGrid');
    this.previewFrame = document.getElementById('filePreviewFrame');
    this.previewFallback = document.getElementById('filePreviewFallback');
    this.currentFileNameEl = document.getElementById('currentFileName');
    this.currentFilePathEl = document.getElementById('currentFilePath');
    this.openInDriveLink = document.getElementById('openInDrive');
    this.downloadBtn = document.getElementById('downloadFile');
    this.breadcrumbEl = document.getElementById('driveBreadcrumb');
    this.mainPanelEl = document.querySelector('.drive-explorer-main');
    this.backBtn = document.getElementById('backToList');

    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => {
        const folder = this.currentFolderNode || this.rootNode;
        if (folder) {
          this.openFolder(folder, null);  // 回到当前文件夹的文件列表
        }
      });
    }
  }

  /**
   * 初始化 Google API
   */
  async initGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi && window.gapi.load) {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      } else {
        reject(new Error('Google API 未加载'));
      }
    });
  }

  /**
   * 加载根目录及其子树
   * 现在 treeContainer 可选，只要 fileGrid 存在就能工作
   */
  async loadDriveTree() {
    if (!this.fileGridContainer) return;

    const loadingHTML = '<p class="drive-loading">正在从 Google Drive 加载目录...</p>';

    if (this.treeContainer) {
      this.treeContainer.innerHTML = loadingHTML;
    }
    this.fileGridContainer.innerHTML = loadingHTML;

    this.nodeMap = {};

    // 根节点（虚拟）
    this.rootNode = {
      id: this.rootFolderId,
      name: this.rootPath,
      mimeType: 'application/vnd.google-apps.folder',
      isFolder: true,
      path: this.rootPath,
      parent: null,
      children: [],
      webViewLink: `https://drive.google.com/drive/folders/${this.rootFolderId}`,
      webContentLink: null,
      downloadLink: null
    };
    this.nodeMap[this.rootFolderId] = this.rootNode;

    this.rootNode.children = await this.buildTree(this.rootFolderId, this.rootPath, this.rootNode);

    // 可选：渲染左侧树（现在页面里没有该容器，不会显示）
    if (this.treeContainer) {
      this.renderTree([this.rootNode], this.treeContainer);
      this.treeContainer.querySelector('.drive-loading')?.remove();
    }

    // 默认打开根文件夹
    this.openFolder(this.rootNode, null);

    this.fileGridContainer.querySelector('.drive-loading')?.remove();
  }

  /**
   * 列出某个文件夹的直接子项
   */
  async listChildren(folderId) {
    const result = [];
    let pageToken = null;

    do {
      const res = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        pageSize: 1000,
        fields: 'nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink)',
        pageToken
      });

      const files = res.result.files || [];
      result.push(...files);
      pageToken = res.result.nextPageToken;
    } while (pageToken);

    return result;
  }

  /**
   * 递归构建树结构
   */
  async buildTree(folderId, parentPath, parentNode) {
    const items = await this.listChildren(folderId);

    const folders = items
      .filter(f => f.mimeType === 'application/vnd.google-apps.folder')
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));

    const files = items
      .filter(f => f.mimeType !== 'application/vnd.google-apps.folder')
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));

    const nodes = [];

    for (const folder of folders) {
      const node = this.createNode(folder, parentPath, parentNode);
      node.children = await this.buildTree(folder.id, node.path, node);
      nodes.push(node);
    }

    for (const file of files) {
      const node = this.createNode(file, parentPath, parentNode);
      nodes.push(node);
    }

    return nodes;
  }

  /**
   * 创建节点对象
   */
  createNode(item, parentPath, parentNode) {
    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
    const path = parentPath ? parentPath + ' / ' + item.name : item.name;

    const node = {
      id: item.id,
      name: item.name,
      mimeType: item.mimeType,
      isFolder,
      path,
      parent: parentNode || null,
      children: [],
      webViewLink: item.webViewLink || (isFolder
        ? `https://drive.google.com/drive/folders/${item.id}`
        : `https://drive.google.com/file/d/${item.id}/view`),
      webContentLink: item.webContentLink || null,
      downloadLink: null
    };

    node.downloadLink = this.buildDownloadLink(item, isFolder, node.webViewLink);
    this.nodeMap[node.id] = node;
    return node;
  }

  /**
   * 构建下载链接
   */
  buildDownloadLink(item, isFolder, fallbackViewLink) {
    // 纯前端 + API Key 无法打包下载整个文件夹，只能在 Drive 页面压缩下载
    if (isFolder) return null;

    // Google Docs / Sheets / Slides 等在线文档，匿名 API 不能直接导出，只能跳转查看
    if (item.mimeType && item.mimeType.startsWith('application/vnd.google-apps.')) {
      return fallbackViewLink || item.webViewLink || `https://drive.google.com/file/d/${item.id}/view`;
    }

    // 普通二进制文件优先使用 webContentLink
    if (item.webContentLink) return item.webContentLink;

    // 退化为 uc?export=download
    return `https://drive.google.com/uc?export=download&id=${item.id}`;
  }

  /**
   * 渲染（可选）目录树
   */
  renderTree(nodes, container) {
    const ul = document.createElement('ul');

    nodes.forEach(node => {
      const li = document.createElement('li');
      li.className = 'drive-node';

      const row = this.createNodeRow(node);
      li.appendChild(row);

      if (node.isFolder && node.children && node.children.length > 0) {
        const childUl = this.renderTree(node.children, null);
        childUl.style.display = 'none';
        li.appendChild(childUl);

        row.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = childUl.style.display !== 'none';
          childUl.style.display = isOpen ? 'none' : 'block';
          const chevron = row.querySelector('.chevron');
          if (chevron) {
            chevron.textContent = isOpen ? '▸' : '▾';
          }
          this.openFolder(node, row);
        });
      } else if (node.isFolder) {
        // 空文件夹
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          const chevron = row.querySelector('.chevron');
          if (chevron) {
            chevron.textContent = chevron.textContent === '▸' ? '▾' : '▸';
          }
          this.openFolder(node, row);
        });
      } else {
        // 文件
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openFile(node, row);
        });
      }

      ul.appendChild(li);
    });

    if (container) {
      container.innerHTML = '';
      container.appendChild(ul);
    }

    return ul;
  }

  /**
   * 创建树节点行
   */
  createNodeRow(node) {
    const row = document.createElement('div');
    row.className = 'drive-node-row';
    if (node.isFolder) row.classList.add('folder-label');
    row.dataset.id = node.id;

    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = node.isFolder ? '▸' : '';
    row.appendChild(chevron);

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = node.isFolder ? '📁' : '📄';
    row.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = node.name;
    row.appendChild(name);

    return row;
  }

  /**
   * 进入“只预览模式”：隐藏文件网格，预览占据主要高度
   */
  enterPreviewMode() {
    if (this.mainPanelEl) {
      this.mainPanelEl.classList.add('preview-only');
    }
    if (this.fileGridContainer) {
      this.fileGridContainer.style.display = 'none';
    }
    if (this.backBtn) {
      this.backBtn.style.display = 'inline-flex';
    }
  }

  /**
   * 退出“只预览模式”
   * resetPreview = true 时顺便清空 iframe
   */
  exitPreviewMode(resetPreview = false) {
    if (this.mainPanelEl) {
      this.mainPanelEl.classList.remove('preview-only');
    }
    if (this.fileGridContainer) {
      this.fileGridContainer.style.display = '';
    }
    if (this.backBtn) {
      this.backBtn.style.display = 'none';
    }
    if (resetPreview && this.previewFrame && this.previewFallback) {
      this.previewFrame.src = '';
      this.previewFrame.style.display = 'none';
      this.previewFallback.style.display = 'flex';
    }
  }

  /**
   * 打开文件夹（刷新文件网格）
   */
  openFolder(node, rowElement) {
    // 每次进入文件夹，先退出“只预览模式”
    this.exitPreviewMode(true);

    // 左侧树的高亮逻辑（虽然现在看不到）
    if (this.currentActiveRow) {
      this.currentActiveRow.classList.remove('active');
    }
    if (rowElement) {
      this.currentActiveRow = rowElement;
      this.currentActiveRow.classList.add('active');
    } else {
      this.currentActiveRow = null;
    }

    this.currentFolderNode = node;

    if (this.currentFileNameEl) {
      this.currentFileNameEl.textContent = node.name;
    }
    if (this.currentFilePathEl) {
      this.currentFilePathEl.textContent = node.path || node.name;
    }

    // 文件夹：隐藏下载按钮，只显示“在 Drive 中打开”（用于整夹打包下载等）
    if (this.downloadBtn) {
      this.downloadBtn.style.display = 'none';
    }
    if (this.openInDriveLink) {
      if (node.webViewLink) {
        this.openInDriveLink.style.display = 'inline-flex';
        this.openInDriveLink.href = node.webViewLink;
      } else {
        this.openInDriveLink.style.display = 'none';
      }
    }

    this.renderFileGrid(node);
    this.updateBreadcrumb(node);
  }

  /**
   * 渲染文件网格
   */
  renderFileGrid(folderNode) {
    if (!this.fileGridContainer) return;

    this.fileGridContainer.innerHTML = '';

    if (!folderNode || !folderNode.children || folderNode.children.length === 0) {
      this.fileGridContainer.innerHTML = '<p class="drive-empty">这个文件夹是空的。</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    const children = [...folderNode.children].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name, 'zh-Hans-CN');
    });

    children.forEach(child => {
      const item = document.createElement('div');
      item.className = 'drive-item';
      item.dataset.id = child.id;

      const icon = document.createElement('div');
      icon.className = 'drive-item-icon';
      icon.textContent = child.isFolder ? '📁' : '📄';
      item.appendChild(icon);

      const name = document.createElement('div');
      name.className = 'drive-item-name';
      name.textContent = child.name;
      item.appendChild(name);

      const meta = document.createElement('div');
      meta.className = 'drive-item-meta';
      meta.textContent = child.isFolder ? '文件夹' : this.getFileExtension(child.name);
      item.appendChild(meta);

      item.addEventListener('click', () => {
        if (child.isFolder) {
          this.openFolder(child, null);
        } else {
          this.openFile(child, null);
        }
      });

      fragment.appendChild(item);
    });

    this.fileGridContainer.appendChild(fragment);
  }

  /**
   * 更新面包屑
   */
  updateBreadcrumb(node) {
    if (!this.breadcrumbEl || !node) return;

    const chain = [];
    let cur = node;
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent;
    }

    this.breadcrumbEl.innerHTML = '';

    chain.forEach((n, idx) => {
      const span = document.createElement('span');
      span.textContent = n.name;
      span.className = 'breadcrumb-item';
      if (idx === chain.length - 1) {
        span.classList.add('active');
      } else {
        span.addEventListener('click', () => {
          this.openFolder(n, null);
        });
      }
      this.breadcrumbEl.appendChild(span);

      if (idx < chain.length - 1) {
        const sep = document.createElement('span');
        sep.textContent = '/';
        sep.className = 'breadcrumb-separator';
        this.breadcrumbEl.appendChild(sep);
      }
    });
  }

  /**
   * 提取文件扩展名
   */
  getFileExtension(name) {
    if (!name) return '文件';
    const idx = name.lastIndexOf('.');
    if (idx === -1) return '文件';
    return name.substring(idx + 1).toLowerCase();
  }

  /**
   * 打开文件进行预览（进入只预览模式）
   */
  openFile(node, rowElement) {
    // 左侧树高亮（如果以后恢复树）
    if (rowElement) {
      if (this.currentActiveRow) {
        this.currentActiveRow.classList.remove('active');
      }
      this.currentActiveRow = rowElement;
      this.currentActiveRow.classList.add('active');
    }

    if (this.currentFileNameEl) {
      this.currentFileNameEl.textContent = node.name;
    }
    if (this.currentFilePathEl) {
      this.currentFilePathEl.textContent = node.path || node.name;
    }

    // 进入“只预览模式”：隐藏文件图标区域，只留下大预览
    this.enterPreviewMode();

    // 面包屑仍然代表当前所在的文件夹
    if (this.breadcrumbEl) {
      this.updateBreadcrumb(node.parent || this.currentFolderNode || this.rootNode || node);
    }

    let viewLink = node.webViewLink || `https://drive.google.com/file/d/${node.id}/view`;
    const previewLink = viewLink.replace('/view', '/preview');

    if (this.previewFrame && this.previewFallback) {
      this.previewFrame.style.display = 'block';
      this.previewFallback.style.display = 'none';
      this.previewFrame.src = previewLink;
    }

    if (this.downloadBtn) {
      if (node.downloadLink) {
        this.downloadBtn.style.display = 'inline-flex';
        this.downloadBtn.href = node.downloadLink;
      } else {
        this.downloadBtn.style.display = 'none';
      }
    }

    if (this.openInDriveLink) {
      if (viewLink) {
        this.openInDriveLink.style.display = 'inline-flex';
        this.openInDriveLink.href = viewLink;
      } else {
        this.openInDriveLink.style.display = 'none';
      }
    }
  }

  /**
   * 显示错误
   */
  showError(message) {
    if (this.treeContainer) {
      this.treeContainer.innerHTML = `<p style="color:#ffb3b3;font-size:0.85rem;">${message}</p>`;
    }
    if (this.fileGridContainer) {
      this.fileGridContainer.innerHTML = `<p style="color:#ffb3b3;font-size:0.85rem;">${message}</p>`;
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.currentActiveRow = null;
    this.isInitialized = false;
    this.rootNode = null;
    this.currentFolderNode = null;
    this.nodeMap = {};
  }
}

window.DriveExplorer = DriveExplorer;
