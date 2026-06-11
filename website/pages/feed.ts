import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

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

//#region RICH TEXT EDITOR PLACEHOLDER FIX
var createEditorWithPlaceholder = () => {
    const editor = create("div", {
        className: "rich-text-editor",
        contentEditable: "true",
        innerHTML: "<p id='editor-placeholder'>Add your thoughts and ideas here...</p>"
    }) as HTMLDivElement;

    editor.addEventListener("focus", function() {
        if (editor.innerHTML.includes("editor-placeholder")) {
            editor.innerHTML = "<p><br></p>";
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(editor.firstChild!, 0);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    });

    editor.addEventListener("blur", function() {
        if (editor.innerHTML.trim() === "" || editor.innerHTML === "<p><br></p>") {
            editor.innerHTML = "<p id='editor-placeholder'>Add your thoughts and ideas here...</p>";
        }
    });

    return editor;
};

var richTextEditor = createEditorWithPlaceholder();
//#endregion

//#region HELPER FUNCTION TO FORMAT TEXT
var formatText = (command: string, value: string | null = null): void => {
    document.execCommand(command, false, value || "");
};
//#endregion

//#region ARTICLE CONTENT POPUP CONSTRUCTION
var articleContentCreationPopUp = create("div", { className: "editor-layout-container" },
    create("div", { className: "editor-sidebar" },
        tagsGroup,
        publishButton
    ),
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
                create("input", { id: "titleInput", type: "text", placeholder: "Add a title to your post", className: "title-input" })
            ),
            create("div", { className: "input-group" },
                create("label", { textContent: "Content" }),
                create("div", { className: "text-editor-box" },
                    // TOOLBAR
                    create("div", { className: "editor-toolbar" },
                        create("button", { textContent: "H1", title:"Normal Size", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("formatBlock", "H1") }),
                        create("button", { textContent: "H2", title:"Subtitle Size", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("formatBlock", "H2") }),
                        create("button", { textContent: "H3", title:"Title Size", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("formatBlock", "H3") }),
                        create("div", { className: "toolbar-divider" }),
                        create("button", { textContent: "B", title:"Bolder Text", className: "toolbar-btn bold", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("bold") }),
                        create("button", { textContent: "I", title:"Italic Text", className: "toolbar-btn italic", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("italic") }),
                        create("button", { textContent: "U", title:"Underline Text", className: "toolbar-btn underline", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("underline") }),
                        create("div", { className: "toolbar-divider" }),
                        create("button", { textContent: "⫷", title: "Align Left", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("justifyLeft") }),
                        create("button", { textContent: "≣", title: "Align Center", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("justifyCenter") }),
                        create("button", { textContent: "⫸", title: "Align Right", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("justifyRight") }),
                        create("div", { className: "toolbar-divider" }),
                        create("button", { textContent: "•≡", title: "Bullet List", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("insertUnorderedList") }),
                        create("button", { textContent: "1≡", title: "Numbered List", className: "toolbar-btn", onmousedown: (e: MouseEvent) => e.preventDefault(), onclick: () => formatText("insertOrderedList") }),
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
                    richTextEditor
                )
            )
        )
    )
) as HTMLDivElement;

// ==================== POPUP INJECTIONS ====================
var articlePopUpDiv = createPopup(articleContentCreationPopUp) as HTMLDivElement;
articlePopUpDiv.classList.add("invisible");
document.body.appendChild(articlePopUpDiv);

var createArticleButton = get("button", "createArticleButton") as HTMLButtonElement;
createArticleButton.onclick = async function () {
    var token = localStorage.getItem("token");
    var user = await send<any>("getUser", token);
    
    if (user == null) {
        suliPopup.classList.remove("invisible");
    } else {
        articlePopUpDiv.classList.remove("invisible");
    }
};

