// Global Cart
let cart = [];

// ------------------- RENDER CART -------------------
async function renderCart() {
    const sidebar = document.querySelector(".side-bar");
    const mainBar = document.querySelector(".main-bar");
    sidebar.innerHTML = "";

    const email = localStorage.getItem("email");
    if (email && cart.length === 0) {
        // Fetch existing cart from backend if local cart is empty
        const existingCart = await fetchUserCart(email);
        if (existingCart.length > 0) {
            cart = existingCart; // populate global cart
        }
    }

    if (cart.length === 0) {
        sidebar.classList.remove("visible");
        mainBar.classList.remove("shrunk");
        return;
    }

    sidebar.classList.add("visible");
    mainBar.classList.add("shrunk");

    let total = 0;

    // Aggregate for display only
    const aggregated = cart.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { ...item, quantity: 1, lastItemId: item.itemId };
        } else {
            acc[item.id].quantity++;
            acc[item.id].lastItemId = item.itemId; // track last added instance
        }
        return acc;
    }, {});
    
    Object.values(aggregated).forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <span>${item.name} x ${item.quantity} | ₹${(item.price * item.quantity).toFixed(2)}</span>
            <div>
                <button class="plus">+</button>
                <button class="minus">-</button>
            </div>
        `;

        div.querySelector(".plus").addEventListener("click", () => addToCart(item));
        div.querySelector(".minus").addEventListener("click", () => removeFromCart(item.lastItemId));
        sidebar.appendChild(div);
    });

    // Total + Addons button
    const footerDiv = document.createElement("div");
    footerDiv.classList.add("cart-total");
    footerDiv.innerHTML = `<hr><p>Total: ₹${total.toFixed(2)}</p>`;

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Addons";
    footerDiv.appendChild(addBtn);
    sidebar.appendChild(footerDiv);

    addBtn.addEventListener("click", () => {
        window.location.href = "/addtheaddons";
    });
}

// ------------------- CART FOOTER -------------------
function renderCartFooter(total) {
    const sidebar = document.querySelector(".side-bar");
    const footer = document.createElement("div");
    footer.classList.add("cart-footer");

    footer.innerHTML = `
        <hr>
        <p>Total: $${total.toFixed(2)}</p>
        <button id="btnAddAddons">Add Addons</button>
    `;

    sidebar.appendChild(footer);

    document.getElementById("btnAddAddons").addEventListener("click", saveCart);
}

// ------------------- ADD / REMOVE -------------------
async function addToCart(burger) {
    const email = localStorage.getItem("email");
    if (!email) return alert("Please log in!");

    const burgersInDb = await fetchUserCart(email);
    const sameBurgerCount = burgersInDb.filter(b => b.name === burger.name).length;

    const newBurger = {
        id: burger.id,
        name: burger.name,
        price: burger.price,
        addons : [],
        itemId: `${burger.id}-${sameBurgerCount + 1}`,
        quantity: 1
    };
    console.log(newBurger);

    try {
        console.log("trying to post burger in db");
        const res = await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, cart: [newBurger] })
        });

        const data = await res.json(); // ✅ Parse response JSON
        console.log("Server response:", data);

        if (!res.ok) {
            const errText = await res.text();
            console.error("Failed to save cart:", errText);
            return alert("Failed to add item to cart");
        }

        cart.push(newBurger); // update local array
        renderCart();

    } catch (err) {
        console.error(err);
        alert("Server error while adding to cart");
    }
}

async function removeFromCart(itemId) {
    const email = localStorage.getItem("email");
    if (!email) return alert("Please log in!");

    try {
        const res = await fetch(`/api/cart/${itemId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Failed to remove cart item:", errText);
            return alert("Failed to remove item from cart");
        }

        cart = cart.filter(item => item.itemId !== itemId);
        renderCart();

    } catch (err) {
        console.error(err);
        alert("Server error while removing from cart");
    }
}

// ------------------- SAVE CART -------------------
async function saveCart() {
    const email = localStorage.getItem("email");
    if (!email) return window.location.href = "/";

    if (cart.length === 0) return alert("Cart is empty!");

    try {
        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, cart })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Server error:", errText);
            return alert("Failed to save cart!");
        }

        const data = await res.json();
        goToAddons(data.redirect);

    } catch (err) {
        console.error("Network error:", err);
        alert("Unable to save cart!");
    }
}

// ------------------- REDIRECT -------------------
function goToAddons(url) {
    window.location.href = url || "/addtheaddons";
}

// ------------------- FETCH BURGERS -------------------
async function fetchBurgers() {
    try {
        const res = await fetch("/api/burgers");
        const burgers = await res.json();
        const container = document.getElementById("burgerContainer");
        container.innerHTML = "";

        burgers.forEach(burger => {
            const card = document.createElement("div");
            card.classList.add("card-component");
            card.innerHTML = `
                <div class="cardImg"><img src="${burger.image}" alt="${burger.name}"></div>
                <div class="cardTitle">${burger.name}</div>
                <div class="cardDesc">${burger.desc}</div>
                <div class="cardPrice">₹${burger.price}</div>
                <button class="selectBtn">Select</button>
            `;
            card.querySelector(".selectBtn").addEventListener("click", () => addToCart(burger));
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Failed to fetch burgers:", err);
    }
}

// ------------------- Fetch CART -------------------

async function fetchUserCart(email) {
    if (!email) return [];
    try {
        const res = await fetch(`/api/cart?email=${encodeURIComponent(email)}`);
        if (!res.ok) {
            console.error("Failed to fetch user cart:", await res.text());
            return [];
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Network error while fetching cart:", err);
        return [];
    }
}


// ------------------- LOGOUT -------------------
function logout() {
    localStorage.removeItem("email");
    window.location.href = "/";
}

// ------------------- INITIALIZE ONLOAD -------------------
window.addEventListener("DOMContentLoaded", () => {
    fetchBurgers();
    renderCart();
});
