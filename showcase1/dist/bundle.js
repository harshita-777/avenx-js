/**
 * AvenxComponent is the base class for all Avenx components.
 * It provides core functionality for reactivity, template rendering, and event binding.
 * It uses a Proxy-based state management system to automatically trigger re-renders on state changes.
 */
class AvenxComponent {
    /** 
     * The DOM element the component is mounted to.
     * @type {HTMLElement|null} 
     * @private
     */
    #element = null;
    
    /** 
     * The raw HTML template string with interpolation placeholders.
     * @type {string} 
     * @private
     */
    #template = '';
    
    /** 
     * A map of component-specific methods.
     * @type {Object<string, Function>} 
     * @private
     */
    #methods = {};
    
    /** 
     * A map of shared reactive states (bridges) accessible to the component.
     * @type {Object} 
     * @private
     */
    #bridges = {};

    /**
     * Creates an instance of AvenxComponent.
     * @param {Object} [initialState={}] - The initial local state of the component.
     * @param {Object} [bridges={}] - Shared reactive states (bridges) accessible to the component.
     * @param {string} [template=''] - The HTML template for the component.
     * @param {Object} [methods={}] - A map of methods available to the component's context.
     */
    constructor(initialState = {}, bridges = {}, template = '', methods = {}) {
        this.#template = template;
        this.#bridges = bridges;
        const self = this;

        /**
         * The reactive state of the component. 
         * Changes to this object trigger an automatic re-render via the Proxy's set trap.
         * @type {Proxy}
         */
        this.state = new Proxy(initialState, {
            set(target, key, value) {
                target[key] = value;
                self.update();
                return true;
            },
            get(target, key) {
                return target[key];
            }
        });

        // Turn action code strings into executable functions with state context
        this.#methods = {};
        for (let [key, code] of Object.entries(methods)) {
            const self = this;
            this.#methods[key] = function(...args) {
                const context = { ...self.state, ...self.#methods, ...self.#bridges, args };
                const fn = new Function(...Object.keys(context), `with(this) { ${code} }`);
                return fn.call(self.state, ...Object.values(context));
            }.bind(this.state);
        }
    }

    /**
     * Executes a string of JavaScript code within the combined context of the component's state,
     * methods, and accessible bridges.
     * @param {string} code - The JavaScript code to execute.
     * @param {Event|null} [event=null] - The event object, if the execution was triggered by a DOM event.
     * @private
     */
    #execute(code, event = null) {
        const context = { ...this.state, ...this.#methods, ...this.#bridges, event };
        try {
            const fn = new Function(...Object.keys(context), `with(this) { ${code} }`);
            fn.call(this.state, ...Object.values(context));
        } catch (e) { console.error("Avenx Exec Error:", e); }
    }

    /**
     * Renders the component's template by interpolating expressions (e.g., {{ expression }}).
     * @returns {string} The interpolated HTML string.
     */
    render() {
        let html = this.#template;
        return html.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expr) => {
            const context = { ...this.state, ...this.#bridges };
            try {
                return new Function(...Object.keys(context), `return ${expr}`).call(this.state, ...Object.values(context));
            } catch (e) { 
                console.warn("Avenx Render Warning:", e, "Expression:", expr);
                return ''; 
            }
        });
    }

    /**
     * Updates the component's DOM element by re-rendering the template and re-binding all events.
     */
    update() {
        if (!this.#element) return;
        this.#element.innerHTML = this.render();
        this.#bindEvents();
    }

    /**
     * Scans the component's DOM for attributes starting with '@' (e.g., @click)
     * and binds them as event listeners that execute the attribute's value as code.
     * @private
     */
    #bindEvents() {
        this.#element.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('@')) {
                    const eventName = attr.name.substring(1);
                    el.addEventListener(eventName, (e) => {
                        this.#execute(attr.value, e);
                    });
                }
            });
        });
    }

    /**
     * Mounts the component to a specific target DOM element and triggers the initial render.
     * @param {HTMLElement} target - The DOM element where the component should be mounted.
     */
    mount(target) {
        this.#element = target;
        this.update();
    }
}

/**
 * AvenxApp is the main orchestrator for an Avenx application.
 * It manages the registration of component classes, the creation and management of shared reactive states (bridges),
 * and the mounting of component instances to the DOM.
 */
