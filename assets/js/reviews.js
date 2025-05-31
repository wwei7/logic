
// 當網頁載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
  // Firebase 設定
  const firebaseConfig = {
    apiKey: "AIzaSyBXN3ElXZ0S888oGjbcqlwElWXLT1LHKX8",
    authDomain: "game-ecc00.firebaseapp.com",
    databaseURL: "https://game-ecc00-default-rtdb.firebaseio.com",
    projectId: "game-ecc00",
    storageBucket: "game-ecc00.firebasestorage.app",
    messagingSenderId: "547677273823",
    appId: "1:547677273823:web:547b175c60167468feb36a",
    measurementId: "G-WV1H7HGZF0"
  };
  
  // 初始化 Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // 取得 Firebase 服務實例
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // 全域變數
  let currentUser = null;
  let currentReviewId = null;
  
  // 每頁顯示的評論數量
  const REVIEWS_PER_PAGE = 9;
  let currentPage = 1;
  let totalPages = 1;
  let allReviews = [];
  
  // DOM 元素
  const signinBtn = document.getElementById('signin-btn');
  const signupBtn = document.getElementById('signup-btn');
  const signoutBtn = document.getElementById('signout-btn');
  const headerSigninBtn = document.getElementById('header-signin-btn');
  const headerSignupBtn = document.getElementById('header-signup-btn');
  const headerSignoutBtn = document.getElementById('header-signout-btn');
  const authMessage = document.getElementById('auth-message');
  const authForm = document.getElementById('auth-form');
  const userProfile = document.getElementById('user-profile');
  const userProfileHeader = document.getElementById('user-profile-header');
  const authHeaderButtons = document.getElementById('auth-header-buttons');
  const myReviewsContainer = document.getElementById('my-reviews-container');
  const authContainer = document.getElementById('auth-container');
  const saveReviewChangesBtn = document.getElementById('saveReviewChanges');
  const confirmDeleteReviewBtn = document.getElementById('confirmDeleteReview');
  const reviewSort = document.getElementById('review-sort');
  const reviewFilter = document.getElementById('review-filter');
  const reviewSearch = document.getElementById('review-search');
  const reviewSearchBtn = document.getElementById('review-search-btn');
  const reviewPagination = document.getElementById('review-pagination');

  window.loadUserReviews = loadUserReviews;

  // 修改評論中的星星評分 (編輯表單中)
  const editStars = document.querySelectorAll('.edit-star');
  const editRatingField = document.getElementById('edit-rating');

  // 啟動 AOS 動畫
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });

  // =====================================
  // 使用者認證相關功能
  // =====================================
  
  // 監聽使用者登入狀態變更
  auth.onAuthStateChanged(user => {
    if (user) {
      // 使用者已登入
      currentUser = user;
      updateUIForAuthenticatedUser(user);
      loadUserReviews(user.uid);
    } else {
      // 使用者已登出
      currentUser = null;
      updateUIForUnauthenticatedUser();
    }
  });
  
  // 更新 UI 為已認證狀態
  function updateUIForAuthenticatedUser(user) {
    // 更新主頁面的使用者資訊
    authMessage.innerHTML = `已登入為 <strong>${user.email}</strong>`;
    authForm.style.display = 'none';
    myReviewsContainer.style.display = 'block';

    
    // 更新使用者資料
    const displayName = user.displayName || user.email.split('@')[0];
    document.getElementById('user-name').textContent = displayName;
    document.getElementById('user-email').textContent = user.email;
    
    if (user.photoURL) {
      document.getElementById('user-avatar').src = user.photoURL;
    }
    
    // 更新頂部導航欄的使用者資訊
    document.getElementById('user-name-header').textContent = displayName;
    
    if (user.photoURL) {
      document.getElementById('user-avatar-header').src = user.photoURL;
    }
    
    // 顯示使用者資訊，隱藏登入按鈕
    userProfileHeader.style.display = 'block';
    authHeaderButtons.style.display = 'none';
  }
  
  // 更新 UI 為未認證狀態
  function updateUIForUnauthenticatedUser() {
    // 更新主頁面
    authMessage.innerHTML = '請登入以管理您的評論';
    authForm.style.display = 'block';
    userProfile.style.display = 'none';
    myReviewsContainer.style.display = 'none';
    authContainer.classList.remove('mb-4');
    
    // 更新頂部導航欄
    userProfileHeader.style.display = 'none';
    authHeaderButtons.style.display = 'block';
  }
  


  // =====================================
  // 評論載入與顯示功能
  // =====================================
  
  // 載入社群評論
  function loadCommunityReviews(sort = 'newest', filter = 'all', search = '', page = 1) {
    const reviewsContainer = document.getElementById('all-reviews-container');
    reviewsContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">載入中...</span></div><p class="mt-2">正在載入評論...</p></div>';
    
    // 建立查詢
    let query = db.collection('reviews');
    
    
    // 套用排序
    switch(sort) {
      case 'newest':
        query = query.orderBy('timestamp', 'desc');
        break;
      case 'oldest':
        query = query.orderBy('timestamp', 'asc');
        break;
      case 'highest':
        query = query.orderBy('rating', 'desc');
        break;
      case 'lowest':
        query = query.orderBy('rating', 'asc');
        break;
      default:
        query = query.orderBy('timestamp', 'desc');
    }
    
    // 執行查詢並處理結果
    query.get().then((snapshot) => {
      allReviews = [];
      snapshot.forEach((doc) => {
        allReviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // 套用評分過濾 - 移到這裡，在資料載入後進行過濾
        if (filter !== 'all') {
        allReviews = allReviews.filter(review => review.rating === parseInt(filter));
        }
      
      // 套用搜尋過濾
      if (search) {
        const searchLower = search.toLowerCase();
        allReviews = allReviews.filter(review => 
          review.name?.toLowerCase().includes(searchLower) || 
          review.message?.toLowerCase().includes(searchLower) ||
          review.role?.toLowerCase().includes(searchLower)
        );
      }
      
      // 處理空結果
      if (allReviews.length === 0) {
        reviewsContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="bi bi-chat-square-text fs-1 text-muted"></i>
            <p class="mt-3">找不到評論</p>
          </div>
        `;
        reviewPagination.innerHTML = '';
        return;
      }
      
      // 計算分頁資訊
      totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
      currentPage = page > totalPages ? 1 : page;
      
      // 獲取當前頁面的評論
      const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
      const endIndex = startIndex + REVIEWS_PER_PAGE;
      const currentPageReviews = allReviews.slice(startIndex, endIndex);
      
      // 渲染評論
      renderReviews(currentPageReviews, reviewsContainer);
      
      // 生成分頁控制項
      generatePagination(currentPage, totalPages);
    }).catch(error => {
      console.error("載入評論時發生錯誤：", error);
      reviewsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="alert alert-danger">
            載入評論時發生錯誤，請稍後再試。
          </div>
        </div>
      `;
    });
  }
  
  // 渲染評論列表
  function renderReviews(reviews, container) {
    container.innerHTML = '';
    
    reviews.forEach(review => {
      const reviewDate = review.timestamp ? new Date(review.timestamp.toDate()).toLocaleDateString('zh-TW') : '最近';
      const stars = getStarRating(review.rating);
      
      container.innerHTML += `
        <div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up">
          <div class="testimonial-item h-100 review-card" data-review-id="${review.id}">
            <div class="d-flex align-items-center mb-3">
              <img src="assets/img/avatar-placeholder.png" class="testimonial-img me-3" alt="">
              <div>
                <h3>${review.name || '匿名'}</h3>
                <h4>${review.role || '顧客'}</h4>
              </div>
            </div>
            <div class="stars mb-2">
              ${stars}
            </div>
            <p>
            <span class="quote-icon-left">&ldquo;</span>
            ${review.message}
            <span class="quote-icon-right">&rdquo;</span>
            </p>
            <div class="text-muted small mt-3">發佈於 ${reviewDate}</div>
            
            <!-- 評論回覆區域 -->
            <div class="comments-section" style="display:none;">
              <div class="comments-list"></div>
              
              <!-- 加載更多按鈕 -->
              <div class="text-center mt-2 load-more-comments" style="display:none;">
                <button class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-arrow-down-circle me-1"></i> 加載更多回覆
                </button>
              </div>
              
              <!-- 無回覆時的提示 -->
              <div class="text-center text-muted small mt-2 no-comments-message" style="display:none;">
                此評論尚無回覆。
              </div>
            </div>
            
            <!-- 回覆表單 -->
            <div class="reply-form" style="display:none; margin-top: 1rem;">
              <textarea class="form-control reply-input" rows="2" placeholder="撰寫您的回覆..."></textarea>
              <div class="text-end mt-2">
                <button class="btn btn-primary btn-sm submit-reply-btn">
                  <i class="bi bi-send me-1"></i> 發送回覆
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  // 生成分頁控制項
  function generatePagination(currentPage, totalPages) {
    reviewPagination.innerHTML = '';
    
    if (totalPages <= 1) {
      return;
    }
    
    // 上一頁按鈕
    const prevBtn = document.createElement('li');
    prevBtn.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = `
      <button class="page-link" aria-label="上一頁" ${currentPage === 1 ? 'disabled' : ''}>
        <span aria-hidden="true">&laquo;</span>
      </button>
    `;
    
    if (currentPage > 1) {
      prevBtn.querySelector('button').addEventListener('click', () => {
        loadCommunityReviews(
          reviewSort.value,
          reviewFilter.value,
          reviewSearch.value,
          currentPage - 1
        );
      });
    }
    
    reviewPagination.appendChild(prevBtn);
    
    // 頁碼按鈕
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('li');
      pageBtn.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageBtn.innerHTML = `
        <button class="page-link">${i}</button>
      `;
      
      pageBtn.addEventListener('click', () => {
        if (i !== currentPage) {
          loadCommunityReviews(
            reviewSort.value,
            reviewFilter.value,
            reviewSearch.value,
            i
          );
        }
      });
      
      reviewPagination.appendChild(pageBtn);
    }
    
    // 下一頁按鈕
    const nextBtn = document.createElement('li');
    nextBtn.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = `
      <button class="page-link" aria-label="下一頁" ${currentPage === totalPages ? 'disabled' : ''}>
        <span aria-hidden="true">&raquo;</span>
      </button>
    `;
    
    if (currentPage < totalPages) {
      nextBtn.querySelector('button').addEventListener('click', () => {
        loadCommunityReviews(
          reviewSort.value,
          reviewFilter.value,
          reviewSearch.value,
          currentPage + 1
        );
      });
    }
    
    reviewPagination.appendChild(nextBtn);
  }
  
  // 載入使用者評論
  function loadUserReviews(userId) {
    console.log("開始載入使用者評論，userId:", userId);
    if (!userId) {
        console.error("沒有提供 userId");
        return;
    }
    const userReviewsList = document.getElementById('user-reviews-list');
    const noReviewsMessage = document.getElementById('no-reviews-message');
    
    if (!userReviewsList) {
    console.error("找不到 user-reviews-list 元素");
    return;
    }
    if (!noReviewsMessage) {
        console.error("找不到 no-reviews-message 元素");
    }

    userReviewsList.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">載入中...</span></div><p class="mt-2">正在載入您的評論...</p></div>';
    
    db.collection('reviews')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          userReviewsList.innerHTML = '';
          noReviewsMessage.style.display = 'block';
          return;
        }

        if (noReviewsMessage) noReviewsMessage.style.display = 'none';
        userReviewsList.innerHTML = '';
        
        snapshot.forEach((doc) => {
          const review = doc.data();
const reviewDate = review.timestamp ? new Date(review.timestamp.toDate()).toLocaleDateString('zh-TW') : '最近';
      const stars = getStarRating(review.rating);
      
      container.innerHTML += `
        <div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up">
          <div class="testimonial-item h-100 review-card" data-review-id="${review.id}">
            <div class="d-flex align-items-center mb-3">
              <img src="assets/img/avatar-placeholder.png" class="testimonial-img me-3" alt="">
              <div>
                <h3>${review.name || '匿名'}</h3>
                <h4>${review.role || '顧客'}</h4>
              </div>
            </div>
            <div class="stars mb-2">
              ${stars}
            </div>
            <p>
            <span class="quote-icon-left">&ldquo;</span>
            ${review.message}
            <span class="quote-icon-right">&rdquo;</span>
            </p>
            <div class="text-muted small mt-3">發佈於 ${reviewDate}</div>
            
            <!-- 評論操作按鈕 -->
            <div class="review-actions mt-2">
              <button class="btn btn-sm btn-outline-primary reply-review-btn">
                <i class="bi bi-chat me-1"></i> 回覆
              </button>
              <span class="comments-count ms-2 small text-muted">0 回覆</span>
            </div>
            
            <!-- 評論回覆區域 -->
            <div class="comments-section" style="display:none;">
              <div class="comments-list"></div>
              
              <!-- 加載更多按鈕 -->
              <div class="text-center mt-2 load-more-comments" style="display:none;">
                <button class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-arrow-down-circle me-1"></i> 加載更多回覆
                </button>
              </div>
              
              <!-- 無回覆時的提示 -->
              <div class="text-center text-muted small mt-2 no-comments-message" style="display:none;">
                此評論尚無回覆。
              </div>
            </div>
            
            <!-- 回覆表單 -->
            <div class="reply-form" style="display:none; margin-top: 1rem;">
              <textarea class="form-control reply-input" rows="2" placeholder="撰寫您的回覆..."></textarea>
              <div class="text-end mt-2">
                <button class="btn btn-primary btn-sm submit-reply-btn">
                  <i class="bi bi-send me-1"></i> 發送回覆
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
          
        });
        
        // 為編輯和刪除按鈕添加事件監聽
        document.querySelectorAll('.edit-review-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-id');
            openEditReviewModal(reviewId);
          });
        });
        
        document.querySelectorAll('.delete-review-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-id');
            openDeleteReviewModal(reviewId);
          });
        });
      })
      .catch(error => {
        console.error("載入使用者評論時發生錯誤：", error);
        userReviewsList.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger">
              載入評論失敗，請稍後再試。
            </div>
          </div>
        `;
      });
  }

  // =====================================
  // 評論編輯與刪除功能
  // =====================================
  
  // 設置星星評分點擊事件
  editStars.forEach(star => {
    star.addEventListener('click', function() {
      const rating = this.getAttribute('data-rating');
      editRatingField.value = rating;
      
      // 更新星星 UI
      editStars.forEach(s => {
        const sRating = s.getAttribute('data-rating');
        if (sRating <= rating) {
          s.classList.remove('bi-star');
          s.classList.add('bi-star-fill');
        } else {
          s.classList.remove('bi-star-fill');
          s.classList.add('bi-star');
        }
      });
    });
  });
  
  // 打開編輯評論模態框
  function openEditReviewModal(reviewId) {
    currentReviewId = reviewId;
    
    // 獲取評論資料
    db.collection('reviews').doc(reviewId).get()
      .then(doc => {
        if (doc.exists) {
          const review = doc.data();
          
          // 填充表單
          document.getElementById('edit-review-id').value = reviewId;
          document.getElementById('edit-message').value = review.message || '';
          
          // 設置星星評分
          const rating = review.rating || 0;
          editRatingField.value = rating;
          
          editStars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
              star.classList.remove('bi-star');
              star.classList.add('bi-star-fill');
            } else {
              star.classList.remove('bi-star-fill');
              star.classList.add('bi-star');
            }
          });
          
          // 顯示模態框
          const editModal = new bootstrap.Modal(document.getElementById('editReviewModal'));
          editModal.show();
        } else {
          console.error("找不到評論");
          showAlert('找不到評論，它可能已被刪除', 'warning');
        }
      })
      .catch(error => {
        console.error("獲取評論時發生錯誤：", error);
        showAlert(`載入評論失敗：${error.message}`, 'danger');
      });
  }
  
  // 打開刪除評論確認模態框
  function openDeleteReviewModal(reviewId) {
    currentReviewId = reviewId;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteReviewModal'));
    deleteModal.show();
  }
  
  // 儲存評論變更
  saveReviewChangesBtn.addEventListener('click', function() {
    if (!currentReviewId || !currentUser) return;
    
    const editMessage = document.getElementById('edit-message').value;
    const editRating = parseInt(editRatingField.value);
    
    if (!editMessage || editRating < 1) {
      showAlert("請提供評分和評論內容", 'warning');
      return;
    }
    
    db.collection('reviews').doc(currentReviewId).update({
      message: editMessage,
      rating: editRating,
      lastEdited: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      // 關閉模態框
      bootstrap.Modal.getInstance(document.getElementById('editReviewModal')).hide();
      
      // 重新載入使用者評論
      loadUserReviews(currentUser.uid);
      
      // 也重新載入社群評論，因為它們可能已更改
      loadCommunityReviews(
        reviewSort.value,
        reviewFilter.value,
        reviewSearch.value,
        currentPage
      );
      // 在 loadCommunityReviews 函數的最後，添加：
      initCommentFeatures();
      showAlert('評論已成功更新', 'success');
    })
    .catch(error => {
      console.error("更新評論時發生錯誤：", error);
      showAlert(`更新評論失敗：${error.message}`, 'danger');
    });
  });
  
  // 刪除評論
  confirmDeleteReviewBtn.addEventListener('click', function() {
    if (!currentReviewId || !currentUser) return;
    
    db.collection('reviews').doc(currentReviewId).delete()
      .then(() => {
        // 關閉模態框
        bootstrap.Modal.getInstance(document.getElementById('deleteReviewModal')).hide();
        
        // 重新載入使用者評論
        loadUserReviews(currentUser.uid);
        
        // 也重新載入社群評論
        loadCommunityReviews(
          reviewSort.value,
          reviewFilter.value,
          reviewSearch.value,
          currentPage
        );
        
        showAlert('評論已成功刪除', 'success');
      })
      .catch(error => {
        console.error("刪除評論時發生錯誤：", error);
        showAlert(`刪除評論失敗：${error.message}`, 'danger');
      });
  });

  // =====================================
  // 評論搜尋、排序與過濾功能
  // =====================================
  
  // 排序變更
  reviewSort.addEventListener('change', function() {
    loadCommunityReviews(
      this.value,
      reviewFilter.value,
      reviewSearch.value,
      1 // 回到第一頁
    );
  });
  
  // 過濾變更
  reviewFilter.addEventListener('change', function() {
    loadCommunityReviews(
      reviewSort.value,
      this.value,
      reviewSearch.value,
      1 // 回到第一頁
    );
  });
  
  // 搜尋按鈕點擊
  reviewSearchBtn.addEventListener('click', function() {
    loadCommunityReviews(
      reviewSort.value,
      reviewFilter.value,
      reviewSearch.value,
      1 // 回到第一頁
    );
  });
  
  // 搜尋框按 Enter
  reviewSearch.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loadCommunityReviews(
        reviewSort.value,
        reviewFilter.value,
        this.value,
        1 // 回到第一頁
      );
    }
  });

  // =====================================
  // 工具函數
  // =====================================
  
  // 生成星星評分 HTML
  function getStarRating(rating) {
    rating = parseInt(rating) || 0;
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
      stars += i <= rating 
        ? '<i class="bi bi-star-fill"></i>' 
        : '<i class="bi bi-star"></i>';
    }
    
    return stars;
  }
  
  // 顯示提示訊息
  function showAlert(message, type = 'success') {
    // 檢查是否已存在 Alert 容器，如果沒有則創建
    let alertContainer = document.querySelector('.alert-container');
    
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.className = 'alert-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(alertContainer);
    }
    
    // 創建警告元素
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="關閉"></button>
    `;
    
    // 添加到容器
    alertContainer.appendChild(alertElement);
    
    // 5 秒後自動消失
    setTimeout(() => {
      if (alertElement) {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
      }
    }, 5000);
  }

  // =====================================
  // 初始化
  // =====================================
  
  // 初始載入社群評論
  loadCommunityReviews();
  
  // 切換標籤時重新載入相關評論
  document.getElementById('community-tab').addEventListener('click', () => {
    loadCommunityReviews(
      reviewSort.value,
      reviewFilter.value,
      reviewSearch.value,
      currentPage
    );
  });
  
  // 如果 URL 包含特定標籤的參考，自動切換到該標籤
  const hash = window.location.hash;
  if (hash === '#my-reviews-tab') {
    document.getElementById('my-reviews-tab').click();
  }
});

