/* eslint-env browser */
class VirtualKeyboard {
  constructor() {
    this.specials = [
      'Backspace',
      'Tab',
      'Enter',
      'CapsLock',
      'ShiftLeft',
      'ShiftRight',
      'AltLeft',
      'AltRight',
      'ControlLeft',
      'ControlRight',
      'MetaLeft',
      'Delete',
    ];
    this.element = null;
    this.textarea = null;
    this.state = {
      isShiftLeftPressed: undefined,
      isShiftRightPressed: undefined,
      isCapsLockPressed: undefined,
      case: 'caseDown',
      lang: 'eng',
    };
    this.current = {
      element: null,
      code: null,
      event: null,
      char: null,
    };
    this.previous = {
      element: null,
      code: null,
      event: null,
      char: null,
    };
  }

  initDomTree(rows) {
    document.body.classList.add('body');
    const div = document.createElement('div');
    div.classList.add('centralizer');

    const p = document.createElement('p');
    p.innerText = 'Virtual Keyboard 2.0';
    p.classList.add('title');
    div.appendChild(p);

    const textArea = document.createElement('textarea');
    textArea.classList.add('body__textarea', 'textarea');
    textArea.setAttribute('id', 'textarea');
    textArea.setAttribute('rows', '5');
    textArea.setAttribute('cols', '50');
    this.textarea = textArea;
    div.appendChild(this.textarea);

    this.element = document.createElement('div');
    this.element.classList.add('body__keyboard', 'keyboard');
    this.element.setAttribute('id', 'keyboard');

    const keyboardFragment = document.createDocumentFragment();

    for (let i = 0; i < rows.length; i += 1) {
      const lineDiv = document.createElement('div');
      lineDiv.classList.add('keyboard__row', 'row');

      for (let j = 0; j < rows[i].length; j += 1) {
        const keyDiv = document.createElement('div');
        keyDiv.classList.add('keyboard__key', 'key', rows[i][j].className);

        const spanRus = document.createElement('span');
        spanRus.classList.add('rus', 'hidden');
        spanRus.insertAdjacentHTML('afterBegin', `<span class="caseDown hidden">${rows[i][j].rus.caseDown}</span>`);
        spanRus.insertAdjacentHTML('beforeEnd', `<span class="caseUp hidden">${rows[i][j].rus.caseUp}</span>`);
        spanRus.insertAdjacentHTML('beforeEnd', `<span class="caps hidden">${rows[i][j].rus.caps || rows[i][j].rus.caseUp}</span>`);
        spanRus.insertAdjacentHTML('beforeEnd', `<span class="shiftCaps hidden">${rows[i][j].rus.shiftCaps || rows[i][j].rus.caseDown}</span>`);
        keyDiv.appendChild(spanRus);

        const spanEng = document.createElement('span');
        spanEng.classList.add('eng');
        spanEng.insertAdjacentHTML('afterBegin', `<span class="caseDown">${rows[i][j].eng.caseDown}</span>`);
        spanEng.insertAdjacentHTML('beforeEnd', `<span class="caseUp hidden">${rows[i][j].eng.caseUp}</span>`);
        spanEng.insertAdjacentHTML('beforeEnd', `<span class="caps hidden">${rows[i][j].eng.caps || rows[i][j].eng.caseUp}</span>`);
        spanEng.insertAdjacentHTML('beforeEnd', `<span class="shiftCaps hidden">${rows[i][j].eng.shiftCaps || rows[i][j].eng.caseDown}</span>`);
        keyDiv.appendChild(spanEng);
        lineDiv.appendChild(keyDiv);
      }
      keyboardFragment.appendChild(lineDiv);
    }

    this.element.appendChild(keyboardFragment);
    div.appendChild(this.element);
    const pCreatedOS = document.createElement('p');
    pCreatedOS.innerText = 'Created in Windows';
    pCreatedOS.classList.add('description');
    div.appendChild(pCreatedOS);
    const pLanguageSwitch = document.createElement('p');
    pLanguageSwitch.innerText = 'Use key shortcut for language switch: left shift + alt';
    pLanguageSwitch.classList.add('language');
    div.appendChild(pLanguageSwitch);

    document.body.appendChild(div);
  }

