/**
 * Firebase Authentication Implementation
 * Handles user login, registration, and profile management
 */

// Firebase config - replace with your actual Firebase project configuration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global alert function
window.showAlert = function(message, type) {
  // Create alert element
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Append to page
  const alertContainer = document.getElementById('alert-container') || document.createElement('div');
  if (!document.getElementById('alert-container')) {
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '80px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '9999';
    document.body.appendChild(alertContainer);
  }
  
  alertContainer.appendChild(alertDiv);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 300);
  }, 5000);
};

// DOM Elements - we'll try to find these when the document loads
let loginForm, registerForm, loginTab, registerTab,
    loginEmail, loginPassword, registerEmail, registerPassword, registerName,
    registerAvatar, registerAvatarPreview, forgotPasswordLink,
    loginGoogleBtn, loginFacebookBtn, loginAppleBtn, 
    authFormSection, profileSection, signoutBtn,
    userAvatar, userName, userEmail, userCreatedDate, userLevel;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  initUIElements();
  
  // Set up authentication state observer
  setupAuthStateObserver();
  
  // Add event listeners to forms and buttons
  setupEventListeners();
  
  // Prepare the auth tabs
  setupAuthTabs();
});

/**
 * Initialize UI elements references
 */
function initUIElements() {
  // Forms
  loginForm = document.getElementById('login-form');
  registerForm = document.getElementById('register-form');
  
  // Tabs
  loginTab = document.getElementById('login-tab');
  registerTab = document.getElementById('register-tab');
  
  // Login form elements
  if (document.getElementById('login-email')) {
    loginEmail = document.getElementById('login-email');
    loginPassword = document.getElementById('login-password');
    forgotPasswordLink = document.getElementById('forgot-password-link');
  }
  
  // Register form elements
  if (document.getElementById('register-email')) {
    registerEmail = document.getElementById('register-email');
    registerPassword = document.getElementById('register-password');
    registerName = document.getElementById('register-name');
    registerAvatar = document.getElementById('register-avatar');
    registerAvatarPreview = document.getElementById('register-avatar-preview');
  }
  
  // Social login buttons
  loginGoogleBtn = document.getElementById('login-google-btn');
  loginFacebookBtn = document.getElementById('login-facebook-btn');
  loginAppleBtn = document.getElementById('login-apple-btn');
  
  // Sections
  authFormSection = document.getElementById('auth-form-section');
  profileSection = document.getElementById('profile-section');
  
  // Profile elements
  signoutBtn = document.getElementById('signout-btn');
  userAvatar = document.getElementById('user-avatar');
  userName = document.getElementById('user-name');
  userEmail = document.getElementById('user-email');
  userCreatedDate = document.getElementById('user-created-date');
  userLevel = document.getElementById('user-level');
  
  // Header elements
  loginBtn = document.getElementById('login-btn');
  userProfileHeader = document.getElementById('user-profile-header');
}

/**
 * Set up the authentication state observer
 */
function setupAuthStateObserver() {
  auth.onAuthStateChanged(async function(user) {
    if (user) {
      // User is signed in
      await updateUIForAuthenticatedUser(user);
    } else {
      // User is signed out
      updateUIForUnauthenticatedUser();
    }
  });
}

/**
 * Update UI for authenticated users
 */
async function updateUIForAuthenticatedUser(user) {
  // Hide login button in header
  if (loginBtn) loginBtn.style.display = 'none';
  
  // Show user profile in header
  if (userProfileHeader) userProfileHeader.style.display = 'block';
  
  // Hide auth form section
  if (authFormSection) authFormSection.style.display = 'none';
  
  // Show profile section
  if (profileSection) profileSection.style.display = 'block';
  
  // Update user info
  if (userName) userName.textContent = user.displayName || '使用者';
  if (userEmail) userEmail.textContent = user.email;
  if (userCreatedDate) {
    const createdDate = new Date(user.metadata.creationTime);
    userCreatedDate.textContent = createdDate.toLocaleDateString();
  }
  
  // Set avatar
  if (userAvatar && user.photoURL) {
    userAvatar.src = user.photoURL;
  } else if (userAvatar) {
    userAvatar.src = 'assets/img/avatar-placeholder.png';
  }
  
  // Update header user avatar and name
  const userNameHeader = document.getElementById('user-name-header');
  const userAvatarHeader = document.getElementById('user-avatar-header');
  
  if (userNameHeader) userNameHeader.textContent = user.displayName || '使用者';
  if (userAvatarHeader && user.photoURL) userAvatarHeader.src = user.photoURL;
  
  // Try to get additional user data from Firestore
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userLevel && userData.level) userLevel.textContent = userData.level;
      // You can add more user data here
    } else {
      // Create user document if it doesn't exist
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        level: '一般會員',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      if (userLevel) userLevel.textContent = '一般會員';
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    window.showAlert('獲取用戶數據時出錯', 'danger');
  }
}