// 新增頭像上傳相關變數與函數
let avatarFile = null;
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');

// 頭像預覽功能
if (avatarUpload) {
  avatarUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // 檢查檔案大小 (最大 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showAlert('頭像大小不能超過 2MB', 'warning');
        this.value = '';
        return;
      }
      
      // 檢查檔案類型
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        showAlert('請上傳 JPG 或 PNG 格式的頭像', 'warning');
        this.value = '';
        return;
      }
      
      avatarFile = file;
      const reader = new FileReader();
      
      reader.onload = function(e) {
        avatarPreview.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
    }
  });
}

/*
// 修改註冊功能，加入頭像上傳
signupBtn.addEventListener('click', async () => {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  // 基本驗證
  if (!email || !password) {
    showAlert('請輸入電子郵件和密碼', 'danger');
    return;
  }
  
  if (password.length < 6) {
    showAlert('密碼必須至少為 6 個字符', 'danger');
    return;
  }
  
  try {
    // 執行註冊
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // 上傳頭像（如果有）
    let photoURL = null;
    if (avatarFile) {
      photoURL = await uploadUserAvatar(avatarFile, user.uid);
    }
    
    // 更新使用者資料
    await user.updateProfile({
      displayName: name,
      photoURL: photoURL
    });
    
    // 在 Firestore 中儲存使用者資料
    await db.collection('users').doc(user.uid).set({
      displayName: name,
      email: user.email,
      photoURL: photoURL,
      role: '使用者',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showAlert('註冊成功！您現在已登入。', 'success');
  } catch (error) {
    console.error('註冊錯誤:', error);
    showAlert('註冊失敗：' + error.message, 'danger');
  }
});
*/
// 上傳使用者頭像的函數
async function uploadUserAvatar(file, userId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `user_avatars/${userId}_${Date.now()}.${fileExt}`;
    const storageRef = storage.ref(fileName);
    
    const uploadTask = storageRef.put(file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          // 進度更新
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('頭像上傳進度: ' + progress + '%');
        }, 
        (error) => {
          // 上傳失敗
          console.error('頭像上傳失敗:', error);
          reject(error);
        }, 
        async () => {
          // 上傳完成，獲取下載 URL
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('頭像上傳錯誤:', error);
    return null;
  }
}


