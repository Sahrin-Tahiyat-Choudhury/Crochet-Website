function renderRecentOrders(orders) {

  const tbody =
    document.getElementById(
      "recentOrdersBody"
    );

  tbody.innerHTML =
    orders.map(order => `
      <tr>
        <td>${order._id.slice(-6)}</td>

        <td>
          ${order.userId?.username || "Unknown"}
        </td>

        <td>
          ₹${order.finalAmount}
        </td>

        <td>
          ${order.status}
        </td>
      </tr>
    `).join("");
}

function renderLowStock(products) {

  const container =
    document.getElementById(
      "lowStockContainer"
    );

  container.innerHTML =
    products.map(product => `
      <div class="stock-alert">

        <div>
          <strong>
            ${product.name}
          </strong>

          <div>
            ${product.stockQuantity} left
          </div>
        </div>

      </div>
    `).join("");
}

async function loadBestSellingProducts() {
  try {
    const data = await API.products.getAll();

    const products = data.products || [];

    const html = products
      .slice(0, 5)
      .map(product => `
        <div style="margin-bottom:14px;">
          <div
            style="
              display:flex;
              justify-content:space-between;
              margin-bottom:5px;
            "
          >
            <span
              style="
                font-size:13px;
                font-weight:500;
              "
            >
              ${product.name}
            </span>

            <span
              style="
                font-size:12px;
                color:var(--text-muted);
              "
            >
              ₹${product.price?.sellingPrice || 0}
            </span>
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width:50%;"
            ></div>
          </div>
        </div>
      `)
      .join("");

    document.getElementById(
      "bestSellingProducts"
    ).innerHTML = html;

  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  loadAdminTheme(); // Load theme first
  
  renderSidebar("dashboard");

  await loadBestSellingProducts();
  
  await loadDashboard();
});

async function loadDashboard() {
  try {

    const stats = await API.analytics.getStats();

    const categories = await API.categories.getAll();

    document.getElementById("inventoryCount").textContent = `${(stats?.lowStockProducts || []).length} low stock`;

    document.getElementById("discountsCount").textContent = `${stats?.activeDiscounts || 0} active`;

    document.getElementById("categoriesCount").textContent =`${(categories?.categories || []).length} categories`;
    
    
    document.getElementById("totalProducts").textContent = stats?.totalProducts || 0;

    document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );


    document.getElementById(
      "totalCustomers"
    ).textContent =
      stats?.totalUsers || 0;

    document.getElementById(
      "totalRevenue"
    ).textContent =
      `₹${stats?.totalRevenue || 0}`;

    document.getElementById(
      "totalPendingOrders"
    ).textContent =
      stats?.pendingOrders || 0;

      document.getElementById(
        "productsCount"
    ).textContent =
    `${stats?.totalProducts || 0} total`;
    
    document.getElementById(
        "ordersCount"
        ).textContent =
    `${stats?.pendingOrders || 0} pending`;
    
    document.getElementById(
        "customersCount"
    ).textContent =
    `${stats?.totalUsers || 0} total`;


      renderRecentOrders(stats?.recentOrders || []);
      renderLowStock(stats?.lowStockProducts || []);

      // Update stat subtexts
      const todayOrders = (stats?.recentOrders || []).filter(o => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orderDate = new Date(o.createdAt);
        return orderDate >= today;
      }).length;
      document.getElementById("revenueSubtext").textContent = `↑ ${todayOrders} orders placed`;
      
      document.getElementById("pendingSubtext").textContent = `${stats?.pendingOrders || 0} needs attention`;
      
      const productsThisMonth = stats?.productsAddedThisMonth || 0;
      document.getElementById("productsSubtext").textContent = `↑ ${productsThisMonth} this month`;
      
      const customersThisMonth = stats?.newCustomersThisMonth || 0;
      document.getElementById("customersSubtext").textContent = `↑ ${customersThisMonth} this month`;

  } catch(error) {
    console.error(error);
  }
}


async function refreshDashboard() {
  await loadBestSellingProducts();
  await loadDashboard();
}

document.addEventListener(
  'DOMContentLoaded',
  loadDashboard
);

// Optional: Auto-refresh every 30 seconds
setInterval(refreshDashboard, 30000);

// Make refresh available globally
window.refreshDashboard = refreshDashboard;