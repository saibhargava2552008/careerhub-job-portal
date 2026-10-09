function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

const jobContainer = document.getElementById("jobContainer");

const searchButton = document.getElementById("searchButton");

const jobSearch = document.getElementById("jobSearch");

const locationSearch = document.getElementById("locationSearch");

let allJobs = [];


// ========================================
// LOAD JOBS FROM BACKEND
// ========================================

async function loadJobs() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/jobs"
        );

        const data = await response.json();

        allJobs = data.jobs;

        displayJobs(allJobs);

    } catch (error) {

        console.error("Failed to load jobs:", error);

        jobContainer.innerHTML =
            "<p>Unable to load jobs.</p>";

    }
}


// ========================================
// DISPLAY JOBS
// ========================================

function displayJobs(jobs) {

    jobContainer.innerHTML = "";

    if (jobs.length === 0) {

        jobContainer.innerHTML =
            "<p>No jobs found.</p>";

        return;
    }


    jobs.forEach(function (job) {

        const jobCard =
            document.createElement("div");

        jobCard.className = "job-card";


        jobCard.innerHTML = `

            <h3>${escapeHTML(job.title)}</h3>

            <p>${escapeHTML(job.company)}</p>

            <p>
                ${escapeHTML(job.location)} • ${escapeHTML(job.jobType)}
            </p>

            <p>${escapeHTML(job.salary)}</p>

            <button class="view-job">
                View Job
            </button>

        `;


        const viewButton =
            jobCard.querySelector(".view-job");


        viewButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    `pages/job-details.html?job=${job._id}`;

            }
        );


        jobContainer.appendChild(jobCard);

    });

}


// ========================================
// SEARCH JOBS
// ========================================

searchButton.addEventListener(
    "click",
    function () {

        const jobText =
            jobSearch.value
                .trim()
                .toLowerCase();


        const locationText =
            locationSearch.value
                .trim()
                .toLowerCase();


        const filteredJobs =
            allJobs.filter(function (job) {

                const matchesJob =
                    job.title
                        .toLowerCase()
                        .includes(jobText) ||

                    job.company
                        .toLowerCase()
                        .includes(jobText);


                const matchesLocation =
                    job.location
                        .toLowerCase()
                        .includes(locationText);


                return matchesJob &&
                       matchesLocation;

            });


        displayJobs(filteredJobs);

    }
);


// ========================================
// LOAD JOBS WHEN PAGE OPENS
// ========================================

loadJobs();