async function loadAnalytics(period = 'this_month') {
  try {

    const stats =
      await API.analytics.getStats(period);

      console.log(stats);

    document.getElementById(
      "revenueValue"
    ).textContent =
      `₹${stats.totalRevenue.toLocaleString("en-IN")}`;

    document.getElementById(
      "ordersValue"
    ).textContent =
      stats.totalOrders;

    document.getElementById(
      "avgOrderValue"
    ).textContent =
      `₹${stats.avgOrderValue.toLocaleString("en-IN")}`;

    document.getElementById(
      "customersValue"
    ).textContent =
      stats.totalUsers;

    document.getElementById('revenueSub').textContent = `${stats.totalOrders} paid orders`;

    document.getElementById(
      "ordersSub"
    ).textContent =
      `${stats.pendingOrders} pending`;

    document.getElementById(
      "avgOrderSub"
    ).textContent =
      "Current average";

    document.getElementById(
      "customersSub"
    ).textContent =
      `${stats.totalUsers} registered customers`;

    renderTopProducts(
      stats.bestSellingProducts
    );
    renderCategoryRevenue(
  stats.categoryRevenue
);

renderMonthlyRevenue(
  stats.monthlyRevenue
);

renderTopCities(
  stats.topCities
);

renderDailyOrders(stats.dailyOrders, stats.currentMonth, stats.currentYear);

  } catch (error) {

    console.error(error);

    showToast(
      "Failed to load analytics",
      "error"
    );
  }
}
function exportAnalytics() {
  const rows = [
    ['Metric', 'Value'],
    ['Total Revenue', `₹${document.getElementById('revenueValue').textContent}`],
    ['Total Orders', document.getElementById('ordersValue').textContent],
    ['Avg Order Value', document.getElementById('avgOrderValue').textContent],
    ['Total Customers', document.getElementById('customersValue').textContent],
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function renderTopProducts(products) {

  const container =
    document.getElementById(
      "topProducts"
    );

  container.innerHTML =
    products.map((product, index) => `
      <li>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="top-rank">
            ${index + 1}
          </div>
          <div>
            <div style="font-weight:500;">
              ${product.name}
            </div>
            <div style="font-size:11px;color:var(--text-muted);">
              ${product.sold || 0} sold
            </div>
          </div>
        </div>

        <strong>
          ${product.sold || 0}
        </strong>
      </li>
    `).join("");
}

function renderCategoryRevenue(categories) {

  const container =
    document.getElementById("categoryChart");

  if (!categories?.length) {
    container.innerHTML =
      "<p>No category data available</p>";
    return;
  }

  const maxRevenue = Math.max(
    ...categories.map(c => c.revenue)
  );

  container.innerHTML =
    categories.map(category => {

      const width =
        (category.revenue / maxRevenue) * 100;

      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label">
            ${category._id || "Uncategorized"}
          </div>

          <div class="chart-bar-track">
            <div
              class="chart-bar-fill"
              style="width:${width}%">
              ₹${category.revenue.toLocaleString("en-IN")}
            </div>
          </div>

          <div class="chart-bar-value">
            ₹${Math.round(category.revenue)}
          </div>
        </div>
      `;
    }).join("");
}

function renderMonthlyRevenue(monthlyRevenue) {
  const chart = document.getElementById("monthChart");
  const labels = document.getElementById("monthLabels");

  if (!monthlyRevenue?.length) {
    chart.innerHTML = "<p>No monthly data</p>";
    return;
  }

  // Safety-sort in case backend order varies
  const sorted = [...monthlyRevenue].sort((a, b) =>
    a._id.year !== b._id.year
      ? a._id.year - b._id.year
      : a._id.month - b._id.month
  );

  const maxRevenue = Math.max(...sorted.map(m => m.revenue));
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  chart.innerHTML = sorted.map(item => {
    const height = (item.revenue / maxRevenue) * 100;
    return `
  <div
    style="flex:1; height:${height}%; background:var(--accent); border-radius:4px 4px 0 0; min-height:4px;"
    title="${monthNames[item._id.month - 1]} ${item._id.year}: ₹${item.revenue.toLocaleString('en-IN')}">
  </div>
`;
  }).join("");

  labels.innerHTML = sorted.map(item =>
    `<span>${monthNames[item._id.month - 1]}</span>`
  ).join("");
}

function renderTopCities(cities) {

  const container =
    document.getElementById("cityChart");

  if (!cities?.length) {
    container.innerHTML =
      "<p>No city data available</p>";
    return;
  }

  const maxCount =
    Math.max(
      ...cities.map(c => c.count)
    );

  container.innerHTML =
    cities.map(city => {

      const width =
        (city.count / maxCount) * 100;

      return `
        <div class="chart-bar-row">

          <div class="chart-bar-label">
            ${city._id || "Unknown"}
          </div>

          <div class="chart-bar-track">
            <div
              class="chart-bar-fill"
              style="width:${width}%">
              ${city.count}
            </div>
          </div>

          <div class="chart-bar-value">
            ${city.count}
          </div>

        </div>
      `;
    }).join("");
}

function renderDailyOrders(dailyOrders, month, year) {
  const container = document.getElementById('dailyChart');
  const titleEl = document.getElementById('dailyOrdersTitle');
  const labelsEl = document.getElementById('dailyLabels');

  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  if (titleEl) titleEl.textContent = `Daily Orders — ${monthName}`;

  if (!dailyOrders?.length) {
    container.innerHTML = '<p>No daily order data</p>';
    return;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const maxOrders = Math.max(...dailyOrders.map(d => d.orders));

  // Build a full array for every day of the month
  const dayMap = {};
  dailyOrders.forEach(d => { dayMap[d._id.day] = d.orders; });

  container.innerHTML = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const orders = dayMap[day] || 0;
    const height = orders ? (orders / maxOrders) * 100 : 2; // 2% min height for empty days
    const opacity = orders ? '1' : '0.15';
    return `
      <div
        style="flex:1;height:${height}%;background:var(--accent);border-radius:3px 3px 0 0;opacity:${opacity};"
        title="Day ${day}: ${orders} order${orders !== 1 ? 's' : ''}">
      </div>
    `;
  }).join('');

  // Dynamic labels
  if (labelsEl) {
    const checkpoints = [1, 7, 14, 21, daysInMonth];
    const shortMonth = new Date(year, month - 1).toLocaleString('en-IN', { month: 'short' });
    labelsEl.innerHTML = checkpoints
      .map(d => `<span>${d} ${shortMonth}</span>`)
      .join('');
  }
}

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    loadAdminTheme(); // Load theme first

    renderSidebar("analytics");

    await loadAnalytics();
  }
);