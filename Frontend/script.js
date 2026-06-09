const API_BASE = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:3000/api'
  : 'https://crochet-website-7n9s.onrender.com/api';
const DEFAULT_POST_AUTH_REDIRECT = 'index.html';

let products = [];
let cart = [];
let currentUser = null;
let activeFilter = 'all';

// ─── MYOB state ───────────────────────────────────────────────────────────────
let myobCart = {};
let myobAllProducts = [];
let myobActiveCategory = 'all';
let selectedProducts = [];
let myobFlowers = [];
let myobWrappers = [];
let selectedCustomFlowers = [];

// ─── Shared ID helper ─────────────────────────────────────────────────────────
// item.productId may be a populated object OR a raw string — this always returns the string ID
function getProductId(item) {
  return String(item.productId?._id || item.productId || item.product?._id || item.product || '');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── Auth: Logout ─────────────────────────────────────────────────────────────
async function logout() {
  try {
    await fetchJson(`${API_BASE}/auth/logout`, { method: 'GET' });
  } catch {}
  currentUser = null;
  cart = [];
  updateAuthLinks();
  updateCartBadge(0);
  updateCartPanel();
  showToast('Logged out. See you soon! 🌸');
  setTimeout(() => { window.location.href = 'login.html'; }, 800);
}

// ─── Cart panel toggle ────────────────────────────────────────────────────────
function toggleCart() {
  document.getElementById('cart-panel')?.classList.toggle('open');
  document.getElementById('cart-overlay')?.classList.toggle('open');
}

// ─── Search toggle ────────────────────────────────────────────────────────────
function toggleSearch() {
  showToast('Search coming soon!');
}

// ─── Mobile nav ───────────────────────────────────────────────────────────────
function toggleMobileNav() {
  document.getElementById('mobile-nav')?.classList.toggle('open');
  document.getElementById('mobile-overlay')?.classList.toggle('open');
}

// ─── Policy tabs ──────────────────────────────────────────────────────────────
function switchPolicy(btn, id) {
  document.querySelectorAll('.policy-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.policy-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`policy-${id}`)?.classList.add('active');
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function closeModal() {
  document.getElementById('product-modal')?.classList.remove('open');
}

// ─── Color helper ─────────────────────────────────────────────────────────────
function colorNameToHex(name) {
  const map = {
    red: '#e74c3c', pink: '#f48fb1', peach: '#f2b8a0', white: '#ffffff',
    cream: '#fff8f0', yellow: '#f9e07f', orange: '#f39c12', purple: '#9b59b6',
    lavender: '#c3aed6', blue: '#5dade2', green: '#58d68d', brown: '#a0522d',
    black: '#2c2c2c', coral: '#ff6b6b', lilac: '#c8a2c8',
  };
  return map[name?.toLowerCase()] || '#ccc';
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function initLoginPage() {
  if (currentUser) {
    window.location.href = getPostAuthRedirect(currentUser);
  }
}

function showPanel(panel) {
  document.getElementById('panel-signin').style.display = panel === 'signin' ? 'block' : 'none';
  document.getElementById('panel-create').style.display = panel === 'create' ? 'block' : 'none';
  const dots = document.querySelectorAll('.dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === (panel === 'signin' ? 0 : 1)));
}

async function handleSignIn(e) {
  e.preventDefault();
  const email    = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  if (!email || !password) return showToast('Please fill in all fields.');
  try {
    const data = await fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    currentUser = data.user || null;
    updateAuthLinks();
    showToast('Welcome back! 🌸');
    setTimeout(() => { window.location.href = getPostAuthRedirect(currentUser); }, 800);
  } catch (err) {
    showToast(err.message || 'Login failed. Please try again.');
  }
}

async function handleCreate(e) {
  e.preventDefault();
  const name     = document.getElementById('name')?.value.trim();
  const phone    = document.getElementById('new-phone')?.value.trim();
  const email    = document.getElementById('new-email')?.value.trim();
  const password = document.getElementById('new-password')?.value;
  if (!name || !email || !password) return showToast('Please fill in all fields.');
  try {
    const data = await fetchJson(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username: name, email, password, phone }),
    });
    currentUser = data.user || null;
    updateAuthLinks();
    showToast('Account created! Welcome 🌸');
    setTimeout(() => { window.location.href = getPostAuthRedirect(currentUser); }, 800);
  } catch (err) {
    showToast(err.message || 'Sign up failed. Please try again.');
  }
}

// ─── Coupon state ─────────────────────────────────────────────────────────────
let appliedCoupon = null;

async function applyCouponCode() {
  const code = document.getElementById('checkout-coupon')?.value.trim();
  const feedback = document.getElementById('coupon-feedback');
  if (!code) return showToast('Enter a coupon code first.');
  try {
    const data = await API.cart.applyCoupon(code);
    appliedCoupon = {
      code:           data.couponCode,
      discountAmount: data.discountAmount,
      finalAmount:    data.finalAmount,
    };
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.color   = 'green';
      feedback.textContent   = `✅ "${data.couponCode}" applied — you save ₹${data.discountAmount}! New total: ₹${data.finalAmount}`;
    }
    const totalEl = document.getElementById('cart-page-total');
    if (totalEl) totalEl.textContent = `₹${data.finalAmount.toFixed(2)}`;
    showToast(`Coupon applied! Saving ₹${data.discountAmount} 🎉`);
  } catch (err) {
    appliedCoupon = null;
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.color   = 'crimson';
      feedback.textContent   = `❌ ${err.message}`;
    }
  }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
async function handleCheckout() {
  if (!currentUser) { showToast('Please log in to place an order.'); return redirectToLogin(); }
  if (!cart.length) return showToast('Your cart is empty.');

  const fullName = document.getElementById('checkout-fullname')?.value.trim();
  const phone    = document.getElementById('checkout-phone')?.value.trim();
  const street   = document.getElementById('checkout-street')?.value.trim();
  const city     = document.getElementById('checkout-city')?.value.trim();
  const state    = document.getElementById('checkout-state')?.value.trim();
  const zip      = document.getElementById('checkout-zip')?.value.trim();
  const country  = document.getElementById('checkout-country')?.value.trim() || 'India';

  if (!fullName || !phone || !street || !city || !state || !zip) {
    return showToast('Please fill in all shipping details.');
  }

  const subtotal = cart.reduce((s, i) => {
    const price = i.productId?.price?.sellingPrice || i.price || 0;
    return s + price * i.quantity;
  }, 0);

  const payload = {
    address: { fullName, phone, street, city, state, zipCode: zip, country },
    products: cart.map(item => {
      const product = item.productId || item.product || {};
      return {
        productId: product._id || product.id || item.productId,
        quantity:  item.quantity,
        price:     product.price?.sellingPrice || item.price || 0,
      };
    }),
    totalAmount:    subtotal,
    couponCode:     appliedCoupon?.code     || null,
    discountAmount: appliedCoupon?.discountAmount ?? 0,
    finalAmount:    appliedCoupon?.finalAmount    ?? subtotal,
    paymentMethod:  'UPI',
    status:         'pending',
  };

  try {
    await API.orders.placeOrder(payload);
    showToast('✅ Order placed! Awaiting admin approval.');
    await API.cart.clear();
    cart = [];
    updateCartBadge(0);
    updateCartPanel();
    renderCartPage();

    appliedCoupon = null;
    const feedback    = document.getElementById('coupon-feedback');
    const couponInput = document.getElementById('checkout-coupon');
    if (feedback)    feedback.style.display = 'none';
    if (couponInput) couponInput.value = '';

    const footer = document.getElementById('cart-page-footer');
    const items  = document.getElementById('cart-page-items');
    if (footer) footer.style.display = 'none';
    if (items) items.innerHTML = `
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:60px;margin-bottom:16px">🎉</div>
        <h3 style="font-family:var(--font-display);font-size:26px;color:var(--dark);margin-bottom:12px">Order Placed!</h3>
        <p style="color:var(--brown-light);font-size:15px;line-height:1.7;max-width:400px;margin:0 auto">
          Your order is pending admin approval.<br>Once approved, a Pay Now button will appear on your Orders page.
        </p>
        <a href="home.html" class="btn-primary" style="display:inline-block;margin-top:24px">Continue Shopping →</a>
      </div>`;
  } catch (err) {
    showToast(err.message || 'Failed to place order. Please try again.');
  }
}

// ─── fetchJson ────────────────────────────────────────────────────────────────
async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data?.message || response.statusText || 'Request failed');
  return data;
}

