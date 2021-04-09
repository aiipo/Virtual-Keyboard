const specialKey = require('../helpers/specialKeys');
const CommonKeys = require('./commonKeys');

class VirtualKeys extends CommonKeys {
  constructor(textarea, obj) {
    super(obj);
    this.textarea = textarea;
  }

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
    this.textarea.value = `${pre}\n${value.slice(selectionStart)}`;
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
    const content = endPrevLine > 0 ? selectionStart - endPrevLine - 1 : selectionStart;
    const pos = startPrevLine + content < endPrevLine ? startPrevLine + content : endPrevLine;
    this.setCursorPosition(pos);
  }

  onArrowDown() {
    const { value, selectionStart } = this.textarea;
    const prevLine = value.slice(0, selectionStart).lastIndexOf('\n');
    const prevLineEnd = prevLine >= 0 ? prevLine : 0;
    const beforeCursor = prevLineEnd > 0 ? selectionStart - prevLineEnd - 1 : selectionStart;

    const afterCursorLine = value.slice(selectionStart).indexOf('\n');
    const afterCursor = afterCursorLine >= 0 ? afterCursorLine : -1;

    let pos = 0;
    const posOnNextLine = selectionStart + afterCursor + beforeCursor + 1;
    if (afterCursorLine >= 0) {
      const next = value.slice(afterCursor + selectionStart + 1).indexOf('\n');
      const nextLineEnd = next >= 0
        ? next + selectionStart + afterCursor + 1
        : value.slice(selectionStart).length + selectionStart;
      pos = posOnNextLine < nextLineEnd ? posOnNextLine : nextLineEnd;
    } else {
      pos = posOnNextLine < value.slice(selectionStart).length
        ? posOnNextLine
        : value.slice(selectionStart).length + selectionStart;
    }
    this.setCursorPosition(pos);
  }

  onAlt() {
    this.setCursorPosition(this.textarea.selectionStart);
  }

  onCtrl() {
    this.setCursorPosition(this.textarea.selectionStart);
  }

  printClicked(e) {
    const { value, selectionStart } = this.textarea;
    const key = this.keysDOM.find(el => el === e.target);
    if (key) {
      this.textarea.value = value.slice(0, selectionStart) + key.getAttribute('value') + value.slice(selectionStart);
      this.textarea.focus();
      this.setCursorPosition(selectionStart + 1);
    }
  }

  onSpecialKeyWhenShiftOn(keyCode) {
    if (this.states.isShift && keyCode !== specialKey.CapsLock
      && keyCode !== specialKey.ShiftRight && keyCode !== specialKey.ShiftLeft) {
      const isSpecial = Object.values(specialKey).find(key => keyCode === key);
      if (isSpecial) {
        this.setState({ isShift: false });
        this.onShift();
      }
    }
  }
}

module.exports = VirtualKeys;
