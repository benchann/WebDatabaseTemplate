import { send } from "clientUtilities";
import { createPopup } from "components/popup";
import { create, get } from "componentUtilities";

//#region GLOBAL STATE
var currentDraftId: number | null = null; 
//#endregion

//#region DYNAMIC TAG SELECTOR
var availableTags: string[] = [
    "Academic","Agriculture","Architecture", 
    "Biology","Chemistry","Genetics","Medicine",   
    "Physics","Science","Sports","Technology",
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

// NEW: Draft Buttons
var saveDraftBtn = create("button", { textContent: "Save Draft", className: "publish-btn" });
saveDraftBtn.style.marginTop = "10px";
saveDraftBtn.style.backgroundColor = "#666";

var myDraftsBtn = create("button", { textContent: "My Drafts", className: "publish-btn" });
myDraftsBtn.style.marginTop = "10px";
myDraftsBtn.style.backgroundColor = "#444";
//#endregion
const sidebarActions = create("div", { className: "draft-actions" },
    saveDraftBtn,
    myDraftsBtn,
    publishButton
);


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
        sidebarActions
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
                create("textarea", { id: "titleInput", placeholder: "Add a title to your post", className: "title-input" })
            ),
            create("div", { className: "input-group" },
                create("label", { textContent: "Content" }),
                create("div", { className: "text-editor-box" },
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

var articlePopUpDiv = createPopup(articleContentCreationPopUp) as HTMLDivElement;
articlePopUpDiv.classList.add("invisible");
document.body.appendChild(articlePopUpDiv);
//#endregion

//#region DRAFTS POPUP
const draftsListContainer = create("div", { className: "drafts-list" });
const draftsPopupContent = create("div", { className: "editor-layout-container" },
    create("div", { className: "editor-sidebar" },
        create("h2", { textContent: "Article Drafts" }),
        create("button", { textContent: "Close", className: "drafts-close-btn", onclick: () => draftsPopup.classList.add("invisible") })
    ),
    create("div", { className: "editor-main" }, draftsListContainer)
);
draftsPopupContent.style.padding = "20px"; // Apply style outside create

const draftsPopup = createPopup(draftsPopupContent) as HTMLDivElement;
draftsPopup.classList.add("invisible");
document.body.appendChild(draftsPopup);
//#endregion

//#region SULI POPUP FOR AUTHENTICATION
const suliPopupContent = create("div", { className: "suli-popup" },
    create("div", { className: "suli-lock" }, "🔒"),
    create("h2", { textContent: "Sign in required" }),
    create("p", { textContent: "You must be logged in to perform this action.", className: "suli-message"}),
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

var createArticleButton = get("button", "createArticleButton") as HTMLButtonElement;
createArticleButton.onclick = async function () {
    var token = localStorage.getItem("token");
    var user = await send<any>("getUser", token);

    draftsPopup.classList.add("invisible");
    if (user == null) {
        suliPopup.classList.remove("invisible");
    } else {
        currentDraftId = null; 
        (document.getElementById("titleInput") as HTMLTextAreaElement).value = "";
        richTextEditor.innerHTML = "<p id='editor-placeholder'>Add your thoughts and ideas here...</p>";
        selectedTags = [];
        updateTagsDisplay();
        articlePopUpDiv.classList.remove("invisible");
    }
};
const openDraftsButton = get("button", "openDraftsButton") as HTMLButtonElement;

openDraftsButton.onclick = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        suliPopup.classList.remove("invisible");
        return;
    }

    const user = await send<any>("getUser", token);

    if (!user) {
        suliPopup.classList.remove("invisible");
        return;
    }

    myDraftsBtn.click();
};
myDraftsBtn.onclick = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        suliPopup.classList.remove("invisible");
        return;
    }

    const user = await send<any>("getUser", token);

    if (!user) {
        suliPopup.classList.remove("invisible");
        return;
    }
    draftsListContainer.innerHTML = "";
    var drafts = await send<any[]>("getDrafts", token);

    if (drafts.length === 0) {
        draftsListContainer.appendChild(create("p", { textContent: "No drafts found." }));
    }

    drafts.forEach(draft => {

    const draftId = draft.Id ?? draft.id;
    const draftTitle = draft.Title ?? draft.title ?? "";
    const draftContent = draft.Content ?? draft.content ?? "";
    const draftTags = draft.Tags ?? draft.tags ?? "";

    const item = create("div", { className: "draft-item" });

    item.appendChild(
        create("h3", {
            textContent: draftTitle || "Untitled Draft"
        })
    );

    item.appendChild(
        create("div", {
            textContent:
                draftContent.replace(/<[^>]+>/g, "").substring(0, 120) +
                (draftContent.length > 120 ? "..." : ""),
            className: "draft-preview"
        })
    );

    const buttons = create("div", {
        className: "draft-buttons"
    });

    const editBtn = create("button", {
        textContent: "Edit",
        onclick: () => {

            currentDraftId = draftId;

            (document.getElementById("titleInput") as HTMLTextAreaElement).value =
                draftTitle;

            richTextEditor.innerHTML =
                draftContent || "<p><br></p>";

            selectedTags =
                draftTags.length > 0
                    ? draftTags.split(",")
                    : [];

            updateTagsDisplay();

            draftsPopup.classList.add("invisible");
            articlePopUpDiv.classList.remove("invisible");
        }
    });

    const deleteBtn = create("button", {
        textContent: "Delete",
        className: "delete-draft-btn",
        onclick: async () => {

            const success = await send<boolean>(
                "deleteDraft",
            {
                DraftId: draftId,
                Token: token
            }
            );

            if (success) {
                item.remove();
            }
        }
    });

    buttons.appendChild(editBtn);
    buttons.appendChild(deleteBtn);

    item.appendChild(buttons);

    draftsListContainer.appendChild(item);
});

    draftsPopup.classList.remove("invisible");
};
// Close the myDraftsBtn.onclick function
saveDraftBtn.onclick = async () => {
    const titleInput = document.getElementById("titleInput") as HTMLTextAreaElement;
    const titleVal = titleInput.value.trim();
    const contentVal = richTextEditor.innerHTML.trim();
    const token = localStorage.getItem("token");
    if (!titleVal) { alert("Title is required."); return; }
    var success = await send<boolean>("saveDraft", [currentDraftId, titleVal, contentVal, selectedTags.join(","), token]);
    if (success) { alert("Draft saved!"); articlePopUpDiv.classList.add("invisible"); }
};
//#endregion