class AvenxApp {
    /** 
     * A list of all currently active (mounted) component instances.
     * @type {AvenxComponent[]} 
     * @private
     */
    #activeComponents = [];
    
    /** 
     * The default target DOM element for mounting the application.
     * @type {HTMLElement|null} 
     * @private
     */
    #target = null;

    /**
     * Creates an instance of AvenxApp.
     * @param {Object} config - The application configuration.
     * @param {string} config.target - The CSS selector for the main application container.
     */
    constructor(config) {
        this.#target = document.querySelector(config.target);
        /**
         * A map of registered component names to their respective class constructors.
         * @type {Map<string, typeof AvenxComponent>}
         */
        this.components = new Map();
        /**
         * A map of shared reactive state objects (bridges).
         * @type {Object<string, Proxy>}
         */
        this.bridges = {};
    }

    /**
     * Registers a component class under a specific name, making it available for mounting.
     * @param {string} name - The unique name for the component.
     * @param {typeof AvenxComponent} compClass - The component class constructor.
     */
    register(name, compClass) { 
        this.components.set(name, compClass); 
    }
    
    /**
     * Registers a shared reactive state object or class (bridge). 
     * Changes to a bridge's state will automatically trigger a re-render for all active components.
     * @param {string} name - The unique name for the bridge.
     * @param {Object|Function} bridgeData - The initial state data or a Bridge class.
     */
    registerBridge(name, bridgeData) {
        const self = this;
        let instance = bridgeData;

        // Check if bridgeData is a class (constructor) and instantiate it
        if (typeof bridgeData === 'function') {
            try {
                instance = new bridgeData();
            } catch (e) {
                // Not a constructor or failed to instantiate, fallback to object behavior
            }
        }

        const reactiveState = new Proxy(instance, {
            set(target, key, value) {
                target[key] = value;
                self.updateAll();
                return true;
            },
            get(target, key, receiver) {
                const value = Reflect.get(target, key, receiver);
                // Bind methods to the proxy (receiver) so 'this' refers to the reactive state
                if (typeof value === 'function') {
                    return value.bind(receiver);
                }
                return value;
            }
        });
        this.bridges[name] = reactiveState;
    }

    /**
     * Triggers an update (re-render) for every active (mounted) component instance in the application.
     */
    updateAll() {
        this.#activeComponents.forEach(comp => comp.update());
    }

    /**
     * Mounts a registered component to a specific target element.
     * Creates a new instance of the component class and provides it with access to all registered bridges.
     * @param {string} name - The name of the registered component to mount.
     * @param {string|null} [targetSelector=null] - The CSS selector for the target mount point. 
     * If null, the application's default target is used.
     */
    mount(name, targetSelector = null) {
        const Comp = this.components.get(name);
        const target = targetSelector ? document.querySelector(targetSelector) : this.#target;
        if (Comp && target) {
            const compInstance = new Comp(this.bridges);
            compInstance.mount(target);
            this.#activeComponents.push(compInstance);
        }
    }
}

class Footer extends AvenxComponent {
    constructor(bridges) {
        super({}, bridges, `<footer class="avenx-65b7cc5c">
    Powered by <span class="avenx-3be8666b">Avenx-JS</span>
</footer>`, {  });
    }
}
class Test extends AvenxComponent {
    constructor(bridges) {
        super({"count":0}, bridges, `<div class="avenx-627449a6"
    <h1 class="avenx-fc0ff300">Avenx Framework</h1>
    <div class="avenx-ab1d203b">
        <span class="avenx-8903a733">Reactive Counter</span>
        <span class="avenx-dde4ffd8">{{ count }}</span>
    </div>
    <div class="avenx-478d1601">
        <button @click="count++" class="avenx-6330516b">Increment</button>
        <button @click="reset()" class="avenx-f136f77f">Reset</button>
    </div>
</div>`, { reset: `count = 0;` });
    }
}
(function(){




const app = new AvenxApp({ target: '#app' });

app.register('Test', Test);
app.register('Footer', Footer);

app.mount('Test');

// Since we cannot modify index.html, we create a mount point for the footer programmatically
const footerMount = document.createElement('div');
footerMount.id = 'footer-app';
document.body.appendChild(footerMount);

app.mount('Footer', '#footer-app');

})();