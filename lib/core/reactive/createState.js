import { ProxyHandlerFactory } from './proxyHandler.js';

/**
 * Factory for creating reactive state objects.
 */
export class StateFactory {
  /**
   * @param {typeof ProxyHandlerFactory} [handlerFactoryClass=ProxyHandlerFactory] - The factory class to create proxy handlers.
   */
  constructor(handlerFactoryClass = ProxyHandlerFactory) {
    /** @type {typeof ProxyHandlerFactory} */
    this.handlerFactoryClass = handlerFactoryClass;
  }

  /**
   * Creates a reactive proxy for the given initial state.
   * @param {Object} [initialState={}] - The initial state object.
   * @param {Object} [options={}] - Configuration options for the proxy handler.
   * @returns {Proxy} The reactive state proxy.
   */
  create(initialState = {}, options = {}) {
    const handlerFactory = new this.handlerFactoryClass(options);
    return new Proxy(initialState, handlerFactory.create());
  }
}