/**
 * Update UI for unauthenticated users
 */
function updateUIForUnauthenticatedUser() {
  // Show login button in header
  if (loginBtn) loginBtn.style.display = 'block';
  
  // Hide user profile in header
  if (userProfileHeader) userProfileHeader.style.display = 'none';
  
  // Show auth form section
  if (authFormSection) authFormSection.style.display = 'block';
  
  // Hide profile section
  if (profileSection) profileSection.style.display = 'none';
}

/**
 * Setup event listeners for forms and buttons
 */
function setupEventListeners() {
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Sign out button
  if (signoutBtn) {
    signoutBtn.addEventListener('click', handleSignOut);
  }
  
  // Social login buttons
  if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener('click', () => handleSocialLogin('google'));
  }
  
  if (loginFacebookBtn) {
    loginFacebookBtn.addEventListener('click', () => handleSocialLogin('facebook'));
  }
  
  if (loginAppleBtn) {
    loginAppleBtn.addEventListener('click', () => handleSocialLogin('apple'));
  }
  
  // Forgot password link
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
  }
  
  // Header login button
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // If we're already on the login page, scroll to the form
      if (window.location.href.includes('log.html')) {
        scrollToLoginForm();
      } else {
        window.location.href = 'log.html';
      }
    });
  }
  
  // Header logout button
  const headerSignoutBtn = document.getElementById('header-signout-btn');
  if (headerSignoutBtn) {
    headerSignoutBtn.addEventListener('click', handleSignOut);
  }
}

/**
 * Setup auth tabs behavior
 */
