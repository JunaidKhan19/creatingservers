// ------------------- GLOBAL VARIABLES -------------------
let cartItems = []; // store cart fetched from DB
const burgerTotals = {}; // track totals for grand total
const email = localStorage.getItem("email");

// ------------------- BACK BUTTON -------------------
document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/home";
});

// ------------------- FETCH USERS CART(CURRENT CART FROM DB) -------------------
async function fetchUserCart(email) {
    if (!email) return [];
    try {
        const res = await fetch(`/api/cart?email=${encodeURIComponent(email)}`);
        if (!res.ok) {
            console.error("Failed to fetch user cart:", await res.text());
            return [];
        }
        console.log("inside fetch user cart:-")
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Network error while fetching cart:", err);
        return [];
    }
}

// ------------------- FETCH ACTUAL BURGER LIST -------------------
async function fetchBurgers() {
    try {
        const res = await fetch("/api/burgers");
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch burgers:", err);
        return [];
    }
}

// ------------------- GRAND TOTAL UPDATION -------------------
function updateGrandTotal() {
    const total = Object.values(burgerTotals).reduce((sum, val) => sum + val, 0);
    document.getElementById("grandTotal").textContent = total.toFixed(2);
}

// ------------------- RENDERING ADDONS FOR EACH BURGER THAT IS SELECTED BY USER -------------------
async function renderAddons() {
    cartItems = await fetchUserCart(email);
    console.log(cartItems)
    const burgers = await fetchBurgers();

    const container = document.getElementById("burgerList");
    container.innerHTML = "";

    cartItems.forEach((burger, index) => {
        const burgerInfo = burgers.find(b => b.id === burger.id);
        if (!burgerInfo) return;

        // MAIN CONTAINER
        const mainDiv = document.createElement("div");
        mainDiv.className = "burger-container";

        // LEFT SECTION: Image, name, desc, base price
        const left = document.createElement("div");
        left.className = "burger-left";
        left.innerHTML = `
            <img src="/images/${burgerInfo.image}" alt="${burgerInfo.name}" />
            <h3>#${burgerInfo.name} <small>-${burger.itemId}</small></h3>
            <p>${burgerInfo.desc || ""}</p>
            <p><strong>Price:</strong> ₹${burger.price}</p>
        `;

        // MIDDLE SECTION: Addons checkboxes
        const middle = document.createElement("div");
        middle.className = "burger-middle";
        const addonsHTML = burgerInfo.addons
            .map(addon => {
                const isChecked = burger.addons?.some(a => a.name === addon.name) ? "checked" : "";
                return `
                    <label class="addon-item">
                        <input type="checkbox" data-price="${addon.price}" data-name="${addon.name}" ${isChecked} />
                        <span class="addon-name">${addon.name}</span>
                        <span class="addon-price">₹${addon.price}</span>
                    </label>
                `;
            })
            .join("");
        middle.innerHTML = `<h4>Addons</h4><div class="addons-list">${addonsHTML}</div>`;

        // RIGHT SECTION: selected addons + total
        const right = document.createElement("div");
        right.className = "burger-right";
        right.innerHTML = `
            <div class="total-box">
                <div class="total-line">
                    <span>${burgerInfo.name}</span>
                    <span>₹${burgerInfo.price}</span>
                </div>
                <div class="addons-selected"></div>
                <hr />
                <div class="total-line total-bottom">
                    <strong>Total:</strong>
                    <strong>₹<span class="totalPrice">${burger.price}</span></strong>
                </div>
            </div>
        `;

        mainDiv.appendChild(left);
        mainDiv.appendChild(middle);
        mainDiv.appendChild(right);
        container.appendChild(mainDiv);

        // TRACK TOTALS
        const cartKey = `${burger.email}-${index}`;
        burgerTotals[cartKey] = burger.price;

        const checkboxes = middle.querySelectorAll("input[type='checkbox']");
        const totalPriceElement = right.querySelector(".totalPrice");
        const selectedAddonsDiv = right.querySelector(".addons-selected");

        let updateTimeout;
        checkboxes.forEach(cb => {
            cb.addEventListener("change", () => {
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(async () => {
                    const basePrice = burgerInfo.price;
                    let total = basePrice;
                    selectedAddonsDiv.innerHTML = "";

                    const selectedAddons = [];
                    checkboxes.forEach(c => {
                        if (c.checked) {
                            const price = parseInt(c.dataset.price);
                            const name = c.dataset.name;
                            total += price;
                            selectedAddons.push({ name, price });

                            // display selected addon in right section
                            const line = document.createElement("div");
                            line.classList.add("total-line");
                            line.innerHTML = `<span>${name}</span><span>₹${price}</span>`;
                            selectedAddonsDiv.appendChild(line);
                        }
                    });

                    totalPriceElement.textContent = total;
                    burgerTotals[cartKey] = total;
                    updateGrandTotal();

                    //UPDATE DB ON EVERY CHECK OR UNCHECK
                    await fetch(`/api/cart/${burger.itemId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: burger.email, addons: selectedAddons, price: total,  actualPrice: burgerInfo.price })
                    });
                }, 300);
            });
        });
    });

    updateGrandTotal();
}

// ------------------- PLACE ORDER BUTTON -------------------
document.getElementById("placeOrderBtn").addEventListener("click", async () => {
    const email = localStorage.getItem("email");

    if (!email) {
        alert("Please log in to place an order!");
        window.location.href = "/";
        return;
    }

    const confirmOrder = confirm("Are you sure you want to place this order?");
    if (!confirmOrder) return;

    const cart = await fetchUserCart(email);
    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const orderData = { email, cart };
    try {
        const res = await fetch("/api/placeOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (res.ok && data.success && data.redirect) {
            alert("Order placed successfully!");
            window.location.href = data.redirect;
        } else {
            alert(`Failed to place order: ${data.message}`);
        }
    } catch (err) {
        alert("Server error while placing order!");
    }
});

// ------------------- INITIALIZE ONLOAD -------------------
window.addEventListener("DOMContentLoaded", () => {
    renderAddons();
});

