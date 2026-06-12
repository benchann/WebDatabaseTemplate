import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // --- 1. LOAD THE USERNAME SO IT DOESN'T SAY "LOADING..." ---
    if (!token) {
        document.getElementById("currentUsernameDisplay")!.innerText = "Not Logged In";
    } else {
        try {
            const user = await send<any>("getUser", token);
            if (user && user.username) {
                document.getElementById("currentUsernameDisplay")!.innerText = user.username;
            } else {
                document.getElementById("currentUsernameDisplay")!.innerText = "User not found";
            }
        } catch (err) {
            console.error("Database fetch failed:", err);
            document.getElementById("currentUsernameDisplay")!.innerText = "Error pulling data";
        }
    }

    // --- 2. FIX THE TABS SO THEY ACTUALLY SWITCH ---
    const tabProfile = document.getElementById("tab-profile");
    const tabPrivacy = document.getElementById("tab-privacy");
    const tabPrefs = document.getElementById("tab-prefs");
    const secProfile = document.getElementById("sec-profile");
    const secPrivacy = document.getElementById("sec-privacy");
    const secPrefs = document.getElementById("sec-prefs");

    function switchTab(activeTab: HTMLElement | null, activeSec: HTMLElement | null) {
        [tabProfile, tabPrivacy, tabPrefs].forEach(t => t?.classList.remove("active"));
        [secProfile, secPrivacy, secPrefs].forEach(s => s?.classList.remove("active"));
        activeTab?.classList.add("active");
        activeSec?.classList.add("active");
    }

    tabProfile?.addEventListener("click", () => switchTab(tabProfile, secProfile));
    tabPrivacy?.addEventListener("click", () => switchTab(tabPrivacy, secPrivacy));
    tabPrefs?.addEventListener("click", () => switchTab(tabPrefs, secPrefs));

    // --- 3. PROFILE PICTURE BUTTONS ---
    const selectPhotoBtn = document.getElementById("selectPhotoBtn");
    const photoInput = document.getElementById("photoInput") as HTMLInputElement;
    const profilePreview = document.getElementById("profilePreview") as HTMLImageElement;
    const profileIcon = document.getElementById("profileIcon");
    const savePhotoBtn = document.getElementById("savePhotoBtn");

    let currentPhotoData = "";

    selectPhotoBtn?.addEventListener("click", () => photoInput?.click());

    photoInput?.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentPhotoData = event.target?.result as string;
                if (profilePreview) {
                    profilePreview.src = currentPhotoData;
                    profilePreview.style.display = "block";
                }
                if (profileIcon) profileIcon.style.display = "none";
                if (savePhotoBtn) savePhotoBtn.style.display = "inline-flex"; // Shows the save button
            };
            reader.readAsDataURL(target.files[0]);
        }
    });

    savePhotoBtn?.addEventListener("click", async () => {
        if (!token) return;
        // Make sure your backend has an "updateProfilePicture" function waiting for this
        const success = await send<any>("updateProfilePicture", token, currentPhotoData);
        if (success) {
            alert("Profile picture saved!");
            savePhotoBtn.style.display = "none";
        } else {
            alert("Failed to save picture to database.");
        }
    });

    // --- 4. UPDATE USERNAME DATABASE LOGIC ---
    const saveUsernameBtn = document.getElementById("saveUsernameBtn");
    saveUsernameBtn?.addEventListener("click", async () => {
        const newUsernameInput = document.getElementById("newUsernameInput") as HTMLInputElement;
        const passwordConfirmInput = document.getElementById("usernamePasswordConfirm") as HTMLInputElement;
        
        if (!newUsernameInput.value || !passwordConfirmInput.value) {
            alert("Enter a new username and your password.");
            return;
        }

        const success = await send<any>("updateUsername", token, newUsernameInput.value, passwordConfirmInput.value);
        if (success) {
            alert("Username updated successfully!");
            document.getElementById("currentUsernameDisplay")!.innerText = newUsernameInput.value;
            newUsernameInput.value = "";
            passwordConfirmInput.value = "";
        } else {
            alert("Update failed. Username taken or wrong password.");
        }
    });

    // --- 5. EYE TOGGLE ICONS (PASSWORD VISIBILITY) ---
    function setupEyeToggle(btnId: string, inputId: string, iconId: string) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId) as HTMLInputElement;
        const icon = document.getElementById(iconId) as HTMLImageElement;

        btn?.addEventListener("click", (e) => {
            e.preventDefault(); // Stops the button from randomly refreshing the page
            if (input.type === "password") {
                input.type = "text";
                if (icon) icon.src = "../images/hidden.png";
            } else {
                input.type = "password";
                if (icon) icon.src = "../images/view.png";
            }
        });
    }

    setupEyeToggle("eyeUsernameConf", "usernamePasswordConfirm", "iconUsernameConf");
    setupEyeToggle("eyeOld", "oldPasswordInput", "iconOld");
    setupEyeToggle("eyeNew", "newPasswordInput", "iconNew");
    setupEyeToggle("eyeConfirm", "confirmPasswordInput", "iconConfirm");

    // --- 6. UPDATE PASSWORD DATABASE LOGIC ---
    const savePasswordBtn = document.getElementById("savePasswordBtn");
    savePasswordBtn?.addEventListener("click", async () => {
        const oldPass = (document.getElementById("oldPasswordInput") as HTMLInputElement).value;
        const newPass = (document.getElementById("newPasswordInput") as HTMLInputElement).value;
        const confirmPass = (document.getElementById("confirmPasswordInput") as HTMLInputElement).value;

        if (!oldPass || !newPass || !confirmPass) {
            alert("Fill in all password fields.");
            return;
        }
        if (newPass !== confirmPass) {
            alert("New passwords do not match.");
            return;
        }

        const success = await send<any>("updatePassword", token, oldPass, newPass);
        if (success) {
            alert("Password updated!");
            (document.getElementById("oldPasswordInput") as HTMLInputElement).value = "";
            (document.getElementById("newPasswordInput") as HTMLInputElement).value = "";
            (document.getElementById("confirmPasswordInput") as HTMLInputElement).value = "";
        } else {
            alert("Update failed. Incorrect old password.");
        }
    });

    // --- 7. PERSONAL PREFERENCES DATABASE LOGIC ---
    const savePrefsBtn = document.getElementById("savePrefsBtn");
    savePrefsBtn?.addEventListener("click", async () => {
        const vis = (document.getElementById("pref-visibility") as HTMLInputElement).checked;
        const email = (document.getElementById("pref-email") as HTMLInputElement).checked;
        const theme = (document.getElementById("pref-theme") as HTMLInputElement).checked;

        // Assumes your backend can handle updating these 3 booleans
        const success = await send<any>("updatePreferences", token, vis, email, theme);
        if (success) {
            alert("Preferences saved!");
        } else {
            alert("Failed to save preferences.");
        }
    });
});