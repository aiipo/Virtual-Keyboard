const keyboardLayout = require('./helpers/keyboardLayout');
const Key = require('./helpers/key');
const specialKey = require('./helpers/specialKeys');
const VirtualKeys = require('./services/virtualKeys');
const { PhysicalKeys, runOnKeys } = require('./services/physicalKeys');
require('./keyboard.scss');

function renderKey(code) {
  const el = document.createElement('input');
  el.setAttribute('disabled', '');
  el.setAttribute('data-code', code);
  el.classList.add('keyboard__key');
  switch (code) {
    case specialKey.Enter:
      el.classList.add('keyboard__key--enter');
      break;
    case specialKey.CapsLock:
    case specialKey.Backspace:
    case specialKey.ShiftLeft:
      el.classList.add('keyboard__key--medium-wide');
      break;
    case specialKey.Tab:
    case specialKey.Del:
    case specialKey.ControlLeft:
    case specialKey.ControlRight:
      el.classList.add('keyboard__key--wide');
      break;
    case specialKey.Space:
      el.classList.add('keyboard__key--ultra-wide');
      break;
    default:
      break;
  }
  return el;
}

class Keyboard {
  constructor(textarea, lang) {
    this.state = {
      isCaps: false,
      isShift: false,
    };
    this.textarea = textarea || document.createElement('textarea');

    if (keyboardLayout()[lang]) {
      this.lang = lang;
    } else if (keyboardLayout()[localStorage.getItem('lang')]) {
      this.lang = localStorage.getItem('lang');
    } else {
      this.lang = 'en';
    }

    this.keysDOM = [];
    this.createKeyboard(this.textarea);
    this.virualKeys = new VirtualKeys(this.textarea, {
      keysDOM: this.keysDOM,
      states: this.state,
      callbacks: {
        setState: state => this.setState(state),
        getState: state => this.getState(state),
      },
    });
    this.physicalKeys = new PhysicalKeys({
      keysDOM: this.keysDOM,
      states: this.state,
      callbacks: {
        setState: state => this.setState(state),
        getState: state => this.getState(state),
      },
    });
    this.addListeners();
  }

  setState(state) {
    Object.keys(state).forEach(key => {
      this.state[key] = state[key];
    });
  }

  getState(state) {
    return this.state[state];
  }

  createKeyboard() {
    this.keyboard = document.createElement('div');
    this.keyboard.classList.add('keyboard');

    this.textarea.classList.add('keyboard__textarea');
    this.keyboard.append(this.textarea);
    const rows = document.createElement('div');
    rows.classList.add('keyboard__rows');
    keyboardLayout()[this.lang].forEach(row => {
      const rowDOM = document.createElement('div');
      rowDOM.classList.add('keyboard__rows__row');
      row.forEach(el => {
        const key = new Key(el);
        const keyDOM = renderKey(key.code);
        this.keysDOM.push(keyDOM);
        key.fillKey(keyDOM);
        rowDOM.append(keyDOM);
      });
      rows.append(rowDOM);
    });
    this.keyboard.append(rows);

    document.body.append(this.keyboard);
    this.textarea.focus();
  }

  changeLanguage() {
    const languages = Object.keys(keyboardLayout());
    const currentIndex = languages.indexOf(this.lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    this.lang = languages[nextIndex];
    localStorage.setItem('lang', this.lang);
    let index = 0;
    keyboardLayout()[this.lang].forEach(row => {
      row.forEach(el => {
        const key = new Key(el);
        key.fillKey(this.keysDOM[index]);
        index += 1;
      });
    });
  }

  handleClick(e) {
    if (!e.target.classList.contains('keyboard__key')) return;
    if (e.type === 'click') {
      const keyCode = e.target.attributes['data-code'].value;
      this.virualKeys.onSpecialKeyWhenShiftOn(keyCode);
      switch (keyCode) {
        case specialKey.Del:
          this.virualKeys.onDelete();
          break;
        case specialKey.Backspace:
          this.virualKeys.onBackspace();
          break;
        case specialKey.Enter:
          this.virualKeys.onEnter();
          break;
        case specialKey.CapsLock:
          this.setState({ isCaps: !this.state.isCaps });
          this.virualKeys.onCaps();
          break;
        case specialKey.MetaLeft:
          this.changeLanguage();
          break;
        case specialKey.Tab:
          this.virualKeys.onTab();
          break;
        case specialKey.ShiftLeft:
        case specialKey.ShiftRight:
          this.virualKeys.onShift(e);
          break;
        case specialKey.ArrowLeft:
          this.virualKeys.onArrowLeft();
          break;
        case specialKey.ArrowRight:
          this.virualKeys.onArrowRight();
          break;
        case specialKey.ArrowUp:
          this.virualKeys.onArrowUp();
          break;
        case specialKey.ArrowDown:
          this.virualKeys.onArrowDown();
          break;
        case specialKey.AltLeft:
        case specialKey.AltRight:
          this.virualKeys.onAlt();
          break;
        case specialKey.ControlLeft:
        case specialKey.ControlRight:
          this.virualKeys.onCtrl();
          break;
        default:
          this.virualKeys.printClicked(e);
          if (this.state.isShift) {
            this.setState({ isShift: false });
            this.virualKeys.onShift();
          }
      }
    }
  }

  handleKeydown(e) {
    this.physicalKeys.highlightPressedKey(e);
    switch (e.code) {
      case specialKey.CapsLock:
        this.setState({ isCaps: e.getModifierState('CapsLock') });
        this.physicalKeys.onCaps();
        break;
      case specialKey.ShiftLeft:
      case specialKey.ShiftRight:
        this.setState({ isShift: true });
        this.physicalKeys.onShift();
        break;
      default:
        break;
    }
    document.addEventListener('keyup', ({ code }) => {
      if (code === specialKey.ShiftLeft || code === specialKey.ShiftRight) {
        this.setState({ isShift: false });
        this.physicalKeys.onShift();
      }
    });
  }

  addListeners() {
    this.keyboard.addEventListener('click', this.handleClick.bind(this));
    document.body.addEventListener('keydown', this.handleKeydown.bind(this));
    runOnKeys(
      this.changeLanguage.bind(this),
      [specialKey.ShiftLeft, specialKey.ControlLeft],
      [specialKey.ShiftRight, specialKey.ControlRight],
    );
  }
}

module.exports = Keyboard;
