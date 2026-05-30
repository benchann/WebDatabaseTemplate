import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

//#region SIGN UP POPUP
var signUpButton = get("button", "signUpButton");
var errorSUDiv = create("div");
var SUText = create("div", { innerText: "Sign Up", className: "SULIText" })
var usernameSUInput = create("input", { placeholder: "Enter your username", className: "buttonsSULIInput" });
var passwordSUInput = create("input", { placeholder: "Enter your password", type: "password", className: "buttonsSULIInput" });
var confirmSUInput = create("input", { placeholder: "Enter your password again", type: "password", className: "buttonsSULIInput" });
var submitSUButton = create("button", { innerText: "Create an account", className: "submitButton" });
var userNameSUDiv = create("div", { innerText: "Username", className: "usernamePasswordDiv" });
var passwordSUDiv = create("div", { innerText: "Password", className: "usernamePasswordDiv" });
var confirmPasswordSUDiv = create("div", { innerText: "Confirm Password", className: "usernamePasswordDiv" });
var sUEyeIcon = create("img", { src: "../images/view.png" });
var sUEyeButton = create("button", { className: "eyeButton" }, sUEyeIcon);
var passwordSUWrapper = create("div", { className: "passwordInputWrapper" },
passwordSUInput, //Component shortcut for get, set and appendchild(create)
sUEyeButton
);
var confirmEyeIcon = create("img", { src: "../images/view.png" });
var confirmEyeButton = create("button", { className: "eyeButton" },confirmEyeIcon);
var confirmSUWrapper = create("div", { className: "passwordInputWrapper" },
confirmSUInput,
confirmEyeButton
);
//adding a switch between su and li in the popup
var tabSUIcon = create("img", { src: "../images/enter.png", className: "tabIconImg" },)
var tabSUButton = create("button", { innerText: "Log In", className: "tabSwitch" },tabSUIcon);
// Active indicator button for the page you are already on
var tabSUActiveIcon = create("img", { src: "../images/profile.png", className: "tabIconImg" });
var tabSUActiveLabel = create("button", { innerText: "Sign Up", className: "tabSwitch currentTab" },tabSUActiveIcon);
var tabButtonSUContainer = create("div", { className: "tabButtonContainer" },
tabSUActiveLabel,
tabSUButton,
);

var popupSUContentDiv = create("div", { className: "popupContainerDiv" },
    SUText,
    userNameSUDiv,
    usernameSUInput,
    passwordSUDiv,
    passwordSUWrapper,
    confirmPasswordSUDiv,
    confirmSUWrapper,
    submitSUButton,
    errorSUDiv,
    tabButtonSUContainer, //order and anarchey matters!
);
var popupSUDiv = createPopup(popupSUContentDiv) // creates a popup with the manually made command and adds the content from the placeholder
document.body.append(popupSUDiv); // implements the new popup
//#endregion

//#region LOG IN POPUP

var loginButton = get("button", "loginButton");
var errorLIDiv = create("div");
var LIText = create("div", { innerText: "Log In", className: "SULIText" })
var usernameLIInput = create("input", { placeholder: "Enter your username", className: "buttonsSULIInput" });
var passwordLIInput = create("input", { placeholder: "Enter your password", type: "password", className: "buttonsSULIInput" });
var submitLIButton = create("button", { innerText: "Log In", className: "submitButton" });
var userNameLIDiv = create("div", { innerText: "Username", className: "usernamePasswordDiv" });
var passwordLIDiv = create("div", { innerText: "Password", className: "usernamePasswordDiv" });
var lIEyeIcon = create("img", { src: "../images/view.png" });
var lIEyeButton = create("button", { className: "eyeButton" }, lIEyeIcon);
var passwordLIWrapper = create("div", { className: "passwordInputWrapper" },
passwordLIInput,
lIEyeButton,
);
var tabLIIcon = create('img', { src: "../images/profile.png", className: "tabIconImg" })
var tabLIButton = create("button", { innerText: "Sign Up", className: "tabSwitch" },tabLIIcon)
// Active indicator button for the page you are already on
var tabLIActiveIcon = create("img", { src: "../images/enter.png", className: "tabIconImg" });
var tabLIActiveLabel = create("button", { innerText: "Log In", className: "tabSwitch currentTab" },tabLIActiveIcon);
var tabButtonLIContainer = create("div", { className: "tabButtonContainer" },
tabLIActiveLabel,
tabLIButton,
);

var popupLIContentDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { innerText: "" }),
    LIText,
    userNameLIDiv,
    usernameLIInput,
    passwordLIDiv,
    passwordLIWrapper,
    submitLIButton,
    errorLIDiv,
    tabButtonLIContainer,
);
var popupLIDiv = createPopup(popupLIContentDiv)// creates a popup with the manually made command and adds the content from the placeholder
document.body.append(popupLIDiv);// implements the new popup
//#endregion

//#region FUNCTIONS

