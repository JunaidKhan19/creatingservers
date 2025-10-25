const params = new URLSearchParams(window.location.search);
const orderId = decodeURIComponent(params.get("orderId"));
console.log("Order ID from URL:", orderId);

async function fetchBill(orderId) {
    try {
        const encodedId = encodeURIComponent(orderId);
        const res = await fetch(`/api/orders/${encodedId}`);
        if (!res.ok) throw new Error("Order not found");
        const order = await res.json();
        console.log("Fetched order:", order);
        return order;
    } catch (err) {
        console.error("Failed to fetch order:", err);
        return null;
    }
}

async function renderBill() {
    const container = document.getElementById("billContainer");
    const noBillMsg = document.getElementById("noBillMessage");

    if (!orderId) {
        console.log("No orderId in URL");
        noBillMsg.style.display = "block";
        return;
    }

    const order = await fetchBill(orderId);
    if (!order) {
        console.log("Order not found for ID:", orderId);
        noBillMsg.style.display = "block";
        return;
    }

    console.log("Rendering bill for order:", order.id);
    noBillMsg.style.display = "none";
    container.style.display = "block";
    container.innerHTML = `
        <h3>Order ID: ${order.id}</h3>
        <p>Email: ${order.email}</p>
        <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
        <hr />
        ${order.items.map(item => `
            <div class="bill-item">
                <div class="item-header">
                    <span class="item-name"><strong>${item.name}</strong></span>
                    <span class="item-price">₹${item.actualPrice}</span>
                </div>
                <div class="item-id">Item ID: ${item.itemId}</div>
                ${item.addons?.length ? `<ul class="addons">
                    ${item.addons.map(a => `<li><span>${a.name}</span><span>₹${a.price}</span></li>`).join("")}
                </ul>` : "<small>No addons</small>"}
                <div class="item-total">
                    <strong>Total for this item:</strong> ₹${item.price.toFixed(2)}
                </div>
            </div>
        `).join("")}
        <hr />
        <div class="total-summary">
            <span>Total:</span> <span>₹${order.totalAmount}</span>
        </div>
    `;

}

window.addEventListener("DOMContentLoaded", renderBill);
