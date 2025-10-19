window.addEventListener("DOMContentLoaded", async () => {
    const email = localStorage.getItem("email");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!email) {
        alert("You must log in first!");
        window.location.href = "/";
        return;
    }

    if (cart.length === 0) {
        document.getElementById("noBillMessage").style.display = "block";
        return;
    }

    try {
        const res = await fetch("/api/bill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart, email })
        });

        const data = await res.json();

        if (!res.ok) {
            alert("Failed to generate bill.");
            window.location.href = "/home";
            return;
        }

        const container = document.getElementById("billContainer");
        container.innerHTML = `
            <h2>Bill ID: ${data.bill.id}</h2>
            <p>Email: ${data.bill.email}</p>
            <ul>
                ${data.bill.items.map(item => `<li>${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
            <p>Subtotal: $${data.bill.subtotal}</p>
            <p>Tax (5%): $${data.bill.tax}</p>
            <h3>Total: $${data.bill.total}</h3>
        `;

        localStorage.removeItem("cart"); // clear cart after bill
    } catch (err) {
        console.error("Error generating bill:", err);
        alert("Server error while generating bill");
        window.location.href = "/home";
    }
});
