import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

//#region CREATE ARTICLE
var createArticleButton = get("button", "createArticleButton") as HTMLButtonElement;

//#region HELPER FUNCTION TO FORMAT TEXT INSIDE THE CANVAS
var formatText = (command: string, value: string | null = null): void => {
    document.execCommand(command, false, value || "");
};
//#endregion

//#region DYNAMIC TAG SELECTOR
var availableTags: string[] = [
    "Architecture", "Technology", "Agriculture", 
    "Science", "Medicine", "Biology", 
    "Physics", "Chemistry", "Genetics"
];
var selectedTags: string[] = [];
var selectedTagsContainer = create("div", { className: "selected-tags-container" });

var updateTagsDisplay = function(): void {
    selectedTagsContainer.innerHTML = "";
    selectedTags.forEach(function(tag) {
        var removeBtn = create("span", {
            textContent: " ✕", 
            className: "tag-remove-btn",
            onclick: function() {
                selectedTags = selectedTags.filter(function(t) { return t !== tag; });
                updateTagsDisplay();
            }
        });
        var tagChip = create("div", { className: "tag-chip" }, tag, removeBtn);
        selectedTagsContainer.appendChild(tagChip);
    });
};

var tagsDropdown = create("div", { className: "tags-dropdown" },
    ...availableTags.map(function(tag) {
        return create("div", { 
            textContent: tag, 
            className: "dropdown-item",
            onclick: function() {
                if (selectedTags.indexOf(tag) === -1) {
                    selectedTags.push(tag);
                    updateTagsDisplay();
                }
                tagsDropdown.style.display = "none";
            }
        });
    })
) as HTMLDivElement;
//#endregion

//#region "ADD TAG" BUTTON
var addTagBtn = create("button", { 
    textContent: "Select Tags", 
    className: "add-tag-btn",
    onclick: function(e: MouseEvent) {
        e.preventDefault();
        var isHidden = tagsDropdown.style.display === "none";
        tagsDropdown.style.display = isHidden ? "block" : "none";
    }
});
tagsDropdown.style.display = "none";
//#endregion

//#region TAGS GROUP + PUBLISH BUTTON
var tagsGroup = create("div", { className: "sidebar-group" },
    create("label", { textContent: "Tags" }),
    selectedTagsContainer,
    addTagBtn,
    tagsDropdown,
    create("span", { textContent: "Select relevant categories for this publication.", className: "sidebar-hint" })
);

var publishButton = create("button", { textContent: "Publish", className: "publish-btn" });
//#endregion
//#endregion

//#region FILE HANDLING (NEW)
// STORES SELECTED FILES FOR FUTURE DATABASE INTEGRATION
var attachedFiles: File[] = [];
var attachedFilesContainer = create("div", { className: "attached-files-container" });

// FUNCTION TO UPDATE THE VISUAL LIST OF ATTACHED FILES
var updateAttachedFilesDisplay = function(): void {
    attachedFilesContainer.innerHTML = "";
    attachedFiles.forEach(function(file, index) {
        var removeBtn = create("span", {
            textContent: " ✕",
            className: "tag-remove-btn",
            onclick: function() {
                attachedFiles.splice(index, 1);
                updateAttachedFilesDisplay();
            }
        });
        var fileChip = create("div", { className: "tag-chip" }, file.name, removeBtn);
        attachedFilesContainer.appendChild(fileChip);
    });
};

// HIDDEN FILE INPUT FOR "ADD FILES"
var fileInput = create("input", {
    type: "file",
    multiple: true,
    style: { display: "none" },
    onchange: function(e: Event) {
        var input = e.target as HTMLInputElement;
        if (input.files) {
            attachedFiles.push(...Array.from(input.files));
            updateAttachedFilesDisplay();
        }
    }
} as any);

var addFilesBtn = create("button", {
    textContent: "Add Files",
    className: "add-tag-btn",
    onclick: function(e: MouseEvent) {
        e.preventDefault();
        fileInput.click();
    }
});

var filesGroup = create("div", { className: "sidebar-group" },
    create("label", { textContent: "Attachments" }),
    attachedFilesContainer,
    addFilesBtn,
    fileInput,
    create("span", { textContent: "Files will appear at the bottom of your article.", className: "sidebar-hint" })
);
//#endregion

