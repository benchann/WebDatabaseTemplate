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
var passwordSUInput = create("input", { placeholder: "Enter your password", className: "buttonsSULIInput" });
var confirmSUInput = create("input", { placeholder: "Enter your password again", className: "buttonsSULIInput" });
var submitSUButton = create("button", { innerText: "Create an account", className: "submitButton" });
var userNameSUDiv = create("div", { innerText: "Username", className: "" });
var passwordSUDiv = create("div", { innerText: "Password", className: "" });
var confirmPasswordSUDiv = create("div", { innerText: "Confirm Password", className: "" });


var usernameLIInput = create("input", { placeholder: "Enter your username", className: "buttonsSULIInput" });
var passwordLIInput = create("input", { placeholder: "Enter your password", className: "buttonsSULIInput" });
var submitLIButton = create("button", { innerText: "Log In", className: "submitButton" });
var userNameLIDiv = create("div", { innerText: "Username", className: "" });
var passwordLIDiv = create("div", { innerText: "Password", className: "" });

var errorSUDiv = create("div");
var errorLIDiv = create("div");

signUpButton.onclick = function () {
    popupSUDiv.classList.remove("invisible");
}

loginButton.onclick = function () {
    popupLIDiv.classList.remove("invisible");
}

var popupSUContentDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { className: "signUpH1", innerText: "Sign Up" }),
    usernameSUInput,
    passwordSUInput,
    confirmSUInput,
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
        console.log("clicked");
        alertSULI("User created successfully");
        localStorage.setItem("token", token);
        setTimeout(() => { location.href = "index.html"; }, 2000);
    }
};


var popupLIContentDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { className: "LIH1", innerText: "Login" }),
    usernameLIInput,
    passwordLIInput,
    submitLIButton,
    errorLIDiv,
);

var popupLIDiv = createPopup(popupLIContentDiv)
document.body.append(popupLIDiv);

submitLIButton.onclick = async function () {
    var token = await send<string | null>("logIn", usernameLIInput.value, passwordLIInput.value)
    if (token == null) {
        errorLIDiv.innerText = "Password or Username do not match.";
        setTimeout(() => {errorLIDiv.innerText = ""; }, 5000);
        return;
    }
    else {
        alertSULI("User logged successfully");
        localStorage.setItem("token", token);
        setTimeout(() => { location.href = "index.html"; }, 2000);
    }
}
