const menuItems = [
  {
    id: "zinger-burger",
    name: "Zinger Burger",
    price: 550,
    emoji: "🍔",
    description: "Crispy chicken fillet with signature sauce and fresh toppings.",
    quantity: 0,
  },
  {
    id: "zinger-roll",
    name: "Zinger Roll",
    price: 420,
    emoji: "🌯",
    description: "Loaded zinger wrap with crunchy fries and creamy toppings.",
    quantity: 0,
  },
  {
    id: "club-sandwich",
    name: "Club Sandwich",
    price: 480,
    emoji: "🥪",
    description: "Triple-layer sandwich with chicken, salad, and toasted bread.",
    quantity: 0,
  },
  {
    id: "broast",
    name: "Broast",
    price: 700,
    emoji: "🍗",
    description: "Juicy crispy broast served with fries and dip.",
    quantity: 0,
  },
  {
    id: "fries",
    name: "Fries",
    price: 220,
    emoji: "🍟",
    description: "Golden crispy fries, hot and perfectly salted.",
    quantity: 0,
  },
];

const deliveryFee = 150;

const menuList = document.getElementById("menuList");
const itemCountBadge = document.getElementById("itemCountBadge");
const orderSummary = document.getElementById("orderSummary");
const subtotalValue = document.getElementById("subtotalValue");
const deliveryValue = document.getElementById("deliveryValue");
const totalValue = document.getElementById("totalValue");
const toast = document.getElementById("toast");
const placeOrderBtn = document.getElementById("placeOrderBtn");

const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const customerAddress = document.getElementById("customerAddress");

function formatCurrency(amount) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function getSelectedItems() {
  return menuItems.filter((item) => item.quantity > 0);
}

function getSubtotal() {
  return getSelectedItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateTotals() {
  const selectedItems = getSelectedItems();
  const subtotal = getSubtotal();
  const total = subtotal + (selectedItems.length > 0 ? deliveryFee : 0);

  itemCountBadge.textContent = `${selectedItems.reduce((count, item) => count + item.quantity, 0)} item${
    selectedItems.reduce((count, item) => count + item.quantity, 0) === 1 ? "" : "s"
  }`;

  subtotalValue.textContent = formatCurrency(subtotal);
  deliveryValue.textContent = formatCurrency(selectedItems.length > 0 ? deliveryFee : 0);
  totalValue.textContent = formatCurrency(total);
}

function renderMenu() {
  menuList.innerHTML = menuItems
    .map(
      (item) => `
        <article class="menu-item" data-id="${item.id}">
          <div class="item-top">
            <div class="item-tag">${item.emoji}</div>
            <div>
              <h3 class="item-title">${item.name}</h3>
              <div class="item-price">${formatCurrency(item.price)}</div>
            </div>
          </div>

          <p class="item-desc">${item.description}</p>

          <div class="quantity-row">
            <div class="stepper" aria-label="Quantity selector for ${item.name}">
              <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.name}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase ${item.name}">+</button>
            </div>
            <button type="button" class="add-btn" data-action="add" data-id="${item.id}">
              Add
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderOrderSummary() {
  const selectedItems = getSelectedItems();

  if (!selectedItems.length) {
    orderSummary.classList.add("empty");
    orderSummary.innerHTML = "<p>Your cart is empty.</p>";
    updateTotals();
    return;
  }

  orderSummary.classList.remove("empty");
  orderSummary.innerHTML = `
    <div class="summary-list">
      ${selectedItems
        .map(
          (item) => `
            <div class="summary-item">
              <div class="summary-label">
                <strong>${item.name}</strong>
                <small>Qty: ${item.quantity}</small>
              </div>
              <div class="summary-value">${formatCurrency(item.price * item.quantity)}</div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function updateQuantity(itemId, delta) {
  const item = menuItems.find((entry) => entry.id === itemId);
  if (!item) return;

  item.quantity = Math.max(0, item.quantity + delta);
  renderMenu();
  renderOrderSummary();
  updateTotals();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

menuList.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  const itemId = target.dataset.id;
  const action = target.dataset.action;

  if (!itemId || !action) return;

  const item = menuItems.find((entry) => entry.id === itemId);
  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
  }

  if (action === "decrease") {
    item.quantity = Math.max(0, item.quantity - 1);
  }

  if (action === "add") {
    item.quantity += 1;
    showToast(`${item.name} added to order`);
  }

  renderMenu();
  renderOrderSummary();
  updateTotals();
});

placeOrderBtn.addEventListener("click", () => {
  const selectedItems = getSelectedItems();
  const name = customerName.value.trim();
  const phone = customerPhone.value.trim();
  const address = customerAddress.value.trim();

  if (!selectedItems.length) {
    showToast("Please add at least one item before placing order.");
    return;
  }

  if (!name || !phone || !address) {
    showToast("Please complete your name, phone number, and delivery address.");
    return;
  }

  const total = getSubtotal() + deliveryFee;

  const orderSummaryText = selectedItems
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");

  showToast(
    `Order placed for ${name}! Total: ${formatCurrency(total)}.`
  );

  console.log("New order:", {
    customerName: name,
    phone,
    address,
    items: selectedItems,
    total,
    orderSummary: orderSummaryText,
  });

  customerName.value = "";
  customerPhone.value = "";
  customerAddress.value = "";

  menuItems.forEach((item) => {
    item.quantity = 0;
  });

  renderMenu();
  renderOrderSummary();
  updateTotals();
});

renderMenu();
renderOrderSummary();
updateTotals();
