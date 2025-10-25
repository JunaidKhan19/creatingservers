// Admin access check
const role = localStorage.getItem("role");
if (role !== "admin") {
    alert("Access denied! Admins only.");
    window.location.href = "/home";
}

let chartInstance = null;

// Render chart dynamically
function renderChart(data, type, datasetKey) {
    const ctx = document.getElementById("mainChart").getContext("2d");

    const labels = Object.keys(data[datasetKey]);
    const values = Object.values(data[datasetKey]);

    // Destroy previous chart if exists
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: datasetKey === "burgerSales" ? "Sales per Burger (₹)" : "Daily Sales (₹)",
                data: values,
                backgroundColor: generateColors(values.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    enabled: true
                }
            },
            // Only apply radius reduction if pie chart
            ...(type === "pie" ? {
                layout: {
                    padding: 10
                },
                elements: {
                    arc: {
                        // controls the overall size of the pie
                        radius: "30%" // ✅ reduce pie size (default is 100%)
                    }
                }
            } : {})
        }
    });
}

// Generate dynamic colors for pie/bar
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${i * (360/count)}, 70%, 60%)`);
    }
    return colors;
}


document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/api/stats");
    const data = await res.json();

    document.getElementById("totalSales").textContent = data.totalSales.toFixed(2);
    document.getElementById("totalOrders").textContent = data.totalOrders;
    document.getElementById("avgOrder").textContent = data.avgOrderValue.toFixed(2);

    // Initial chart
    renderChart(data, "bar", "burgerSales");

    // Event listeners for dynamic chart updates
    document.getElementById("updateChart").addEventListener("click", () => {
        const chartType = document.getElementById("chartType").value;
        const chartData = document.getElementById("chartData").value;
        renderChart(data, chartType, chartData);
    });

    const role = localStorage.getItem("role");
    const navLeft = document.querySelector(".nav-left");
    if (role === "admin" && navLeft) {
        const adminBtn = document.createElement("button");
        adminBtn.classList.add("nav-btn");
        adminBtn.innerHTML = `<a href="/reports">Reports</a>`;
        navLeft.appendChild(adminBtn);
    }
});

// ------------------- LOGOUT -------------------
function logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "/";
}