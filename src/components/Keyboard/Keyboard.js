import './_keyboard.scss';
import keyboardLayout from './keyboardLayout';
import Key from './Key';

class Keyboard {
  constructor(textarea, lang) {
    this.keyboard = document.createElement('div');
    this.keyboard.classList.add('keyboard');

    this.textarea = textarea || document.createElement('textarea');
    this.textarea.classList.add('keyboard__textarea');
    this.keyboard.append(this.textarea);
    this.isCaps = false;
    this.isShift = false;
    // get language
    this.lang = keyboardLayout[lang] ? lang :
                keyboardLayout[localStorage.getItem('lang')] ? localStorage.getItem('lang')
                : 'en';
    this.keysDOM = [];
    // render and fill keys, get them
    keyboardLayout()[this.lang].forEach(row => {
      const rowDOM = document.createElement('div');
      row.forEach(el => {
        const key = new Key(el);
        const keyDOM = this.renderKey(key.code);
        this.keysDOM.push(keyDOM);
        key.fillKey(keyDOM);
        rowDOM.append(keyDOM);
      });
      this.keyboard.append(rowDOM);
    });
    
    document.body.append(this.keyboard);
    this.textarea.focus();
    this.addListeners();
  }

  renderKey(code) {
    const el = document.createElement('input');
    el.setAttribute('disabled', '');
    el.setAttribute('data-code', code);
    el.classList.add('keyboard__key');
    switch(code) {
      case 'Enter':
        el.classList.add('keyboard__key--enter');
        break;
      case 'CapsLock':
      case 'Backspace':
      case 'ShiftLeft':
        el.classList.add('keyboard__key--medium-wide');
        break;
      case 'Tab':
      case 'Delete':
      case 'ControlLeft':
      case 'ControlRight':
        el.classList.add('keyboard__key--wide');
        break;
      case 'Space':
        el.classList.add('keyboard__key--ultra-wide');
        break;
    }
    return el;
  }

  /***********************************
   * When key is pressed on virtual keyboard or physical.
   * Result shows on virtual.
  ************************************/

  toLowerCaseKeys() {
    this.keysDOM.forEach(key => {
      const value = key.getAttribute('value');
      if (value.length === 1) {
        key.setAttribute('value', value.charAt(0).toLowerCase());
      }
    });
  }

  toUpperCaseKeys() {
    this.keysDOM.forEach(key => {
      const value = key.getAttribute('value');
      if (value.length === 1) {
        key.setAttribute('value', value.charAt(0).toUpperCase());
      }
    });
  }

  toShiftOnKeys() {
    this.keysDOM.forEach(key => {
      const value = key.getAttribute('data-shift');
      if (value) {
        key.setAttribute('value', value);
      }
    });
  }

  toShiftOffKeys() {
    this.keysDOM.forEach(key => {
      const value = key.getAttribute('data-unshift');
      if (value) {
        key.setAttribute('value', value);
      }
    });
  }

  highlightShift(state, event) {
    const caps = event && this.keysDOM.find(key =>
      key.getAttribute('data-code') === event.target.getAttribute('data-code')
    );
    if (caps && state) {
      caps.classList.add('key--pressed-shift');
    } else {
      this.keysDOM.forEach(key => {
        if (key.getAttribute('data-code') === 'ShiftRight'
            || key.getAttribute('data-code') === 'ShiftLeft') {
          key.classList.remove('key--pressed-shift');
        }
      })
    }
  }

  highlightCapsLock() {
    const caps = this.keysDOM.find(key => key.getAttribute('data-code') === 'CapsLock');
    if (this.isCaps) {
      caps.classList.add('key--pressed-caps');
    } else {
      caps.classList.remove('key--pressed-caps');
    }
  }

  onCaps() {
    this.highlightCapsLock();
    if (this.isCaps && !this.isShift || !this.isCaps) {
      this.toUpperCaseKeys();
    } else {
      this.toLowerCaseKeys();
    }
  }

  onShift(event) {
    if (this.isShift) {
      this.toShiftOnKeys();
      this.highlightShift(true, event);
      if (this.isCaps) {
        this.toLowerCaseKeys();
      }
    } else {
      this.toShiftOffKeys();
      this.highlightShift(false, event);
      if(this.isCaps) {
        this.toUpperCaseKeys();
      }
    }
  }

  /******************************
    When key is pressed on virtual keyboard
   ******************************/

  setCursorPosition(position) {
    this.textarea.selectionStart = position;
    this.textarea.selectionEnd = position;
    this.textarea.focus();
  }

  onDelete() {
    const { value, selectionStart } = this.textarea;
    this.textarea.value = value.slice(0, selectionStart) + value.slice(selectionStart + 1);
    this.setCursorPosition(selectionStart);
  }

  onBackspace() {
    const { value, selectionStart } = this.textarea;
    const pos = selectionStart > 0 ? selectionStart - 1 : 0;
    this.textarea.value = value.slice(0, pos) + value.slice(selectionStart);
    this.setCursorPosition(pos);
  }

  onEnter() {
    const { value, selectionStart } = this.textarea;
    const pre = value.slice(0, selectionStart);
    this.textarea.value = pre + '\n' + value.slice(selectionStart);
    this.setCursorPosition(pre.length + 1);
  }

  onTab() {
    const { value, selectionStart } = this.textarea;
    const tab = '  ';
    this.textarea.value = value.slice(0, selectionStart) + tab + value.slice(selectionStart);
    this.setCursorPosition(selectionStart + tab.length);
  }

  onArrowLeft() {
    this.setCursorPosition(this.textarea.selectionStart ? this.textarea.selectionStart - 1 : 0);
  }