function setupAuthTabs() {
  // Create tabs if they don't exist
  if (!loginTab || !registerTab) {
    const authTab = document.getElementById('authTab');
    if (authTab) {
      authTab.innerHTML = `
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login-pane" type="button" role="tab" aria-controls="login-pane" aria-selected="true">登入</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register-pane" type="button" role="tab" aria-controls="register-pane" aria-selected="false">註冊</button>
        </li>
      `;
      
      // Re-get the tab elements
      loginTab = document.getElementById('login-tab');
      registerTab = document.getElementById('register-tab');
    }
  }
  
  // Create login form if it doesn't exist
  const loginPane = document.getElementById('login-pane');
  if (loginPane && !loginForm) {
    loginPane.innerHTML = `
      <div class="login-header">
        <h2>歡迎回來</h2>
        <p>請輸入您的帳號密碼</p>
      </div>
      <form id="login-form">
        <div class="form-floating mb-3">
          <input type="email" class="form-control" id="login-email" placeholder="name@example.com" required>
          <label for="login-email">電子郵件</label>
        </div>
        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="login-password" placeholder="Password" required>
          <label for="login-password">密碼</label>
        </div>
        <div class="mb-3 d-flex justify-content-between align-items-center">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="remember-me">
            <label class="form-check-label" for="remember-me">記住我</label>
          </div>
          <a href="#" id="forgot-password-link" class="forgot-password">忘記密碼？</a>
        </div>
        <div class="d-grid mb-3">
          <button type="submit" class="btn btn-primary btn-lg">登入</button>
        </div>
        <div id="login-error" class="alert alert-danger mt-3" style="display: none;"></div>
        
        <div class="social-login">
          <div class="divider">
            <span>或使用其他方式登入</span>
          </div>
          <div class="social-buttons">
            <button type="button" class="btn-icon btn-google" id="login-google-btn">
              <i class="bi bi-google"></i>
            </button>
            <button type="button" class="btn-icon btn-facebook" id="login-facebook-btn">
              <i class="bi bi-facebook"></i>
            </button>
            <button type="button" class="btn-icon btn-apple" id="login-apple-btn">
              <i class="bi bi-apple"></i>
            </button>
          </div>
        </div>
      </form>
    `;
    
    // Re-initialize UI elements for login
    loginForm = document.getElementById('login-form');
    loginEmail = document.getElementById('login-email');
    loginPassword = document.getElementById('login-password');
    forgotPasswordLink = document.getElementById('forgot-password-link');
    loginGoogleBtn = document.getElementById('login-google-btn');
    loginFacebookBtn = document.getElementById('login-facebook-btn');
    loginAppleBtn = document.getElementById('login-apple-btn');
    
    // Setup event listeners again
    setupEventListeners();
  }
  
  // Create register form if it doesn't exist
  const registerPane = document.getElementById('register-pane');
  if (registerPane && !registerForm) {
    registerPane.innerHTML = `
      <div class="login-header">
        <h2>建立新帳號</h2>
        <p>加入我們的美妝社群</p>
      </div>
      <form id="register-form">
        <div class="text-center mb-4">
          <img id="register-avatar-preview" src="assets/img/avatar-placeholder.png" alt="Avatar Preview" class="avatar-preview">
          <div class="mt-2">
            <label for="register-avatar" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-upload"></i> 上傳頭像
            </label>
            <input type="file" id="register-avatar" accept="image/jpeg, image/png" style="display: none;">
          </div>
        </div>
        <div class="form-floating mb-3">
          <input type="text" class="form-control" id="register-name" placeholder="Your Name" required>
          <label for="register-name">姓名</label>
        </div>
        <div class="form-floating mb-3">
          <input type="email" class="form-control" id="register-email" placeholder="name@example.com" required>
          <label for="register-email">電子郵件</label>
        </div>
        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="register-password" placeholder="Password" required minlength="6">
          <label for="register-password">密碼 (至少6字元)</label>
        </div>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="agree-terms" required>
          <label class="form-check-label" for="agree-terms">
            我同意 <a href="#">服務條款</a> 和 <a href="#">隱私政策</a>
          </label>
        </div>
        <div class="d-grid mb-3">
          <button type="submit" class="btn btn-primary btn-lg">註冊</button>
        </div>
        <div id="register-error" class="alert alert-danger mt-3" style="display: none;"></div>
        <div id="register-success" class="alert alert-success mt-3" style="display: none;">註冊成功！正在登入...</div>
        
        <div class="social-login">
          <div class="divider">
            <span>或使用其他方式註冊</span>
          </div>
          <div class="social-buttons">
            <button type="button" class="btn-icon btn-google" id="register-google-btn">
              <i class="bi bi-google"></i>
            </button>
            <button type="button" class="btn-icon btn-facebook" id="register-facebook-btn">
              <i class="bi bi-facebook"></i>
            </button>
            <button type="button" class="btn-icon btn-apple" id="register-apple-btn">
              <i class="bi bi-apple"></i>
            </button>
          </div>
        </div>
      </form>
    `;
    
    // Re-initialize UI elements for register
    registerForm = document.getElementById('register-form');
    registerEmail = document.getElementById('register-email');
    registerPassword = document.getElementById('register-password');
    registerName = document.getElementById('register-name');
    registerAvatar = document.getElementById('register-avatar');
    registerAvatarPreview = document.getElementById('register-avatar-preview');
    
    // Re-attach social login buttons events
    document.getElementById('register-google-btn').addEventListener('click', () => handleSocialLogin('google'));
    document.getElementById('register-facebook-btn').addEventListener('click', () => handleSocialLogin('facebook'));
    document.getElementById('register-apple-btn').addEventListener('click', () => handleSocialLogin('apple'));
    
    // Setup avatar preview
    if (registerAvatar) {
      registerAvatar.addEventListener('change', handleAvatarPreview);
    }
    
    // Re-attach form submit
    registerForm.addEventListener('submit', handleRegister);
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const email = loginEmail.value;
  const password = loginPassword.value;
  const rememberMe = document.getElementById('remember-me') ? document.getElementById('remember-me').checked : false;
  const errorElement = document.getElementById('login-error');
  
  // Clear previous errors
  if (errorElement) errorElement.style.display = 'none';
  
  // Set persistence
  const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
  
  try {
    await auth.setPersistence(persistence);
    await auth.signInWithEmailAndPassword(email, password);
    
    // Show success message
    window.showAlert('登入成功！', 'success');
  } catch (error) {
    console.error("Login error:", error);
    
    let errorMessage = '登入失敗，請檢查您的電子郵件和密碼';
    switch(error.code) {
      case 'auth/invalid-email':
        errorMessage = '無效的電子郵件地址';
        break;
      case 'auth/user-disabled':
        errorMessage = '此帳號已被停用';
        break;
      case 'auth/user-not-found':
        errorMessage = '找不到此電子郵件的帳號';
        break;
      case 'auth/wrong-password':
        errorMessage = '密碼不正確';
        break;
    }
    
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    } else {
      window.showAlert(errorMessage, 'danger');
    }
  }
}

