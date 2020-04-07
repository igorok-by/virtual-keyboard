/* eslint-disable no-param-reassign */

const localStoredLang = localStorage.getItem('keyboardLang');
let keyboardLang = localStoredLang || 'eng';

const languageSwitcher = [
  ['Alt', 'Shift'],
  ['AltGraph', 'Shift'],
];
const replacedButtonNames = [
  ['Delete', 'Del'],
  ['CapsLock', 'CapsLk'],
  ['Control', 'Ctrl'],
  ['Meta', 'Win'],
  ['ArrowUp', 'Up'],
  ['Backspace', 'Back'],
  ['AltGraph', 'Alt'],
  ['ArrowDown', 'Down'],
  ['ArrowLeft', 'Left'],
  ['ArrowRight', 'Right'],
];
const duplicatedButtonNames = ['Alt', 'Control', 'Shift'];
const symbolList = {
  rusSymbols: [
    ['ё', 'Ё'],
    ['1', '!'],
    ['2', '"'],
    ['3', '№'],
    ['4', ';'],
    ['5', '%'],
    ['6', ':'],
    ['7', '?'],
    ['8', '*'],
    ['9', '('],
    ['0', ')'],
    ['-', '_'],
    ['=', '+'],
    'Backspace', 'Tab',
    'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', '\\',
    'Delete', 'CapsLock',
    'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э',
    'Enter', 'Shift',
    'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.',
    'ArrowUp', 'Shift', 'Control', 'Meta', 'Alt', ' ', 'AltGraph', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Control',
  ],
  engSymbols: [
    ['`', '~'],
    ['1', '!'],
    ['2', '@'],
    ['3', '#'],
    ['4', '$'],
    ['5', '%'],
    ['6', '^'],
    ['7', '&'],
    ['8', '*'],
    ['9', '('],
    ['0', ')'],
    ['-', '_'],
    ['=', '+'],
    'Backspace', 'Tab',
    'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
    'Delete', 'CapsLock',
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'",
    'Enter', 'Shift',
    'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
    'ArrowUp', 'Shift', 'Control', 'Meta', 'Alt', ' ', 'AltGraph', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Control',
  ],
};
const stepsRowsEnd = [14, 29, 42, 55, 64];
const lastIndexOfDoubledSymbols = 12;

let isCapsEnabled = false;
let buttonNamesList = [];
let pressedButtonsList = [];
let inputText;
let capsLockButton;
let keyboardWrapper;
let delay;

const handleReplaceButtonName = (buttonName) => {
  const namesList = replacedButtonNames.flat();
  const indexOfName = namesList.findIndex((replacedName, index) => {
    if (index % 2 !== 0) {
      return false;
    }

    if (replacedName === buttonName) {
      return true;
    }

    return false;
  });

  return indexOfName !== -1
    ? namesList[indexOfName + 1]
    : false;
};

const addTemplateForButtons = (buttonName) => {
  if (typeof buttonName === 'object') {
    return `<div class="button">${buttonName[0]}</div>`;
  }
  if (buttonName === ' ') {
    return `<div class="button button--big-width">${buttonName}</div>`;
  }
  if (buttonName === 'CapsLock') {
    return `<div class="button button--capslock">${buttonName}</div>`;
  }
  if (buttonName.startsWith('Arrow')) {
    return `<div class='button-wrap'>
              <span class="button button--text-hidden">${buttonName}</span>
              <span class="button__replace button__arrow button__arrow-${handleReplaceButtonName(buttonName).toLowerCase()}"></span>
            </div>`;
  }
  if (handleReplaceButtonName(buttonName)) {
    return `<div class='button-wrap'>
              <span class="button button--text-hidden">${buttonName}</span>
              <span class="button__replace">${handleReplaceButtonName(buttonName)}</span>
            </div>`;
  }
  return `<div class="button">${buttonName}</div>`;
};

const appendButtonsToRow = (buttonsRow, symbolsList) => {
  buttonsRow.innerHTML = symbolsList.map((symbol) => addTemplateForButtons(symbol)).join('');
};

const sliceButtonFromList = (symbolsList, rowEnd) => {
  let startSlice = 0;
  const endSlice = stepsRowsEnd[rowEnd];

  if (rowEnd > 0) {
    startSlice = stepsRowsEnd[rowEnd - 1];
  }

  return symbolsList.slice(startSlice, endSlice);
};

