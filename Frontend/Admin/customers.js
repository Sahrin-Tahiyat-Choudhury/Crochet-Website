/* =============================================
   THE YARN JOURNEY — Customers Page JS
   ============================================= */

let CUSTOMERS = [];
let searchQ = '';
let cityFilter = 'all';
let typeFilter = 'all';
let currentPage = 1;
const PAGE_SIZE = 10;


function updateStats() {
  document.getElementById('statTotal').textContent = CUSTOMERS.length;

  const repeat = CUSTOMERS.filter(c => c.orders >= 2).length;
  document.getElementById('statRepeat').textContent = repeat;

  const retention = CUSTOMERS.length
    ? ((repeat / CUSTOMERS.length) * 100).toFixed(1) + '%'
    : '0%';
  document.getElementById('statRetention').textContent = retention + ' retention';

  const top = CUSTOMERS.reduce((best, c) => (!best || c.spent > best.spent ? c : best), null);
  document.getElementById('statTopSpender').textContent = top
    ? '₹' + top.spent.toLocaleString('en-IN')
    : '₹0';
  document.getElementById('statTopName').textContent = top ? top.name : '—';

  const cities = new Set(CUSTOMERS.map(c => c.city).filter(Boolean));
  document.getElementById('statCities').textContent = cities.size;
}

