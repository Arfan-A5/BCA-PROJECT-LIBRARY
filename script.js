document.addEventListener("DOMContentLoaded", function () {
  // ----- Login Page -----
  const loginForm = document.getElementById("adminLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (username === "admin" && password === "bca123") {
        window.location.href = "admin/dashboard.html";
      } else {
        showMessage("Invalid username or password. Please try again.", "error");
      }
    });
  }

  // ----- Add / Edit Project Page -----
  const form = document.getElementById("addProjectForm");
  if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const editIndex = urlParams.get("edit");
    const projects = JSON.parse(localStorage.getItem("bcaProjects")) || [];

    if (editIndex !== null && projects[editIndex]) {
      const p = projects[editIndex];
      document.getElementById("group").value = p.group;
      document.getElementById("title").value = p.title;
      document.getElementById("description").value = p.description;
      document.getElementById("members").value = p.members;
      document.getElementById("contributions").value = p.contributions;
      document.getElementById("github").value = p.github;
      document.getElementById("tags").value = p.tags;
      // ✅ ADD THIS TO SHOW EXISTING IMAGE
      if (p.screenshotURL) {
        const preview = document.getElementById("existingScreenshotPreview");
        preview.innerHTML = `
        <p>Existing Screenshot:</p>
        <img src="${p.screenshotURL}" style="max-width: 100%; margin-top: 5px;" />
      `;
      }
      document.querySelector(".submit-button").textContent = "Update Project";
    }

    form.addEventListener("submit", function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("screenshot");
  const file = fileInput.files[0];

  const readScreenshotAsBase64 = () => {
    return new Promise((resolve) => {
      if (!file) {
        // If editing and no new file selected, retain existing one
        if (editIndex !== null && projects[editIndex].screenshotURL) {
          return resolve(projects[editIndex].screenshotURL);
        }
        return resolve(""); // No image
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result); // ✅ Base64 string
      };
      reader.readAsDataURL(file);
    });
  };

  readScreenshotAsBase64().then((screenshotURL) => {
    const newProject = {
      group: document.getElementById("group").value.trim(),
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      members: document.getElementById("members").value.trim(),
      contributions: document.getElementById("contributions").value.trim(),
      github: document.getElementById("github").value.trim(),
      tags: document.getElementById("tags").value.trim(),
      screenshotURL, // ✅ now stored as base64
    };

    if (editIndex !== null) {
      projects[editIndex] = newProject;
      showMessage("✅ Project updated successfully!", "success");
    } else {
      projects.push(newProject);
      showMessage("✅ Project added successfully!", "success");
    }

    localStorage.setItem("bcaProjects", JSON.stringify(projects));

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
  });
});

  }

  // ----- Dashboard Page -----
  const projectListEl = document.querySelector(".project-list");
  if (projectListEl) {
    const projects = JSON.parse(localStorage.getItem("bcaProjects")) || [];
    if (projects.length === 0) {
      projectListEl.innerHTML = "<p>No projects added yet.</p>";
      return;
    }

    let html = "";
    projects.forEach((p, i) => {
      html += `
        <div class="project-card" data-index="${i}">
          <h3>${p.title}</h3>
          <p><strong>Group:</strong> ${p.group}</p>
          <p><strong>Description:</strong> ${p.description}</p>
          <p><strong>Members:</strong> ${p.members}</p>
          <p><strong>Contributions:</strong> ${p.contributions}</p>
          ${p.tags ? `<p><strong>Tags:</strong> ${p.tags}</p>` : ""}
          ${
            p.github
              ? `<p><strong>GitHub:</strong> <a href="${p.github}" target="_blank">${p.github}</a></p>`
              : ""
          }
          <div class="dashboard-actions">
            <button class="edit-btn" data-index="${i}">✏️ Edit</button>
            <button class="delete-btn" data-index="${i}">🗑️ Delete</button>
          </div>
        </div><hr/>`;
    });

    projectListEl.innerHTML = html;

    // Edit project
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        window.location.href = `add-project.html?edit=${index}`;
      });
    });

    // Delete project
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        showConfirm("Are you sure you want to delete this project?", () => {
          projects.splice(index, 1);
          localStorage.setItem("bcaProjects", JSON.stringify(projects));
          location.reload();
        });
      });
    });
  }
});

// ----- Project Preview -----
function previewProject() {
  const title = document.getElementById("title").value.trim();
  const group = document.getElementById("group").value.trim();
  const description = document.getElementById("description").value.trim();
  const members = document.getElementById("members").value.trim();
  const contributions = document.getElementById("contributions").value.trim();
  const tags = document.getElementById("tags").value.trim();
  const github = document.getElementById("github").value.trim();
  const screenshotInput = document.getElementById("screenshot");
  const file = screenshotInput.files[0];
  let imageURL = file ? URL.createObjectURL(file) : "";

  if (!title || !group || !description || !members || !contributions) {
    showMessage("Please fill in all required fields.", "warning");
    return;
  }

  const previewHTML = `
    <h4>${title}</h4>
    <p><strong>Group:</strong> ${group}</p>
    <p><strong>Description:</strong> ${description}</p>
    <p><strong>Members:</strong> ${members}</p>
    <p><strong>Contributions:</strong> ${contributions}</p>
    ${tags ? `<p><strong>Tags:</strong> ${tags}</p>` : ""}
    ${
      github
        ? `<p><strong>GitHub:</strong> <a href="${github}" target="_blank">${github}</a></p>`
        : ""
    }
    ${
      imageURL
        ? `<img src="${imageURL}" alt="Screenshot" style="max-width: 100%; margin-top: 10px;" />`
        : ""
    }
  `;

  document.getElementById("previewContent").innerHTML = previewHTML;
  document.getElementById("previewArea").style.display = "block";
}

