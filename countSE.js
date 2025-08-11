javascript: void function () {
  (function () {
    var floor = Math.floor;

    function updateLastIncrementDisplay() {
      let timestamp = getLastIncrement();
      if (!timestamp) {
        x.textContent = "00:00:00";
        return;
      }
      let date = new Date(timestamp);
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      x.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function updateStopwatch() {
      let lastIncrement = getLastIncrement();
      if (!lastIncrement) lastIncrement = Date.now();
      let elapsed = Date.now() - lastIncrement;
      let minutes = floor(elapsed / 60000);
      let seconds = floor((elapsed % 60000) / 1000);
      y.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function updateOffStopwatch() {
      const offTime = getOffTime();
      const lastIncrement = getLastIncrement();
      const now = Date.now();
      const delay = 300000; // 5 minutes
      let extra = 0;
      if (now > lastIncrement + delay) {
        extra = now - (lastIncrement + delay);
      }
      const total = offTime + extra;
      let minutes = floor(total / 60000);
      let seconds = floor((total % 60000) / 1000);
      z.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function startStopwatch() {
      E = getLastIncrement();
      clearInterval(D);
      D = setInterval(() => {
        updateStopwatch();
      }, 1000);
    }

    function startOffStopwatch() {
      if (window.offInterval) clearInterval(window.offInterval);
      window.offInterval = setInterval(updateOffStopwatch, 1000);
    }

    // Storage keys
    const STORAGE_KEY = "simpleCounter";
    const LAST_INCREMENT_KEY = "simpleCounterLastIncrement";
    const OFF_KEY = "simpleCounterOff";
    const VISIBILITY_KEY = "visibilityState";

    // LocalStorage functions
    const getCount = () => parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
    const setCount = v => localStorage.setItem(STORAGE_KEY, v);
    const setLastIncrement = v => localStorage.setItem(LAST_INCREMENT_KEY, v);
    const getLastIncrement = () => parseInt(localStorage.getItem(LAST_INCREMENT_KEY)) || 0;
    const getOffTime = () => parseInt(localStorage.getItem(OFF_KEY)) || 0;
    const setOffTime = v => localStorage.setItem(OFF_KEY, v);
    const getVisibility = () => localStorage.getItem(VISIBILITY_KEY) === "true";
    const setVisibility = v => localStorage.setItem(VISIBILITY_KEY, v.toString());

    // Remove old container
    const old = document.getElementById("counter-container");
    if (old) old.remove();

    // Create main container
    const container = document.createElement("div");
    container.id = "counter-container";
    container.style.cssText = "position: fixed; bottom: 8rem; right: 9rem; font-size: .9rem; z-index: 58; text-align: center; border: none; background: none; opacity: 0.2;";

    // Create button
    const btn = document.createElement("button");
    btn.textContent = "+";
    btn.style.cssText = "padding: .6rem 1rem; border: none; background: none; font-size: 2rem; margin-right: 1rem;";
    btn.onclick = () => {
      const last = getLastIncrement();
      const now = Date.now();
      const delay = 300000; // 5 min

      if (now > last + delay) {
        const off = getOffTime();
        setOffTime(off + (now - (last + delay)));
      }

      let count = getCount() + 1;
      setCount(count);
      input.value = count;
      setLastIncrement(now);
      updateLastIncrementDisplay();
      startStopwatch();
      startOffStopwatch();

      const inputField = document.querySelector("input[type='text']");
      if (inputField) {
        if (inputField.hasAttribute("aria-label")) inputField.focus();
        else inputField.blur();
      }
    };

    // Create input
    const input = document.createElement("input");
    input.type = "text";
    input.value = getCount();
    input.style.cssText = "width: 4rem; text-align: center; background: none; border: none; font-size: 1.5rem;";
    input.oninput = () => {
      const clean = input.value.replace(/\D/g, "");
      input.value = clean;
      setCount(parseInt(clean) || 0);
    };

    // Create time displays
    const x = document.createElement("div");
    x.id = "last-increment";
    x.textContent = "00:00:00";

    const y = document.createElement("div");
    y.id = "stopwatch";
    y.textContent = "00:00";

    const z = document.createElement("div");
    z.id = "off-stopwatch";
    z.textContent = "00:00";
    z.style.cssText = "color: red;";

    const hiddenContainer = document.createElement("div");
    const timeContainer = document.createElement("div");

    const toggleDiv = document.createElement("div");
    toggleDiv.style.cssText = "width: 100%; height: 7rem;";
    toggleDiv.onclick = () => {
      const visible = getVisibility();
      const newState = !visible;
      hiddenContainer.style.visibility = newState ? "visible" : "hidden";
      setVisibility(newState);
    };

    container.append(toggleDiv, hiddenContainer);
    hiddenContainer.append(btn, input, timeContainer);
    timeContainer.append(x, y);
    document.body.appendChild(container);

    // Initialize timers
    let D, E;

    if (!localStorage.getItem(LAST_INCREMENT_KEY)) {
      setLastIncrement(Date.now());
    }
    if (!localStorage.getItem(VISIBILITY_KEY)) {
      setVisibility(true);
    }

    updateLastIncrementDisplay();
    startStopwatch();
    startOffStopwatch();
    input.value = getCount();

    // Sync on storage change
    window.addEventListener("storage", () => {
      updateLastIncrementDisplay();
      updateStopwatch();
      updateOffStopwatch();
      input.value = getCount();
      const visible = getVisibility();
      hiddenContainer.style.visibility = visible ? "visible" : "hidden";
    });

    // Right-click context menu
    let contextMenu;
    timeContainer.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (contextMenu) contextMenu.remove();

      contextMenu = document.createElement("div");
      contextMenu.style.cssText = "position: absolute; padding: .3rem .6rem; background-color: white; border: .11rem solid black; z-index: 59; border-radius: .25rem; font-size: 1rem; color: black;";
      contextMenu.style.top = `${e.pageY}px`;
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.textContent = "reset time";

      contextMenu.addEventListener("click", () => {
        setOffTime(0);
        setLastIncrement(Date.now());
        updateStopwatch();
        updateOffStopwatch();
        contextMenu.remove();
      });

      document.body.appendChild(contextMenu);
      document.addEventListener("click", () => {
        if (contextMenu) contextMenu.remove();
      }, { once: true });
    });
  })();
}();
