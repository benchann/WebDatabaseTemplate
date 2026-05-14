import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

var signUpButton = get("button", "signUpButton");

var usernameSUInput = create("input", { placeholder: "Username", className: "buttonsSUInput" });
var passwordSUInput = create("input", { placeholder: "Password", className: "buttonsSUInput" });
var confirmSUInput = create("input", { placeholder: "Confirm password", className: "buttonsSUInput" });
var submitSUButton = create("button", { innerText: "Submit" });
var errorSUDiv = create("div");
var successSUDiv = create("div");
var popupSUContentDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { className: "signUpH1", innerText: "Sign Up" }),
    usernameSUInput,
    passwordSUInput,
    confirmSUInput,
    submitSUButton,
    errorSUDiv,
    successSUDiv,
);
function alertSU(message: string) {
    var toast = create("div", { id: "alertSU" });
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

var popupSUDiv = createPopup(popupSUContentDiv)
document.body.append(popupSUDiv);

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
        alertSU("User created successfully");
        localStorage.setItem("token", token);
        setTimeout(() => {
        location.href = "index.html";
    }, 2000);
    }
};

signUpButton.onclick = function () {
    popupSUDiv.classList.remove("invisible");
}