function populateCityFilter() {
  const sel = document.getElementById('cityFilter');
  const cities = [...new Set(CUSTOMERS.map(c => c.city).filter(Boolean))].sort();
  sel.innerHTML = '<option value="all">All Cities</option>' +
    cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

function avatarColor(i) {
  const colors = ['#e8916a','#4caf82','#4a7fc1','#9370DB','#e6a817','#e05c5c'];
  return colors[i % colors.length];
}

function avatarLetter(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function getFilteredCustomers() {
  let rows = [...CUSTOMERS];

  if (searchQ) {
    rows = rows.filter(c =>
      (c.name || '').toLowerCase().includes(searchQ) ||
      (c.email || '').toLowerCase().includes(searchQ) ||
      (c.phone || '').includes(searchQ) ||
      (c.city || '').toLowerCase().includes(searchQ)
    );
  }

  if (cityFilter !== 'all') {
    rows = rows.filter(c => c.city === cityFilter);
  }

  if (typeFilter === 'repeat') {
    rows = rows.filter(c => c.orders >= 2);
  } else if (typeFilter === 'new') {
    rows = rows.filter(c => c.orders <= 1);
  } else if (typeFilter === 'highspend') {
    const avg = CUSTOMERS.reduce((s, c) => s + c.spent, 0) / (CUSTOMERS.length || 1);
    rows = rows.filter(c => c.spent > avg);
  }

  return rows;
}

function renderCustomers() {
  const tbody = document.getElementById('customersTbody');
  const allFiltered = getFilteredCustomers();
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = allFiltered.slice(start, start + PAGE_SIZE);

  renderPagination(); 

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No customers found</h3>
        <p>Try a different search or filter.</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((c, i) => `
    <tr>
      <td>
        <div class="product-cell">
          <div class="product-img" style="background:${avatarColor(i)};color:#fff;font-weight:600;font-size:15px;">
            ${avatarLetter(c.name)}
          </div>
          <div>
            <div class="product-name">${c.name || 'Unknown'}</div>
            <div style="font-size:12px;color:var(--text-muted);">${c.email || ''}</div>
            ${c.orders >= 5 ? '<span class="badge badge-orange" style="font-size:10px;">⭐ Loyal</span>' : ''}
          </div>
        </div>
      </td>
      <td style="color:var(--text-mid);font-size:13px;">${c.phone || '—'}</td>
      <td>${c.city ? `<span class="badge badge-blue">${c.city}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td><strong>${c.orders}</strong></td>
      <td><strong>₹${c.spent.toLocaleString('en-IN')}</strong></td>
      <td style="color:var(--text-muted);font-size:12px;">${formatDate(c.last)}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" title="View Profile" onclick="viewCustomer('${c.id}')">👁️</button>
          <button class="icon-btn" title="Message" onclick="openChatWith('${c.id}')">💌</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openChatWith(id) {
  viewCustomer(id);
  // Small delay to let the modal render before scrolling
  setTimeout(() => {
    const ta = document.querySelector('#customerModalBody .form-textarea');
    if (ta) ta.focus();
  }, 150);
}
function searchCustomers(q) {
  searchQ = q.toLowerCase();
  currentPage = 1; 
  renderCustomers();
}

function setCityFilter(value) {
  cityFilter = value;
  currentPage = 1; 
  renderCustomers();
}

function setTypeFilter(value) {
  typeFilter = value;
  currentPage = 1; 
  renderCustomers();
}

function viewCustomer(id) {
  // compare as strings since MongoDB ObjectId comes back as string
  const c = CUSTOMERS.find(x => String(x.id) === String(id));
  if (!c) return;

  document.getElementById('customerModalTitle').textContent = c.name || 'Customer Profile';
  document.getElementById('customerModalBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border-light);">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;">
        ${avatarLetter(c.name)}
      </div>
      <div>
        <div style="font-size:17px;font-weight:600;">${c.name || 'Unknown'}</div>
        <div style="color:var(--text-muted);font-size:13px;">
          ${c.email || ''}${c.phone ? ' · ' + c.phone : ''}${c.city ? ' · ' + c.city : ''}
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:18px;">
      <div style="text-align:center;background:var(--accent-soft);border-radius:8px;padding:14px;">
        <div style="font-size:20px;font-weight:700;color:var(--accent);">${c.orders}</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Orders</div>
      </div>
      <div style="text-align:center;background:var(--green-soft);border-radius:8px;padding:14px;">
        <div style="font-size:20px;font-weight:700;color:var(--green);">₹${c.spent.toLocaleString('en-IN')}</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Spent</div>
      </div>
      <div style="text-align:center;background:var(--blue-soft);border-radius:8px;padding:14px;">
        <div style="font-size:20px;font-weight:700;color:var(--blue);">${c.city || '—'}</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">City</div>
      </div>
    </div>
    <div class="form-label" style="margin-bottom:8px;">Last Order</div>
    <div style="background:#faf5f1;border-radius:8px;padding:12px;font-size:13px;color:var(--text-mid);">
      ${c.last
        ? `Last order placed on <strong>${formatDate(c.last)}</strong>. View full order history in the Orders section.`
        : 'No orders placed yet.'
      }
    </div>
    <div class="form-group" style="margin-top:16px;">
  <label class="form-label">Subject</label>
  <input class="form-input" id="msgSubject" placeholder="Subject…" value="Message from The Yarn Journey" />
</div>
<div class="form-group" style="margin-top:8px;">
  <label class="form-label">Message</label>
  <textarea class="form-textarea" id="msgBody" placeholder="Write a note or message…"></textarea>
</div>
  `;
  openModal('customerModal');
  // Wire the send button to actually read the textarea
const sendBtn = document.querySelector('#customerModal .modal-footer .btn-primary');
sendBtn.onclick = async () => {
  const subject = document.getElementById('msgSubject')?.value?.trim();
  const msg = document.getElementById('msgBody')?.value?.trim();

  if (!msg) {
    showToast('Please write a message first', 'warning');
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';

  try {
    await API.customers.sendMessage(c.id, subject, msg);
    showToast(`Message sent to ${c.name} 💌`, 'success');
    closeModal('customerModal');
  } catch (err) {
    showToast(err.message || 'Failed to send message', 'error');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = '💌 Send Message';
  }
};
}

function openChatWith(id) {
  viewCustomer(id);
  // Small delay to let the modal render before scrolling
  setTimeout(() => {
    const ta = document.querySelector('#customerModalBody .form-textarea');
    if (ta) ta.focus();
  }, 150);
}

function exportCustomers() {
  const rows = getFilteredCustomers();
  if (!rows.length) {
    showToast('No customers to export', 'warning');
    return;
  }

  const headers = ['Name', 'Email', 'Phone', 'City', 'Orders', 'Total Spent (₹)', 'Last Order'];
  const csvRows = [
    headers.join(','),
    ...rows.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      c.orders,
      c.spent,
      c.last ? new Date(c.last).toLocaleDateString('en-IN') : 'Never'
    ].join(','))
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customers-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${rows.length} customers`, 'success');
}

function renderPagination() {
  const filtered = getFilteredCustomers();
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);
  document.querySelector('.pagination span').textContent =
    `Showing ${from}–${to} of ${total} customers`;

  const container = document.querySelector('.pagination-pages');
  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">›</button>`;
  container.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  renderCustomers();
}

async function loadCustomers() {
  try {
    const data = await API.customers.getAll();
    CUSTOMERS = data.customers || [];
    updateStats();
    populateCityFilter();
    renderCustomers();
  } catch (err) {
    console.error('Failed to load customers:', err);
    showToast('Failed to load customers', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAdminTheme(); // Load theme first
  
  renderSidebar('customers');
  loadCustomers();
});