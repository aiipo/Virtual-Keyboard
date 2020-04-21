class Key {
  constructor({ code, key, keyShift }) {
    if (!code || !key) {
      return;
    }
    this.code = code;
    this.key = key;
    this.keyShift = keyShift;
  }

  fillKey(key, isCapsLock, isShift) {
    key.setAttribute('value', this.key);
    if (isShift && isCapsLock) {
      key.setAttribute('value', this.keyShift);
    }
  }
}

export default Key;