const generateButtonRows = (mainWrapper) => {
  const buttonsRows = mainWrapper.querySelectorAll('.row');
  const symbolsList = symbolList[`${keyboardLang}Symbols`];

  buttonsRows.forEach(
    (buttonsRow, index) => appendButtonsToRow(buttonsRow, sliceButtonFromList(symbolsList, index)),
  );
};

const isLanguageToggled = (pressedList) => {
  const pressedButtonNames = pressedList.map((buttonName) => buttonName.innerText);

  return languageSwitcher[0].every((buttonName) => pressedButtonNames.indexOf(buttonName) !== -1)
    || languageSwitcher[1].every((buttonName) => pressedButtonNames.indexOf(buttonName) !== -1);
};

const specialKeysHandlers = {
  isValueSingle(textInButton) {
    return textInButton.length === 1;
  },

  handleTypedSymbols(typedSymbols) {
    const cursorPos = inputText.selectionStart;
    const textBeforeCursor = inputText.value.slice(0, cursorPos);
    const textAfterCursor = inputText.value.slice(inputText.selectionEnd);

    inputText.value = textBeforeCursor + typedSymbols + textAfterCursor;
    inputText.selectionStart = cursorPos + 1;
    inputText.selectionEnd = cursorPos + 1;
  },

  deleteSelectedSymbols() {
    inputText.value = inputText.value.slice(0, inputText.selectionStart)
      + inputText.value.slice(inputText.selectionEnd);
  },

  handlePressBackspace() {
    if (inputText.value.length > 0) {
      const cursorPos = inputText.selectionStart;

      if (inputText.selectionStart !== inputText.selectionEnd) {
        this.deleteSelectedSymbols();
        inputText.selectionStart = cursorPos;
        inputText.selectionEnd = cursorPos;
        return;
      }
      if (inputText.selectionEnd > 0) {
        inputText.value = inputText.value.slice(0, cursorPos - 1)
          + inputText.value.slice(cursorPos);
        inputText.selectionStart = cursorPos - 1;
        inputText.selectionEnd = cursorPos - 1;
      }
    }
  },

  handlePressTab() {
    inputText.value += '\t';
  },

  handlePressDel() {
    const cursorPos = inputText.selectionStart;

    if (inputText.selectionStart !== inputText.selectionEnd) {
      this.deleteSelectedSymbols();
      return;
    }
    if (inputText.selectionEnd <= inputText.value.length) {
      inputText.value = inputText.value.slice(0, cursorPos)
        + inputText.value.slice(cursorPos + 1);

      inputText.selectionStart = cursorPos;
      inputText.selectionEnd = cursorPos;
    }
  },

  handlePressEnter() {
    inputText.value += '\n';
  },

  handlePressArrowLeft() {
    const cursorPos = inputText.selectionEnd;
    if (cursorPos > 0) {
      inputText.setSelectionRange(cursorPos - 1, cursorPos - 1);
    }
  },

  handlePressArrowRight() {
    const cursorPos = inputText.selectionStart;
    if (cursorPos < inputText.value.length) {
      inputText.setSelectionRange(cursorPos + 1, cursorPos + 1);
    }
  },

  handlePressCapsLock(event) {
    if (!event.detail.repeated) {
      isCapsEnabled = !isCapsEnabled;
      capsLockButton.classList.toggle('button--capslock-active');

      buttonNamesList.forEach((buttonName, index) => {
        if (this.isValueSingle(buttonName.innerText)) {
          buttonName.innerText = isCapsEnabled
            ? buttonName.innerText.toUpperCase()
            : buttonName.innerText.toLowerCase();
        }
        if (index <= lastIndexOfDoubledSymbols) {
          buttonName.innerText = isCapsEnabled
            ? symbolList[`${keyboardLang}Symbols`][index][1]
            : symbolList[`${keyboardLang}Symbols`][index][0];
        }
      });
    }
  },

  handleShiftPressStart(event) {
    if (event.type === 'mousedown' && !event.detail.repeated) {
      buttonNamesList.forEach((buttonName) => {
        if (this.isValueSingle(buttonName.innerText)) {
          buttonName.innerText = buttonName.innerText.toUpperCase();
        }
      });
    }
  },

  handleShiftPressEnd() {
    if (!isCapsEnabled) {
      buttonNamesList.forEach((buttonName) => {
        if (this.isValueSingle(buttonName.innerText)) {
          buttonName.innerText = buttonName.innerText.toLowerCase();
        }
      });
    }
  },

  handleToggleLanguage() {
    clearTimeout(delay);
    specialKeysHandlers.handleShiftPressEnd();
    keyboardLang = keyboardLang === 'eng' ? 'rus' : 'eng';

    buttonNamesList.forEach((button, index) => {
      const buttonName = symbolList[`${keyboardLang}Symbols`][index];
      if (index <= lastIndexOfDoubledSymbols) {
        button.innerText = isCapsEnabled ? buttonName[1] : buttonName[0];
        return;
      }
      if (this.isValueSingle(button.innerText)) {
        button.innerText = isCapsEnabled ? buttonName.toUpperCase() : buttonName.toLowerCase();
      }
    });

    localStorage.setItem('keyboardLang', keyboardLang);
  },
};

