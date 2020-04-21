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

  addListeners() {
    this.keyboard.addEventListener('click', this.handleClick.bind(this));
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
          break;
        case 'ArrowRight':
          break;
        case 'ArrowUp':
          break;
        case 'ArrowDown':
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

  printClicked(e) {
    const { value, selectionStart } = this.textarea;
    const key = this.keysDOM.find(key => key === e.target);
    if (key) {
      this.textarea.value = value.slice(0, selectionStart) + key.getAttribute('value') + value.slice(selectionStart);
      this.textarea.focus();
      this.setCursorPosition(selectionStart + 1);
    }
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

  onTab() {
    const { value, selectionStart } = this.textarea;
    const tab = '  ';
    this.textarea.value = value.slice(0, selectionStart) + tab + value.slice(selectionStart);
    this.setCursorPosition(selectionStart + tab.length);
  }

  setCursorPosition(position) {
    this.textarea.selectionStart = position;
    this.textarea.selectionEnd = position;
    this.textarea.focus();
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
}

export default Keyboard;