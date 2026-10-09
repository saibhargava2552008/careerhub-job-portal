(function () {
    const nav = document.querySelector("header nav");
    if (!nav) return;

    const token = localStorage.getItem("token");
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
        user = null;
    }

    const isPagesFolder = window.location.pathname.toLowerCase().includes("/pages/");
    const homeHref = isPagesFolder ? "../index.html" : "index.html";
    const jobsHref = homeHref + "#jobs";
    const dashboardHref = isPagesFolder ? "recruiter-dashboard.html" : "pages/recruiter-dashboard.html";
    const applicationsHref = isPagesFolder ? "my-applications.html" : "pages/my-applications.html";
    const loginHref = isPagesFolder ? "login.html" : "pages/login.html";
    const registerHref = isPagesFolder ? "register.html" : "pages/register.html";

    const link = function (href, label) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        return a;
    };

    nav.replaceChildren();
    nav.appendChild(link(homeHref, "Home"));
    nav.appendChild(link(jobsHref, "Jobs"));

    if (token && user && user.role === "recruiter") {
        nav.appendChild(link(dashboardHref, "Recruiter Dashboard"));
    } else if (token && user && user.role === "jobseeker") {
        nav.appendChild(link(applicationsHref, "My Applications"));
    }

    if (token && user) {
        const logout = link("#", "Logout");
        logout.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = loginHref;
        });
        nav.appendChild(logout);
    } else {
        nav.appendChild(link(loginHref, "Login"));
        nav.appendChild(link(registerHref, "Register"));
    }
})();