const addHandlers = () => {
  keyboardWrapper.addEventListener('mousedown', (event) => {
    const pressedButtonName = event.target;

    if (pressedButtonName.classList.contains('button')) {
      const typedSymbols = event.target.innerText === '' ? ' ' : event.target.innerText;

      if (!event.detail.repeated) {
        pressedButtonsList.push(pressedButtonName);
        pressedButtonName.classList.add('active');
      }
      if (specialKeysHandlers.isValueSingle(typedSymbols)) {
        specialKeysHandlers.handleTypedSymbols(typedSymbols);
      }
      if (pressedButtonsList.length > 1
        && isLanguageToggled(pressedButtonsList)
        && !event.detail.repeated) {
        specialKeysHandlers.handleToggleLanguage();
      }
      switch (typedSymbols) {
        case 'Backspace':
          specialKeysHandlers.handlePressBackspace();
          break;
        case 'Delete':
          specialKeysHandlers.handlePressDel();
          break;
        case 'Tab':
          specialKeysHandlers.handlePressTab();
          break;
        case 'CapsLock':
          specialKeysHandlers.handlePressCapsLock(event);
          break;
        case 'Enter':
          specialKeysHandlers.handlePressEnter();
          break;
        case 'ArrowLeft':
          specialKeysHandlers.handlePressArrowLeft();
          break;
        case 'ArrowRight':
          specialKeysHandlers.handlePressArrowRight();
          break;
        case 'ArrowUp':
          specialKeysHandlers.handleTypedSymbols('↑');
          break;
        case 'ArrowDown':
          specialKeysHandlers.handleTypedSymbols('↓');
          break;
        case 'Shift':
          if (delay) clearTimeout(delay);
          delay = setTimeout(() => specialKeysHandlers.handleShiftPressStart(event), 100);
          break;
        default:
          inputText.focus();
          break;
      }
    }
  });

  const resetKeyboard = () => {
    buttonNamesList.forEach((buttonName) => buttonName.classList.remove('active'));
    pressedButtonsList = [];
  };

  const upTargetButton = (button) => {
    const buttonIndex = pressedButtonsList.indexOf(button);
    if (buttonIndex === -1) {
      return;
    }
    pressedButtonsList[buttonIndex].classList.remove('active');
    pressedButtonsList.splice(buttonIndex, 1);
  };

  const handleOnMouseUp = (event) => {
    if (event.target.innerText === 'Shift') {
      clearTimeout(delay);
      specialKeysHandlers.handleShiftPressEnd();
    }
    if (pressedButtonsList.length <= 1) {
      resetKeyboard();
      inputText.focus();
      return;
    }
    upTargetButton(event.target);
    inputText.focus();
  };

  // eslint-disable-next-line arrow-body-style
  const findButtonAtLanguageSymbols = (languageSymbols, pressedButton) => {
    return languageSymbols.findIndex((letter, index) => {
      if (index <= lastIndexOfDoubledSymbols) {
        return false;
      }
      return letter.toLowerCase() === pressedButton;
    });
  };

  const handleIsPressedButtonDuplicated = (pressedButton, pressedButtonCode) => {
    if (duplicatedButtonNames.indexOf(pressedButton) === -1) {
      return false;
    }
    if (pressedButtonCode.endsWith('Left')) {
      findButtonAtLanguageSymbols(symbolList.engSymbols, pressedButton);
    }
    if (pressedButtonCode.endsWith('Right')) {
      let orderInPair = 0;
      const indexOfSymbol = symbolList.engSymbols.findIndex((symbol, index) => {
        if (index <= lastIndexOfDoubledSymbols) {
          return false;
        }
        if (symbol === pressedButton) {
          orderInPair += 1;
        }
        return orderInPair === 2;
      });
      return indexOfSymbol !== -1 ? indexOfSymbol : false;
    }
    return false;
  };

  const getIndexInLanguage = (languageArr, pressedButton) => {
    languageArr = languageArr.flat();
    const indexOfLanguageArr = languageArr.findIndex((symbol) => symbol === pressedButton);
    if (indexOfLanguageArr !== -1) {
      const indexInNestedArr = Math.floor(indexOfLanguageArr / 2);
      return indexInNestedArr;
    }
    return false;
  };

  const handleIndexOfButtonInLanguage = (pressedButton) => {
    const doubledRusSymbols = symbolList.rusSymbols.slice(0, lastIndexOfDoubledSymbols + 1);
    const doubledEngSymbols = symbolList.engSymbols.slice(0, lastIndexOfDoubledSymbols + 1);
    const indexOfRus = getIndexInLanguage(doubledRusSymbols, pressedButton);
    const indexOfEng = getIndexInLanguage(doubledEngSymbols, pressedButton);

    if (indexOfRus !== false) {
      return indexOfRus;
    }
    if (indexOfEng !== false) {
      return indexOfEng;
    }
    return false;
  };

  const getSingleElement = (pressedButton) => {
    const indexOfRus = findButtonAtLanguageSymbols(symbolList.rusSymbols, pressedButton);
    const indexOfEng = findButtonAtLanguageSymbols(symbolList.engSymbols, pressedButton);

    if (indexOfRus !== -1) {
      return indexOfRus;
    }
    if (indexOfEng !== -1) {
      return indexOfEng;
    }
    return false;
  };

  const getIndexOfTargetButton = (pressedButton, pressedButtonCode) => {
    if (handleIsPressedButtonDuplicated(pressedButton, pressedButtonCode) !== false) {
      return handleIsPressedButtonDuplicated(pressedButton, pressedButtonCode);
    }
    if (handleIndexOfButtonInLanguage(pressedButton) !== false) {
      return handleIndexOfButtonInLanguage(pressedButton);
    }
    if (getSingleElement(pressedButton.toLowerCase()) !== false) {
      return getSingleElement(pressedButton.toLowerCase());
    }
    return false;
  };

  window.addEventListener('mouseup', handleOnMouseUp);

  window.addEventListener('keydown', (event) => {
    event.preventDefault();
    const indexOfTargetButton = getIndexOfTargetButton(event.key, event.code);
    const pressedElement = buttonNamesList[indexOfTargetButton];

    if (indexOfTargetButton >= 0) {
      const customMousedown = new CustomEvent('mousedown', {
        detail: {
          repeated: event.repeat,
        },
        bubbles: true,
        cancelable: false,
      });
      pressedElement.dispatchEvent(customMousedown);
    }
  });

  const handleOnKeyUp = (event) => {
    event.preventDefault();
    const indexOfTargetButton = getIndexOfTargetButton(event.key, event.code);
    const pressedElement = buttonNamesList[indexOfTargetButton];

    if (indexOfTargetButton) {
      const customMouseup = new CustomEvent('mouseup', {
        bubbles: true,
        cancelable: false,
      });
      pressedElement.dispatchEvent(customMouseup);
    }
  };

  window.addEventListener('keyup', handleOnKeyUp);

  window.onblur = resetKeyboard();
};

const mountKeyboard = () => {
  const mainWrapper = document.createElement('main');
  mainWrapper.innerHTML = `<textarea class="input" rows="10"></textarea>
    <section class="keyboard" id="keyboardWrapper">
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
      <p class="about-switch">To switch language press <span>Shift + left Alt</span></p>
      <p class="about-system">Created for Windows OS</p>
    </section>`;

  generateButtonRows(mainWrapper);

  inputText = mainWrapper.querySelector('.input');
  buttonNamesList = mainWrapper.querySelectorAll('.button');
  capsLockButton = mainWrapper.querySelector('.button--capslock');
  keyboardWrapper = mainWrapper.querySelector('#keyboardWrapper');

  document.body.prepend(mainWrapper);
  addHandlers();
};

window.onload = () => {
  mountKeyboard();
};