// ─── mapProductData ───────────────────────────────────────────────────────────
function mapProductData(product) {
  const mrp  = product.price?.originalPrice || 0;
  const sell = product.price?.sellingPrice  || 0;
  return {
    id:       product._id || product.id,
    name:     product.name,
    cat:      product.category?.name || product.cat || 'Uncategorised',
    icon:     '🧶',
    uri:      product.uri || product.image || '',
    mrp, sell,
    discount: mrp > sell ? Math.round(((mrp - sell) / mrp) * 100) : 0,
    date:     product.createdAt || product.date || '',
    desc:     product.description || product.desc || '',
    shipping: product.shipping || 'Dispatched in 3–5 days. Ships nationwide across India.',
    material: product.material || '',
    rating:   product.rating || null,
    reviews:  product.reviewCount || 0,
    colors:   product.colors || [],
    type:     product.type || '',
    stockQuantity: product.stockQuantity ?? 99,
  };
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getPostAuthRedirect(user = currentUser) {
  const redirect = getQueryParam('redirect');
  const defaultRedirect = user?.role === 'admin' ? 'Admin/index.html' : DEFAULT_POST_AUTH_REDIRECT;
  if (!redirect) return defaultRedirect;
  if (/^https?:\/\//i.test(redirect) || redirect.startsWith('//')) return defaultRedirect;
  const clean = redirect.replace(/^\/+/, '').replace(/\\/g, '/');
  if (!clean || clean.includes('login.html')) return defaultRedirect;
  if (clean.toLowerCase().startsWith('admin/') && user?.role !== 'admin') {
    showToast('Please sign in with an admin account to open the admin dashboard.');
    return defaultRedirect;
  }
  return clean;
}

// ─── App init ─────────────────────────────────────────────────────────────────
async function initApp() {
  await initAuth();
  await loadCategories();
  await loadProducts();
  await refreshCart();
  updateAuthLinks();

  if (document.getElementById('myob-products-grid')) {
    await initMyobPicker();
  }

  populateCustomFlowerChips();

  if (document.getElementById('custom-flower-chips')) {
    populateCustomFlowerChips();
  }

  if (document.getElementById('custom-product-type')) {
    populateCustomProductTypes();
  }

  if (document.getElementById('cart-page-items')) {
    await initCartPage();
  }

  if (window.location.pathname.endsWith('login.html')) {
    initLoginPage();
  }

  if (document.getElementById('orders-list')) {
    await initOrdersPage();
  }
}

async function initAuth() {
  try {
    const data = await fetchJson(`${API_BASE}/auth/get-me`);
    currentUser = data.user || null;
  } catch {
    currentUser = null;
  }
}

function updateAuthLinks() {
  Array.from(document.querySelectorAll('a[href="login.html"]')).forEach(link => {
    if (currentUser) {
      link.textContent = 'Logout';
      link.href = '#';
      link.onclick = e => { e.preventDefault(); logout(); };
    } else {
      link.textContent = 'Login';
      link.href = 'login.html';
      link.onclick = null;
    }
  });
}

function redirectToLogin() {
  if (window.location.pathname.endsWith('login.html')) return;
  const redirect = window.location.pathname.replace(/.*\//, '');
  window.location.href = `login.html?redirect=${encodeURIComponent(redirect)}`;
}

// ─── Orders page ──────────────────────────────────────────────────────────────
async function initOrdersPage() {
  const el = document.getElementById('orders-list');
  if (!el) return;

  if (!currentUser) {
    el.innerHTML = '<p style="text-align:center">Please <a href="login.html">log in</a> to view your orders.</p>';
    return;
  }

  try {
    const data = await fetchJson(`${API_BASE}/order/my-orders`);
    const orders = Array.isArray(data) ? data : (data.orders || []);

    if (!orders.length) {
      el.innerHTML = '<p style="text-align:center;color:var(--brown-light)">No orders yet 🌸</p>';
      return;
    }

    el.innerHTML = orders.map(o => {
      const isApproved = o.status === 'approved';
      return `
        <div style="border:1px solid var(--blush-deep);border-radius:14px;padding:20px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span style="font-family:var(--font-display);font-size:15px;font-weight:600">Order #${o._id.slice(-6)}</span>
            <span style="font-size:12px;padding:4px 12px;border-radius:20px;background:${statusColor(o.status)};color:#fff">${o.status}</span>
          </div>
          <div style="font-size:14px;color:var(--brown-light);margin-bottom:8px">
            ${o.products.map(p => `${p.productId?.name || 'Item'} × ${p.quantity}`).join(', ')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-family:var(--font-display);font-size:16px;color:var(--dark)">₹${o.finalAmount}</span>
            <span style="font-size:12px;color:var(--brown-light)">${new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          ${isApproved ? `
            <div style="margin-top:16px;padding:16px;background:var(--blush);border-radius:10px">
              <p style="font-size:14px;font-weight:600;color:var(--dark);margin-bottom:8px">✅ Order Approved — Complete your payment</p>
              <p style="font-size:13px;color:var(--brown);margin-bottom:12px">Amount due: <strong>₹${o.finalAmount}</strong></p>
              <button class="btn-primary" style="width:100%;padding:12px"
                onclick="event.preventDefault(); openRazorpay('${o._id}', ${o.finalAmount})">
                Pay Now →
              </button>
            </div>` : ''}
        </div>`;
    }).join('');
  } catch (err) {
    el.innerHTML = '<p style="color:crimson">Failed to load orders.</p>';
  }
}

function statusColor(s) {
  return { pending:'#bbb', approved:'#2ecc71', processing:'#f39c12', shipped:'#3498db', delivered:'#27ae60', cancelled:'#e74c3c' }[s] || '#bbb';
}

async function openRazorpay(orderId, amount) {
  try {
    const data = await fetchJson(`${API_BASE}/payment/order`, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });

    const options = {
      key:         'rzp_test_SiY1LuvLCi3e7D',
      amount:      data.amount,
      currency:    data.currency,
      name:        'The Yarn Journey',
      description: `Order #${String(orderId).slice(-6)}`,
      order_id:    data.razorpayOrderId,
      handler: async function (response) {
        try {
          await fetchJson(`${API_BASE}/payment/verify`, {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId,
            }),
          });
          showToast('🎉 Payment successful! Your order is being processed.');
          await initOrdersPage();
        } catch (err) {
          showToast('Payment verification failed. Please contact support.');
        }
      },
      prefill: { name: currentUser?.username || '', email: currentUser?.email || '' },
      theme: { color: '#c9856a' },
    };

    try {
      const rzp = new window.Razorpay(options);
      setTimeout(() => rzp.open(), 0);
    } catch (err) {
      console.error('Razorpay init error:', err);
    }
  } catch (err) {
    showToast(err.message || 'Could not initiate payment.');
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────
async function loadCategories() {
  try {
    const data = await fetchJson(`${API_BASE}/product/categories`);
    const categories = data.categories || [];

    const catGrid = document.querySelector('.cat-grid');
    if (catGrid) {
      catGrid.innerHTML = categories.map(cat => `
        <div class="cat-card" onclick="filterProducts('${cat.name}', null); document.getElementById('featured')?.scrollIntoView({behavior:'smooth'})">
          <span class="cat-icon">🌸</span>
          <div class="cat-name">${cat.name}</div>
        </div>
      `).join('') + `
        <div class="cat-cta" onclick="window.location.href='product.html'">
          <span style="font-size:30px">✨</span>
          <div class="cat-name">Make Your Own Bouquet</div>
          <span style="font-size:13px;color:var(--brown-light)">Customize → Order</span>
        </div>`;
    }

    const filterDiv = document.querySelector('.filter-sort');
    if (filterDiv) {
      filterDiv.innerHTML = `
        <button class="filter-btn active" onclick="filterProducts('all', this)">All</button>
        ${categories.map(cat => `
          <button class="filter-btn" onclick="filterProducts('${cat.name}', this)">${cat.name}</button>
        `).join('')}
        <select class="filter-btn" onchange="sortProducts(this.value)" style="padding-right:30px">
          <option value="">Sort by</option>
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
        </select>`;
    }
  } catch (err) {
    console.warn('Could not load categories:', err.message);
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────
async function loadProducts() {
  try {
    const data = await fetchJson(`${API_BASE}/product?limit=200`);
    products = Array.isArray(data.products)
      ? data.products.map(mapProductData).sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];
  } catch (err) {
    console.warn('Could not load products from backend:', err.message);
    products = [];
  }
  filterProducts(activeFilter, document.querySelector('.filter-btn.active'));
}

function renderProducts(data) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!data.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--brown-light);font-family:var(--font-display);font-size:20px">No products found 🌸</div>';
    return;
  }
  grid.innerHTML = data.map(p => {
    const disc = p.mrp ? Math.round((1 - p.sell / p.mrp) * 100) : 0;
    const imgMarkup = p.uri
      ? `<img src="${p.uri}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:70px;background:var(--blush-mid)">${p.icon}</div>`;
    return `<div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
      <div class="product-img-wrap">
        ${imgMarkup}
        <div class="product-badge">${disc}% OFF</div>
        <button class="product-wishlist" onclick="event.stopPropagation();this.textContent=this.textContent=='🤍'?'❤️':'🤍';showToast('Wishlist updated!')">🤍</button>
        <button class="product-quick-add" onclick="event.stopPropagation();addToCart('${p.id}')">+ Quick Add to Cart</button>
      </div>
      <div class="product-info">
        <div class="product-cat-tag">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          <span class="price-sell">₹${p.sell}</span>
          <span class="price-mrp">₹${p.mrp}</span>
          <span class="price-off">${disc}% Off</span>
        </div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.round(p.rating || 0))}${'☆'.repeat(5 - Math.round(p.rating || 0))}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterProducts(cat, btn) {
  activeFilter = cat;
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const filtered = cat === 'all' ? products : products.filter(p => p.cat?.toLowerCase() === cat.toLowerCase());
  renderProducts(filtered);
}

function sortProducts(val) {
  let data = activeFilter === 'all' ? [...products] : products.filter(p => p.cat?.toLowerCase() === activeFilter.toLowerCase());
  if      (val === 'low')  data.sort((a, b) => a.sell - b.sell);
  else if (val === 'high') data.sort((a, b) => b.sell - a.sell);
  else if (val === 'az')   data.sort((a, b) => a.name.localeCompare(b.name));
  else if (val === 'za')   data.sort((a, b) => b.name.localeCompare(a.name));
  else if (val === 'new')  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (val === 'old')  data.sort((a, b) => new Date(a.date) - new Date(b.date));
  renderProducts(data);
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
async function refreshCart() {
  if (!currentUser) { cart = []; updateCartBadge(0); updateCartPanel(); return; }
  try {
    const data = await fetchJson(`${API_BASE}/cart`);
    cart = Array.isArray(data.items) ? data.items : [];
    updateCartBadge(cart.reduce((s, i) => s + i.quantity, 0));
    updateCartPanel();
  } catch {
    cart = []; updateCartBadge(0); updateCartPanel();
  }
}

function updateCartBadge(count) {
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = count;
}

function updateCartPanel() {
  const panel = document.getElementById('cart-items-wrap');
  const total = document.getElementById('cart-total');
  if (!panel || !total) return;
  if (!cart.length) {
    panel.innerHTML = '<div class="cart-empty"><span class="ce-icon">🛒</span>Your cart is empty.<br><small style="font-size:14px;margin-top:8px;display:block">Add some handcrafted magic!</small></div>';
    total.textContent = '₹0.00';
    return;
  }
  panel.innerHTML = cart.map(item => {
    const product   = item.productId || item.product;
    const productId = getProductId(item);
    const name      = product?.name || 'Unknown product';
    const price     = product?.price?.sellingPrice || item.price || 0;
    return `<div class="cart-item">
      <div class="cart-item-img"><span style="font-size:30px">🧶</span></div>
      <div style="flex:1">
        <div class="cart-item-name">${name}</div>
        <div class="cart-item-price">₹${price}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${productId}',-1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty('${productId}',1)">+</button>
          <button onclick="removeItem('${productId}')" style="margin-left:8px;background:none;border:none;cursor:pointer;color:var(--brown-light);font-size:18px">🗑</button>
        </div>
      </div>
      <div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--dark)">₹${price * item.quantity}</div>
    </div>`;
  }).join('');
  const totalAmt = cart.reduce((s, i) => {
    const price = i.productId?.price?.sellingPrice || i.price || 0;
    return s + price * i.quantity;
  }, 0);
  total.textContent = `₹${totalAmt.toFixed(2)}`;
}

async function addToCart(id, quantity = 1) {
  if (!currentUser) { showToast('Please log in before adding items to the cart'); return redirectToLogin(); }
  try {
    const data = await fetchJson(`${API_BASE}/cart/add`, {
      method: 'POST',
      body: JSON.stringify({ productId: id, quantity }),
    });
    cart = Array.isArray(data.cart?.items) ? data.cart.items : cart;
    updateCartBadge(cart.reduce((s, i) => s + i.quantity, 0));
    updateCartPanel();
    showToast('🛍️ Item added to cart');
  } catch (err) {
    showToast(err.message);
  }
}

async function changeQty(id, delta) {
  if (!currentUser) return redirectToLogin();
  // Use getProductId + String comparison so ObjectId objects and strings both match
  const item = cart.find(x => getProductId(x) === String(id));
  if (!item) return showToast('Item not found in cart.');
  const newQty = item.quantity + delta;
  if (newQty < 1) return removeItem(id);
  try {
    const data = await fetchJson(`${API_BASE}/cart/item/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: newQty }),
    });
    cart = Array.isArray(data.cart?.items) ? data.cart.items : cart;
    updateCartBadge(cart.reduce((s, x) => s + x.quantity, 0));
    updateCartPanel();
    if (document.getElementById('cart-page-items')) renderCartPage();
  } catch (err) {
    showToast(err.message);
  }
}

