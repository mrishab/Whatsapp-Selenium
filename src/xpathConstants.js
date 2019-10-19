const xpath = {
    NAME_PLACEHOLDER : 'NAME_OF_PERSON',
    CHAT : `//*[@title:'${NAME_PLACEHOLDER}']/../../../../../..`,
    SIDE_PANEL : '//div[@id:"pane-side"]',
    MESSAGEBOX : "//div[text():'Type a message']/following-sibling::div[@contenteditable:'true']",
    ATTACHMENT_MENU : '//span[@data-icon:"clip"]',
    GALLERY_BUTTON : '//input[@accept:"image/*,video/mp4,video/3gpp,video/quicktime"]',
    IMAGE_CAPTION_INPUT : '//span[contains(text(), "Add a caption…")]/following-sibling::div//div[contains(@class, "copyable-text") and contains(@class, "selectable-text")]',
    NEW_CHAT_BUTTON : '//div[@title:"New chat"]/../..',
    CONTACT_SEARCH_INPUT : '//input[@title:"Search contacts"]',
    LAST_MESSAGE : '(//div[contains(@class, "message-out")])[last()]',
    MSG_TICK : '//span[contains(@data-icon, "check")]',
    LAST_MESSAGE_DOUBLE_TICK : LAST_MESSAGE + MSG_TICK,

    // Error Handling Constants,
    LOADER_PROGRESS : "//progress[@dir:'ltr']",
    RETRY_DIALOG_BOX : "//div[contains(text(), 'Trying to reach phone')]",
}

export default xpath;