  addActiveState() {
    this.current.element.classList.add('active');
  }

  removeActiveState() {
    if (this.current.element) {
      if (this.previous.element && this.previous.element.classList.contains('active')) {
        if (!['CapsLock', 'ShiftLeft', 'ShiftRight'].includes(this.previous.code)) {
          this.previous.element.classList.remove('active');
        }
      }

      this.current.element.classList.remove('active');
    }
  }

  toggleCase() {
    const items = this.element.querySelectorAll(`div>.${this.state.lang}`);
    for (let i = 0; i < items.length; i += 1) {
      if (!items[i].querySelectorAll('span')[0].classList.contains('hidden')) items[i].querySelectorAll('span')[0].classList.add('hidden');
      if (!items[i].querySelectorAll('span')[1].classList.contains('hidden')) items[i].querySelectorAll('span')[1].classList.add('hidden');
      if (!items[i].querySelectorAll('span')[2].classList.contains('hidden')) items[i].querySelectorAll('span')[2].classList.add('hidden');
      if (!items[i].querySelectorAll('span')[3].classList.contains('hidden')) items[i].querySelectorAll('span')[3].classList.add('hidden');

      if ((this.state.isShiftLeftPressed || this.state.isShiftRightPressed)
        && this.state.isCapsLockPressed) {
        items[i].querySelectorAll('span')[3].classList.remove('hidden');
        this.state.case = 'shiftCaps';
      } else if (this.state.isCapsLockPressed) {
        items[i].querySelectorAll('span')[2].classList.remove('hidden');
        this.state.case = 'caps';
      } else if (this.state.isShiftLeftPressed || this.state.isShiftRightPressed) {
        items[i].querySelectorAll('span')[1].classList.remove('hidden');
        this.state.case = 'caseUp';
      } else {
        items[i].querySelectorAll('span')[0].classList.remove('hidden');
        this.state.case = 'caseDown';
      }
    }
  }

  toggleLang() {
    const toggle = () => {
      const items = this.element.querySelectorAll(`div>.${this.state.lang}`);
      for (let i = 0; i < items.length; i += 1) {
        items[i].classList.toggle('hidden');
        items[i].querySelectorAll(`span.${this.state.case}`)[0].classList.toggle('hidden');
      }
    };
    toggle();
    if (this.state.lang === 'eng') {
      this.state.lang = 'rus';
    } else {
      this.state.lang = 'eng';
    }
    localStorage.setItem('lang', this.state.lang);
    toggle();
  }

  keyFunctionTextAreaFeedback() {
    let textareaValue = this.textarea.value;
    const s = this.textarea.selectionStart;

    const insertValue = () => {
      if (s >= 0 && s <= textareaValue.length) {
        this.textarea.value = textareaValue.slice(0, s) + this.current.char
          + textareaValue.slice(s, textareaValue.length);
        this.textarea.selectionStart = s + this.current.char.length;
        this.textarea.selectionEnd = s + this.current.char.length;
      } else {
        this.textarea.value += this.current.char;
      }
    };

    if (this.specials.includes(this.current.code)) {
      switch (this.current.code) {
        case 'Backspace':
          if (s > 0 && s <= textareaValue.length) {
            textareaValue = textareaValue.slice(0, s - 1)
                + textareaValue.slice(s, textareaValue.length);
            this.textarea.value = textareaValue;
            this.textarea.selectionStart = s - 1;
            this.textarea.selectionEnd = s - 1;
          }
          break;
        case 'Delete':
          if (s >= 0 && s <= textareaValue.length - 1) {
            textareaValue = textareaValue.slice(0, s)
                + textareaValue.slice(s + 1, textareaValue.length);
            this.textarea.value = textareaValue;
            this.textarea.selectionStart = s;
            this.textarea.selectionEnd = s;
          }
          break;
        case 'Tab':
          this.current.char = '    ';
          insertValue();
          break;
        case 'Enter':
          this.current.char = '\n';
          insertValue();
          break;
        case 'CapsLock':
          if (this.state.isCapsLockPressed && !this.current.event.repeat) {
            this.removeActiveState();
            this.state.isCapsLockPressed = false;
          } else {
            this.addActiveState();
            this.state.isCapsLockPressed = true;
          }
          this.toggleCase();
          break;
        case 'ShiftLeft':
          if (!this.state.isShiftLeftPressed && !this.state.isShiftRightPressed) {
            this.addActiveState();
            this.state.isShiftLeftPressed = true;
            this.toggleCase();
          }
          break;
        case 'ShiftRight':
          if (!this.state.isShiftLeftPressed && !this.state.isShiftRightPressed) {
            this.addActiveState();
            this.state.isShiftRightPressed = true;
            this.toggleCase();
          }
          break;
        default:
          break;
      }
    } else {
      insertValue();
    }
    //   TODO Здесь происходит смена языка
    if (this.current.event.shiftKey && this.current.event.altKey) {
      this.toggleLang();
    }
  }

