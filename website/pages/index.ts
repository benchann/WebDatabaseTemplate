import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create } from "componentUtilities";

var usernameSUInput = create("input", { placeholder: "Username" });
var passwordSUInput = create("input", { placeholder: "Password" });
var confirmSUInput = create("input", { placeholder: "Confirm password" });
var submitSUButton = create("button", { innerText: "Submit" });
var errorSUDiv = create("div");
var popupSUDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { className: "signUpH1", innerText: "Sign Up" }),
    usernameSUInput,
    passwordSUInput,
    confirmSUInput,
    submitSUButton,
    errorSUDiv,
);

document.body.append(createPopup(popupSUDiv));

submitSUButton.onclick = async function () {
    if (passwordSUInput.value != confirmSUInput.value) {
        errorSUDiv.innerText = "Passwords do not match.";
        return;
    }

    var username = usernameSUInput.value;
    var password = passwordSUInput.value;
    var token = await send<string | null>("signUp", username, password);
    if(token==null){
        errorSUDiv.innerText = "The username is already in use."
        return;
    }
    localStorage.setItem("token",token);
    location.href = "index.html"
}; 