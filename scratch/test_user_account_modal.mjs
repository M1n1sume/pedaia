import { openUserAccountModal } from '../public/js/views/userAccountModal.js';
import { store } from '../public/js/state.js';

console.log('Testing User Account Modal...');

// Mock DOM
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c)
    };
  }
  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }
  remove() {}
  querySelector() { return new MockElement(); }
}

globalThis.document = {
  getElementById: (id) => null,
  body: {
    insertAdjacentHTML: (position, html) => {
      console.log('Inserted HTML length:', html.length);
      if (!html.includes('id="user-account-modal"')) throw new Error('Missing #user-account-modal');
      if (!html.includes('id="modal-menu-profile"')) throw new Error('Missing profile menu item');
      if (!html.includes('id="modal-menu-saved-designs"')) throw new Error('Missing saved designs item');
      if (!html.includes('id="modal-menu-generated-outputs"')) throw new Error('Missing AI outputs item');
      if (!html.includes('id="modal-menu-logout"')) throw new Error('Missing logout item');
      console.log('✓ Modal HTML contains all required controls without cutoffs');
    }
  },
  removeEventListener: () => {},
  addEventListener: () => {}
};

openUserAccountModal();
console.log('✓ openUserAccountModal executed successfully!');
