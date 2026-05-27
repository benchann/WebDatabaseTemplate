import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

function alertSULI(message: string) {
    var toast = document.createElement("div");
    toast.id = "alertLISU";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => { toast.remove(); }, 3000);
}

var signUpButton = get("button", "signUpButton");
var loginButton = get("button", "loginButton");

var usernameSUInput = create("input", { placeholder: "Enter your username", className: "buttonsSULIInput" });
var passwordSUInput = create("input", { placeholder: "Enter your password", type:"password", className: "buttonsSULIInput" });
var confirmSUInput = create("input", { placeholder: "Enter your password again", type:"password", className: "buttonsSULIInput" });
var submitSUButton = create("button", { innerText: "Create an account", className: "submitButton" });
var userNameSUDiv = create("div", { innerText: "Username", className: "usernamePasswordDiv" });
var passwordSUDiv = create("div", { innerText: "Password", className: "usernamePasswordDiv" });
var confirmPasswordSUDiv = create("div", { innerText: "Confirm Password", className: "usernamePasswordDiv" });

var sUEyeIcon = create("img", {src:"../images/view.png" });
var sUEyeButton = create("button", {className: "eyeButton"});
sUEyeButton.appendChild(sUEyeIcon);

var passwordSUWrapper = create("div", { className: "passwordInputWrapper" });
passwordSUWrapper.appendChild(passwordSUInput);
passwordSUWrapper.appendChild(sUEyeButton);

var confirmEyeIcon = create("img", { src: "../images/view.png" });
var confirmEyeButton = create("button", { className: "eyeButton" });
confirmEyeButton.appendChild(confirmEyeIcon);

var confirmSUWrapper = create("div", { className: "passwordInputWrapper" });
confirmSUWrapper.appendChild(confirmSUInput);
confirmSUWrapper.appendChild(confirmEyeButton);

////////

var usernameLIInput = create("input", { placeholder: "Enter your username", className: "buttonsSULIInput" });
var passwordLIInput = create("input", { placeholder: "Enter your password", type:"password", className: "buttonsSULIInput" });
var submitLIButton = create("button", { innerText: "Log In", className: "submitButton" });
var userNameLIDiv = create("div", { innerText: "Username", className: "usernamePasswordDiv" });
var passwordLIDiv = create("div", { innerText: "Password", className: "usernamePasswordDiv" });

var lIEyeIcon = create("img", {src:"../images/view.png" });
var lIEyeButton = create("button", {className: "eyeButton"});
lIEyeButton.appendChild(lIEyeIcon);

var passwordLIWrapper = create("div", { className: "passwordInputWrapper" });
passwordLIWrapper.appendChild(passwordLIInput);
passwordLIWrapper.appendChild(lIEyeButton);


var errorSUDiv = create("div");
var errorLIDiv = create("div");

var tabSUButton = create ("button", { innerText:"Sign Up",className:"tabSwitch"}) //adding a switch between su and li in the popup
var tabSUIcon = create("img", {src: "../images/profile.png"})
tabSUButton.appendChild(tabSUIcon)
var tabButtonSUContainer = create("div", { className: "tabButtonContainer" });
tabButtonSUContainer.appendChild(tabSUButton)

var tabLIButton = create ("button", {innerText: "Log In", className:"tabSwitch"})
var tabLIIcon = create('img',{src: "../images/enter.png"})
tabLIButton.appendChild(tabLIIcon)
var tabButtonLIContainer = create("div", { className: "tabButtonContainer" });
tabButtonLIContainer.appendChild(tabLIButton)

tabSUButton.onclick = function() {
    popupLIDiv.classList.add("invisible");  // Hide login popup
    popupSUDiv.classList.remove("invisible"); // Open signup popup
}

tabLIButton.onclick = function() {
    popupSUDiv.classList.add("invisible");   // Hide signup popup
    popupLIDiv.classList.remove("invisible");  // Open login popup
}

signUpButton.onclick = function () {
    popupSUDiv.classList.remove("invisible");
}

loginButton.onclick = function () {
    popupLIDiv.classList.remove("invisible");
}

lIEyeButton.addEventListener("click", function(){
    if (passwordLIInput.getAttribute("type")=== "password"){
        passwordLIInput.setAttribute("type","text");
        lIEyeIcon.src ="../images/hidden.png";
    }
    else{
        passwordLIInput.setAttribute("type", "password");
        lIEyeIcon.src= "../images/view.png";
    }
});

sUEyeButton.addEventListener("click", function(){
    if (passwordSUInput.getAttribute("type")=== "password"){
        passwordSUInput.setAttribute("type","text");
        sUEyeIcon.src ="../images/hidden.png";
    }
    else{
        passwordSUInput.setAttribute("type", "password");
        sUEyeIcon.src= "../images/view.png";
    }
});

confirmEyeButton.addEventListener("click", function() {
    if (confirmSUInput.getAttribute("type") === "password") {
        confirmSUInput.setAttribute("type", "text");
        confirmEyeIcon.src = "../images/hidden.png";
    } else {
        confirmSUInput.setAttribute("type", "password");
        confirmEyeIcon.src = "../images/view.png";
    }
});

var popupSUContentDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { className: "popupSubtitle", innerText: "Sign Up", }),
    tabButtonSUContainer, //order and anarchey matters!
    userNameSUDiv,
    usernameSUInput,
    passwordSUDiv,
    passwordSUWrapper,
    confirmPasswordSUDiv,
    confirmSUWrapper,
    submitSUButton,
    errorSUDiv,
);

var popupSUDiv = createPopup(popupSUContentDiv) // creates a popup with the manually made command and adds the content from the placeholder
document.body.append(popupSUDiv); // implements the new popup

submitSUButton.onclick = async function () {

    if (passwordSUInput.value != confirmSUInput.value) {
        errorSUDiv.innerText = "Passwords do not match.";
        return;
    }

    var username = usernameSUInput.value;
    var password = passwordSUInput.value;
    var token = await send<string | null>("signUp", username, password);
    if (token == null) {
        errorSUDiv.innerText = "The username is already in use."
        return;
    }
    else {
        alertSULI("User created successfully");
        localStorage.setItem("token", token);
        setTimeout(() => { location.href = "index.html"; }, 2000);
        setTimeout(() => { location.href = "feed.html"; }, 400);

    }
};


var popupLIContentDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { className: "popupSubtitle", innerText: "Login" }),
    tabButtonLIContainer,
    userNameLIDiv,
    usernameLIInput,
    passwordLIDiv,
    passwordLIWrapper,
    submitLIButton,
    errorLIDiv,
);

var popupLIDiv = createPopup(popupLIContentDiv)
document.body.append(popupLIDiv);

submitLIButton.onclick = async function () {
    var token = await send<string | null>("logIn", usernameLIInput.value, passwordLIInput.value)
    if (token == null) {
        errorLIDiv.innerText = "Password or Username do not match.";
        setTimeout(() => { errorLIDiv.innerText = ""; }, 5000);
        return;
    }
    else {
        alertSULI("User logged in successfully");
        localStorage.setItem("token", token);
        setTimeout(() => { location.href = "index.html"; }, 2000);
        setTimeout(() => { location.href = "feed.html"; }, 400);

    }
}