//ALERT FUNC
function alertSULI(message: string) {
    var toast = document.createElement("div");
    toast.id = "alertLISU";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => { toast.remove(); }, 1700);
};
//SU/LI BUTTONS ONCLICK FUNCS
signUpButton.onclick = function () {
    popupSUDiv.classList.remove("invisible");
};
loginButton.onclick = function () {
    popupLIDiv.classList.remove("invisible");
};
//SWITCH BETWEEN LI/SU FUNCS
tabSUButton.onclick = function () {
    popupLIDiv.classList.remove("invisible");  // Hides and shows login popup with a manually made component(invisible)
    popupSUDiv.classList.add("invisible");
}
tabLIButton.onclick = function () {
    popupSUDiv.classList.remove("invisible");  // Hides and shows login popup with a manually made component(invisible)
    popupLIDiv.classList.add("invisible");  
};
//SU/LI SUMBIT FUNCS
submitSUButton.onclick = async function () {

    if (passwordSUInput.value != confirmSUInput.value) {
        errorSUDiv.innerText = "Passwords do not match.";
        setTimeout(() => { errorSUDiv.innerText = ""; }, 3500);
        return;
    }

    var username = usernameSUInput.value;
    var password = passwordSUInput.value;
    var token = await send<string | null>("signUp", username, password);
    if (token == null) {
        errorSUDiv.innerText = "The username is already in use."
        setTimeout(() => { errorSUDiv.innerText = ""; }, 3500);
        return;
    }
    else {
        alertSULI("User created successfully");
        localStorage.setItem("token", token);
 setTimeout(() => {updateNavUI(usernameSUInput.value)
            popupSUDiv.classList.add("invisible");
        popupLIDiv.classList.add("invisible");
    }, 1700);

    }
};
submitLIButton.onclick = async function () {
    var token = await send<string | null>("logIn", usernameLIInput.value, passwordLIInput.value)
    if (token == null) {
        errorLIDiv.innerText = "Password or Username do not match.";
        setTimeout(() => { errorLIDiv.innerText = ""; }, 3500);
        return;
    }
    else {
        alertSULI("User logged in successfully");
        localStorage.setItem("token", token);
        setTimeout(() => {updateNavUI(usernameLIInput.value)
            popupSUDiv.classList.add("invisible");
        popupLIDiv.classList.add("invisible");
    }, 1700);

    }
};
//LO BUTN
var greetingContainer = document.getElementById("userGreeting");
var nameDisplay = document.getElementById("userNameDisplay");
var logOutButton = get("button", "logOutButton");
logOutButton.onclick = async function () {
    // 2. (Optional) Tell the server to invalidate the token
   const currentToken = localStorage.getItem("token");

    // 2. Only tell the server if a token actually exists
    if (currentToken) {
        await send("logOut", currentToken);
    }

    // 3. Remove the token from the browser
    localStorage.removeItem("token");

    // 4. Reset UI
    alertSULI("You have been logged out.");

    //5. UI Cleanup
    loginButton.style.display = "inline-block";
    signUpButton.style.display = "inline-block";
    logOutButton.style.display = "none";

    // 4. Hide the greeting and clear the name
    if (greetingContainer) {
        greetingContainer.style.display = "none"; 
    }
    if (nameDisplay) {
        nameDisplay.innerText = ""; // Clear the text just in case
    }
    
    alertSULI("You have been logged out.");
};
//REMOVING SU/LI BUTTONS AND ADDING GREETING
function updateNavUI(username: string) {
    //Hiding the Login and Sign Up buttons using your existing variables
    loginButton.style.display = "none";
    signUpButton.style.display = "none";
    logOutButton.style.display = "inline-block";

    // Making the container visible and set the text
    if (greetingContainer) {
        greetingContainer.style.display = "flex"; 
    }
    if (nameDisplay) {
        nameDisplay.innerText = username; 
    }
}
//SERVER USERNAME FETCH
async function fetchAndSetUserUi(){
    var token = localStorage.getItem("token");
if (!token) return; // No token, no need to fetch
    try {
        // You'll need an endpoint on your server that returns user info
        // It should accept the token (or have it in the header)
        const userData = await send<{username: string}>("getUserInfo", token);

        if (userData) {
            updateNavUI(userData.username);
        }
    } catch (error) {
        // If the token is invalid or expired, clear it
        console.error("Token is invalid");
        localStorage.removeItem("token");
    }
}
//SU/LI EVENTLISTNER FOR PASSWORD SECURITY
sUEyeButton.addEventListener("click", function () {
    if (passwordSUInput.getAttribute("type") === "password") {
        passwordSUInput.setAttribute("type", "text");
        sUEyeIcon.src = "../images/hidden.png";
    }
    else {
        passwordSUInput.setAttribute("type", "password");
        sUEyeIcon.src = "../images/view.png";
    }
});
confirmEyeButton.addEventListener("click", function () {
    if (confirmSUInput.getAttribute("type") === "password") {
        confirmSUInput.setAttribute("type", "text");
        confirmEyeIcon.src = "../images/hidden.png";
    } else {
        confirmSUInput.setAttribute("type", "password");
        confirmEyeIcon.src = "../images/view.png";
    }
});
lIEyeButton.addEventListener("click", function () {
    if (passwordLIInput.getAttribute("type") === "password") {
        passwordLIInput.setAttribute("type", "text");
        lIEyeIcon.src = "../images/hidden.png";
    }
    else {
        passwordLIInput.setAttribute("type", "password");
        lIEyeIcon.src = "../images/view.png";
    }
});
//#endregion