// 修改評論提交功能，移除名稱與職業輸入
// 簡化評論表單，使用使用者的資料
const newReviewForm = document.getElementById('newReviewForm');
if (newReviewForm) {
  // 移除原有的名稱和職業輸入欄位
  const nameInput = document.getElementById('reviewName');
  const roleInput = document.getElementById('reviewRole');
  if (nameInput) nameInput.parentElement.remove();
  if (roleInput) roleInput.parentElement.remove();

  newReviewForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentUser) {
      showAlert('請先登入再提交評論', 'warning');
      return;
    }
    
    const rating = parseInt(document.getElementById('reviewRating').value);
    const message = document.getElementById('reviewMessage').value;
    
    if (rating === 0 || isNaN(rating)) {
      showAlert('請選擇評分', 'warning');
      return;
    }
    
    if (!message.trim()) {
      showAlert('請填寫評論內容', 'warning');
      return;
    }
    
    try {
      // 獲取用戶資料
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      // 創建新評論基本資料 (使用用戶的資料，不需要再輸入)
      const newReview = {
        name: currentUser.displayName || userData.displayName || currentUser.email.split('@')[0],
        role: userData.role || '使用者',
        rating: rating,
        message: message,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userPhotoURL: currentUser.photoURL || userData.photoURL || null,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // 先添加評論以獲取 ID
      const docRef = await db.collection('reviews').add(newReview);
      
      // 如果有照片，上傳並更新評論
      if (currentPhotoFile) {
        const photoUrl = await uploadPhoto(currentPhotoFile, docRef.id);
        if (photoUrl) {
          await docRef.update({
            photoUrl: photoUrl
          });
        }
      }
      
      // 重置表單
      newReviewForm.reset();
      document.querySelectorAll('.rating-star').forEach(s => {
        s.classList.remove('bi-star-fill');
        s.classList.add('bi-star');
      });
      document.getElementById('reviewRating').value = 0;
      photoPreview.src = 'assets/img/photo-placeholder.png';
      currentPhotoFile = null;
      
      // 顯示成功訊息
      document.getElementById('reviewSuccess').style.display = 'block';
      document.getElementById('reviewError').style.display = 'none';
      
      setTimeout(() => {
        document.getElementById('reviewSuccess').style.display = 'none';
      }, 5000);
      
      // 重新載入評論
      loadUserReviews(currentUser.uid);
      loadCommunityReviews(
        reviewSort.value,
        reviewFilter.value,
        reviewSearch.value,
        currentPage
      );
      
      showAlert('評論已成功提交！', 'success');
    } catch (error) {
      console.error("提交評論時發生錯誤：", error);
      document.getElementById('reviewError').style.display = 'block';
      document.getElementById('reviewSuccess').style.display = 'none';
      
      setTimeout(() => {
        document.getElementById('reviewError').style.display = 'none';
      }, 5000);
      
      showAlert(`提交評論失敗：${error.message}`, 'danger');
    }
  });
}

