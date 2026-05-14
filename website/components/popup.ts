import { create } from "componentUtilities";

export function createPopup(element: HTMLElement) {
    function close(e: PointerEvent) {
        if (e.target != e.currentTarget) {
            return;
        }

        popupDiv.classList.add("invisible");
    }

    var popupDiv = create("div", { className: "popupBackgroundDiv invisible", onclick: close },
        create("div", { className: "popupBodyDiv" },
            element
        )
    );

    return popupDiv;
}
