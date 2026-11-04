require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const jobsFile = path.join(__dirname, "data", "jobs.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: "canadajobs.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 2 * 60 * 60 * 1000
    }
}));

app.use(express.static(path.join(__dirname, "public")));

function readJobs() {
    return JSON.parse(fs.readFileSync(jobsFile, "utf8"));
}

function saveJobs(jobs) {
    fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
}

function requireAdmin(req, res, next) {
    if (!req.session.admin) {
        return res.status(401).json({ error: "Admin login required" });
    }
    next();
}

app.get("/api/admin/status", (req, res) => {
    res.json({ authenticated: !!req.session.admin });
});

app.post("/api/admin/login", (req, res) => {
    if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
        return res.status(500).json({ error: "Admin configuration missing" });
    }

    if (req.body.password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Incorrect password" });
    }

    req.session.regenerate(err => {
        if (err) return res.status(500).json({ error: "Login failed" });

        req.session.admin = true;
        res.json({ success: true });
    });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("canadajobs.sid");
        res.json({ success: true });
    });
});

app.get("/api/admin/jobs", requireAdmin, (req, res) => {
    res.json(readJobs());
});

app.post("/api/admin/jobs", requireAdmin, (req, res) => {
    const { title, location, salary, description } = req.body;

    if (![title, location, salary, description].every(
        value => typeof value === "string" && value.trim()
    )) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const jobs = readJobs();

    const job = {
        id: require("crypto").randomUUID(),
        title: title.trim().slice(0, 100),
        location: location.trim().slice(0, 100),
        salary: salary.trim().slice(0, 100),
        description: description.trim().slice(0, 2000)
    };

    jobs.push(job);
    saveJobs(jobs);

    res.status(201).json({ success: true, job });
});

app.delete("/api/admin/jobs/:id", requireAdmin, (req, res) => {
    const jobs = readJobs();
    const updated = jobs.filter(job => job.id !== req.params.id);

    if (updated.length === jobs.length) {
        return res.status(404).json({ error: "Job not found" });
    }

    saveJobs(updated);
    res.json({ success: true });
});

app.get("/health", (req, res) => {
    res.json({ app: "CANADA JOBS", status: "online" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`CANADA JOBS running on port ${PORT}`);
});
