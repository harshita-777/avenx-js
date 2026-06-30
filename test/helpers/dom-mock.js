const assert = require('assert');

// 1. Die Mock-Klasse zur Verhaltensprüfung (Behavior Verification)
class MockDOMElement {
  constructor(tagName, namespaceURI = 'http://www.w3.org/1999/xhtml') {
    this.tagName = tagName.toUpperCase();
    this.nodeName = tagName.toUpperCase();
    this.nodeType = 1; // Element Node
    this.namespaceURI = namespaceURI;
    this.childNodes = [];
    this._attrs = {};
    this.attributes = [];
    this.innerHTML = '';
    this.value = '';

    // Verhaltensaufzeichnung (Interaction Logging)
    this.recordedCalls = [];
  }

  setAttribute(name, value) {
    this._attrs[name] = String(value);
    this.attributes = Object.entries(this._attrs).map(([k, v]) => ({ name: k, value: v }));
  }

  getAttribute(name) {
    return this._attrs[name] !== undefined ? this._attrs[name] : null;
  }

  hasAttribute(name) {
    return this._attrs[name] !== undefined;
  }

  removeAttribute(name) {
    delete this._attrs[name];
    this.attributes = Object.entries(this._attrs).map(([k, v]) => ({ name: k, value: v }));
  }

  appendChild(child) {
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.childNodes.indexOf(child);
    if (idx !== -1) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
      return child;
    }
  }

  replaceChild(newChild, oldChild) {
    const idx = this.childNodes.indexOf(oldChild);
    if (idx !== -1) {
      this.childNodes[idx] = newChild;
      newChild.parentNode = this;
      oldChild.parentNode = null;
      return oldChild;
    }
  }

  cloneNode(deep) {
    const copy = new MockDOMElement(this.tagName, this.namespaceURI);
    copy.value = this.value;
    copy._attrs = { ...this._attrs };
    copy.attributes = [...this.attributes];
    if (deep) {
      this.childNodes.forEach((child) => {
        if (child.nodeType === 1) {
          copy.appendChild(child.cloneNode(true));
        } else {
          copy.appendChild({ ...child, parentNode: copy });
        }
      });
    }
    return copy;
  }

  querySelectorAll(selector) {
    // Gibt eine leere Liste zurück, da dieses Element keine verschachtelten slot-Elemente hat
    return [];
  }

  addEventListener(event, callback) {
    // Protokolliert den Aufruf für spätere Assertions
    this.recordedCalls.push({ method: 'addEventListener', event, callback });
  }

  removeEventListener(event, callback) {
    // Protokolliert den Aufruf für spätere Assertions
    this.recordedCalls.push({ method: 'removeEventListener', event, callback });
  }

  // Verifikations-Methoden zur Verhaltensprüfung (Behavior Verification)
  assertListenerWasAdded(event) {
    const found = this.recordedCalls.some((call) => call.method === 'addEventListener' && call.event === event);
    assert.ok(found, `Erwartung fehlgeschlagen: addEventListener wurde nicht für "${event}" aufgerufen.`);
  }

  assertListenerWasRemoved(event) {
    const found = this.recordedCalls.some((call) => call.method === 'removeEventListener' && call.event === event);
    assert.ok(found, `Erwartung fehlgeschlagen: removeEventListener wurde nicht für "${event}" aufgerufen.`);
  }
}

// 2. Hilfsfunktionen zum Registrieren und Zurücksetzen der globalen Variablen
function setupDOMMock() {
  global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 };
  global.document = {
    querySelector: () => new MockDOMElement('div'),
    createElement: (tag) => new MockDOMElement(tag),
    createElementNS: (ns, tag) => new MockDOMElement(tag, ns),
  };

  global.DOMParser = class {
    parseFromString(htmlString) {
      const body = new MockDOMElement('body');

      // Einfacher HTML Regex Parser
      const tagRegex = /<([a-z0-9-]+)([^>]*?)>([\s\S]*?)<\/\1>/gi;
      let match;
      while ((match = tagRegex.exec(htmlString)) !== null) {
        const tagName = match[1];
        const attrsStr = match[2];
        const content = match[3];

        const element = new MockDOMElement(tagName);

        const attrRegex = /([\w@:-]+)(?:=(?:"([^"]*)"|'([^']*)'))?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
          const attrName = attrMatch[1];
          const attrValue = attrMatch[2] || attrMatch[3] || '';
          element.setAttribute(attrName, attrValue);
        }

        if (content.trim()) {
          const textNode = {
            nodeType: 3,
            nodeName: '#text',
            textContent: content,
            parentNode: element,
          };
          element.childNodes.push(textNode);
        }

        body.appendChild(element);
      }

      return { body };
    }
  };
}

function teardownDOMMock() {
  delete global.Node;
  delete global.document;
  delete global.DOMParser;
}

module.exports = {
  MockDOMElement,
  setupDOMMock,
  teardownDOMMock,
};
