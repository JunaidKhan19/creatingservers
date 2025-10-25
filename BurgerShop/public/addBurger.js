// ------------------- DOM ELEMENTS -------------------
const container = document.getElementById("addBurgerContainer");
const backBtn = document.getElementById("backBtn");

// Go back to home
backBtn.addEventListener("click", () => {
    window.location.href = "/home";
});

// ------------------- RENDER ADD BURGER FORM -------------------
function renderAddBurgerForm() {
    const form = document.getElementById("addBurgerForm");
    const imageInput = document.getElementById("burgerImage");
    const imagePreview = document.getElementById("imagePreview");
    const addonsContainer = document.getElementById("addonsContainer");
    const addAddonBtn = document.getElementById("addAddonBtn");

    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            imagePreview.innerHTML = `<img src="${reader.result}" alt="Preview" style="max-width:150px;border-radius:10px;">`;
        };
        reader.readAsDataURL(file);
    });

    addAddonBtn.addEventListener("click", () => {
        const addonDiv = document.createElement("div");
        addonDiv.classList.add("addon-item");
        addonDiv.innerHTML = `
            <input type="text" class="addon-name" placeholder="Addon Name" required />
            <input type="number" class="addon-price" placeholder="Price" required />
            <button type="button" class="remove-addon">❌</button>
        `;
        addonsContainer.appendChild(addonDiv);

        addonDiv.querySelector(".remove-addon").addEventListener("click", () => {
        addonDiv.remove();
        });
    });

    // ------------------- SUBMIT FORM -------------------
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("burgerName").value.trim();
        const desc = document.getElementById("burgerDesc").value.trim();
        const price = document.getElementById("burgerPrice").value.trim();
        const file = imageInput.files[0];

        if (!name || !desc || !price || !file) {
            return alert("Please fill all fields and select an image.");
        }

        const addons = [];
        document.querySelectorAll(".addon-item").forEach((el, index) => {
        const addonName = el.querySelector(".addon-name").value.trim();
        const addonPrice = el.querySelector(".addon-price").value.trim();
        if (addonName && addonPrice) {
            addons.push({ id: index + 1, name: addonName, price: Number(addonPrice) });
        }
        });

        const formData = new FormData();
        formData.append("name", name);
        formData.append("desc", desc);
        formData.append("price", price);
        formData.append("image", file);
        formData.append("addons", JSON.stringify(addons));
        formData.append("role", localStorage.getItem("role"));

        try {
        const res = await fetch("/api/burgers", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to add burger:", data);
            alert("Failed to add burger. Try again.");
            return;
        }

        alert("Burger added successfully!");
        window.location.href = "/home";
        } catch (err) {
        console.error("Error adding burger:", err);
        alert("Server error. Please try again.");
        }
    });
}


// ------------------- ON PAGE LOAD -------------------
document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");

    // Only allow admin to access this page
    if (role !== "admin") {
        alert("Access denied! Only admin can add burgers.");
        window.location.href = "/home";
        return;
    }

    renderAddBurgerForm();
});