  onArrowRight() {
    this.setCursorPosition(this.textarea.selectionEnd + 1);
  }

  onArrowUp() {
    const { value, selectionStart } = this.textarea;
    const prevLine = value.slice(0, selectionStart).lastIndexOf('\n');
    const endPrevLine = prevLine >= 0 ? prevLine : 0;
    const prevPrevLine = value.slice(0, endPrevLine > 0 ? endPrevLine : 0).lastIndexOf('\n');
    const startPrevLine = prevPrevLine > 0 ? prevPrevLine + 1 : 0;
    const content = endPrevLine > 0 ? selectionStart - endPrevLine - 1 : selectionStart; // length of content on the line before cursor
    const pos = startPrevLine + content < endPrevLine ? startPrevLine + content : endPrevLine;
    this.setCursorPosition(pos);
  }

  onArrowDown() {
    const { value, selectionStart } = this.textarea;
    const prevLine = value.slice(0, selectionStart).lastIndexOf('\n');
    const prevLineEnd = prevLine >= 0 ? prevLine : 0;
    const beforeCursor = prevLineEnd > 0 ? selectionStart - prevLineEnd - 1 : selectionStart; // length of the line before cursor

    const afterCursorLine = value.slice(selectionStart).indexOf('\n');
    const afterCursor = afterCursorLine >= 0 ? afterCursorLine : -1; // length of the line after cursor

    let pos = 0;
    const posOnNextLine = selectionStart + afterCursor + beforeCursor + 1;
    if (afterCursorLine >= 0) {
      const next = value.slice(afterCursor + selectionStart + 1).indexOf('\n');
      const nextLineEnd = next >= 0 // end of next line(if it doesn't exist - of current)
        ? next + selectionStart + afterCursor + 1
        : value.slice(selectionStart).length + selectionStart;
      pos = posOnNextLine < nextLineEnd ? posOnNextLine : nextLineEnd;
    } else {
      pos = posOnNextLine < value.slice(selectionStart).length ? posOnNextLine : value.slice(selectionStart).length + selectionStart;
    }
    this.setCursorPosition(pos);
  }

  changeLanguage() {
    const languages = Object.keys(keyboardLayout());
    const currentIndex = languages.indexOf(this.lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    this.lang = languages[nextIndex];
    let index = 0;
    keyboardLayout()[this.lang].forEach(row => {
      row.forEach(el => {
        const key = new Key(el);
        key.fillKey(this.keysDOM[index]);
        index++;
      });
    });
  }

  printClicked(e) {
    const { value, selectionStart } = this.textarea;
    const key = this.keysDOM.find(key => key === e.target);
    if (key) {
      this.textarea.value = value.slice(0, selectionStart) + key.getAttribute('value') + value.slice(selectionStart);
      this.textarea.focus();
      this.setCursorPosition(selectionStart + 1);
    }
  }

  handleClick(e) {
    if (!e.target.classList.contains('keyboard__key')) return;
    if (e.type === 'click') {
      const keyCode = e.target.attributes['data-code'].value;
      switch (keyCode) {
        case 'Delete':
          this.onDelete();
          break;
        case 'Backspace':
          this.onBackspace();
          break;
        case 'Enter':
          this.onEnter();
          break;
        case 'CapsLock':
          this.isCaps = !this.isCaps;
          this.onCaps();
          break;
        case 'MetaLeft':
          this.changeLanguage();
          break;
        case 'Tab':
          this.onTab();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isShift = !this.isShift;
          this.onShift(e);
          break;
        case 'ArrowLeft':
          this.onArrowLeft();
          break;
        case 'ArrowRight':
          this.onArrowRight();
          break;
        case 'ArrowUp':
          this.onArrowUp();
          break;
        case 'ArrowDown':
          this.onArrowDown();
          break;
        case 'AltLeft':
        case 'AltRight':
          break;
        case 'ControlLeft':
        case 'ControlRight':
          break;
        default:
          this.printClicked(e);
          if (this.isShift) {
            this.isShift = false;
            this.onShift();
          }
      }
    }
  }

  /*******************************
    When key is pressed on device
   ********************************/

  runOnKeys(func, ...codes) {
    const pressed = new Set();
    document.addEventListener('keydown', e => {
      pressed.add(e.code);
      for (const code of codes) {
        if (!pressed.has(code[0]) || !pressed.has(code[1])) {
          continue;
        }
        pressed.clear();
        func();
      }
    });
    document.addEventListener('keyup', e => {
      pressed.delete(e.code);
    });
  }

  highlightPressedKey({ code }) {
    const key = this.keysDOM.find(key => key.getAttribute('data-code') === code);
    if (key) {
      key.classList.add('key--pressed');
      document.body.addEventListener('keyup', () => {
        key.classList.remove('key--pressed');
      });
    }
  }

  handleKeydown(e) {
    this.highlightPressedKey(e);
    switch (e.code) {
      case 'CapsLock':
        this.isCaps = e.getModifierState('CapsLock');
        this.onCaps();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isShift = true;
        this.onShift();
        break;
      default:
        break;
    }
    document.addEventListener('keyup', ({ code }) => {
      if (code === 'ShiftLeft' || code  === 'ShiftRight') {
        this.isShift = false;
        this.onShift();
      }
    });
  }

  addListeners() {
    this.keyboard.addEventListener('click', this.handleClick.bind(this));
    document.body.addEventListener('keydown', this.handleKeydown.bind(this));
    this.runOnKeys(
      this.changeLanguage.bind(this),
      ['ShiftLeft', 'ControlLeft'],
      ['ControlRight', 'ShiftRight']
    );
  }
}

export default Keyboard;