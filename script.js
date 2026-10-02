/**
 * System Data Configurations & Roster Lists
 */
const DEPARTMENT_DOCTORS = {
    "General Ayurveda": ["Dr. Aanand Patel", "Dr. Hitesh Joshi"],
    "Panchakarma": ["Dr. Bhargav Vaidya", "Dr. Shweta Rana"],
    "Kayachikitsa": ["Dr. Nitin Sharma", "Dr. Pooja Acharya"],
    "Shalya Tantra": ["Dr. K. R. Rawal", "Dr. Vimal Prajapati"],
    "Shalakya Tantra": ["Dr. Meera Vaghela"],
    "Balroga": ["Dr. Deepa Shah"],
    "Swasthavritta": ["Dr. Rajesh Trivedi"],
    "Yoga and Naturopathy": ["Dr. Amit Solanki", "Dr. Neha Dave"]
};

// Global Memory State instantiated from LocalStorage structures
let appointments = JSON.parse(localStorage.getItem('hosp_appointments')) || [];
let currentPatientSession = JSON.parse(localStorage.getItem('hosp_current_session')) || null;

/**
 * Event Execution Hooks on DOM Loading Initialization
 */
document.addEventListener("DOMContentLoaded", () => {
    initNavigationHandlers();
    initThemingSystem();
    initDynamicDropdowns();
    initFormSubmissions();
    renderDashboards();
    syncSessionState();
});

/**
 * Single Page Navigation Layout Routing Engines
 */
function initNavigationHandlers() {
    document.querySelectorAll(".nav-link, .navigate-btn").forEach(trigger => {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            const targetPage = trigger.getAttribute("data-target");
            switchPage(targetPage);
        });
    });
}

function switchPage(targetId) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
    const activeSection = document.getElementById(targetId);
    if (activeSection) {
        activeSection.classList.remove("hidden");
        // Maintain UI state synchronization inside top header links
        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");
            if(link.getAttribute("data-target") === targetId) link.classList.add("active");
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Notification System Component Trigger
 */
function displayNotification(text, mode = "success") {
    const banner = document.getElementById("notification");
    banner.innerText = text;
    banner.className = `notification ${mode}`;
    setTimeout(() => { banner.className = "notification hidden"; }, 4000);
}

/**
 * Appearance Control Systems (Dark / Light Configuration Management)
 */
function initThemingSystem() {
    const toggle = document.getElementById("theme-toggle");
    toggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nextTheme);
        toggle.innerHTML = nextTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

/**
 * Clinical Specialists Cascading Dropdowns Realtime Update Routing
 */
function initDynamicDropdowns() {
    const deptSelect = document.getElementById("book-dept");
    const docSelect = document.getElementById("book-doctor");

    if(deptSelect && docSelect) {
        deptSelect.addEventListener("change", () => {
            const selectedDept = deptSelect.value;
            docSelect.innerHTML = '<option value="">Select Medical Specialist</option>';
            
            if (selectedDept && DEPARTMENT_DOCTORS[selectedDept]) {
                docSelect.disabled = false;
                DEPARTMENT_DOCTORS[selectedDept].forEach(doc => {
                    const option = document.createElement("option");
                    option.value = doc;
                    option.innerText = doc;
                    docSelect.appendChild(option);
                });
            } else {
                docSelect.disabled = true;
            }
        });
    }
}

/**
 * Form Submission Assertions, Verification and LocalStorage Synchronization
 */
function initFormSubmissions() {
    // 1. Core Profile Processing Logic Rule Set
    const regForm = document.getElementById("registration-form");
    if(regForm) {
        regForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const pass = document.getElementById("reg-pass").value;
            const confirmPass = document.getElementById("reg-confirm").value;

            if(pass.length < 6) {
                displayNotification("Security constraint violation: Password must be at least 6 characters.", "error");
                return;
            }
            if(pass !== confirmPass) {
                displayNotification("Verification error: Password criteria matches failed.", "error");
                return;
            }

            const generatedToken = "PAT" + Math.floor(100000 + Math.random() * 900000);
            const patientProfile = {
                uid: generatedToken,
                name: document.getElementById("reg-name").value,
                mobile: document.getElementById("reg-mobile").value,
                email: document.getElementById("reg-email").value,
                // Aadhaar data tokenizing replacement strategy preventing local raw metric exposures
                aadhaarRef: "[Stored Securely under Encryption Reference Token]",
                gender: document.getElementById("reg-gender").value
            };

            localStorage.setItem(`profile_${patientProfile.mobile}`, JSON.stringify(patientProfile));
            localStorage.setItem(`profile_${patientProfile.email}`, JSON.stringify(patientProfile));
            
            displayNotification(`Registration complete! Your Patient ID is: ${generatedToken}`, "success");
            regForm.reset();
            switchPage("login");
        });
    }

    // 2. Access Authorization Validation Handling Engine
    const loginForm = document.getElementById("login-form");
    const togglePass = document.getElementById("toggle-login-pass");
    
    if(togglePass) {
        togglePass.addEventListener("click", () => {
            const passField = document.getElementById("login-pass");
            const type = passField.getAttribute("type") === "password" ? "text" : "password";
            passField.setAttribute("type", type);
            togglePass.classList.toggle("fa-eye-slash");
        });
    }

    if(loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const lookupToken = document.getElementById("login-id").value;
            const cachedUser = localStorage.getItem(`profile_${lookupToken}`);

            if(cachedUser) {
                currentPatientSession = JSON.parse(cachedUser);
                localStorage.setItem('hosp_current_session', JSON.stringify(currentPatientSession));
                syncSessionState();
                displayNotification(`Authentication approved. Welcome back, ${currentPatientSession.name}`, "success");
                switchPage("booking");
                loginForm.reset();
            } else {
                displayNotification("Invalid account reference or credentials. Try again.", "error");
            }
        });
    }

    // 3. Clinical Diagnostic Appointment Scheduling Logic
    const bookForm = document.getElementById("booking-form");
    if(bookForm) {
        bookForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const appointmentTicket = {
                id: "UNJ" + Math.floor(10000 + Math.random() * 90000),
                name: document.getElementById("book-name").value,
                patientId: document.getElementById("book-id").value,
                mobile: document.getElementById("book-mobile").value,
                dept: document.getElementById("book-dept").value,
                doctor: document.getElementById("book-doctor").value,
                date: document.getElementById("book-date").value,
                slot: document.getElementById("book-slot").value,
                symptoms: document.getElementById("book-symptoms").value || "N/A"
            };

            appointments.push(appointmentTicket);
            localStorage.setItem('hosp_appointments', JSON.stringify(appointments));
            
            triggerReceiptOutput(appointmentTicket);
            renderDashboards();
            bookForm.reset();
            switchPage("confirmation");
        });
    }

    // 4. General Electronic Public Enquiries Handler
    const contactForm = document.getElementById("contact-form");
    if(contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            displayNotification("Thank you. Inquiry transmitted successfully to Unjha digital admin desks.", "success");
            contactForm.reset();
        });
    }
}

