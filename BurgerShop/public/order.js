// ------------------- FETCH ALL ORDERS -------------------
async function fetchOrders() {
    const email = localStorage.getItem("email");
    if (!email) {
        alert("You must log in first!");
        window.location.href = "/";
    }
    try {
        const res = await fetch("/api/orders");
        const orders = await res.json();

        const container = document.getElementById("ordersContainer");
        container.innerHTML = "";

        if (!orders || orders.length === 0) {
        container.innerHTML = "<p>No orders placed yet.</p>";
        return;
        }

        orders.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("order-card");
        div.style.cursor = "pointer";

        const items = order.items.map(i => 
            `<li>${i.name} x ${i.quantity} - ₹${(i.price * i.quantity).toFixed(2)}</li>`
        ).join("");

        div.innerHTML = `
            <h3>Order id: ${order.id}</h3>
            <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
            <ul>${items}</ul>
            <p class="total">Total: ₹${order.totalAmount.toFixed(2)}</p>
        `;

        div.addEventListener("click", () => {
            const encodedId = encodeURIComponent(order.id);
            window.open(`/bill/?orderId=${encodedId}`, "_blank");
        });
        container.appendChild(div);
        });
    } catch (err) {
        console.error("Error fetching orders:", err);
        document.getElementById("ordersContainer").innerHTML = "<p>Failed to load orders.</p>";
    }
}

window.addEventListener("DOMContentLoaded", fetchOrders);
