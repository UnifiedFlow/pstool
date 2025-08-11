function clearButtons() {
  document.querySelectorAll("button").forEach((button) => {
    button.removeAttribute("disabled");
    button.color = 'red';
  });
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (
            node.matches?.("mat-sidenav-container") ||
            node.querySelector?.("mat-sidenav-container")
          ) {
            clearButtons();
          }
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

clearButtons();