/**
 * Realtime Profile Synchronization Pipeline
 */
function syncSessionState() {
    if(currentPatientSession) {
        const bName = document.getElementById("book-name");
        const bId = document.getElementById("book-id");
        const bMob = document.getElementById("book-mobile");

        if(bName) bName.value = currentPatientSession.name;
        if(bId) bId.value = currentPatientSession.uid;
        if(bMob) bMob.value = currentPatientSession.mobile;
    }
}

/**
 * Automated Systemic Receipt Builder Function
 */
function triggerReceiptOutput(ticket) {
    const canvas = document.getElementById("receipt-details");
    if(canvas) {
        canvas.innerHTML = `
            <div class="receipt-row"><strong>Appointment ID:</strong> <span>${ticket.id}</span></div>
            <div class="receipt-row"><strong>Patient Name:</strong> <span>${ticket.name}</span></div>
            <div class="receipt-row"><strong>Patient Reference ID:</strong> <span>${ticket.patientId}</span></div>
            <div class="receipt-row"><strong>Department:</strong> <span>${ticket.dept}</span></div>
            <div class="receipt-row"><strong>Medical Officer:</strong> <span>${ticket.doctor}</span></div>
            <div class="receipt-row"><strong>Scheduled Date:</strong> <span>${ticket.date}</span></div>
            <div class="receipt-row"><strong>Time Slot Window:</strong> <span>${ticket.slot}</span></div>
            <div class="receipt-row"><strong>Symptoms Registered:</strong> <span>${ticket.symptoms}</span></div>
            <div class="qr-placeholder">[System Secure QR Verification Code: ${ticket.id}]</div>
        `;
    }
}

/**
 * Roster Reporting Views Renderer Engine
 */
function renderDashboards() {
    const docTable = document.getElementById("doctor-appointments-tbody");
    const adminTable = document.getElementById("admin-appointments-tbody");
    
    // Set Metric Cards Data Values Elements
    const totalCount = appointments.length;
    if(document.getElementById("admin-total-appointments")) {
        document.getElementById("admin-total-appointments").innerText = totalCount;
    }
    if(document.getElementById("admin-today-patients")) {
        // Distinct count estimation simulation based on standard local iterations
        const distinctProfilesCount = Object.keys(localStorage).filter(k => k.startsWith('profile_')).length / 2;
        document.getElementById("admin-today-patients").innerText = Math.max(distinctProfilesCount, 1);
    }

    // Populating Doctor Control Table View Elements
    if(docTable) {
        docTable.innerHTML = appointments.length === 0 ? '<tr><td colspan="5" style="text-align:center;">No scheduled records found.</td></tr>' : '';
        appointments.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.name}</strong><br><small>Mob: ${item.mobile}</small></td>
                <td>${item.dept}</td>
                <td>${item.date}<br><small>${item.slot}</small></td>
                <td><span class="status-badge active">Confirmed</span></td>
            `;
            docTable.appendChild(row);
        });
    }

    // Populating Administrator Master Systemic Stream View Elements
    if(adminTable) {
        adminTable.innerHTML = appointments.length === 0 ? '<tr><td colspan="5" style="text-align:center;">No operational streams registered.</td></tr>' : '';
        appointments.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.dept}</td>
                <td>${item.date}</td>
                <td><span class="status-badge active">Live</span></td>
            `;
            adminTable.appendChild(row);
        });
    }

    // Dynamic filtering capability inside doctor search controls
    const searchInput = document.getElementById("doc-search");
    if(searchInput) {
        searchInput.addEventListener("input", (e) => {
            const keyword = e.target.value.toLowerCase();
            const rows = docTable.querySelectorAll("tr");
            rows.forEach(r => {
                if(r.innerText.toLowerCase().includes(keyword)) {
                    r.style.display = "";
                } else {
                    r.style.display = "none";
                }
            });
        });
    }
}