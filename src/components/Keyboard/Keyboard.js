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
    // get language
    this.lang = keyboardLayout[lang] ? lang :
                keyboardLayout[localStorage.getItem('lang')] ? localStorage.getItem('lang')
                : 'en';
    this.keysDOM = [];
    // render and fill keys, get them
    this.keys = keyboardLayout()[this.lang].map(row => {
      const rowDOM = document.createElement('div');
      row.map(el => {
        const key = new Key(el);
        const keyDOM = this.renderKey(key.code);
        this.keysDOM.push(keyDOM);
        key.fillKey(keyDOM);
        rowDOM.append(keyDOM);
        return key;
      });
      this.keyboard.append(rowDOM);
      return row;
    }).flat();
    
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
    this.keys = keyboardLayout()[this.lang].map(row => {
      row.map(el => {
        const key = new Key(el);
        key.fillKey(this.keysDOM[index]);
        index++;
        return key;
      });
      return row;
    }).flat();
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
          break;
        case 'MetaLeft':
          this.changeLanguage();
          break;
        case 'Tab':
          this.onTab();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
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
      key.classList.add('key-pressed');
      document.body.addEventListener('keyup', () => {
        key.classList.remove('key-pressed');
      });
    }
  }

  addListeners() {
    this.keyboard.addEventListener('click', this.handleClick.bind(this));
    document.body.addEventListener('keydown', this.highlightPressedKey.bind(this));
    this.runOnKeys(
      this.changeLanguage.bind(this),
      ['ShiftLeft', 'ControlLeft'],
      ['ControlRight', 'ShiftRight']
    );
  }
}

export default Keyboard;