// ----- Reusable UI Feedback -----
function showMessage(message, type = "info") {
  const msgBox = document.getElementById("messageBox");
  if (!msgBox) return;
  msgBox.textContent = message;
  msgBox.style.backgroundColor =
    type === "success"
      ? "#28a745"
      : type === "error"
      ? "#dc3545"
      : type === "warning"
      ? "#ffc107"
      : "#007bff";
  msgBox.classList.add("show");
  setTimeout(() => msgBox.classList.remove("show"), 600);
}

function showConfirm(message, onConfirm) {
  const confirmBox = document.getElementById("confirmBox");
  const confirmMessage = document.getElementById("confirmMessage");
  const yesBtn = document.getElementById("confirmYes");
  const cancelBtn = document.getElementById("confirmCancel");

  if (!confirmBox || !confirmMessage || !yesBtn || !cancelBtn) return;

  confirmMessage.textContent = message;
  confirmBox.style.display = "flex";

  yesBtn.onclick = () => {
    confirmBox.style.display = "none";
    onConfirm();
  };

  cancelBtn.onclick = () => {
    confirmBox.style.display = "none";
  };
}


// now displaying cards in the index or home page 
document.addEventListener("DOMContentLoaded", function () {
  const homeProjectList = document.getElementById("homeProjectList");

  if (!homeProjectList) return; // not on homepage

  const projects = JSON.parse(localStorage.getItem("bcaProjects")) || [];

  if (projects.length === 0) {
    homeProjectList.innerHTML = "<p>No projects available yet.</p>";
    return;
  }

  let html = "";
projects.forEach((p, i) => {
  html += `
    <div class="project-card">
      <h3>${p.title}</h3>
      <p><strong>Group:</strong> ${p.group}</p>
      <p><strong>Members:</strong> ${p.members}</p>
      <p><strong>Contributions:</strong> ${p.contributions}</p>
      ${
        p.github
          ? `<p><strong>GitHub:</strong> <a href="${p.github}" target="_blank">${p.github}</a></p>`
          : ""
      }
      ${
        p.screenshotURL
          ? `<img src="${p.screenshotURL}" alt="Screenshot" style="max-width:100%; margin-top:10px;" />`
          : ""
      }
      <a class="view-button" href="project-detail.html?id=${i}">View Details</a>
    </div>
  `;
});
homeProjectList.innerHTML = html;

});

// darkmode

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("darkModeToggle");

  // Load previously saved mode
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      // Save user preference
      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
      } else {
        localStorage.setItem("darkMode", "disabled");
      }
    });
  }
});

const searchInput = document.getElementById("searchInput");
const containers = [
  document.getElementById("homeProjectList"),
  document.querySelector(".project-list") // for admin dashboard
].filter(Boolean); // only keep non-null ones

const projects = JSON.parse(localStorage.getItem("bcaProjects")) || [];

// Function to highlight keyword
function highlight(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, `<mark>$1</mark>`);
}

// Function to render projects in a given container
function renderProjects(container, filteredProjects, keyword) {
  if (!container) return;

  if (filteredProjects.length === 0) {
    container.innerHTML = "<p>No matching projects found.</p>";
    return;
  }

  const html = filteredProjects.map((p, i) => `
    <div class="project-card">
      <h3>${highlight(p.title || "", keyword)}</h3>
      <p><strong>Group:</strong> ${highlight(p.group || "", keyword)}</p>
      <p><strong>Members:</strong> ${highlight(p.members || "", keyword)}</p>
      <p><strong>Contributions:</strong> ${highlight(p.contributions || "", keyword)}</p>
      ${
        p.screenshotURL
          ? `<img src="${p.screenshotURL}" alt="Screenshot" style="max-width:100%; margin-top:10px;" />`
          : ""
      }
      <a class="view-button" href="project-detail.html?id=${i}">View Details</a>
    </div>
  `).join("");

  container.innerHTML = html;
}

// Initial render
containers.forEach(container => renderProjects(container, projects, ""));

// Search input listener
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const keyword = this.value.trim().toLowerCase();
    const filtered = projects.filter((p) =>
      Object.values(p).some((val) =>
        String(val || "").toLowerCase().includes(keyword)
      )
    );
    containers.forEach(container => renderProjects(container, filtered, keyword));
  });
}


// responsiveness
  const menuBtn = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("sub_nav");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // responsivness for dashboard
 
  document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".admin-menu-toggle");
    const nav = document.getElementById("sub_nav");

    if (menuToggle && nav) {
      menuToggle.addEventListener("click", function () {
        nav.classList.toggle("show");
      });
    }
  });





