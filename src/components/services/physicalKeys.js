const CommonKeys = require('./commonKeys');

function runOnKeys(func, ...codes) {
  const pressed = new Set();
  document.addEventListener('keydown', e => {
    pressed.add(e.code);
    codes.forEach(code => {
      if (pressed.has(code[0]) && pressed.has(code[1])) {
        pressed.clear();
        func();
      }
    });
  });
  document.addEventListener('keyup', e => {
    pressed.delete(e.code);
  });
}

class PhysicalKeys extends CommonKeys {
  highlightPressedKey(event) {
    const key = this.keysDOM.find(el => el.getAttribute('data-code') === event.code);
    if (key) {
      key.classList.add('key--pressed');
      document.body.addEventListener('keyup', ({ code }) => {
        this.keysDOM.forEach(el => {
          if (el.getAttribute('data-code') === code) {
            el.classList.remove('key--pressed');
          }
        });
      });
      document.body.addEventListener('focusout', () => {
        this.keysDOM.forEach(el => el.classList.remove('key--pressed'));
      });
    }
  }
}

module.exports = {
  PhysicalKeys,
  runOnKeys,
};
