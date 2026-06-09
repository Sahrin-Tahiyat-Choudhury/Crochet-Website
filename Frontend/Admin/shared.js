/* =============================================
   THE YARN JOURNEY — Shared Navigation JS
   ============================================= */

const ADMIN_API_BASE = (() => {
  const isLocalFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && window.location.port !== '3000';
  const localApiHost = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1';
  return isLocalFrontend || window.location.protocol === 'file:'
    ? `http://${localApiHost}:3000/api`
    : '/api';
})();


let adminCurrentUser = null;

async function adminFetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'Request failed');
  }

  return data;
}
const get = (url) =>
  adminFetchJson(`${ADMIN_API_BASE}${url}`);

const post = (url, data) =>
  adminFetchJson(`${ADMIN_API_BASE}${url}`, {
    method: "POST",
    body: JSON.stringify(data)
  });

window.API = {
  products: {
    getAll: () => get("/product?limit=200")
  },

  categories: {
    getAll: () => get("/product/categories")
  },

  analytics: {
    getStats: () => get("/analytics")
  },

  users: {
  getMe: () => get("/auth/get-me"),

  updateProfile: (data) =>
    adminFetchJson(`${ADMIN_API_BASE}/user/profile`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  changePassword: (data) =>
    adminFetchJson(`${ADMIN_API_BASE}/user/change-password`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
},
contact: {
    getMessages: () => get("/contact/messages")
  }
};


function getAdminPageRedirect() {
  const page = window.location.pathname.replace(/\\/g, '/').split('/').pop() || 'index.html';
  return `Admin/${page}`;
}

function redirectToAdminLogin() {
  window.location.href = `../login.html?redirect=${encodeURIComponent(getAdminPageRedirect())}`;
}

function updateAdminIdentity(user) {
  const name = user?.username || user?.email || 'Admin';
  const avatar = (name[0] || 'A').toUpperCase();

  const avatarEl = document.getElementById('admin-avatar');
  const nameEl = document.getElementById('admin-user-name');

  if (avatarEl) avatarEl.textContent = avatar;
  if (nameEl) nameEl.textContent = name;
}

async function requireAdmin() {
  try {
    const data = await adminFetchJson(`${ADMIN_API_BASE}/auth/get-me`);
    adminCurrentUser = data.user || null;

    if (!adminCurrentUser || adminCurrentUser.role !== 'admin') {
      showToast('Admin access requires an admin account.', 'error');
      setTimeout(redirectToAdminLogin, 900);
      return null;
    }

    updateAdminIdentity(adminCurrentUser);
    return adminCurrentUser;
  } catch (error) {
    redirectToAdminLogin();
    return null;
  }
}

async function logoutAdmin() {
  try {
    await adminFetchJson(`${ADMIN_API_BASE}/auth/logout`, { method: 'GET' });
  } catch (error) {
    console.warn(error);
  }

  window.location.href = '../login.html';
}

/**
 * Renders the sidebar into #sidebar element.
 * Pass activePage = 'products' | 'orders' | 'customers' |
 *                   'categories' | 'discounts' | 'inventory' |
 *                   'analytics' | 'settings'
 */
function renderSidebar(activePage = 'products') {
  const nav = [
  { section: 'MAIN' },

  {
    id: 'dashboard',
    icon: '🏠',
    label: 'Dashboard',
    href: 'index.html'
  },

  {
    id: 'products',
    icon: '🌸',
    label: 'Products',
    badge: 30,
    href: 'products.html'
  },

  { id: 'orders',     icon: '📦', label: 'Orders',          badge: 7,   href: 'orders.html' },
  {
  id: 'custom-orders',
  icon: '🧵',
  label: 'Custom Orders',
  href: 'customOrders.html'
},
{
  id: 'contact', icon:'💬', label:'Contact', href:'contact.html'
},
  { id: 'customers',  icon: '👥', label: 'Customers',                   href: 'customers.html' },
  { section: 'CATALOG' },
    { id: 'categories', icon: '🏷️', label: 'Categories',                  href: 'categories.html' },
    { id: 'content', icon: '📝', label: 'Content', href: 'content.html'},
    { id: 'discounts',  icon: '✂️', label: 'Discounts & Promos',          href: 'discounts.html' },
    { id: 'inventory',  icon: '📊', label: 'Inventory',                   href: 'inventory.html' },
    { section: 'STORE' },
    { id: 'analytics',  icon: '📈', label: 'Analytics',                   href: 'analytics.html' },
    { id: 'settings',   icon: '⚙️', label: 'Settings',                    href: 'settings.html' },
];

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-box">
        <span class="logo-top">The</span>
        <span class="logo-name">YARN<span>Journey</span></span>
        <span class="logo-since">SINCE · 2023 WITH YOU</span>
      </div>
    </div>
    <nav>
      ${nav.map(item => {
        if (item.section) {
          return `<div class="nav-section-label">${item.section}</div>`;
        }
        const isActive = item.id === activePage;
        const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
        return `
          <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${badge}
          </a>`;
      }).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="avatar" id="admin-avatar">A</div>
      <div class="user-info">
        <div class="user-name" id="admin-user-name">Admin</div>
        <div class="user-role">Admin</div>
      </div>
      <button class="sidebar-logout" type="button" onclick="logoutAdmin()">Logout</button>
    </div>
  `;

  if (adminCurrentUser) updateAdminIdentity(adminCurrentUser);
}

/* ---------- Utility helpers ---------- */

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* Close modal when clicking outside */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* Toggle switch helper */
function initToggles() {
  document.querySelectorAll('.toggle').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });
}

/* Simple toast */
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const colors = { success: '#4caf82', error: '#e05c5c', info: '#4a7fc1' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colors[type] || colors.success}; color:#fff;
    padding:11px 18px; border-radius:8px; font-size:13px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    box-shadow:0 4px 16px rgba(0,0,0,0.15);
    animation: slideUp 0.3s ease;
  `;
  toast.textContent = msg;

  const style = document.createElement('style');
  style.textContent = `@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* Load admin theme from localStorage on all pages */
function loadAdminTheme() {
  const savedColor = localStorage.getItem("adminThemeColor");
  if (savedColor) {
    document.documentElement.style.setProperty("--accent", savedColor);
    document.documentElement.style.setProperty("--accent-hover", adjustBrightness(savedColor, -15));
    document.documentElement.style.setProperty("--accent-soft", adjustAlpha(savedColor, 0.15));
  }

  const savedInterfaceTheme = localStorage.getItem("adminInterfaceTheme");
  if (savedInterfaceTheme) {
    applyInterfaceTheme(savedInterfaceTheme);
  }
}

/* Helper to adjust color brightness */
function adjustBrightness(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/* Helper to adjust color alpha */
function adjustAlpha(color, alpha) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* Apply interface theme */
function applyInterfaceTheme(theme) {
  document.documentElement.setAttribute("data-interface-theme", theme);
  
  // Add dark mode CSS if needed
  if (theme === "dark") {
    document.documentElement.style.setProperty("--main-bg", "#0f1419");
    document.documentElement.style.setProperty("--card-bg", "#1a2332");
    document.documentElement.style.setProperty("--text-dark", "#e0e0e0");
  } else {
    document.documentElement.style.setProperty("--main-bg", "#fdf6f0");
    document.documentElement.style.setProperty("--card-bg", "#ffffff");
    document.documentElement.style.setProperty("--text-dark", "#1c1c1c");
  }
}

document.addEventListener('DOMContentLoaded', requireAdmin);
