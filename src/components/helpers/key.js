class Key {
  constructor({ code, key, keyShift }) {
    if (!code || !key) {
      return;
    }
    this.code = code;
    this.key = key;
    this.keyShift = keyShift;
  }

  fillKey(key) {
    key.setAttribute('value', this.key);
    if (this.keyShift) {
      key.setAttribute('data-shift', this.keyShift);
      key.setAttribute('data-unshift', this.key);
    }
  }
}

module.exports = Key;
