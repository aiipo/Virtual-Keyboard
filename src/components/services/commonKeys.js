const specialKey = require('../helpers/specialKeys');

class CommonKeys {
  constructor({ keysDOM, states, callbacks }) {
    this.keysDOM = keysDOM;
    this.states = states;
    this.setState = callbacks.setState instanceof Function
      ? state => callbacks.setState(state)
      : () => {};
    this.getState = callbacks.getState instanceof Function
      ? state => callbacks.getState(state)
      : () => {};
  }

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

  highlightShift(event) {
    const targetShiftOff = event && this.keysDOM.find(key =>
      key.getAttribute('data-code') === event.target.getAttribute('data-code')
        && !key.classList.contains('key--pressed-shift')
    );
    this.keysDOM.forEach(key => key.classList.remove('key--pressed-shift'));
    if (targetShiftOff) {
      targetShiftOff.classList.add('key--pressed-shift');
    }
  }

  highlightCapsLock() {
    const caps = this.keysDOM.find(key => key.getAttribute('data-code') === specialKey.CapsLock);
    if (this.states.isCaps) {
      caps.classList.add('key--pressed-caps');
    } else {
      caps.classList.remove('key--pressed-caps');
    }
  }

  onCaps() {
    this.highlightCapsLock();
    if ((this.states.isCaps && !this.states.isShift) || (!this.states.isCaps && this.states.isShift)) {
      this.toUpperCaseKeys();
    } else {
      this.toLowerCaseKeys();
    }
  }

  onShift(event) {
    if (event) {
      const shift = this.keysDOM.find(key => key.classList.contains('key--pressed-shift') && key === event.target)
        ? !this.states.isShift
        : true;
      this.setState({ isShift: shift });
      this.highlightShift(event);
      if (this.states.isShift) {
        this.toShiftOnKeys();
      } else {
        this.toShiftOffKeys();
      }
      if (this.states.isCaps) {
        this.toLowerCaseKeys();
      }
    } else if (this.states.isShift) {
      this.toShiftOnKeys();
      this.highlightShift(event);
      if (this.states.isCaps) {
        this.toLowerCaseKeys();
      }
    } else {
      this.toShiftOffKeys();
      this.highlightShift(event);
      if (this.states.isCaps) {
        this.toUpperCaseKeys();
      }
    }
  }
}

module.exports = CommonKeys;