/**
 * Handle registration form submission
 */
async function handleRegister(e) {
  e.preventDefault();
  
  const email = registerEmail.value;
  const password = registerPassword.value;
  const name = registerName.value;
  const avatar = registerAvatar.files[0];
  const errorElement = document.getElementById('register-error');
  const successElement = document.getElementById('register-success');
  
  // Clear previous messages
  if (errorElement) errorElement.style.display = 'none';
  if (successElement) successElement.style.display = 'none';
  
  try {
    // Create user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update profile
    const updateProfile = {
      displayName: name
    };
    
    // Upload avatar if selected
    if (avatar) {
      const storageRef = storage.ref(`user-avatars/${user.uid}`);
      await storageRef.put(avatar);
      const downloadURL = await storageRef.getDownloadURL();
      updateProfile.photoURL = downloadURL;
    }
    
    // Update user profile
    await user.updateProfile(updateProfile);
    
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: name,
      photoURL: updateProfile.photoURL || '',
      level: '一般會員',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Show success message
    if (successElement) {
      successElement.style.display = 'block';
    } else {
      window.showAlert('註冊成功！正在登入...', 'success');
    }
    
    // Switch to profile view after short delay
    setTimeout(() => {
      updateUIForAuthenticatedUser(user);
    }, 1500);
    
  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = '註冊失敗，請稍後再試';
    switch(error.code) {
      case 'auth/email-already-in-use':
        errorMessage = '此電子郵件已被註冊';
        break;
      case 'auth/invalid-email':
        errorMessage = '無效的電子郵件地址';
        break;
      case 'auth/weak-password':
        errorMessage = '密碼強度不足，請使用更強的密碼';
        break;
    }
    
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    } else {
      window.showAlert(errorMessage, 'danger');
    }
  }
}

/**
 * Handle sign out
 */
async function handleSignOut() {
  try {
    await auth.signOut();
    window.showAlert('已成功登出', 'success');
    updateUIForUnauthenticatedUser();
  } catch (error) {
    console.error("Sign out error:", error);
    window.showAlert('登出時發生錯誤', 'danger');
  }
}

/**
 * Handle social login
 */
async function handleSocialLogin(provider) {
  let authProvider;
  
  switch(provider) {
    case 'google':
      authProvider = new firebase.auth.GoogleAuthProvider();
      break;
    case 'facebook':
      authProvider = new firebase.auth.FacebookAuthProvider();
      break;
    case 'apple':
      authProvider = new firebase.auth.OAuthProvider('apple.com');
      break;
    default:
      window.showAlert('不支援的登入方式', 'danger');
      return;
  }
  
  try {
    const result = await auth.signInWithPopup(authProvider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // Create user document if first time login
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        level: '一般會員',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    window.showAlert('登入成功！', 'success');
  } catch (error) {
    console.error("Social login error:", error);
    window.showAlert(`使用${provider}登入失敗: ${error.message}`, 'danger');
  }
}

/**
 * Handle forgot password request
 */
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = prompt('請輸入您的電子郵件地址，我們將發送密碼重置連結：');
  
  if (!email) return;
  
  try {
    await auth.sendPasswordResetEmail(email);
    window.showAlert('密碼重置連結已發送到您的電子郵件', 'success');
  } catch (error) {
    console.error("Password reset error:", error);
    window.showAlert('無法發送密碼重置連結: ' + error.message, 'danger');
  }
}

