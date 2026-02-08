// like_github 主题核心JavaScript功能

(function() {
  'use strict';
  
  // 主题初始化
  const ThemeManager = {
    // 初始化主题
    init: function() {
      this.initThemeToggle();
      this.initMobileMenu();
      this.initBackToTop();
      this.initSearch();
      this.initCodeCopy();
      this.initSmoothScroll();
      this.initImageZoom();
      this.initDarkModeObserver();
      this.initCategoryExpand();
      this.initToc();
    },
    
    // 主题切换功能
    initThemeToggle: function() {
      const themeToggle = document.querySelector('.theme-toggle');
      const mobileThemeToggle = document.querySelector('.mobile-theme-toggle');
      const themeIcon = document.getElementById('themeIcon');
      
      const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('github-theme', newTheme);
        
        // 更新图标
        if (themeIcon) {
          themeIcon.className = newTheme === 'light' ? 'ri-sun-line' : 'ri-moon-line';
        }
        
        // 更新主题颜色meta标签
        this.updateThemeColor(newTheme);
      };
      
      if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
      }
      
      if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
      }
    },
    
    // 更新主题颜色meta标签
    updateThemeColor: function(theme) {
      const themeColor = theme === 'dark' ? '#0d1117' : '#ffffff';
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = themeColor;
    },
    
    // 移动端菜单功能
    initMobileMenu: function() {
      const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
      const mobileClose = document.querySelector('.mobile-close');
      const mobileMenu = document.querySelector('.mobile-menu');
      
      if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
          mobileMenu.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
      }
      
      if (mobileClose) {
        mobileClose.addEventListener('click', () => {
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
      
      // 点击遮罩关闭菜单
      if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
          if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
          }
        });
      }
    },
    
    // 返回顶部功能
    initBackToTop: function() {
      const backToTop = document.querySelector('.back-to-top');
      if (backToTop) {
        // 滚动监听
        window.addEventListener('scroll', () => {
          if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
          } else {
            backToTop.classList.remove('visible');
          }
        });
        
        // 点击返回顶部
        backToTop.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
    },
    
    // 搜索功能
    initSearch: function() {
      const searchToggle = document.querySelector('.search-toggle');
      const searchModal = document.querySelector('.search-modal');
      const searchClose = document.querySelector('.search-close');
      const searchInput = document.querySelector('.search-input');
      
      if (searchToggle && searchModal) {
        // 打开搜索
        searchToggle.addEventListener('click', () => {
          searchModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          setTimeout(() => {
            if (searchInput) searchInput.focus();
          }, 100);
        });
        
        // 关闭搜索
        if (searchClose) {
          searchClose.addEventListener('click', () => {
            searchModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          });
        }
        
        // ESC键关闭搜索
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && searchModal.getAttribute('aria-hidden') === 'false') {
            searchModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          }
        });
        
        // 搜索实现（简单的本地搜索）
        if (searchInput) {
          searchInput.addEventListener('input', this.debounce((e) => {
            this.performSearch(e.target.value);
          }, 300));
        }
      }
    },
    
    // 执行搜索
    performSearch: function(query) {
      if (!query.trim()) {
        this.clearSearchResults();
        return;
      }
      
      const resultsContainer = document.querySelector('.search-results');
      if (!resultsContainer) return;
      
      // 简单的本地搜索实现
      const posts = Array.from(document.querySelectorAll('.post-item, .archive-post'));
      const results = [];
      
      posts.forEach(post => {
        const title = post.querySelector('h2 a, .archive-post-title');
        const content = post.textContent || '';
        
        if (title && (title.textContent.toLowerCase().includes(query.toLowerCase()) || 
                     content.toLowerCase().includes(query.toLowerCase()))) {
          results.push({
            title: title.textContent,
            url: title.href,
            excerpt: content.substring(0, 150) + '...'
          });
        }
      });
      
      this.displaySearchResults(results);
    },
    
    // 显示搜索结果
    displaySearchResults: function(results) {
      const resultsContainer = document.querySelector('.search-results');
      if (!resultsContainer) return;
      
      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">没有找到相关结果</div>';
        return;
      }
      
      const html = results.map(result => `
        <div class="search-result-item">
          <h3 class="search-result-title">
            <a href="${result.url}">${result.title}</a>
          </h3>
          <p class="search-result-excerpt">${result.excerpt}</p>
        </div>
      `).join('');
      
      resultsContainer.innerHTML = html;
    },
    
    // 清除搜索结果
    clearSearchResults: function() {
      const resultsContainer = document.querySelector('.search-results');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      }
    },
    
    // 防抖函数
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // 代码复制功能
    initCodeCopy: function() {
      document.querySelectorAll('pre code').forEach(block => {
        const pre = block.parentNode;
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.innerHTML = '<i class="ri-file-copy-line"></i>';
        copyButton.title = '复制代码';
        
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(block.textContent).then(() => {
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="ri-check-line"></i>';
            copyButton.classList.add('copied');
            setTimeout(() => {
              copyButton.innerHTML = originalHTML;
              copyButton.classList.remove('copied');
            }, 2000);
          });
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
      });
    },
    
    // 平滑滚动
    initSmoothScroll: function() {
      // 为所有内部链接添加平滑滚动
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    },
    
    // 图片缩放功能
    initImageZoom: function() {
      const images = document.querySelectorAll('.post-body img, .page-body img');
      
      images.forEach(img => {
        // 为图片添加点击放大功能
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
          this.zoomImage(img);
        });
        
        // 添加键盘支持
        img.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.zoomImage(img);
          }
        });
        
        img.setAttribute('tabindex', '0');
      });
    },
    
    // 图片放大功能
    zoomImage: function(img) {
      // 创建遮罩层
      const overlay = document.createElement('div');
      overlay.className = 'image-zoom-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        cursor: zoom-out;
      `;
      
      // 创建放大图片
      const zoomedImage = document.createElement('img');
      zoomedImage.src = img.src;
      zoomedImage.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
      `;
      
      overlay.appendChild(zoomedImage);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      
      // 关闭功能
      const closeZoom = () => {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
      };
      
      overlay.addEventListener('click', closeZoom);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeZoom();
        }
      });
    },
    
    // 监听系统深色模式变化
    initDarkModeObserver: function() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // 如果用户没有手动设置主题，跟随系统偏好
        const savedTheme = localStorage.getItem('github-theme');
        if (!savedTheme) {
          document.documentElement.setAttribute('data-theme', 'dark');
          this.updateThemeColor('dark');
        }
      }
      
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem('github-theme');
        if (!savedTheme) {
          // 只有当用户没有手动设置主题时才跟随系统
          const newTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', newTheme);
          this.updateThemeColor(newTheme);
        }
      });
    },
    
    // 分类展开功能
    initCategoryExpand: function() {
      document.addEventListener('click', (e) => {
        const button = e.target.closest('.view-all-btn');
        if (button) {
           e.preventDefault();
           
           const targetId = button.getAttribute('data-target');
           const targetList = document.getElementById(targetId);
           
           if (targetList) {
             const isExpanded = button.classList.contains('expanded');
             const expandText = button.getAttribute('data-text-expand');
             const collapseText = button.getAttribute('data-text-collapse');
             
             if (isExpanded) {
               // 收起逻辑
               targetList.style.height = targetList.scrollHeight + 'px';
               targetList.offsetHeight; // 强制重排
               
               targetList.style.height = '0px';
               targetList.style.overflow = 'hidden';
               targetList.style.transition = 'height 0.3s ease';
               
               button.classList.remove('expanded');
               button.textContent = expandText;
               
               setTimeout(() => {
                   if (!button.classList.contains('expanded')) {
                       targetList.style.display = 'none';
                   }
               }, 300);
             } else {
               // 展开逻辑
               button.classList.add('loading');
               const loadingText = document.documentElement.lang === 'zh-CN' ? '加载中...' : 'Loading...';
               const originalText = button.textContent;
               // button.textContent = loadingText; // 可选：显示加载中
               
               // 稍微延迟以显示加载状态（如果是异步加载）
               // 这里因为是本地展开，直接执行
               requestAnimationFrame(() => {
                   button.classList.remove('loading');
                   targetList.style.display = 'block';
                   targetList.style.overflow = 'hidden';
                   targetList.style.height = '0px';
                   targetList.style.transition = 'height 0.3s ease';
                   
                   targetList.offsetHeight; // 强制重排
                   
                   targetList.style.height = targetList.scrollHeight + 'px';
                   
                   button.classList.add('expanded');
                   button.textContent = collapseText;
                   
                   setTimeout(() => {
                       if (button.classList.contains('expanded')) {
                           targetList.style.height = 'auto';
                           targetList.style.overflow = 'visible';
                       }
                   }, 300);
               });
             }
           }
        }
      });
    },

    // 目录滚动监听
    initToc: function() {
      const tocWidget = document.querySelector('.toc-widget');
      if (!tocWidget) return;

      const tocLinks = document.querySelectorAll('.toc-link');
      const sections = [];
      
      // 收集所有章节标题
      tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          // 处理中文 ID 解码
          const id = decodeURIComponent(href.substring(1));
          let target = document.getElementById(id);
          
          // 如果找不到目标，尝试查找 name 属性（兼容旧版浏览器或某些生成器）
          if (!target) {
             target = document.getElementsByName(id)[0];
          }
          
          if (target) {
            sections.push({
              link: link,
              target: target
            });
            
            // 添加点击事件处理
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const offset = 80; // 头部高度偏移
              const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
              
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
              
              // 更新 URL hash，但不触发默认跳转
              history.pushState(null, null, href);
            });
          }
        }
      });

      if (sections.length === 0) return;

      // 监听滚动
      const scrollHandler = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        // 顶部偏移量，留出头部高度
        const offset = 100; 

        let currentSection = null;

        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          if (section.target.offsetTop <= scrollTop + offset) {
            currentSection = section;
          } else {
            break;
          }
        }

        // 移除所有激活状态
        document.querySelectorAll('.toc-link').forEach(link => {
          link.classList.remove('active');
        });
        
        // 移除所有子菜单展开状态
        document.querySelectorAll('.toc-child').forEach(child => {
          child.classList.remove('active');
        });

        if (currentSection) {
          currentSection.link.classList.add('active');
          
          // 展开父级菜单
          let parent = currentSection.link.parentElement;
          while (parent && !parent.classList.contains('toc-content')) {
             if (parent.classList.contains('toc-child')) {
               parent.classList.add('active');
               // 同时也激活父级链接
               const parentLi = parent.parentElement;
               if (parentLi) {
                 const parentLink = parentLi.querySelector('.toc-link');
                 if (parentLink) parentLink.classList.add('active');
               }
             }
             parent = parent.parentElement;
          }
        }
      };

      window.addEventListener('scroll', scrollHandler);
      // 初始化执行一次
      scrollHandler();
    }
  };
  
  // 初始化
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
  });
  
})();