//#region RICH TEXT EDITOR PLACEHOLDER FIX (SINGLE CLICK SOLUTION)
// IMPROVED PLACEHOLDER LOGIC - CLEARS ON FIRST CLICK AND PLACES CURSOR IMMEDIATELY
var createEditorWithPlaceholder = () => {
    const editor = create("div", {
        className: "rich-text-editor",
        contentEditable: "true",
        innerHTML: "<p id='editor-placeholder'>Add your thoughts and ideas here...</p>"
    }) as HTMLDivElement;

    // SINGLE CLICK FOCUS FIX - REMOVES PLACEHOLDER ON FIRST INTERACTION
    editor.addEventListener("focus", function() {
        if (editor.innerHTML.includes("editor-placeholder")) {
            editor.innerHTML = "<p><br></p>";
            // PLACE CURSOR AT START IMMEDIATELY
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(editor.firstChild!, 0);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    });

    // RESTORE PLACEHOLDER IF USER LEAVES EDITOR EMPTY
    editor.addEventListener("blur", function() {
        if (editor.innerHTML.trim() === "" || editor.innerHTML === "<p><br></p>") {
            editor.innerHTML = "<p id='editor-placeholder'>Add your thoughts and ideas here...</p>";
        }
    });

    return editor;
};

var richTextEditor = createEditorWithPlaceholder();
//#endregion

//#region ARTICLE CONTENT POPUP CONSTRUCTION
var articleContentCreationPopUp = create("div", { className: "editor-layout-container" },
    // LEFT SIDEBAR
    create("div", { className: "editor-sidebar" },
        tagsGroup,
        filesGroup,           // NEW: ATTACHMENTS SECTION
        publishButton
    ),
    // RIGHT MAIN CONTENT
    create("div", { className: "editor-main" },
        create("div", { className: "editor-nav" },
            create("div", { className: "topLeftText" },
                create("span", { textContent: "S C I Z O N E", className: "webName" })
            ),
            create("div", { className: "topCenterText" },
                create("span", { textContent: "Knowledge" }),
                create("span", { textContent: "Science" }),
                create("span", { textContent: "Medical" }),
                create("span", { textContent: "Technology" })
            ),
            create("div", { className: "topRightText" },
                create("span", { textContent: "Create History", className: "nav-create" })
            )
        ),
        create("div", { className: "editor-canvas" },
            create("h2", { textContent: "Create content", className: "canvas-heading" }),
            create("div", { className: "input-group" },
                create("label", { textContent: "Title Of The Post" }),
                create("input", { type: "text", placeholder: "Add a title to your post", className: "title-input" })
            ),
            create("div", { className: "input-group" },
                create("label", { textContent: "Content" }),
                create("div", { className: "text-editor-box" },
                    // TOOLBAR
                    create("div", { className: "editor-toolbar" },
                        create("button", { textContent: "H1", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("formatBlock", "H1") }),
                        create("button", { textContent: "H2", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("formatBlock", "H2") }),
                        create("button", { textContent: "H3", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("formatBlock", "H3") }),
                        create("div", { className: "toolbar-divider" }),
                        create("button", { textContent: "B", className: "toolbar-btn bold", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("bold") }),
                        create("button", { textContent: "I", className: "toolbar-btn italic", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("italic") }),
                        create("button", { textContent: "U", className: "toolbar-btn underline", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("underline") }),
                        create("div", { className: "toolbar-divider" }),
                        create("button", { textContent: "⫷", title: "Align Left", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("justifyLeft") }),
                        create("button", { textContent: "≣", title: "Align Center", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("justifyCenter") }),
                        create("button", { textContent: "⫸", title: "Align Right", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("justifyRight") }),
                        create("div", { className: "toolbar-divider" }),
                        create("button", { textContent: "•≡", title: "Bullet List", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("insertUnorderedList") }),
                        create("button", { textContent: "1≡", title: "Numbered List", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("insertOrderedList") }),
                        create("div", { className: "toolbar-divider" }),
                        // IMAGE INSERT BUTTON (NEW)
                        create("button", { 
                            textContent: "🖼️", 
                            title: "Add Picture", 
                            className: "toolbar-btn",
                            onmousedown: (e: MouseEvent) => e.preventDefault(),
                            onclick: () => {
                                const imgInput = document.createElement("input");
                                imgInput.type = "file";
                                imgInput.accept = "image/*";
                                imgInput.onchange = () => {
                                    if (imgInput.files && imgInput.files[0]) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            formatText("insertImage", ev.target!.result as string);
                                        };
                                        reader.readAsDataURL(imgInput.files[0]);
                                    }
                                };
                                imgInput.click();
                            }
                        }),
                        create("div", { className: "toolbar-divider" }),
                        create("input", {
                            type: "color",
                            className: "toolbar-color-picker",
                            title: "Text Color",
                            oninput: (e: Event) => {
                                var colorInput = e.target as HTMLInputElement;
                                formatText("foreColor", colorInput.value);
                            }
                        })
                    ),
                    // THE ACTUAL EDITABLE AREA
                    richTextEditor
                )
            )
        )
    )
) as HTMLDivElement;
//#endregion

//#region POPUP INITIALIZATION
var articlePopUpDiv = createPopup(articleContentCreationPopUp) as HTMLDivElement;
articlePopUpDiv.classList.add("invisible");
document.body.append(articlePopUpDiv);

createArticleButton.onclick = function (): void {
    articlePopUpDiv.classList.remove("invisible");
};

publishButton.onclick = function(): void {
    articlePopUpDiv.classList.add("invisible");
    // TODO: COLLECT attachedFiles + richTextEditor.innerHTML FOR DATABASE
};
//#endregion