/**
 * Handle avatar preview when selecting a file
 */
function handleAvatarPreview(e) {
  const file = e.target.files[0];
  if (file) {
    // Check file size and type
    if (file.size > 2 * 1024 * 1024) {
      window.showAlert('頭像大小不能超過 2MB', 'warning');
      e.target.value = '';
      return;
    }
    
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      window.showAlert('請上傳 JPG 或 PNG 格式的頭像', 'warning');
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      registerAvatarPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Scroll to login form
 */
function scrollToLoginForm() {
  const loginFormContainer = document.querySelector('.login-form-container');
  if (loginFormContainer) {
    loginFormContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Profile edit modal functionality
 */
window.openProfileEditModal = function() {
  // Check if modal already exists
  let modalElement = document.getElementById('profile-edit-modal');
  
  if (!modalElement) {
    // Create modal if it doesn't exist
    modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'profile-edit-modal';
    modalElement.tabIndex = '-1';
    modalElement.setAttribute('aria-labelledby', 'profile-edit-modal-label');
    modalElement.setAttribute('aria-hidden', 'true');
    
    modalElement.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="profile-edit-modal-label">編輯個人資料</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="profile-edit-form">
              <div class="text-center mb-4">
                <img id="profile-edit-avatar-preview" src="${auth.currentUser?.photoURL || 'assets/img/avatar-placeholder.png'}" alt="Avatar Preview" class="avatar-preview">
                <div class="mt-2">
                  <label for="profile-edit-avatar" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-upload"></i> 更換頭像
                  </label>
                  <input type="file" id="profile-edit-avatar" accept="image/jpeg, image/png" style="display: none;">
                </div>
              </div>
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="profile-edit-name" placeholder="Your Name" value="${auth.currentUser?.displayName || ''}" required>
                <label for="profile-edit-name">姓名</label>
              </div>
              <div class="form-floating mb-3">
                <input type="email" class="form-control" id="profile-edit-email" placeholder="name@example.com" value="${auth.currentUser?.email || ''}" disabled>
                <label for="profile-edit-email">電子郵件 (不可更改)</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" id="profile-edit-save-btn">儲存變更</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalElement);
    
    // Initialize avatar preview functionality
    const profileEditAvatar = document.getElementById('profile-edit-avatar');
    const profileEditAvatarPreview = document.getElementById('profile-edit-avatar-preview');
    
    profileEditAvatar.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          window.showAlert('頭像大小不能超過 2MB', 'warning');
          this.value = '';
          return;
        }
        
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
          window.showAlert('請上傳 JPG 或 PNG 格式的頭像', 'warning');
          this.value = '';
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
          profileEditAvatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Save button functionality
    document.getElementById('profile-edit-save-btn').addEventListener('click', async function() {
      const newName = document.getElementById('profile-edit-name').value;
      const avatarFile = document.getElementById('profile-edit-avatar').files[0];
      
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('未登入');
        
        const updateData = {
          displayName: newName
        };
        
        // Upload avatar if selected
        if (avatarFile) {
          const storageRef = storage.ref(`user-avatars/${user.uid}`);
          await storageRef.put(avatarFile);
          const downloadURL = await storageRef.getDownloadURL();
          updateData.photoURL = downloadURL;
        }
        
        // Update profile
        await user.updateProfile(updateData);
        
        // Update Firestore
        await db.collection('users').doc(user.uid).update({
          displayName: newName,
          ...(avatarFile ? { photoURL: updateData.photoURL } : {})
        });
        
        // Update UI
        if (userName) userName.textContent = newName;
        if (userAvatar && updateData.photoURL) userAvatar.src = updateData.photoURL;
        
        // Update header
        const userNameHeader = document.getElementById('user-name-header');
        const userAvatarHeader = document.getElementById('user-avatar-header');
        
        if (userNameHeader) userNameHeader.textContent = newName;
        if (userAvatarHeader && updateData.photoURL) userAvatarHeader.src = updateData.photoURL;
        
        // Close modal
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        
        window.showAlert('個人資料已更新', 'success');
      } catch (error) {
        console.error("Profile update error:", error);
        window.showAlert('更新個人資料時出錯: ' + error.message, 'danger');
      }
    });
  }
  
  // Show the modal
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
};