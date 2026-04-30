import { create } from "componentUtilities";

export function createPopup(element: HTMLElement) {
    function close(e: PointerEvent) {
        if (e.target != e.currentTarget) {
            return;
        }

        popupDiv.remove();
    }

    var popupDiv = create("div", { className: "popupBackgroundDiv", onclick: close },
        create("div", { className: "popupBodyDiv" },
            element
        )
    );

    return popupDiv;
}
