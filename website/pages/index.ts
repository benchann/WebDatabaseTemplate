import { createPopup } from "components/popup";
import { create } from "componentUtilities";

var popupInnerDiv = create("div", { className: "popupContainerDiv" },
    create("h1", { className: "signUpH1", innerText: "Sign Up" }),
    create("input", {placeholder: "Username"}),
    create("input", {placeholder: "Password"}),
    create("input", {placeholder: "Confirm password"}),
    create("button", {innerText: "Submit"}),
);

document.body.append(createPopup(popupInnerDiv));