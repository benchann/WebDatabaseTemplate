import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

//#region Create Article
var createArticleButton = get("button", "createArticleButton");

// Build the inner elements for the layout
var articleContentCreationPopUp = create("div", { className: "editor-layout-container" },
    // LEFT SIDEBAR (Settings)
    create("div", { className: "editor-sidebar" },
        create("div", { className: "sidebar-group" },
            create("label", { textContent: "Purchase price" }),
            create("input", { type: "text", placeholder: "10¢", className: "sidebar-input" }),
            create("span", { textContent: "Enter how much you want to charge for your content.", className: "sidebar-hint" })
        ),
        create("div", { className: "sidebar-group" },
            create("label", { textContent: "Tags" }),
            create("input", { type: "text", placeholder: "Technology, Life, Architecture", className: "sidebar-input" }),
            create("span", { textContent: "Separate tags using commas or spaces.", className: "sidebar-hint" })
        ),
        create("button", { textContent: "Publish 10¢", className: "publish-btn" })
    ),

    // RIGHT MAIN CONTENT AREA
    create("div", { className: "editor-main" },
        // Top Navbar Simulation
        create("div", { className: "editor-nav" },
            create("div", { className: "nav-left" },
                create("span", { textContent: "S C I  Z O N E", className: "logo" })
            ),
            create("div", { className: "nav-center" },
                create("span", { textContent: "Hot" }),
                create("span", { textContent: "New" }),
                create("span", { textContent: "Technology" }),
                create("span", { textContent: "Health" })
            ),
            create("div", { className: "nav-right" },
                create("span", { textContent: "Create", className: "nav-create" })
            )
        ),
        // Editor Canvas
        create("div", { className: "editor-canvas" },
            create("h2", { textContent: "Create content", className: "canvas-heading" }),

            create("div", { className: "input-group" },
                create("label", { textContent: "Title Of The Post" }),
                create("input", { type: "text", placeholder: "Lorem ipsum dolor sit amet", className: "title-input" })
            ),

            create("div", { className: "input-group" },
                create("label", { textContent: "Content" }),
                create("div", { className: "text-editor-box" },
                    create("p", { textContent: "Integer sit amet urna non lectus fermentum dignissim vel nec lorem. Cras rhoncus orci lorem, vehicula mollis purus pellentesque et. Curabitur vel tempus eros. Nulla eget odio neque. Pellentesque blandit elementum diam, eget pellentesque ipsum. Morbi sem est, pellentesque ac dapibus vel, congue eu mi. Suspendisse imperdie..." }),

                    // Floating Editor Toolbar Simulation
                    create("div", { className: "floating-toolbar" },
                        create("button", { textContent: "H1" }),
                        create("button", { textContent: "H2" }),
                        create("button", { textContent: "B", className: "bold" }),
                        create("button", { textContent: "I", className: "italic" })
                    ),

                    // Light green highlighted premium selection text
                    create("p", {},
                        create("span", { textContent: "Donec tempor maximus dui,", className: "highlight-green" }),
                        create("span", { textContent: " vulputate bibendum est pulvinar sit amet." })
                    ),

                    // Divider line for paid content
                    create("div", { className: "paid-divider" },
                        create("span", { textContent: "PAID CONTENT" })
                    ),

                    create("p", { textContent: "Suspendisse vehicula hendrerit nisi, eu placerat metus egestas in. Vivamus eget rutrum sem. Proin imperdiet vehicula purus eu iaculis." })
                )
            )
        )
    )
);

var articlePopUpDiv = createPopup(articleContentCreationPopUp);
articlePopUpDiv.classList.add("invisible");
document.body.append(articlePopUpDiv);

createArticleButton.onclick = function () {
    articlePopUpDiv.classList.remove("invisible");
}