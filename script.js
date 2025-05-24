class ChimpishTranslator {
  constructor() {
    this.isEnglishToChimpish = true;
    this.translationTimeout = null;
    this.initializeElements();
    this.bindEvents();
    this.updateUI();
  }

  initializeElements() {
    this.sourceText = document.getElementById("source-text");
    this.targetText = document.getElementById("target-text");
    this.swapBtn = document.getElementById("swap-btn");
    this.clearBtn = document.getElementById("clear-btn");
    this.copyBtn = document.getElementById("copy-btn");
    this.charCount = document.getElementById("char-count");
    this.englishBtn = document.getElementById("english-btn");
    this.chimpishBtn = document.getElementById("chimpish-btn");
    this.sourceLang = document.querySelector(".source-lang");
    this.targetLang = document.querySelector(".target-lang");
  }

  bindEvents() {
    this.sourceText.addEventListener("input", () => {
      this.updateCharCount();
      this.scheduleAutoTranslation();
    });

    this.swapBtn.addEventListener("click", () => {
      this.swapLanguages();
    });

    this.clearBtn.addEventListener("click", () => {
      this.clearText();
    });

    this.copyBtn.addEventListener("click", () => {
      this.copyTranslation();
    });

    this.englishBtn.addEventListener("click", () => {
      if (!this.isEnglishToChimpish) {
        this.swapLanguages();
      }
    });

    this.chimpishBtn.addEventListener("click", () => {
      if (this.isEnglishToChimpish) {
        this.swapLanguages();
      }
    });

    // Enable translation on Enter key
    this.sourceText.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        this.translateText();
      }
    });
  }

  updateCharCount() {
    const count = this.sourceText.value.length;
    this.charCount.textContent = count;

    if (count > 4500) {
      this.charCount.style.color = "#ea4335";
    } else if (count > 4000) {
      this.charCount.style.color = "#fbbc04";
    } else {
      this.charCount.style.color = "#9aa0a6";
    }
  }

  updateUI() {
    if (this.isEnglishToChimpish) {
      this.englishBtn.classList.add("active");
      this.chimpishBtn.classList.remove("active");
      this.sourceLang.textContent = "English";
      this.targetLang.textContent = "Chimpish";
      this.sourceText.placeholder = "Enter English text to translate...";
    } else {
      this.chimpishBtn.classList.add("active");
      this.englishBtn.classList.remove("active");
      this.sourceLang.textContent = "Chimpish";
      this.targetLang.textContent = "English";
      this.sourceText.placeholder = "Enter Chimpish symbols to translate...";
    }
    this.clearTranslation();
  }

  scheduleAutoTranslation() {
    // Clear any existing timeout
    if (this.translationTimeout) {
      clearTimeout(this.translationTimeout);
    }

    // Check if there's text to translate
    const text = this.sourceText.value.trim();
    if (text) {
      // Translate immediately (real-time)
      this.translateText();
    } else {
      // Clear translation when input is empty
      this.clearTranslation();
    }
  }

  swapLanguages() {
    this.isEnglishToChimpish = !this.isEnglishToChimpish;

    // Cancel any pending auto-translation
    if (this.translationTimeout) {
      clearTimeout(this.translationTimeout);
    }

    // Swap the text content
    const sourceValue = this.sourceText.value;
    const targetValue = this.targetText.textContent;

    this.sourceText.value =
      targetValue === "Translation will appear here" ? "" : targetValue;

    this.updateUI();
    this.updateCharCount();

    // Schedule auto-translation for the swapped content if there's text
    if (this.sourceText.value.trim()) {
      this.scheduleAutoTranslation();
    }

    // Add animation class
    this.swapBtn.style.transform = "rotate(180deg) scale(1.1)";
    setTimeout(() => {
      this.swapBtn.style.transform = "";
    }, 300);
  }

  clearText() {
    this.sourceText.value = "";
    this.updateCharCount();
    this.clearTranslation();
    this.sourceText.focus();

    // Cancel any pending auto-translation
    if (this.translationTimeout) {
      clearTimeout(this.translationTimeout);
    }
  }

  clearTranslation() {
    this.targetText.innerHTML =
      '<span class="placeholder">Translation will appear here</span>';
  }

  async translateText() {
    const text = this.sourceText.value.trim();

    if (!text) {
      this.showError("Please enter some text to translate.");
      return;
    }

    try {
      const mode = this.isEnglishToChimpish ? "encode" : "decode";
      const result = await this.callChimpishScript(text, mode);

      if (result.success) {
        this.targetText.textContent = result.translation;
      } else {
        this.showError(result.error || "Translation failed. Please try again.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      this.showError(
        "Connection error. Please make sure the server is running."
      );
    }
  }

  async callChimpishScript(text, mode) {
    try {
      const response = await fetch("/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          mode: mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback: try to simulate the translation locally
      return this.simulateTranslation(text, mode);
    }
  }

  // Fallback method that simulates the chimpish.py functionality
  simulateTranslation(text, mode) {
    const symbols = [
      "-",
      "/",
      "/-",
      ":",
      ":-",
      ":/",
      ":/-",
      ";",
      ";-",
      ";/",
      ";/-",
      ";:",
      ";:-",
      ";:/",
      ";:/-",
      "(",
      "(-",
      "(/",
      "(/-",
      "(:",
      "(:-",
      "(:/",
      "(:/-",
      "(;",
      "(;-",
      "(;/",
    ];

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    try {
      if (mode === "encode") {
        const encodeMap = {};
        for (let i = 0; i < alphabet.length; i++) {
          encodeMap[alphabet[i]] = symbols[i];
        }

        const tokens = [];
        for (const word of text.toUpperCase().split(" ")) {
          for (const char of word) {
            if (!encodeMap[char]) {
              throw new Error(`Unsupported character: ${char}`);
            }
            tokens.push(encodeMap[char]);
          }
          tokens.push(".");
        }
        if (tokens.length > 0 && tokens[tokens.length - 1] === ".") {
          tokens.pop();
        }

        return {
          success: true,
          translation: tokens.join(" "),
        };
      } else {
        const decodeMap = {};
        for (let i = 0; i < symbols.length; i++) {
          decodeMap[symbols[i]] = alphabet[i];
        }

        const decodedChars = [];
        for (const token of text.trim().split(" ")) {
          if (token === ".") {
            decodedChars.push(" ");
          } else {
            if (!decodeMap[token]) {
              throw new Error(`Unknown symbol: ${token}`);
            }
            decodedChars.push(decodeMap[token]);
          }
        }

        return {
          success: true,
          translation: decodedChars.join("").replace(/  +/g, " "),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  showError(message) {
    this.targetText.innerHTML = `<span style="color: #ea4335; font-style: italic;">${message}</span>`;
  }

  async copyTranslation() {
    const text = this.targetText.textContent;

    if (!text || text === "Translation will appear here") {
      this.showTemporaryMessage("No translation to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showTemporaryMessage("Copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.showTemporaryMessage("Copied to clipboard!");
    }
  }

  showTemporaryMessage(message) {
    const originalText = this.copyBtn.innerHTML;
    this.copyBtn.innerHTML = `<span style="font-size: 0.8rem;">${message}</span>`;
    this.copyBtn.style.background = "#34a853";

    setTimeout(() => {
      this.copyBtn.innerHTML = originalText;
      this.copyBtn.style.background = "";
    }, 2000);
  }
}

// Initialize the translator when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new ChimpishTranslator();
});

// Add some visual feedback for button interactions
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("mousedown", () => {
      button.style.transform = "scale(0.98)";
    });

    button.addEventListener("mouseup", () => {
      button.style.transform = "";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });
  });
});
