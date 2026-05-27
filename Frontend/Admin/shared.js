/* =============================================
   THE YARN JOURNEY — Shared Navigation JS
   ============================================= */

/**
 * Renders the sidebar into #sidebar element.
 * Pass activePage = 'products' | 'orders' | 'customers' |
 *                   'categories' | 'discounts' | 'inventory' |
 *                   'analytics' | 'settings'
 */
function renderSidebar(activePage = 'products') {
  const nav = [
    { section: 'MAIN' },
    { id: 'products',   icon: '🌸', label: 'Products',        badge: 30,  href: 'products.html' },
    { id: 'orders',     icon: '📦', label: 'Orders',          badge: 7,   href: 'orders.html' },
    { id: 'customers',  icon: '👥', label: 'Customers',                   href: 'customers.html' },
    { section: 'CATALOG' },
    { id: 'categories', icon: '🏷️', label: 'Categories',                  href: 'categories.html' },
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
      <div class="avatar">S</div>
      <div class="user-info">
        <div class="user-name">Shop Owner</div>
        <div class="user-role">Admin</div>
      </div>
    </div>
  `;
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
