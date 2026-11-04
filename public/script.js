const form = document.getElementById("registerForm");

if (form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        form.style.display = "none";

        const success = document.getElementById("successMessage");
        success.style.display = "block";

        success.innerHTML = `
            <h2>🍁 REGISTRATION SUCCESSFUL!</h2>
            <p>Thank you for registering with CANADA JOBS.</p>
            <p>You can now explore our job listings.</p>
            <a href="jobs.html" class="primary-btn">EXPLORE JOBS</a>
        `;
    });
}