// 修改渲染評論列表函數，使用用戶頭像
function renderReviews(reviews, container) {
  container.innerHTML = '';
  
  reviews.forEach(review => {
    const reviewDate = review.timestamp ? new Date(review.timestamp.toDate()).toLocaleDateString('zh-TW') : '最近';
    const stars = getStarRating(review.rating);
    
    // 使用用戶頭像
    const avatarUrl = review.userPhotoURL || 'assets/img/avatar-placeholder.png';
    
    // 照片部分
    const photoHtml = review.photoUrl ? 
      `<div class="review-photo">
        <img src="${review.photoUrl}" class="img-fluid" alt="評論照片">
      </div>` : '';
    
    container.innerHTML += `
      <div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up">
        <div class="testimonial-item h-100">
          <div class="d-flex align-items-center mb-3">
            <img src="${avatarUrl}" class="testimonial-img me-3" alt="">
            <div>
              <h3>${review.name || '匿名'}</h3>
              <h4>${review.role || '顧客'}</h4>
            </div>
          </div>
          <div class="stars mb-2">
            ${stars}
          </div>
          <p>
            <i class="bi bi-quote quote-icon-left"></i>
            <span>${review.message}</span>
            <i class="bi bi-quote quote-icon-right"></i>
          </p>
          ${photoHtml}
          <div class="text-muted small mt-3">發佈於 ${reviewDate}</div>
        </div>
      </div>
    `;
  });
}

