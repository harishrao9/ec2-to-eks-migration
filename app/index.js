const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.APP_ENV || 'EC2';
const VERSION = process.env.APP_VERSION || '1.0.0';

app.use(express.json());

// ── DATA ──
const restaurants = [
  {
    id: 1, name: "Spice Garden", cuisine: "North Indian", rating: 4.5,
    deliveryTime: "25-35 min", minOrder: 149, image: "🍛",
    tags: ["Popular", "Bestseller"],
    menu: [
      { id: 101, name: "Butter Chicken", price: 280, desc: "Creamy tomato gravy with tender chicken" },
      { id: 102, name: "Dal Makhani", price: 180, desc: "Slow cooked black lentils in butter" },
      { id: 103, name: "Garlic Naan", price: 50, desc: "Freshly baked with garlic and butter" },
      { id: 104, name: "Paneer Tikka", price: 220, desc: "Grilled cottage cheese with spices" }
    ]
  },
  {
    id: 2, name: "Pizza Palace", cuisine: "Italian", rating: 4.3,
    deliveryTime: "30-40 min", minOrder: 199, image: "🍕",
    tags: ["New"],
    menu: [
      { id: 201, name: "Margherita Pizza", price: 249, desc: "Classic tomato, mozzarella, basil" },
      { id: 202, name: "BBQ Chicken Pizza", price: 329, desc: "Smoky BBQ with grilled chicken" },
      { id: 203, name: "Pasta Arrabbiata", price: 189, desc: "Penne in spicy tomato sauce" },
      { id: 204, name: "Garlic Bread", price: 99, desc: "Toasted with herb butter" }
    ]
  },
  {
    id: 3, name: "Biryani House", cuisine: "Hyderabadi", rating: 4.7,
    deliveryTime: "20-30 min", minOrder: 199, image: "🍚",
    tags: ["Top Rated", "Popular"],
    menu: [
      { id: 301, name: "Chicken Biryani", price: 299, desc: "Dum cooked with basmati rice" },
      { id: 302, name: "Mutton Biryani", price: 399, desc: "Slow cooked tender mutton" },
      { id: 303, name: "Veg Biryani", price: 199, desc: "Fragrant rice with mixed vegetables" },
      { id: 304, name: "Raita", price: 49, desc: "Cooling yogurt with cucumber" }
    ]
  },
  {
    id: 4, name: "Burger Barn", cuisine: "American", rating: 4.2,
    deliveryTime: "20-25 min", minOrder: 99, image: "🍔",
    tags: ["Fast Delivery"],
    menu: [
      { id: 401, name: "Classic Beef Burger", price: 199, desc: "Juicy beef patty with lettuce, tomato" },
      { id: 402, name: "Crispy Chicken Burger", price: 179, desc: "Fried chicken with coleslaw" },
      { id: 403, name: "Loaded Fries", price: 129, desc: "Fries with cheese sauce and jalapeños" },
      { id: 404, name: "Chocolate Shake", price: 99, desc: "Thick and creamy milkshake" }
    ]
  }
];

const orders = [];
let orderIdCounter = 1000;

