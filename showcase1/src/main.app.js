import { AvenxApp } from 'avenx-js/runtime';
import Test from './components/test/test.component.js';
import Footer from './components/footer/footer.component.js';

const app = new AvenxApp({ target: '#app' });

app.register('Test', Test);
app.register('Footer', Footer);

app.mount('Test');

// Since we cannot modify index.html, we create a mount point for the footer programmatically
const footerMount = document.createElement('div');
footerMount.id = 'footer-app';
document.body.appendChild(footerMount);

app.mount('Footer', '#footer-app');
