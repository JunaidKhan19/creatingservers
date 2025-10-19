async function signup(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    if (!username || !email || !password) {
        message.textContent = "Please fill all fields.";
        message.style.color = "red";
        return;
    }

    try {
        const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        message.textContent = data.message || (res.ok ? "Signup successful" : "Signup failed");
        message.style.color = res.ok ? "green" : "red";

        // Redirect to login page after 1 second
        if (res.ok) {
        setTimeout(() => {
            window.location.href = "/";
        }, 1000);
        }
    } catch (err) {
        message.textContent = "Network error. Please try again.";
        message.style.color = "red";
    }
}

// Attach function to form
document.getElementById("signupform").addEventListener("submit", signup);