async function removeItem(id) {
  if (!currentUser) return redirectToLogin();
  try {
    const data = await fetchJson(`${API_BASE}/cart/item/${id}`, { method: 'DELETE' });
    cart = Array.isArray(data.cart?.items) ? data.cart.items : cart;
    updateCartBadge(cart.reduce((s, x) => s + x.quantity, 0));
    updateCartPanel();
    if (document.getElementById('cart-page-items')) renderCartPage();
    showToast('Item removed from cart');
  } catch (err) {
    showToast(err.message);
  }
}

// ─── Cart page ────────────────────────────────────────────────────────────────
async function initCartPage() {
  const itemsEl   = document.getElementById('cart-page-items');
  const emptyEl   = document.getElementById('cart-page-empty');
  const footerEl  = document.getElementById('cart-page-footer');
  const checkForm = document.getElementById('checkout-form');
  if (!itemsEl || !emptyEl || !footerEl) return;

  if (!currentUser) {
    itemsEl.innerHTML = '<div style="text-align:center;padding:60px 20px"><p style="font-size:20px;color:var(--brown)">Please <a href="login.html">log in</a> to view your cart.</p></div>';
    emptyEl.style.display  = 'none';
    footerEl.style.display = 'none';
    if (checkForm) checkForm.style.display = 'none';
    return;
  }

  try {
    const data = await fetchJson(`${API_BASE}/cart`);
    cart = Array.isArray(data.items) ? data.items : [];
  } catch { cart = []; }

  renderCartPage();

  try {
    const data = await fetchJson(`${API_BASE}/auth/get-me`);
    const u = data.user;
    const phoneEl = document.getElementById('checkout-phone');
    const cityEl  = document.getElementById('checkout-city');
    if (phoneEl && u?.phone) phoneEl.value = u.phone;
    if (cityEl  && u?.city)  cityEl.value  = u.city;
  } catch {}
}

