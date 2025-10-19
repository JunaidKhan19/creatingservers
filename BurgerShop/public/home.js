const email = localStorage.getItem("email");
if (!email) {
    alert("You must log in first!");
    window.location.href = "/";
}

let cart = [];

async function fetchBurgers() {
    try {
        const res = await fetch("/api/burgers");
        const burgers = await res.json();

        const container = document.getElementById("burgerContainer");
        container.innerHTML = ""; // clear previous cards

        burgers.forEach(burger => {
            const card = document.createElement("div");
            card.classList.add("card-component");

            card.innerHTML = `
                <div class="cardImg"><img src="${burger.image}" alt="${burger.name}"></div>
                <div class="cardTitle">${burger.name}</div>
                <div class="cardDesc">${burger.desc}</div>
                <div class="cardPrice">$${burger.price}</div>
                <div class="btn">
                    <button class="selectBtn" type="button">Select</button>
                </div>
            `;

            card.querySelector(".selectBtn").onclick = () => addToCart(burger);
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Failed to fetch burgers:", err);
    }
}


// Add burger
function addToCart(burger) {
    const existing = cart.find(item => item.id === burger.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...burger, quantity: 1 });

    renderCart();
}

// Remove/decrease burger
function removeFromCart(burgerId) {
    const existing = cart.find(item => item.id === burgerId);
    if (!existing) return;

    if (existing.quantity > 1) existing.quantity -= 1;
    else cart = cart.filter(item => item.id !== burgerId);

    renderCart();
}

// Render cart
function renderCart() {
    const sidebar = document.querySelector(".side-bar");
    const mainBar = document.querySelector(".main-bar");

    sidebar.innerHTML = "";

    if (cart.length === 0) {
        sidebar.classList.remove("visible");
        mainBar.classList.remove("shrunk");
        return;
    }

    sidebar.classList.add("visible");
    mainBar.classList.add("shrunk");

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <span>${item.name} x ${item.quantity} | $${(item.price * item.quantity).toFixed(2)}</span>
            <button class="plus">+</button>
            <button class="minus">-</button>
        `;

        div.querySelector(".plus").onclick = () => addToCart(item);
        div.querySelector(".minus").onclick = () => removeFromCart(item.id);

        sidebar.appendChild(div);
    });

    // Total & Order button
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("cart-total");
    totalDiv.innerHTML = `
        <hr>
        <p>Total: $${total.toFixed(2)}</p>
        <button id="placeorderBtn">Place Order</button>
    `;
    sidebar.appendChild(totalDiv);

    
    // Order button click
    document.getElementById("placeorderBtn").onclick = async () => {
        const email = localStorage.getItem("email");
        if (!email) {
            alert("Please log in to place an order!");
            window.location.href = "/";
            return;
        }

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart, total, email })
            });

            const data = await res.json();

            if (res.ok) {
                // Save cart and orderId for bill page
                localStorage.setItem("cart", JSON.stringify(cart));
                localStorage.setItem("lastOrderId", data.orderId);

                // Clear current cart
                cart = [];
                renderCart();

                // Redirect to bill page
                window.location.href = data.redirect;
            } else {
                alert(`❌ Failed: ${data.message}`);
            }
        } catch (err) {
            console.error("Error placing order:", err);
            alert("Server error while placing order!");
        }
    };
}

function logout() {
    console.log("initializing logout");
    localStorage.removeItem("email");
    // or clear everything: localStorage.clear();

    window.location.href = "/"; // redirect to login page
}

// onload
window.addEventListener("DOMContentLoaded", () => {
    fetchBurgers();
    renderCart();
});
