
const localStoredLang = localStorage.getItem('keyboardLang');
let keyboardLang = localStoredLang || 'eng';

const stepsRowsEnd = [14, 29, 42, 55, 64];
const lastIndexOfDoubledSymbols = 12;
const languageSwitcher = [
  ['Alt', 'Shift'],
  ['AltGraph', 'Shift']
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
  ['ArrowRight', 'Right']
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
    'ArrowUp', 'Shift', 'Control', 'Meta', 'Alt', ' ', 'AltGraph', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Control'
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
    'ArrowUp', 'Shift', 'Control', 'Meta', 'Alt', ' ', 'AltGraph', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Control'
  ],
};

let keyElementsList = [];
let textInput;
let capsLockButton;
let keyboardWrapper;

const handleReplaceButtonName = (buttonName) => {
  const namesList = replacedButtonNames.flat();
  const indexOfName = namesList.findIndex((replacedName, index) => {
    if (index % 2 !== 0) {
      return false;
    };

    if (replacedName === buttonName) {
      return true;
    };
  });

  return indexOfName !== -1
    ? namesList[indexOfName + 1]
    : false;
};

const addTemplateForButtons = (buttonName) => {
  if (typeof buttonName === 'object') {
    return `<div class="key">${buttonName[0]}</div>`;
  };

  if (buttonName === ' ') {
    return `<div class="key key--big-width">${buttonName}</div>`;
  };

  if (buttonName === 'CapsLock') {
    return `<div class="key key--capslock">${buttonName}</div>`;
  };

  if (buttonName.startsWith('Arrow')) {
    return `<div class='key-wrap'>
              <span class="key key--text-hidden">${buttonName}</span>
              <span class="key__replace key__arrow key__arrow-${handleReplaceButtonName(buttonName).toLowerCase()}"></span>
            </div>`;
  };

  if (handleReplaceButtonName(buttonName)) {
    return `<div class='key-wrap'>
              <span class="key key--text-hidden">${buttonName}</span>
              <span class="key__replace">${handleReplaceButtonName(buttonName)}</span>
            </div>`;
  };

  return `<div class="key">${buttonName}</div>`;
};

const appendButtonsToRow = (buttonsRow, buttonsList) => {
  buttonsRow.innerHTML = buttonsList.map(button => addTemplateForButtons(button)).join('');
};

const sliceButtonFromList = (buttonsList, rowEnd) => {
  let startSlice = 0;
  let endSlice = stepsRowsEnd[rowEnd];

  if (rowEnd > 0) {
    startSlice = stepsRowsEnd[rowEnd - 1];
  };

  return buttonsList.slice(startSlice, endSlice);
};

const generateButtonRows = (mainWrapper) => {
  const buttonsRows = mainWrapper.querySelectorAll('.row');
  const buttonsList = symbolList[`${keyboardLang}Symbols`];

  buttonsRows.forEach((buttonsRow, index) => appendButtonsToRow(buttonsRow, sliceButtonFromList(buttonsList, index)));
};

function renderInitialState() {
  const mainWrapper = document.createElement('main');
  mainWrapper.innerHTML = `<textarea class="input" rows="10"></textarea>
    <section class="keyboard" id="keyboardWrapper">
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
    </section>`;

  generateButtonRows(mainWrapper);

  textInput = mainWrapper.querySelector('.input');
  keyElementsList = mainWrapper.querySelectorAll('.key');
  capsLockButton = mainWrapper.querySelector('.key--capslock');
  keyboardWrapper = mainWrapper.querySelector('#keyboardWrapper');

  document.body.prepend(mainWrapper);
}

window.onload = function onload() {
  renderInitialState();
};