// ── HTML UI ──
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FoodRush</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; color: #222; }

  /* NAV */
  nav { background: #e63946; color: white; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .logo { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .logo span { color: #ffd166; }
  .nav-right { display: flex; align-items: center; gap: 16px; }
  .cart-btn { background: white; color: #e63946; border: none; border-radius: 20px; padding: 6px 16px; font-weight: 600; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; }
  .cart-count { background: #ffd166; color: #222; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }

  /* ENV BADGE */
  .env-bar { background: #222; color: #ffd166; text-align: center; padding: 6px; font-size: 12px; font-weight: 500; }
  .env-badge { display: inline-block; background: #e63946; color: white; border-radius: 4px; padding: 1px 8px; margin: 0 4px; font-size: 11px; }

  /* HERO */
  .hero { background: linear-gradient(135deg, #e63946 0%, #c1121f 100%); color: white; padding: 40px 24px; }
  .hero h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
  .hero p { font-size: 16px; opacity: 0.9; margin-bottom: 20px; }
  .search-bar { background: white; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; max-width: 500px; }
  .search-bar input { border: none; outline: none; font-size: 15px; flex: 1; color: #222; }
  .search-icon { font-size: 18px; }

  /* CATEGORIES */
  .section { padding: 24px; }
  .section-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
  .categories { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
  .cat-chip { background: white; border: 2px solid #eee; border-radius: 24px; padding: 8px 18px; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
  .cat-chip:hover, .cat-chip.active { background: #e63946; color: white; border-color: #e63946; }

  /* RESTAURANT CARDS */
  .restaurants { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .rest-card { background: white; border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .rest-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
  .rest-img { background: #fff5f5; height: 140px; display: flex; align-items: center; justify-content: center; font-size: 64px; position: relative; }
  .rest-tags { position: absolute; top: 10px; left: 10px; display: flex; gap: 6px; }
  .tag-badge { background: #e63946; color: white; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
  .tag-badge.new { background: #06d6a0; }
  .rest-info { padding: 14px; }
  .rest-name { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
  .rest-cuisine { font-size: 13px; color: #666; margin-bottom: 8px; }
  .rest-meta { display: flex; gap: 16px; font-size: 13px; color: #444; }
  .rating { color: #f4a261; font-weight: 600; }
  .min-order { color: #888; font-size: 12px; margin-top: 6px; }

  /* MODAL */
  .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; overflow-y: auto; }
  .modal-overlay.open { display: flex; align-items: flex-start; justify-content: center; padding: 20px; }
  .modal { background: white; border-radius: 20px; width: 100%; max-width: 560px; overflow: hidden; margin: auto; }
  .modal-header { background: #e63946; color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
  .modal-header h2 { font-size: 20px; }
  .close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
  .menu-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; border-bottom: 1px solid #f0f0f0; }
  .menu-item:last-child { border-bottom: none; }
  .item-info h4 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .item-info p { font-size: 13px; color: #666; }
  .item-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .item-price { font-size: 15px; font-weight: 700; color: #e63946; }
  .add-btn { background: #e63946; color: white; border: none; border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .add-btn:hover { background: #c1121f; }
  .qty-ctrl { display: flex; align-items: center; gap: 8px; }
  .qty-btn { background: #f5f5f5; border: none; border-radius: 6px; width: 28px; height: 28px; font-size: 16px; cursor: pointer; font-weight: 600; }

  /* CART SIDEBAR */
  .cart-sidebar { position: fixed; right: 0; top: 0; height: 100%; width: 360px; background: white; box-shadow: -4px 0 20px rgba(0,0,0,0.15); z-index: 300; transform: translateX(100%); transition: transform 0.3s; display: flex; flex-direction: column; }
  .cart-sidebar.open { transform: translateX(0); }
  .cart-header { background: #e63946; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
  .cart-items { flex: 1; overflow-y: auto; padding: 16px; }
  .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
  .cart-item-name { font-size: 14px; font-weight: 500; }
  .cart-item-price { font-size: 14px; color: #e63946; font-weight: 600; }
  .cart-footer { padding: 16px; border-top: 2px solid #f0f0f0; }
  .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; margin-bottom: 12px; }
  .checkout-btn { background: #e63946; color: white; border: none; border-radius: 12px; padding: 14px; width: 100%; font-size: 16px; font-weight: 700; cursor: pointer; }
  .checkout-btn:hover { background: #c1121f; }
  .empty-cart { text-align: center; padding: 40px 20px; color: #888; }
  .empty-cart div { font-size: 48px; margin-bottom: 12px; }

  /* ORDER SUCCESS */
  .order-success { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 400; align-items: center; justify-content: center; }
  .order-success.open { display: flex; }
  .success-box { background: white; border-radius: 20px; padding: 40px; text-align: center; max-width: 360px; }
  .success-icon { font-size: 64px; margin-bottom: 16px; }
  .success-box h2 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  .success-box p { color: #666; margin-bottom: 20px; }
  .order-id { background: #fff5f5; color: #e63946; border-radius: 8px; padding: 8px 16px; font-weight: 700; display: inline-block; margin-bottom: 20px; }
  .ok-btn { background: #e63946; color: white; border: none; border-radius: 12px; padding: 12px 32px; font-size: 16px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>

<div class="env-bar">
  Running on <span class="env-badge" id="envLabel">EC2</span> &nbsp;|&nbsp;
  Version: <span id="versionLabel">1.0.0</span> &nbsp;|&nbsp;
  Host: <span id="hostLabel">...</span>
</div>

<nav>
  <div class="logo">Food<span>Rush</span> 🚀</div>
  <div class="nav-right">
    <span style="font-size:13px;opacity:0.9">Mangalore, Karnataka</span>
    <button class="cart-btn" onclick="toggleCart()">
      🛒 Cart <span class="cart-count" id="cartCount">0</span>
    </button>
  </div>
</nav>

<div class="hero">
  <h1>Hungry? We've got you! 🍽️</h1>
  <p>Order from the best restaurants in Mangalore</p>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="Search for restaurants or dishes..." oninput="filterRestaurants(this.value)" />
  </div>
</div>

<div class="section">
  <div class="section-title">Categories</div>
  <div class="categories">
    <div class="cat-chip active" onclick="filterCuisine('all', this)">🍽️ All</div>
    <div class="cat-chip" onclick="filterCuisine('North Indian', this)">🍛 North Indian</div>
    <div class="cat-chip" onclick="filterCuisine('Italian', this)">🍕 Italian</div>
    <div class="cat-chip" onclick="filterCuisine('Hyderabadi', this)">🍚 Biryani</div>
    <div class="cat-chip" onclick="filterCuisine('American', this)">🍔 Burgers</div>
  </div>
</div>

<div class="section" style="padding-top:0">
  <div class="section-title">Restaurants near you</div>
  <div class="restaurants" id="restaurantGrid"></div>
</div>

<!-- Restaurant Modal -->
<div class="modal-overlay" id="restaurantModal">
  <div class="modal">
    <div class="modal-header">
      <div>
        <h2 id="modalTitle"></h2>
        <div style="font-size:13px;opacity:0.85" id="modalMeta"></div>
      </div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div id="menuItems"></div>
  </div>
</div>

<!-- Cart Sidebar -->
<div class="cart-sidebar" id="cartSidebar">
  <div class="cart-header">
    <h3>Your Order 🛒</h3>
    <button class="close-btn" onclick="toggleCart()">✕</button>
  </div>
  <div class="cart-items" id="cartItems"></div>
  <div class="cart-footer" id="cartFooter"></div>
</div>

<!-- Order Success -->
<div class="order-success" id="orderSuccess">
  <div class="success-box">
    <div class="success-icon">🎉</div>
    <h2>Order Placed!</h2>
    <p>Your food is being prepared and will arrive soon.</p>
    <div class="order-id" id="orderId"></div>
    <br>
    <button class="ok-btn" onclick="closeSuccess()">Track Order</button>
  </div>
</div>

<script>
const restaurants = ${JSON.stringify(restaurants)};
let cart = {};
let activeRestaurant = null;
let currentCuisine = 'all';
let searchQuery = '';

function renderRestaurants() {
  const grid = document.getElementById('restaurantGrid');
  const filtered = restaurants.filter(r => {
    const matchCuisine = currentCuisine === 'all' || r.cuisine === currentCuisine;
    const matchSearch = r.name.toLowerCase().includes(searchQuery) || r.cuisine.toLowerCase().includes(searchQuery);
    return matchCuisine && matchSearch;
  });

  grid.innerHTML = filtered.map(r => \`
    <div class="rest-card" onclick="openRestaurant(\${r.id})">
      <div class="rest-img">
        <div class="rest-tags">
          \${r.tags.map(t => \`<span class="tag-badge \${t==='New'?'new':''}">\${t}</span>\`).join('')}
        </div>
        \${r.image}
      </div>
      <div class="rest-info">
        <div class="rest-name">\${r.name}</div>
        <div class="rest-cuisine">\${r.cuisine}</div>
        <div class="rest-meta">
          <span class="rating">⭐ \${r.rating}</span>
          <span>🕐 \${r.deliveryTime}</span>
        </div>
        <div class="min-order">Min order: ₹\${r.minOrder}</div>
      </div>
    </div>
  \`).join('');
}

function filterCuisine(cuisine, el) {
  currentCuisine = cuisine;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderRestaurants();
}

function filterRestaurants(val) {
  searchQuery = val.toLowerCase();
  renderRestaurants();
}

function openRestaurant(id) {
  activeRestaurant = restaurants.find(r => r.id === id);
  document.getElementById('modalTitle').textContent = activeRestaurant.image + ' ' + activeRestaurant.name;
  document.getElementById('modalMeta').textContent = activeRestaurant.cuisine + ' • ⭐ ' + activeRestaurant.rating + ' • ' + activeRestaurant.deliveryTime;
  renderMenu();
  document.getElementById('restaurantModal').classList.add('open');
}

function closeModal() {
  document.getElementById('restaurantModal').classList.remove('open');
}

function renderMenu() {
  const container = document.getElementById('menuItems');
  container.innerHTML = activeRestaurant.menu.map(item => {
    const qty = cart[item.id] ? cart[item.id].qty : 0;
    return \`
      <div class="menu-item">
        <div class="item-info">
          <h4>\${item.name}</h4>
          <p>\${item.desc}</p>
        </div>
        <div class="item-right">
          <span class="item-price">₹\${item.price}</span>
          \${qty === 0
            ? \`<button class="add-btn" onclick="addToCart(\${item.id}, '\${item.name}', \${item.price})">ADD</button>\`
            : \`<div class="qty-ctrl">
                <button class="qty-btn" onclick="changeQty(\${item.id}, -1)">−</button>
                <span>\${qty}</span>
                <button class="qty-btn" onclick="changeQty(\${item.id}, 1)">+</button>
              </div>\`
          }
        </div>
      </div>
    \`;
  }).join('');
}

function addToCart(id, name, price) {
  cart[id] = { name, price, qty: 1 };
  updateCartUI();
  if (activeRestaurant) renderMenu();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartUI();
  if (activeRestaurant) renderMenu();
}

function updateCartUI() {
  const total = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
  const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (count === 0) {
    itemsEl.innerHTML = '<div class="empty-cart"><div>🛒</div><p>Your cart is empty</p></div>';
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = Object.entries(cart).map(([id, item]) => \`
    <div class="cart-item">
      <div>
        <div class="cart-item-name">\${item.name}</div>
        <div style="font-size:12px;color:#888">x\${item.qty}</div>
      </div>
      <div class="cart-item-price">₹\${item.price * item.qty}</div>
    </div>
  \`).join('');

  footerEl.innerHTML = \`
    <div class="total-row"><span>Total</span><span>₹\${total}</span></div>
    <div style="font-size:12px;color:#888;margin-bottom:12px">Delivery fee: ₹30 • Estimated: 30 min</div>
    <button class="checkout-btn" onclick="placeOrder()">Place Order — ₹\${total + 30}</button>
  \`;
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
}

function placeOrder() {
  const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  if (count === 0) return;

  const orderId = 'FR-' + Math.floor(Math.random() * 90000 + 10000);
  document.getElementById('orderId').textContent = 'Order ID: ' + orderId;
  document.getElementById('orderSuccess').classList.add('open');
  document.getElementById('cartSidebar').classList.remove('open');

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, items: cart, total: Object.values(cart).reduce((s,i) => s+i.price*i.qty,0) + 30 })
  });

  cart = {};
  updateCartUI();
}

function closeSuccess() {
  document.getElementById('orderSuccess').classList.remove('open');
}

// Load env info
fetch('/api/info').then(r => r.json()).then(d => {
  document.getElementById('envLabel').textContent = d.env;
  document.getElementById('versionLabel').textContent = d.version;
  document.getElementById('hostLabel').textContent = d.hostname;
});

renderRestaurants();
</script>
</body>
</html>`;

// ── ROUTES ──
app.get('/', (req, res) => res.send(html));

app.get('/api/info', (req, res) => {
  res.json({
    app: 'FoodRush',
    env: ENV,
    version: VERSION,
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: Math.floor(process.uptime()) + 's'
  });
});

app.get('/api/restaurants', (req, res) => res.json(restaurants));

app.get('/api/restaurants/:id', (req, res) => {
  const r = restaurants.find(r => r.id === parseInt(req.params.id));
  if (!r) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(r);
});

app.post('/api/orders', (req, res) => {
  const order = { ...req.body, timestamp: new Date().toISOString(), status: 'confirmed' };
  orders.push(order);
  res.status(201).json({ success: true, order });
});

app.get('/api/orders', (req, res) => res.json(orders));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', env: ENV, version: VERSION, uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 FoodRush running on port ${PORT} | ENV: ${ENV} | Version: ${VERSION}`);
});