// --- 1. TAB SWITCHING LOGIC ---
const tabs = [
    { btn: document.getElementById("tab-profile"), sec: document.getElementById("sec-profile") },
    { btn: document.getElementById("tab-privacy"), sec: document.getElementById("sec-privacy") },
    { btn: document.getElementById("tab-prefs"), sec: document.getElementById("sec-prefs") }
];

tabs.forEach(tab => {
    tab.btn?.addEventListener("click", () => {
        // Remove active class from all
        tabs.forEach(t => {
            t.btn?.classList.remove("active");
            t.sec?.classList.remove("active");
        });
        // Add active class to clicked tab
        tab.btn?.classList.add("active");
        tab.sec?.classList.add("active");
    });
});

// --- 2. PROFILE PHOTO UPLOAD LOGIC ---
const uploadBtn = document.getElementById("uploadBtn") as HTMLButtonElement;
const photoInput = document.getElementById("photoInput") as HTMLInputElement;
const profilePreview = document.getElementById("profilePreview") as HTMLImageElement;
const profileIcon = document.getElementById("profileIcon") as HTMLElement;

let currentPhotoData = ""; // We will store the base64 string here

// When button clicked, trigger hidden file input
uploadBtn?.addEventListener("click", () => photoInput.click());

// When user selects a file
photoInput?.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const file = target.files[0];
        
        // FileReader converts the image into a Base64 string that we can display & send to C#
        const reader = new FileReader();
        reader.onload = (event) => {
            currentPhotoData = event.target?.result as string;
            
            // Update UI
            profilePreview.src = currentPhotoData;
            profilePreview.style.display = "block"; // Show the image
            profileIcon.style.display = "none";     // Hide the placeholder icon
        };
        reader.readAsDataURL(file);
    }
});

// --- 3. PASSWORD EYE BUTTON LOGIC ---
// Helper function adapting your code to handle multiple password fields easily
function setupEyeToggle(inputId: string, btnId: string, iconId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const btn = document.getElementById(btnId) as HTMLButtonElement;
    const icon = document.getElementById(iconId) as HTMLImageElement;

    if (!input || !btn || !icon) return;

    btn.addEventListener("click", () => {
        if (input.getAttribute("type") === "password") {
            input.setAttribute("type", "text");
            icon.src = "../images/hidden.png"; // Replace with your hidden image path
        } else {
            input.setAttribute("type", "password");
            icon.src = "../images/view.png"; // Replace with your visible image path
        }
    });
}

// Hook up all three password fields
setupEyeToggle("oldPasswordInput", "eyeOld", "iconOld");
setupEyeToggle("newPasswordInput", "eyeNew", "iconNew");
setupEyeToggle("confirmPasswordInput", "eyeConfirm", "iconConfirm");


// --- 4. SAVING DATA TO SERVER (API Calls) ---
const saveProfileBtn = document.getElementById("saveProfileBtn");
saveProfileBtn?.addEventListener("click", () => {
    const username = (document.getElementById("usernameInput") as HTMLInputElement).value;
    const token = localStorage.getItem("token"); // Assuming you save token here on login

    // Example Server call to match our C# updateProfile request
    // Send to your generic RequestHandler
    console.log("Sending to server: updateProfile", { token, username, currentPhotoData });
    alert("Profile updated logic triggered! Check console.");
});

const savePasswordBtn = document.getElementById("savePasswordBtn");
savePasswordBtn?.addEventListener("click", () => {
    const oldPass = (document.getElementById("oldPasswordInput") as HTMLInputElement).value;
    const newPass = (document.getElementById("newPasswordInput") as HTMLInputElement).value;
    const confirmPass = (document.getElementById("confirmPasswordInput") as HTMLInputElement).value;

    if(newPass !== confirmPass) {
        alert("New passwords do not match!");
        return;
    }

    const token = localStorage.getItem("token");
    console.log("Sending to server: updatePassword", { token, oldPass, newPass });
    alert("Password updated logic triggered! Check console.");
});