  keyDownHandler(event) {
    if (event.key !== 'F12') {
      event.preventDefault();
    }
    this.current.event = event;
    this.current.code = event.code;
    [this.current.element] = this.element.getElementsByClassName(event.code);
    if (this.current.element) {
      this.current.char = this.current.element.querySelectorAll(':not(.hidden)')[1].textContent;
      this.keyFunctionTextAreaFeedback();
      if (this.current.code === 'MetaLeft') {
        this.addActiveState();
        setTimeout(this.removeActiveState.bind(this), 300);
      } else if (!['CapsLock', 'ShiftLeft', 'ShiftRight'].includes(this.current.code)) {
        this.addActiveState();
      }
    }
  }

  keyUpHandler(event) {
    const key = this.element.getElementsByClassName(event.code)[0];
    if (key) {
      this.current.element = key.closest('div');
      if (event.code !== 'CapsLock') {
        this.removeActiveState();
      }
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        if (event.code === 'ShiftLeft') {
          this.state.isShiftLeftPressed = false;
        }
        if (event.code === 'ShiftRight') {
          this.state.isShiftRightPressed = false;
        }
        this.removeActiveState();
        this.toggleCase();
      }
    }
  }

  mouseDownHandler(e) {
    if (e.target.tagName === 'SPAN') {
      this.current.event = e;
      this.current.element = e.target.closest('div');
      // eslint-disable-next-line prefer-destructuring
      this.current.code = this.current.element.classList[2];
      this.current.char = e.target.textContent;
      this.keyFunctionTextAreaFeedback();
      if (this.current.code !== 'CapsLock') {
        this.addActiveState();
        this.previous = {
          ...this.current,
        };
      }
      e.preventDefault();
    }
  }

  mouseUpHandler(e) {
    this.current.event = e;
    this.current.element = e.target.closest('div');
    if (this.current.element) {
      if (this.current.element.classList.contains('key')) {
        // eslint-disable-next-line prefer-destructuring
        this.current.code = this.current.element.classList[2];
      } else {
        this.current = {
          ...this.previous,
        };
      }
      if (this.current.code !== 'CapsLock') {
        this.removeActiveState();
        if (this.state.isShiftLeftPressed && this.current.code === 'ShiftLeft') {
          this.state.isShiftLeftPressed = false;
          this.toggleCase();
        }
        if (this.state.isShiftRightPressed && this.current.code === 'ShiftRight') {
          this.state.isShiftRightPressed = false;
          this.toggleCase();
        }
      }
    }
  }

  restoreLanguage() {
    if (localStorage.lang === 'rus') {
      this.toggleLang();
    }
  }

  initKeyboard(rows) {
    this.initDomTree(rows);
    this.restoreLanguage();
    document.addEventListener('keyup', this.keyUpHandler.bind(this));
    document.addEventListener('keydown', this.keyDownHandler.bind(this));
    document.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    this.element.addEventListener('mousedown', this.mouseDownHandler.bind(this));
  }
}

const keyboard = new VirtualKeyboard();
// eslint-disable-next-line no-undef
keyboard.initKeyboard(keyLines);