//#region FEED RENDER LOOPER
var loadFeedStream = async function(): Promise<void> {
    const feedStream = document.getElementById("feedStream") as HTMLDivElement;
    const pinnedList = document.getElementById("pinnedArticlesList") as HTMLDivElement;
    if (!feedStream || !pinnedList) return;

    feedStream.innerHTML = "";
    pinnedList.innerHTML = "";
    
    var token = localStorage.getItem("token");
    var articles = await send<any[]>("getArticles", token || ""); 
    
    console.log(articles);

    if (!articles || articles.length === 0) {
        feedStream.appendChild(create("div", { textContent: "No articles shared yet. Be the first to publish!", className: "no-articles-card" }));
        pinnedList.appendChild(create("div", { textContent: "No pins yet.", className: "empty-pins"}));
        return;
    }

    let handleVote = async (articleId: number, requestedVote: number) => {
        const token = localStorage.getItem("token");
        if (!token) {
            suliPopup.classList.remove("invisible");
            return;
        }

        const success = await send<boolean>("toggleVote", [token, articleId, requestedVote]);
        
        if (success) {
            const scrollPos = window.scrollY;
            await loadFeedStream();
            window.scrollTo(0, scrollPos);
        } else {
            console.error("Voting failed, Please Try Again Later");
        }
    };

    let hasPins = false;

    articles.forEach(function(article) {
        const articleId = article.Id || article.id;
        const displayTitle = article.Title || article.title || "";
        const displayTags = article.Tags || article.tags || "";
        const displayContent = article.Content || article.content || "";
        const displayAuthor = article.AuthorUsername || article.authorUsername || "anonymous";
        const isPinned = !!(article.IsPinned || article.isPinned);
        const userVote = article.UserVote ?? article.userVote ?? 0;
        const score = article.Score ?? article.score ?? 0;

        if (isPinned) {
            hasPins = true;
            var pinnedItem = create("div", { className: "pinned-item" },
                create("div", { className: "pinned-item-title", textContent: displayTitle }),
                create("div", { className: "pinned-item-author", textContent: "by u/" + displayAuthor })
            );
            
            pinnedItem.onclick = function() {
                var targetCard = document.getElementById("article-" + articleId);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
                    targetCard.classList.add("expanded");
                    var toggleBtn = targetCard.querySelector(".article-card-toggle");
                    if (toggleBtn) toggleBtn.textContent = "Show Less";
                }
            };
            pinnedList.appendChild(pinnedItem);
        }

        var card = create("div", { className: "article-card", id: "article-" + articleId });
        var voteColumn = create("div", { className: "vote-column" });

        var upvoteBtn = create("button", {
            className: "vote-btn upvote " + (userVote === 1 ? "active" : ""),
            innerHTML: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/></svg>`
        });

        var scoreDisplay = create("span", {
            textContent: score.toString(),
            className: "vote-score " + (
                userVote === 1
                    ? "upvoted-text"
                    : (userVote === -1 ? "downvoted-text" : "")
            )
        });

        var downvoteBtn = create("button", {
            className: "vote-btn downvote " + (userVote === -1 ? "active" : ""),
            innerHTML: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 10h-4V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7H4a1.001 1.001 0 0 0-.781 1.625l8 10a1 1 0 0 0 1.562 0l8-10A1.001 1.001 0 0 0 20 10z"/></svg>`
        });

        upvoteBtn.onclick = () => {
            console.log("UPVOTE CLICKED");
            handleVote(articleId, userVote === 1 ? 0 : 1);
        };

        downvoteBtn.onclick = () => {
            console.log("DOWNVOTE CLICKED");
            handleVote(articleId, userVote === -1 ? 0 : -1);
        };

        voteColumn.appendChild(upvoteBtn);
        voteColumn.appendChild(scoreDisplay);
        voteColumn.appendChild(downvoteBtn);

        var cardContentWrapper = create("div", { className: "article-card-main" });
        var header = create("div", { className: "article-card-header" });
        var titleGroup = create("div", { className: "article-title-group" });
        var title = create("h2", { textContent: displayTitle, className: "article-card-title" });
        
        var tagsContainer = create("div", { className: "article-card-tags" });
        if (displayTags) {
            displayTags.split(",").forEach(function(tag: string) {
                if (tag.trim() !== "") {
                    tagsContainer.appendChild(create("span", { textContent: tag, className: "article-card-tag-chip" }));
                }
            });
        }
        titleGroup.appendChild(title);
        titleGroup.appendChild(tagsContainer);

        var pinBtn = create("button", { 
            className: "article-pin-btn " + (isPinned ? "active" : ""),
            innerHTML: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.5V9a3 3 0 0 1 6 0v1.5a4 4 0 0 0 4 4v1H5v-1a4 4 0 0 0 4-4z"/></svg>`
        });

        pinBtn.onclick = async () => {
            if (!token) return suliPopup.classList.remove("invisible");
            if (!articleId) return;

            var success = await send<boolean>("togglePin", [token, articleId]);
            if (success) {
                const scrollPos = window.scrollY;
                await loadFeedStream();
                window.scrollTo(0, scrollPos);
            }
        }; 

        header.appendChild(titleGroup);
        header.appendChild(pinBtn);

        var meta = create("div", { textContent: "Published by u/" + displayAuthor, className: "article-card-meta" });
        var content = create("div", { className: "article-card-content" });
        content.innerHTML = displayContent;

        cardContentWrapper.appendChild(header);
        cardContentWrapper.appendChild(meta);
        cardContentWrapper.appendChild(content);
        
        card.appendChild(voteColumn);
        card.appendChild(cardContentWrapper);
        
        feedStream.appendChild(card);

        if (content.scrollHeight > content.clientHeight) {
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
            cardContentWrapper.appendChild(toggleBtn);
        }
    });

    if (!hasPins) {
        pinnedList.appendChild(create("div", { textContent: "No pins yet. Click the pin icon on an article!", className: "empty-pins"}));
    }
};

publishButton.onclick = async function() {
    const titleInput = document.getElementById("titleInput") as HTMLTextAreaElement;
    if (!titleInput) return;

    var titleVal = titleInput.value.trim();
    var contentVal = richTextEditor.innerHTML.trim();
    var token = localStorage.getItem("token");

    if (!titleVal || contentVal === "" || contentVal === "<p><br></p>" || contentVal.includes("editor-placeholder")) {
        alert("Please add a title and write content before publishing.");
        return;
    }

    var tagsString = selectedTags.join(",");
    
    var success = await send<boolean>("publishArticle", [titleVal, contentVal, tagsString, token]);
    if (success) {

        if (currentDraftId) {
            await send("deleteDraft", {
            DraftId: currentDraftId,
            Token: token
        });
        }

        currentDraftId = null;

        titleInput.value = "";
        richTextEditor.innerHTML = "<p id='editor-placeholder'>Add your thoughts and ideas here...</p>";

        selectedTags = [];
        updateTagsDisplay();

        articlePopUpDiv.classList.add("invisible");

        await loadFeedStream();
    }
    else {
        alert("Failed to publish your article. Verify your session.");
    }
};
loadFeedStream();