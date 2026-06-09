/* =============================================
   THE YARN JOURNEY — Orders Page JS
   ============================================= */

let orders = [];
let activeFilter = "all";     // order status: all/pending/shipped/delivered
let paymentFilter = "all";    // payment status: all/paid/pending/refunded
let dateSort = "newest";      // newest/oldest
let searchQ = "";
let currentOrderId = null;
let currentPage = 1;
let totalPages = 1;
let sortBy = "createdAt";
let sortOrder = "desc";

function getOrderTotal(o) {
  return o.finalAmount || o.totalAmount || o.totalPrice || o.price || 0;
}

function updateStats(orders) {
  document.getElementById("totalOrders").textContent = orders.length;

  document.getElementById("pendingOrders").textContent =
    orders.filter(o => o.status === "pending").length;

  document.getElementById("shippedOrders").textContent =
    orders.filter(o => o.status === "shipped").length;

  const revenue = orders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || o.price || 0), 0);

  document.getElementById("monthlyRevenue").textContent =
    `₹${revenue.toLocaleString("en-IN")}`;
}

function renderPagination(pagination) {
  // update subtitle
  const pending = orders.filter(o => o.status === 'pending').length;
  document.getElementById('pageSubtitle').textContent =
    `Track and manage customer orders · ${pending} pending`;

  // update "Showing X–Y of Z"
  const limit = 10;
  const from  = (currentPage - 1) * limit + 1;
  const to    = Math.min(currentPage * limit, pagination.total);
  document.querySelector('.pagination span').textContent =
    `Showing ${from}–${to} of ${pagination.total} orders`;

  // pagination buttons (existing code)
  const container = document.querySelector('.pagination-pages');
  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">‹</button>`;
  for (let i = 1; i <= pagination.pages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${currentPage === pagination.pages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">›</button>`;
  container.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  loadOrders();
}

function exportOrders() {
  const headers = ["Order ID", "Customer", "Total", "Status", "Payment", "Date"];

  const rows = orders.map(o => {
    const userName =
      o.userId?.username ||
      o.user?.username ||
      "Unknown";

    return [
      o._id,
      userName,
      o.finalAmount,
      o.status,
      o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString("en-IN")
    ];
  });

  let csv = [headers, ...rows]
    .map(e => e.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function statusBadgeOrder(s) {
  const map = {
    'delivered': 'badge-green',
    'shipped':   'badge-blue',
    'processing':'badge-orange',
    'pending':   'badge-yellow',
    'cancelled': 'badge-red',
    'approved': 'badge-teal',
    'rejected': 'badge-orange',
  };
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  return `<span class="badge ${map[s?.toLowerCase()] || 'badge-gray'}">${label}</span>`;
}

function paymentBadge(status) {

  return status === "paid"

    ? `<span class="badge badge-green">
         ✔ Paid
       </span>`

    : `<span class="badge badge-yellow">
         ⏳ Pending
       </span>`;
}

function setPaymentFilter(value) {
  paymentFilter = value;
  renderOrders();
}

function setDateSort(value) {
  dateSort = value;
  renderOrders();
}

function renderOrders() {
  const tbody = document.getElementById('ordersTbody');
  let rows = [...orders];

if (activeFilter !== 'all') {
  rows = rows.filter(o => o.status?.toLowerCase() === activeFilter.toLowerCase());
}

if (paymentFilter !== 'all') {
  rows = rows.filter(o => o.paymentStatus?.toLowerCase() === paymentFilter.toLowerCase());
}

if (searchQ) {
  rows = rows.filter(o =>
    o._id.toLowerCase().includes(searchQ) ||
    (o.userId?.username || o.user?.username || "").toLowerCase().includes(searchQ) ||
    (o.products || []).map(p => p.productId?.name || "").join(" ").toLowerCase().includes(searchQ)
  );
}

rows.sort((a, b) => {
  const aDate = new Date(a.createdAt || 0).getTime();
  const bDate = new Date(b.createdAt || 0).getTime();

  if (dateSort === "oldest") return aDate - bDate;
  return bDate - aDate; // newest first
});

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <div class="empty-icon">📦</div><h3>No orders found</h3>
      <p>Try a different filter or search term.</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(o => {
    const userName =
    o.userId?.username ||
    o.user?.username ||
    "Unknown";

    return`
    <tr>
<td>
  <span style="font-weight:600;color:var(--accent);">
    ${o._id.slice(-6)}
  </span>

  ${o.isBouquet ? `
    <div style="font-size:11px;color:#e67e22;">
      🌸 Bouquet
    </div>
  ` : ""}
</td>      <td><div style="font-weight:500;">${userName || "Unknown"}</div></td>
      <td><span style="font-size:12.5px;color:var(--text-mid);">${(o.products || o.flowers || []).length} item(s)</span></td>
      <td><strong>₹${getOrderTotal(o).toLocaleString("en-IN")}</strong></td>
      <td>${paymentBadge(o.paymentStatus)}</td>
      <td>${statusBadgeOrder(o.status)}</td>
      <td style="color:var(--text-muted);font-size:12px;">${new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" title="View" onclick="viewOrder('${o._id}')">👁️</button>
          <button class="icon-btn" title="Invoice" onclick="downloadInvoiceById('${o._id}')">📄</button>
           ${o.isBouquet
    ? `<button class="icon-btn danger" title="Reject Bouquet" onclick="rejectOrder('${o._id}')">🚫</button>`
    : `<button class="icon-btn danger" title="Cancel Order" onclick="cancelOrder('${o._id}')">✕</button>`
  }
        </div>
      </td>
    </tr>
  `}).join('');
}

function filterOrders(f) {
  activeFilter = f;
  document.querySelectorAll('[id^="tab-"]').forEach(b => {
    b.style.background = '';
    b.style.color = '';
    b.style.borderColor = '';
  });
  const active = document.getElementById('tab-' + f.toLowerCase());
  if (active) {
    active.style.background = 'var(--accent)';
    active.style.color = '#fff';
    active.style.borderColor = 'var(--accent)';
  }
  renderOrders();
}

function searchOrders(q) {
  searchQ = q.toLowerCase();
  renderOrders();
}
async function markPaymentVerified(orderId) {
  await updateOrder(orderId, 'processing'); // or 'confirmed' if you have that status
  showToast('Payment verified, order moved to processing', 'success');
}
function viewOrder(id) {
  currentOrderId = id;
  const o = orders.find(x => x._id === id);   // use orders, not ORDERS
  if (!o) return;

  const userName =
  o.userId?.username ||
  o.user?.username ||
  "Unknown";

  const statusOptions = o.isBouquet
  ? `
    <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
    <option value="confirmed" ${o.status==='confirmed'?'selected':''}>Confirmed</option>
    <option value="rejected" ${o.status==='rejected'?'selected':''}>Rejected</option>
  `
  : `
    <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
    <option value="processing" ${o.status==='processing'?'selected':''}>Processing</option>
    <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
    <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
    <option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelled</option>
    <option value="approved" ${o.status==='approved'?'selected':''}>Approved</option>
  `;

  document.getElementById('orderDetailTitle').textContent = `Order ${o._id}`;
  document.getElementById('orderDetailBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div><div class="form-label">Customer</div><div style="font-weight:500;margin-top:4px;">${userName}</div></div>
      <div><div class="form-label">Date</div><div style="margin-top:4px;">${new Date(o.createdAt).toLocaleDateString("en-IN")}</div></div>
      <div>
  <div class="form-label">Items</div>
  <div style="margin-top:4px;">
    ${
      o.isBouquet
        ? (o.flowers || []).map(f => f.product?.name || "Flower").join(", ")
        : (o.products || []).map(p => p.productId?.name || "Product").join(", ")
    }
  </div>
</div>
      <div><div class="form-label">Total</div><div style="font-weight:700;font-size:16px;margin-top:4px;color:var(--accent);">₹${getOrderTotal(o).toLocaleString("en-IN")}</div></div>
      <div><div class="form-label">Payment</div><div style="margin-top:4px;">${paymentBadge(o.paymentStatus)}</div></div>
      <div><div class="form-label">Status</div><div style="margin-top:4px;">${statusBadgeOrder(o.status)}</div></div>
    </div>
    <div class="form-group">
      <label class="form-label">Update Status</label>
      <select class="form-select">
      ${statusOptions}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Tracking Number</label>
      <input class="form-input" placeholder="Enter tracking number…" />
    </div>
    <div class="form-group">
      <label class="form-label">Note to Customer</label>
      <textarea class="form-textarea" placeholder="Optional message…"></textarea>
    </div>

    // Inside the orderDetailBody innerHTML, add:
${o.utrNumber ? `
  <div style="margin-top:12px;padding:12px;background:var(--bg2);border-radius:8px;">
    <div class="form-label">UTR / Payment Reference</div>
    <div style="font-weight:500;margin-top:4px;font-family:monospace">${o.utrNumber}</div>
    <button class="btn btn-primary" style="margin-top:8px" onclick="markPaymentVerified('${o._id}')">
      ✅ Mark Payment Verified
    </button>
  </div>
` : ''}
  `;
  openModal('orderDetailModal');

  document.getElementById("updateOrderBtn").onclick = async () => {
  const status = document.querySelector("#orderDetailBody select").value;

  const order = orders.find(o => o._id === id);

  if (order?.isBouquet) {

    // bouquet allowed statuses only
    if (status !== "confirmed" && status !== "rejected") {
      showToast("Bouquet orders only support confirmed/rejected", "error");
      return;
    }

    if (status === "rejected") {
      await API.bouquetOrder.reject(id);
      showToast("Bouquet order rejected", "success");
    }

    if (status === "confirmed") {
      await API.bouquetOrder.confirm?.(id); // if you add later
      showToast("Bouquet order confirmed", "success");
    }

  } else {
    await updateOrder(id, status);
  }

  closeModal("orderDetailModal");
  await loadOrders();
};
}

async function rejectOrder(id) {
  try {
    await API.bouquetOrder.reject(id);
    showToast("Bouquet order rejected", "success");
    await loadOrders();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Reject failed", "error");
  }
}

async function updateOrder(orderId, status) {
  const order = orders.find(o => o._id === orderId);

  try {
    if (order?.isBouquet) {
      showToast("Use bouquet status API for bouquet orders", "error");
      return;
    }

    await API.orders.updateOrderStatus(orderId, { status });

    showToast("Order status updated", "success");
    closeModal("orderDetailModal");
    await loadOrders();

  } catch (error) {
    console.error(error);
    showToast(error.message || "Failed to update order", "error");
  }
}

async function loadOrders() {
  try {
    const [data, bouquetData] = await Promise.all([
      API.orders.getAll({
        page: currentPage,
        limit: 10,
        status: activeFilter,
        sortBy,
        order: sortOrder
      }),

      API.bouquetOrder.getAdminAll() // OR getAdminAll() if you added it
    ]);

    const normalOrders = data.orders || [];
    const bouquetOrders = bouquetData.orders || [];

    orders = [
      ...normalOrders,
      ...bouquetOrders.map(o => ({
        ...o,
        isBouquet: true
      }))
    ];



    totalPages = data.pagination?.pages || 1;

    updateStats(orders);
    renderOrders();
    renderPagination(data.pagination);

  } catch (err) {
    console.error(err);
    showToast("Failed to load orders", "error");
  }
}

async function cancelOrder(orderId) {
  try {
    const order = orders.find(o => o._id === orderId);
    if (!order) {
      showToast("Order not found in UI", "error");
      return;
    }

    if (order.isBouquet) {
      await API.bouquetOrder.cancel(order._id);
      showToast("Bouquet order cancelled", "success");
    } else {
      await API.orders.cancel(order._id);
      showToast("Order cancelled", "success");
    }

    await loadOrders();

  } catch (err) {
    console.error(err);
    showToast(err.message || "Cancel failed", "error");
  }
}

function downloadInvoice(order) {
  const data = [
    ["Order ID", order._id],
    ["Customer", order.userId?.username || "Unknown"],
    ["Total", order.finalAmount],
    ["Status", order.status],
    ["Payment", order.paymentStatus],
    ["Date", new Date(order.createdAt).toLocaleString()]
  ];

  const csv = data.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${order._id}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
function downloadInvoiceById(id) {
  const order = orders.find(o => o._id === id);
  if (!order) return;

  downloadInvoice(order);
}

async function createManualOrder() {
  try {
    const userId      = document.getElementById('manualCustomerId').value;
    const contact     = document.getElementById('manualContact').value.trim();
    const sel         = document.getElementById('manualProduct');
    const productId   = sel.value;
    const price       = Number(sel.selectedOptions[0]?.dataset.price || 0);
    const quantity    = Number(document.getElementById('manualQuantity').value);
    const paymentMethod = document.getElementById('manualPayment').value;
    const address     = document.getElementById('manualAddress').value.trim();

    if (!userId)    return showToast('Please select a customer', 'error');
    if (!productId) return showToast('Please select a product', 'error');
    if (!address)   return showToast('Please enter a delivery address', 'error');

    const payload = {
      userId,                              // ← real customer _id now
      products: [{ productId, quantity, price }],
      totalAmount:    price * quantity,
      discountAmount: 0,
      finalAmount:    price * quantity,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      address: {
        fullName: document.getElementById('manualCustomerId').selectedOptions[0].text.split(' —')[0],
        street:   address,
        city:     'N/A',
        state:    'N/A',
        zipCode:  '000000',
        country:  'India'
      },
      contact
    };

    await API.admin.manualOrder(payload);
    showToast('Manual order created', 'success');
    closeModal('manualOrderModal');
    await loadOrders();

  } catch (err) {
    console.error(err);
    showToast('Failed to create order', 'error');
  }
}


async function openManualOrderModal() {
  openModal('manualOrderModal');

  // load customers
  const custSel = document.getElementById('manualCustomerId');
  custSel.innerHTML = '<option value="">Loading customers…</option>';

  // load products
  const prodSel = document.getElementById('manualProduct');
  prodSel.innerHTML = '<option value="">Loading products…</option>';

  try {
    const [custData, prodData] = await Promise.all([
      API.customers.getAll(),
      API.products.getAll()
    ]);

    const customers = custData.customers || custData;
    custSel.innerHTML = '<option value="">Select customer…</option>' +
      customers.map(c =>
        `<option value="${c._id}">${c.name} — ${c.email || c.phone || ''}</option>`
      ).join('');

    const products = prodData.products || prodData;
    prodSel.innerHTML = '<option value="">Select product…</option>' +
      products.map(p =>
        `<option value="${p._id}" data-price="${p.price?.sellingPrice || 0}">
          ${p.name} — ₹${p.price?.sellingPrice?.toLocaleString('en-IN')}
        </option>`
      ).join('');

  } catch (err) {
    console.error(err);
    custSel.innerHTML = '<option value="">Failed to load customers</option>';
    prodSel.innerHTML = '<option value="">Failed to load products</option>';
    showToast('Failed to load form data', 'error');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  loadAdminTheme(); // Load theme first

  renderSidebar("orders");

  await loadOrders();
});