const suliPopupContent = create("div", { className: "suli-popup" },
    create("div", { className: "suli-lock" }, "🔒"),
    create("h2", { textContent: "Sign in required" }),
    create("p", { textContent: "You must be logged in to create an article.", className: "suli-message"}),
    create("div", { className: "suli-buttons" },
        create("button", { 
            textContent: "Cancel",
            className: "suli-cancel",
            onclick: () => suliPopup.classList.add("invisible")
        }),
        create("a", {
            textContent: "Continue to Sign In",
            className: "suli-continue",
            href: "index.html"
        })
    )
);
const suliPopup = createPopup(suliPopupContent) as HTMLDivElement;
suliPopup.classList.add("invisible");
document.body.appendChild(suliPopup);

//#region FEED RENDER LOOPER
var loadFeedStream = async function(): Promise<void> {
    // Dynamically query to ensure DOM lifecycle availability
    const feedStream = document.getElementById("feedStream") as HTMLDivElement;
    if (!feedStream) return;

    feedStream.innerHTML = "";
    var articles = await send<any[]>("getArticles");

    if (!articles || articles.length === 0) {
        feedStream.appendChild(create("div", { textContent: "No articles shared yet. Be the first to publish!", className: "no-articles-card" }));
        return;
    }

    articles.forEach(function(article) {
        var displayTitle = article.Title || article.title || "";
        var displayTags = article.Tags || article.tags || "";
        var displayContent = article.Content || article.content || "";
        var displayAuthor = article.AuthorUsername || article.authorUsername || "anonymous";

        var card = create("div", { className: "article-card" });
        var header = create("div", { className: "article-card-header" });
        var title = create("h2", { textContent: displayTitle, className: "article-card-title" });
        var tagsContainer = create("div", { className: "article-card-tags" });

        if (displayTags) {
            displayTags.split(",").forEach(function(tag: string) {
                if (tag.trim() !== "") {
                    tagsContainer.appendChild(create("span", { textContent: tag, className: "article-card-tag-chip" }));
                }
            });
        }

        header.appendChild(title);
        header.appendChild(tagsContainer);

        var meta = create("div", { textContent: "Published by u/" + displayAuthor, className: "article-card-meta" });
        var content = create("div", { className: "article-card-content" });
        content.innerHTML = displayContent;

        var toggleBtn = create("button", { textContent: "Read More", className: "article-card-toggle" });
        toggleBtn.onclick = function() {
            if (card.classList.contains("expanded")) {
                card.classList.remove("expanded");
                toggleBtn.textContent = "Read More";
            } else {
                card.classList.add("expanded");
                toggleBtn.textContent = "Show Less";
            }
        };

        card.appendChild(header);
        card.appendChild(meta);
        card.appendChild(content);
        card.appendChild(toggleBtn);
        feedStream.appendChild(card);
    });
};

// ==================== INTERACTION ACTION HANDLERS ====================
// FIXED: Added missing async signature and updated dynamic variable selector scoping
publishButton.onclick = async function() {
    const titleInput = document.getElementById("titleInput") as HTMLInputElement;
    if (!titleInput) return;

    var titleVal = titleInput.value.trim();
    var contentVal = richTextEditor.innerHTML.trim();
    var token = localStorage.getItem("token");

    if (!titleVal || contentVal === "" || contentVal === "<p><br></p>" || contentVal.includes("editor-placeholder")) {
        alert("Please add a title and write content before publishing.");
        return;
    }

    var tagsString = selectedTags.join(",");
    
    // FIXED: Swapped parameters grouping from a standard tuple evaluation sequence into an explicit array array mapping bounds [...]
    var success = await send<boolean>("publishArticle", [titleVal, contentVal, tagsString, token]);
    if (success) {
        titleInput.value = "";
        richTextEditor.innerHTML = "<p id='editor-placeholder'>Add your thoughts and ideas here...</p>";
        selectedTags = [];
        updateTagsDisplay();
        
        articlePopUpDiv.classList.add("invisible");
        loadFeedStream();
    } else {
        alert("Failed to publish your article. Verify your session.");
    }
};

// Initial invocation on source resolution execution boundaries
loadFeedStream();