// 修改用戶資料顯示部分，加入頭像上傳功能
function updateUIForAuthenticatedUser(user) {
  // 更新主頁面的使用者資訊
  authMessage.innerHTML = `已登入為 <strong>${user.email}</strong>`;
  authForm.style.display = 'none';
  userProfile.style.display = 'block';
  myReviewsContainer.style.display = 'block';
  authContainer.classList.add('mb-4');
  
  // 構建個人資料區塊 (替換原有的簡單顯示)
  let userProfileHtml = `
    <div class="user-profile-section text-center" data-aos="fade-up">
      <div class="profile-avatar-preview">
        <img id="profile-avatar" src="${user.photoURL || 'assets/img/avatar-placeholder.png'}" class="img-fluid" alt="用戶頭像">
      </div>
      <h4 class="mb-1" id="profile-name">${user.displayName || user.email.split('@')[0]}</h4>
      <p class="text-muted mb-3" id="profile-email">${user.email}</p>
      
      <div class="mb-3">
        <button class="btn btn-sm btn-outline-primary" id="edit-profile-btn">
          <i class="bi bi-pencil-square me-1"></i>編輯資料
        </button>
      </div>
      
      <button class="btn btn-outline-danger btn-sm" id="profile-signout-btn">
        <i class="bi bi-box-arrow-right me-1"></i>登出
      </button>
    </div>
  `;
  
  userProfile.innerHTML = userProfileHtml;
  
  // 添加編輯個人資料按鈕事件
  document.getElementById('edit-profile-btn').addEventListener('click', openProfileEditModal);
  document.getElementById('profile-signout-btn').addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        showAlert('您已成功登出', 'success');
      })
      .catch(error => {
        console.error('登出錯誤:', error);
        showAlert('登出失敗：' + error.message, 'danger');
      });
  });
  
  // 更新頂部導航欄的使用者資訊
  document.getElementById('user-name-header').textContent = user.displayName || user.email.split('@')[0];
  
  if (user.photoURL) {
    document.getElementById('user-avatar-header').src = user.photoURL;
  }
  
  // 顯示使用者資訊，隱藏登入按鈕
  userProfileHeader.style.display = 'block';
  authHeaderButtons.style.display = 'none';
}

