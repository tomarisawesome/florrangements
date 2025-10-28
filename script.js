/* JAVASCRIPT for cart/adding bouquets */


let cart = JSON.parse(localStorage.getItem("cart")) || [];

// save cart
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// fully clear cart
function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
}

// bring back last saved cart
function syncCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
}

// ADD TO CART FUNCTION
function addToCart(name, price) {
  // synclatest saved cart
  syncCart();

  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  saveCart();
  alert(`${name} added to cart!`);
}

// OUR BOUQUETS — SIZE PICKER
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.href.includes("ourbouquets.html")) return;

  const popup = document.getElementById("size-popup");
  const cancelBtn = document.getElementById("popup-cancel");
  let currentBouquet = null;

  // when "ADD TO CART" button is clicked
  document.querySelectorAll(".bouquet-card .add-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = e.target.closest(".bouquet-card");
      const name = card.querySelector(".bouquet-name").textContent.trim();
      currentBouquet = name;
      popup.classList.remove("hidden");
    });
  });

  // when a size is chosen (then actually add to cart)
  document.querySelectorAll(".popup-buttons button").forEach(sizeBtn => {
    sizeBtn.addEventListener("click", () => {
      const size = sizeBtn.dataset.size;
      const price = parseFloat(sizeBtn.dataset.price);
      const name = `${currentBouquet} (${size})`;
      addToCart(name, price);
      popup.classList.add("hidden");
      currentBouquet = null;
    });
  });

  // cancel button
  cancelBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    currentBouquet = null;
  });
});

// DELETE ITEM FUNCTION
function deleteItem(index) {
  cart.splice(index, 1);

  if (cart.length === 0) {
    clearCart();
  } else {
    saveCart();
  }

  renderCart();
}

// RENDER CART PAGE
function renderCart() {
  const cartGrid = document.querySelector(".cart-grid");
  const orderSummary = document.querySelector(".order-summary");
  if (!cartGrid || !orderSummary) return;

  // sync latest cart state
  syncCart();

  // handle empty cart case
  if (cart.length === 0) {
    cartGrid.innerHTML = "<p>Your cart is empty 🛒</p>";
    orderSummary.innerHTML = "<p><strong>No items yet!</strong></p>";
    return;
  }

  cartGrid.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <div class="delete" data-index="${index}">X DELETE</div>
      <div class="cart-img"></div>
      <h4 class="bouquet-name">${item.name}</h4>
      <div class="quantity-controls">
        <button class="decrease" data-index="${index}">−</button>
        <span class="quantity">${item.quantity}</span>
        <button class="increase" data-index="${index}">+</button>
      </div>
      <div class="bouquet-price">$${item.price.toFixed(2)} each</div>
      <div class="item-total">Subtotal: $${itemTotal.toFixed(2)}</div>
    `;

    cartGrid.appendChild(cartItem);
  });

  orderSummary.innerHTML = `
    <strong>ORDER SUMMARY:</strong>
    <ol>
      ${cart
        .map(
          (item) =>
            `<li>${item.name} – <strong>${item.quantity} × $${item.price.toFixed(
              2
            )}</strong></li>`
        )
        .join("")}
    </ol>
    <p><strong>TOTAL: $${total.toFixed(2)}</strong></p>
  `;

  // delete item
  document.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      deleteItem(index);
    });
  });

  // quantity +
  document.querySelectorAll(".increase").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      cart[index].quantity += 1;
      saveCart();
      renderCart();
    });
  });

  // quantity - 
  document.querySelectorAll(".decrease").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }

      if (cart.length === 0) clearCart();
      else saveCart();

      renderCart();
    });
  });
}

// PAGE INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  // "Add to Cart" buttons (for all pages except ourbouquets)
  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      if (window.location.href.includes("ourbouquets.html")) return; // 🚫 skip for our bouquets
      const card = e.target.closest(".bouquet-card, .selection-card");
      const name = card.querySelector("h4").textContent;

      // find a price
      const priceElem =
        card.querySelector(".bouquet-price") || card.querySelector("p");
      const priceText = priceElem ? priceElem.textContent : "$0";
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

      addToCart(name, price);
    });
  });

  /* render cart */
  if (window.location.href.includes("cart.html")) {
    renderCart();
  }
});

// YOUR BOUQUETS CUSTOM BUILDER
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.href.includes("yourbouquets.html")) return;

  const sizeCards = document.querySelectorAll("#step-size .selection-card");
  const flowerCards = document.querySelectorAll("#step-flowers .selection-card");
  const noteField = document.getElementById("bouquet-note");
  const createBtn = document.getElementById("create-bouquet-btn");

  let selectedSize = null;
  let selectedPrice = 0;
  let selectedFlowers = [];

  // SIZE SELECTION 
  sizeCards.forEach(card => {
    card.addEventListener("click", () => {
      sizeCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedSize = card.dataset.size;
      selectedPrice = parseFloat(card.dataset.price);
    });
  });

  // FLOWER SELECTION
  flowerCards.forEach(card => {
    card.addEventListener("click", () => {
      const flower = card.dataset.flower;

      if (selectedFlowers.includes(flower)) {
        // deselect
        selectedFlowers = selectedFlowers.filter(f => f !== flower);
        card.classList.remove("selected");
      } else if (selectedFlowers.length < 3) {
        // select
        selectedFlowers.push(flower);
        card.classList.add("selected");
      } else {
        alert("You can select up to 3 flowers only!");
      }
    });
  });

  // create bouquet
  createBtn.addEventListener("click", () => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }

    const note = noteField.value.trim();
    const nameParts = [`Custom ${selectedSize} Bouquet`];
    if (selectedFlowers.length > 0) {
      nameParts.push(`(${selectedFlowers.join(", ")})`);
    }
    if (note) {
      nameParts.push(`– "${note}"`);
    }

    const customName = nameParts.join(" ");
    addToCart(customName, selectedPrice);
  });
});

// NAVBAR DROPDOWN TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  const parents = document.querySelectorAll("#nav .dropdown-parent > a");

  parents.forEach((a) => {
    a.setAttribute("aria-haspopup", "true");
    a.setAttribute("aria-expanded", "false");

    a.addEventListener("click", (e) => {
      if (a.getAttribute("href") === "#") e.preventDefault();

      const li = a.parentElement;
      const isOpen = li.classList.contains("open");

      // close other open dropdowns
      document.querySelectorAll("#nav li.open").forEach((n) => {
        n.classList.remove("open");
        const link = n.querySelector(":scope > a");
        if (link) link.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        li.classList.add("open");
        a.setAttribute("aria-expanded", "true");
      }
    });
  });

  // close dropdowns
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#nav")) {
      document.querySelectorAll("#nav li.open").forEach((n) => {
        n.classList.remove("open");
        const link = n.querySelector(":scope > a");
        if (link) link.setAttribute("aria-expanded", "false");
      });
    }
  });
});