function renderCartPage() {
  const itemsEl   = document.getElementById('cart-page-items');
  const emptyEl   = document.getElementById('cart-page-empty');
  const footerEl  = document.getElementById('cart-page-footer');
  const totalEl   = document.getElementById('cart-page-total');
  const checkForm = document.getElementById('checkout-form');
  if (!itemsEl || !emptyEl || !footerEl || !totalEl) return;

  if (!cart.length) {
    emptyEl.style.display  = 'block';
    footerEl.style.display = 'none';
    if (checkForm) checkForm.style.display = 'none';
    itemsEl.innerHTML = '';
    return;
  }

  emptyEl.style.display  = 'none';
  footerEl.style.display = 'block';
  if (checkForm) checkForm.style.display = 'flex';

  itemsEl.innerHTML = cart.map(item => {
    const product   = item.productId || item.product || {};
    const productId = getProductId(item); // always a clean string
    const price     = product.price?.sellingPrice || item.price || 0;
    return `<div class="cart-item" style="border-bottom:1px solid var(--blush-mid);padding:16px 0;display:flex;gap:14px;align-items:center">
      <div style="width:70px;height:70px;background:var(--blush);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0">🧶</div>
      <div style="flex:1">
        <div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--dark)">${product.name || 'Product'}</div>
        <div style="font-size:14px;color:var(--brown);margin-top:4px">₹${price} each</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
          <button class="qty-btn" onclick="changeQty('${productId}', -1)" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">−</button>
          <span style="font-size:15px;font-weight:600;min-width:20px;text-align:center">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty('${productId}', 1)" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">+</button>
          <button onclick="removeItem('${productId}')" style="margin-left:6px;background:none;border:none;cursor:pointer;color:var(--brown-light);font-size:20px;line-height:1" title="Remove">🗑</button>
        </div>
      </div>
      <div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--dark);white-space:nowrap">₹${price * item.quantity}</div>
    </div>`;
  }).join('');

  const total = cart.reduce((s, i) => {
    const price = i.productId?.price?.sellingPrice || i.price || 0;
    return s + price * i.quantity;
  }, 0);
  totalEl.textContent = `₹${total.toFixed(2)}`;
}