// 添加編輯個人資料對話框
function openProfileEditModal() {
  // 如果模態框已存在，先移除
  let existingModal = document.getElementById('editProfileModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 創建新的模態框
  const modalHtml = `
    <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editProfileModalLabel">編輯個人資料</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="關閉"></button>
          </div>
          <div class="modal-body">
            <form id="editProfileForm">
              <div class="text-center mb-4">
                <div class="profile-avatar-preview mb-3">
                  <img src="${currentUser.photoURL || 'assets/img/avatar-placeholder.png'}" class="img-fluid" id="edit-avatar-preview" alt="頭像預覽">
                </div>
                <div class="mb-3">
                  <input type="file" class="form-control" id="edit-avatar-upload" accept="image/*">
                  <small class="text-muted">支援 JPG、PNG 格式，最大 2MB</small>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="edit-profile-name" class="form-label">顯示名稱</label>
                <input type="text" class="form-control" id="edit-profile-name" value="${currentUser.displayName || ''}">
              </div>
              
              <div class="mb-3">
                <label for="edit-profile-role" class="form-label">身份/職稱</label>
                <input type="text" class="form-control" id="edit-profile-role" placeholder="例如：美妝愛好者、專業彩妝師等">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" id="saveProfileChanges">儲存變更</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到頁面
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 獲取必要元素
  const editAvatarUpload = document.getElementById('edit-avatar-upload');
  const editAvatarPreview = document.getElementById('edit-avatar-preview');
  const saveProfileChangesBtn = document.getElementById('saveProfileChanges');
  const editProfileNameInput = document.getElementById('edit-profile-name');
  const editProfileRoleInput = document.getElementById('edit-profile-role');
  
  // 如果用戶有角色資料，載入到表單中
  db.collection('users').doc(currentUser.uid).get().then(doc => {
    if (doc.exists) {
      const userData = doc.data();
      if (userData.role) {
        editProfileRoleInput.value = userData.role;
      }
    }
  }).catch(err => {
    console.error('載入用戶資料時出錯:', err);
  });
  
  // 處理頭像上傳預覽
  let profileAvatarFile = null;
  editAvatarUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // 檢查檔案大小 (最大 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showAlert('頭像大小不能超過 2MB', 'warning');
        this.value = '';
        return;
      }
      
      // 檢查檔案類型
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        showAlert('請上傳 JPG 或 PNG 格式的頭像', 'warning');
        this.value = '';
        return;
      }
      
      profileAvatarFile = file;
      const reader = new FileReader();
      
      reader.onload = function(e) {
        editAvatarPreview.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
    }
  });
  
  // 儲存資料變更
  saveProfileChangesBtn.addEventListener('click', async function() {
    const name = editProfileNameInput.value;
    const role = editProfileRoleInput.value;
    
    try {
      // 更新用戶資料物件
      const updates = {
        displayName: name,
        role: role,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // 如果有上傳新頭像
      if (profileAvatarFile) {
        const photoURL = await uploadUserAvatar(profileAvatarFile, currentUser.uid);
        updates.photoURL = photoURL;
        
        // 更新 Auth 用戶資料
        await currentUser.updateProfile({
          displayName: name,
          photoURL: photoURL
        });
      } else {
        // 只更新名稱
        await currentUser.updateProfile({
          displayName: name
        });
      }
      
      // 更新 Firestore 中的用戶資料
      await db.collection('users').doc(currentUser.uid).set(updates, { merge: true });
      
      // 關閉模態框
      bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
      
      // 更新 UI
      document.getElementById('profile-name').textContent = name || currentUser.email.split('@')[0];
      document.getElementById('user-name-header').textContent = name || currentUser.email.split('@')[0];
      
      if (profileAvatarFile) {
        document.getElementById('profile-avatar').src = editAvatarPreview.src;
        document.getElementById('user-avatar-header').src = editAvatarPreview.src;
      }
      
      showAlert('個人資料已成功更新', 'success');
      
      // 重新載入評論以使用新的用戶資料
      loadUserReviews(currentUser.uid);
      loadCommunityReviews(
        reviewSort.value,
        reviewFilter.value,
        reviewSearch.value,
        currentPage
      );
      
    } catch (error) {
      console.error("更新個人資料時發生錯誤：", error);
      showAlert(`更新個人資料失敗：${error.message}`, 'danger');
    }
  });
  
  // 顯示模態框
  const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
  editProfileModal.show();
}

// 全局變數來存儲評論回覆
let reviewComments = {};
const COMMENTS_PER_PAGE = 5;

// 初始化評論回覆功能
function initCommentFeatures() {
  // 綁定回覆按鈕點擊事件
  document.addEventListener('click', function(e) {
    // 回覆按鈕點擊
    if (e.target.closest('.reply-review-btn')) {
      const reviewCard = e.target.closest('.review-card');
      const reviewId = reviewCard.dataset.reviewId;
      const replyForm = reviewCard.querySelector('.reply-form');
      
      // 檢查用戶是否已登錄
      if (!currentUser) {
        showAuthModal();
        return;
      }
      
      // 切換回覆表單顯示
      replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
    }
    
    // 提交回覆按鈕點擊
    if (e.target.closest('.submit-reply-btn')) {
      const reviewCard = e.target.closest('.review-card');
      const reviewId = reviewCard.dataset.reviewId;
      const replyInput = reviewCard.querySelector('.reply-input');
      const commentText = replyInput.value.trim();
      
      if (commentText) {
        submitComment(reviewId, commentText);
        replyInput.value = '';
        // 隱藏回覆表單
        reviewCard.querySelector('.reply-form').style.display = 'none';
      }
    }
    
    // 載入更多回覆
    if (e.target.closest('.load-more-comments')) {
      const reviewCard = e.target.closest('.review-card');
      const reviewId = reviewCard.dataset.reviewId;
      loadMoreComments(reviewId, reviewCard);
    }
    
    // 刪除回覆
    if (e.target.closest('.delete-comment-btn')) {
      const commentItem = e.target.closest('.comment-item');
      const reviewCard = e.target.closest('.review-card');
      const reviewId = reviewCard.dataset.reviewId;
      const commentId = commentItem.dataset.commentId;
      
      if (confirm('確定要刪除這個回覆嗎？')) {
        deleteComment(reviewId, commentId);
      }
    }
  });
}

// 提交評論回覆
function submitComment(reviewId, text) {
  if (!currentUser) return;
  
  const commentData = {
    text: text,
    author: {
      id: currentUser.uid,
      name: currentUser.displayName || '匿名用戶',
      avatar: currentUser.photoURL || 'assets/img/default-avatar.png'
    },
    createdAt: new Date().toISOString()
  };
  
  // 使用 Firebase 保存評論回覆
  db.collection('reviews').doc(reviewId).collection('comments').add(commentData)
    .then(docRef => {
      // 更新本地評論計數
      fetchComments(reviewId);
    })
    .catch(error => {
      console.error('評論發送失敗:', error);
      alert('評論發送失敗，請稍後再試');
    });
}

// 獲取特定評論的回覆
function fetchComments(reviewId, card) {
  let reviewCard;
  
  if (card) {
    reviewCard = card;
  } else {
    reviewCard = document.querySelector(`.review-card[data-review-id="${reviewId}"]`);
    if (!reviewCard) return;
  }
  
  // 獲取評論回覆
  db.collection('reviews').doc(reviewId).collection('comments')
    .orderBy('createdAt', 'desc')
    .limit(COMMENTS_PER_PAGE)
    .get()
    .then(snapshot => {
      // 保存評論數據到全局變數
      reviewComments[reviewId] = {
        comments: [],
        lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
        hasMore: snapshot.docs.length >= COMMENTS_PER_PAGE
      };
      
      // 清除現有評論列表
      const commentsList = reviewCard.querySelector('.comments-list');
      commentsList.innerHTML = '';
      
      if (snapshot.empty) {
        // 沒有評論時隱藏評論區
        reviewCard.querySelector('.comments-section').style.display = 'none';
        reviewCard.querySelector('.comments-count').textContent = '0 回覆';
        return;
      }
      
      // 顯示評論區
      reviewCard.querySelector('.comments-section').style.display = 'block';
      
      // 獲取評論總數
      db.collection('reviews').doc(reviewId).collection('comments').get()
        .then(allComments => {
          const count = allComments.size;
          reviewCard.querySelector('.comments-count').textContent = `${count} 回覆`;
          
          // 顯示/隱藏加載更多按鈕
          const loadMoreBtn = reviewCard.querySelector('.load-more-comments');
          loadMoreBtn.style.display = snapshot.docs.length >= COMMENTS_PER_PAGE ? 'block' : 'none';
        });
      
      // 渲染評論
      snapshot.forEach(doc => {
        const commentData = doc.data();
        commentData.id = doc.id;
        reviewComments[reviewId].comments.push(commentData);
        renderComment(commentData, commentsList, reviewId);
      });
    })
    .catch(error => {
      console.error('獲取評論失敗:', error);
    });
}

// 渲染單條評論
function renderComment(commentData, container, reviewId) {
  // 使用模板創建評論元素
  const template = document.getElementById('comment-template');
  const commentElement = document.importNode(template.content, true).querySelector('.comment-item');
  
  // 設置評論 ID
  commentElement.dataset.commentId = commentData.id;
  
  // 填充評論數據
  commentElement.querySelector('.comment-avatar').src = commentData.author.avatar || 'assets/img/default-avatar.png';
  commentElement.querySelector('.comment-author').textContent = commentData.author.name;
  commentElement.querySelector('.comment-text').textContent = commentData.text;
  
  // 設置評論日期
  const commentDate = new Date(commentData.createdAt);
  const formattedDate = formatDate(commentDate);
  commentElement.querySelector('.comment-date').textContent = formattedDate;
  
  // 檢查是否為當前用戶的評論，顯示刪除按鈕
  if (currentUser && commentData.author.id === currentUser.uid) {
    commentElement.querySelector('.delete-comment-btn').style.display = 'inline-block';
  }
  
  // 添加到容器
  container.appendChild(commentElement);
}

// 加載更多評論
function loadMoreComments(reviewId, reviewCard) {
  if (!reviewComments[reviewId] || !reviewComments[reviewId].lastVisible) return;
  
  db.collection('reviews').doc(reviewId).collection('comments')
    .orderBy('createdAt', 'desc')
    .startAfter(reviewComments[reviewId].lastVisible)
    .limit(COMMENTS_PER_PAGE)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        reviewComments[reviewId].hasMore = false;
        reviewCard.querySelector('.load-more-comments').style.display = 'none';
        return;
      }
      
      // 更新最後可見文檔
      reviewComments[reviewId].lastVisible = snapshot.docs[snapshot.docs.length - 1];
      
      // 獲取評論列表容器
      const commentsList = reviewCard.querySelector('.comments-list');
      
      // 添加新載入的評論
      snapshot.forEach(doc => {
        const commentData = doc.data();
        commentData.id = doc.id;
        reviewComments[reviewId].comments.push(commentData);
        renderComment(commentData, commentsList, reviewId);
      });
      
      // 如果載入的評論少於每頁數量，表示沒有更多評論了
      if (snapshot.docs.length < COMMENTS_PER_PAGE) {
        reviewComments[reviewId].hasMore = false;
        reviewCard.querySelector('.load-more-comments').style.display = 'none';
      }
    })
    .catch(error => {
      console.error('載入更多評論失敗:', error);
    });
}

// 刪除評論
function deleteComment(reviewId, commentId) {
  db.collection('reviews').doc(reviewId).collection('comments').doc(commentId).delete()
    .then(() => {
      // 重新獲取評論
      fetchComments(reviewId);
    })
    .catch(error => {
      console.error('刪除評論失敗:', error);
      alert('刪除失敗，請稍後再試');
    });
}

// 格式化日期
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return '剛剛';
  } else if (diffMins < 60) {
    return `${diffMins}分鐘前`;
  } else if (diffHours < 24) {
    return `${diffHours}小時前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-TW');
  }
}

