const loginForm = document.getElementById("loginForm");
const jobForm = document.getElementById("jobForm");
const dashboard = document.getElementById("dashboard");
const loginBox = document.getElementById("login");

async function checkAdmin() {
    const response = await fetch("/api/admin/status");

    if (response.ok) {
        loginBox.style.display = "none";
        dashboard.style.display = "block";
        loadJobs();
    }
}

loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            password: document.getElementById("adminPassword").value
        })
    });

    const result = await response.json();

    if (response.ok) {
        loginBox.style.display = "none";
        dashboard.style.display = "block";
        loadJobs();
    } else {
        document.getElementById("loginMessage").textContent =
            result.error || "Login failed";
    }
});

jobForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const job = {
        title: document.getElementById("title").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        description: document.getElementById("description").value
    };

    const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(job)
    });

    if (response.ok) {
        jobForm.reset();
        document.getElementById("jobMessage").textContent =
            "Job added successfully!";
        loadJobs();
    } else {
        document.getElementById("jobMessage").textContent =
            "Unable to add job.";
    }
});

async function loadJobs() {
    const response = await fetch("/api/admin/jobs");

    if (!response.ok) return;

    const jobs = await response.json();
    const list = document.getElementById("jobList");

    list.innerHTML = "";

    jobs.forEach(job => {
        const item = document.createElement("div");
        item.style.padding = "15px";
        item.style.borderBottom = "1px solid #ddd";

        const title = document.createElement("h3");
        title.textContent = job.title;

        const details = document.createElement("p");
        details.textContent = `${job.location} | ${job.salary}`;

        const button = document.createElement("button");
        button.textContent = "DELETE";
        button.onclick = () => deleteJob(job.id);

        item.append(title, details, button);
        list.appendChild(item);
    });
}

async function deleteJob(id) {
    if (!confirm("Delete this job listing?")) return;

    await fetch("/api/admin/jobs/" + encodeURIComponent(id), {
        method: "DELETE"
    });

    loadJobs();
}

async function logout() {
    await fetch("/api/admin/logout", {method: "POST"});
    location.reload();
}

checkAdmin();