// ─── My Orders (orders page) ──────────────────────────────────────────────────
async function loadMyOrders() {
  const listEl  = document.getElementById('orders-list');
  const emptyEl = document.getElementById('orders-empty');
  if (!listEl || !emptyEl) return;

  if (!currentUser) {
    listEl.innerHTML = '<div style="text-align:center;padding:60px 20px"><p style="font-size:18px;color:var(--brown)">Please <a href="login.html">log in</a> to view your orders.</p></div>';
    return;
  }

  try {
    const data   = await API.orders.getMyOrders();
    const orders = Array.isArray(data) ? data : (data.orders || []);

    if (!orders.length) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    listEl.innerHTML = orders.map(order => {
      const statusBadge  = (order.status || 'pending').toLowerCase();
      const productsList = (order.products || [])
        .map(p => `${p.productId?.name || p.name || 'Unknown'} × ${p.quantity || 0}`)
        .join(', ');
      const orderDate = new Date(order.createdAt || order.date).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
      return `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-id">Order #${order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}</div>
              <div style="font-size:13px;color:var(--brown-light);margin-top:2px">${orderDate}</div>
            </div>
            <span class="order-status ${statusBadge}">${statusBadge}</span>
          </div>
          <div class="order-items">
            <div style="font-size:13px;color:var(--brown)">${productsList}</div>
          </div>
          <div class="order-footer">
            <span style="color:var(--brown-light)">Total</span>
            <span style="color:var(--dark)">₹${(order.finalAmount || order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    listEl.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--brown-light)">Unable to load orders. ${err.message}</div>`;
  }
}

// ─── MYOB ─────────────────────────────────────────────────────────────────────
async function initMyobPicker() {
  const grid = document.getElementById('myob-products-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="myob-loader">Loading flowers... 🌸</div>';
  try {
    const data = await API.bouquetOrder.getAll();
    myobFlowers     = (data.flowers  || []).map(mapProductData);
    myobWrappers    = (data.wrappers || []).map(mapProductData);
    myobAllProducts = myobFlowers;
    if (!myobFlowers.length) {
      grid.innerHTML = '<div class="myob-loader">No flowers available yet 🌸</div>';
      return;
    }
    populateAllWrapperOptions();
    renderMyobGrid(myobFlowers);
    populateCustomFlowerChips();
  } catch (err) {
    console.error('initMyobPicker failed:', err);
    grid.innerHTML = '<div class="myob-loader">Could not load flowers. Please refresh.</div>';
  }
}

// ─── Single wrapper populator — handles both selects ─────────────────────────
function populateAllWrapperOptions() {
  ['myob-wrapper', 'co-wrapper'].forEach(selectId => {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Select wrapper</option>';
    myobWrappers.forEach(wrapper => {
      select.innerHTML += `<option value="${wrapper.id}">${wrapper.name} (₹${wrapper.sell})</option>`;
    });
  });
}

function myobFilterByCategory(cat, btn) {
  myobActiveCategory = cat;
  document.querySelectorAll('.myob-cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = cat === 'all'
    ? myobAllProducts
    : myobAllProducts.filter(p => p.cat?.toLowerCase() === cat.toLowerCase());
  const emptyEl = document.getElementById('myob-empty-state');
  const grid    = document.getElementById('myob-products-grid');
  if (!filtered.length) {
    grid.style.display    = 'none';
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    grid.style.display    = 'grid';
    renderMyobGrid(filtered);
  }
}

function renderMyobGrid(data) {
  const grid = document.getElementById('myob-products-grid');
  if (!grid) return;
  grid.innerHTML = data.map(p => {
    const inCart    = myobCart[p.id];
    const qty       = inCart ? inCart.quantity : 0;
    const imgSrc    = p.uri || '';
    const colorDots = p.colors?.length
      ? `<div class="myob-color-dots">${p.colors.slice(0,5).map(c => `<span class="myob-color-dot" style="background:${colorNameToHex(c)}" title="${c}"></span>`).join('')}</div>`
      : '';
    return `
      <div class="myob-product-card ${qty > 0 ? 'in-bouquet' : ''}" id="myob-card-${p.id}">
        <div class="myob-card-img">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
            : `<span style="font-size:36px">${p.icon || '🌸'}</span>`}
          ${qty > 0 ? `<div class="myob-qty-badge">${qty}</div>` : ''}
        </div>
        <div class="myob-card-body">
          <div class="myob-card-cat">${p.cat}</div>
          <div class="myob-card-name">${p.name}</div>
          ${colorDots}
          <div class="myob-card-price">₹${p.sell}</div>
          <div class="myob-card-actions">
            ${qty === 0
              ? `<button class="myob-add-btn" onclick="myobAddItem('${p.id}')">+ Add</button>`
              : `<div class="myob-qty-controls">
                  <button class="qty-btn" onclick="myobChangeQty('${p.id}', -1)">−</button>
                  <span class="qty-num">${qty}</span>
                  <button class="qty-btn" onclick="myobChangeQty('${p.id}', 1)">+</button>
                 </div>`}
          </div>
        </div>
      </div>`;
  }).join('');
}

function myobAddItem(productId) {
  const p = myobAllProducts.find(x => String(x.id) === String(productId));
  if (!p) return;
  myobCart[productId] = { product: p, quantity: 1 };
  myobRefreshUI();
}

function myobChangeQty(productId, delta) {
  if (!myobCart[productId]) return;
  const newQty = myobCart[productId].quantity + delta;
  if (newQty <= 0) {
    delete myobCart[productId];
  } else {
    myobCart[productId].quantity = newQty;
  }
  myobRefreshUI();
}

function myobRefreshUI() {
  const filtered = myobActiveCategory === 'all'
    ? myobAllProducts
    : myobAllProducts.filter(p => p.cat?.toLowerCase() === myobActiveCategory.toLowerCase());
  renderMyobGrid(filtered);

  const items        = Object.values(myobCart);
  const stemCount    = items.reduce((s, i) => s + i.quantity, 0);
  const total        = items.reduce((s, i) => s + i.product.sell * i.quantity, 0);
  const summaryWrap  = document.getElementById('myob-summary-wrap');
  const summaryItems = document.getElementById('myob-summary-items');
  const stemCountEl  = document.getElementById('myob-stem-count');
  const totalPriceEl = document.getElementById('myob-total-price');
  const extrasEl     = document.getElementById('myob-extras');

  if (!summaryWrap) return;

  if (!items.length) {
    summaryWrap.style.display = 'none';
    if (extrasEl) extrasEl.style.display = 'none';
    return;
  }

  summaryWrap.style.display = 'block';
  if (extrasEl) extrasEl.style.display = 'block';

  summaryItems.innerHTML = items.map(({ product, quantity }) => `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="color:rgba(255,248,243,0.8);font-size:13px">${product.name} × ${quantity}</span>
      <span style="color:var(--peach-soft);font-size:13px;font-weight:600">₹${product.sell * quantity}</span>
    </div>`).join('');

  stemCountEl.textContent  = `${stemCount} stem${stemCount !== 1 ? 's' : ''}`;
  totalPriceEl.textContent = `₹${total}`;
}

async function submitMyobOrder() {
  if (!currentUser) { showToast('Please log in first.'); return redirectToLogin(); }
  const flowers = Object.values(myobCart).map(item => ({ product: item.product.id, quantity: item.quantity }));
  if (!flowers.length) return showToast('Select at least one flower.');
  const wrapperId = document.getElementById('myob-wrapper')?.value;
  const payload   = { flowers };
  if (wrapperId) payload.wrapper = { product: wrapperId, quantity: 1 };
  try {
    await API.bouquetOrder.submit(payload);
    showToast('Bouquet order submitted!');
    myobCart = {};
    myobRefreshUI();
    document.getElementById('myob-wrapper').value = '';
  } catch (err) {
    showToast(err.message);
  }
}

// ─── Custom Order ─────────────────────────────────────────────────────────────
function populateCustomFlowerChips() {
  const container = document.getElementById('custom-flower-chips');
  if (!container) return;
  container.innerHTML = myobFlowers.map(flower => `
    <button type="button" class="flower-chip" onclick="toggleCustomFlowerChip(this, '${flower.name}')">
      ${flower.name}
    </button>`).join('');
}

function toggleCustomFlowerChip(btn, flower) {
  btn.classList.toggle('active');
  if (selectedCustomFlowers.includes(flower)) {
    selectedCustomFlowers = selectedCustomFlowers.filter(f => f !== flower);
  } else {
    selectedCustomFlowers.push(flower);
  }
}

function populateCustomProductTypes() {
  const select = document.getElementById('custom-product-type');
  if (!select) return;
  const cats = [...new Set(products.map(p => p.cat).filter(Boolean))];
  select.innerHTML = '<option value="">Select a product type</option>';
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

async function submitCustomOrder() {
  if (!currentUser) { showToast('Please log in to submit a custom order request.'); return redirectToLogin(); }

  const name        = document.getElementById('custom-name')?.value.trim();
  const contact     = document.getElementById('custom-contact')?.value.trim();
  const productType = document.getElementById('custom-product-type')?.value.trim();
  const colors      = document.getElementById('custom-colors')?.value.trim();
  const wrapper     = document.getElementById('custom-wrapper-style')?.value.trim();
  const budget      = document.getElementById('custom-budget')?.value.trim();
  const occasion    = document.getElementById('custom-occasion')?.value.trim();
  const quantity    = Number(document.getElementById('custom-quantity')?.value) || 1;
  const description = document.getElementById('custom-description')?.value.trim();

  if (!name || !contact || !productType || !description) {
    return showToast('Please complete the custom order form before sending.');
  }

  try {
    await API.customOrder.submit({
      productType, flowerSelection: selectedCustomFlowers,
      wrapperStyle: wrapper, colorPreference: colors,
      quantity, budget, occasion, description, name, contact,
    });

    ['custom-name','custom-contact','custom-colors','custom-budget','custom-description']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['custom-product-type','custom-wrapper-style','custom-occasion']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    const qtyEl = document.getElementById('custom-quantity');
    if (qtyEl) qtyEl.value = '1';

    document.querySelectorAll('#custom-flower-chips .flower-chip')
      .forEach(btn => btn.classList.remove('active'));

    selectedCustomFlowers = [];
    showToast('✅ Custom order request sent.');
  } catch (err) {
    showToast(err.message);
  }
}

async function loadReviews() {
    try {
        const reviews = await API.reviews.getAll();

        const container =
            document.getElementById('reviews-slider');

        container.innerHTML = '';

        reviews.forEach(review => {
            container.innerHTML += `
                <div class="review-card">

                    <div class="review-header">
                        <div class="review-avatar">
                            ${review.userId?.name?.charAt(0) || 'U'}
                        </div>

                        <div>
                            <div class="review-name">
                                ${review.userId?.name || 'Customer'}
                            </div>

                            <div class="review-date">
                                ${new Date(
                                    review.createdAt
                                ).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div class="review-stars">
                        ${'★'.repeat(review.rating)}
                    </div>

                    <p class="review-text">
                        "${review.comment}"
                    </p>

                    <div class="review-product">
                        Ordered:
                        <span class="review-product-tag">
                            ${review.productId?.name || ''}
                        </span>
                    </div>

                </div>
            `;
        });
    }
    catch (err) {
        console.error(err);
    }
}
window.addEventListener('DOMContentLoaded', initApp);