// 修改現有的渲染評論卡片函數
function renderReviewCard(reviewData, container) {
  const template = document.getElementById('review-card-template');
  const reviewElement = document.importNode(template.content, true).querySelector('.review-card');
  
  // 設置評論ID (用於後續操作)
  reviewElement.dataset.reviewId = reviewData.id;
  
  // 設置用戶頭像
  reviewElement.querySelector('.review-avatar').src = reviewData.author.avatar || 'assets/img/default-avatar.png';
  
  // 設置用戶名稱
  reviewElement.querySelector('.review-author').textContent = reviewData.author.name;
  
  // 設置評論星級
  const starsContainer = reviewElement.querySelector('.review-rating');
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('i');
    star.className = i <= reviewData.rating ? 'bi bi-star-fill text-warning me-1' : 'bi bi-star text-muted me-1';
    starsContainer.appendChild(star);
  }
  
  // 設置評論日期
  const reviewDate = new Date(reviewData.createdAt);
  const formattedDate = formatDate(reviewDate);
  reviewElement.querySelector('.review-date').textContent = formattedDate;
  
  // 設置評論內容
  reviewElement.querySelector('.review-text').textContent = reviewData.text;
  
  // 如果是當前用戶的評論，顯示操作選項
  if (currentUser && reviewData.author.id === currentUser.uid) {
    reviewElement.querySelector('.review-actions').style.display = 'block';
  }
  
  // 綁定編輯和刪除事件
  reviewElement.querySelector('.edit-review-btn')?.addEventListener('click', () => openEditModal(reviewData));
  reviewElement.querySelector('.delete-review-btn')?.addEventListener('click', () => openDeleteModal(reviewData.id));
  
  // 將評論卡片添加到容器中
  container.appendChild(reviewElement);
  
  // 獲取和顯示此評論的回覆
  fetchComments(reviewData.id, reviewElement);
  
  return reviewElement;
}
// 在頁面載入時初始化評論功能
document.addEventListener('DOMContentLoaded', function() {
  // ...原有代碼...
  
  // 初始化評論功能
  initCommentFeatures();
});
