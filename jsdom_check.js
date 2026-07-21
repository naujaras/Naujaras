const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('main.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only" });

dom.window.onerror = function(message, source, lineno, colno, error) {
    console.error("RUNTIME ERROR:", message, error);
};

try {
    dom.window.eval(js);
    console.log("No runtime errors caught during evaluation!");
} catch (e) {
    console.error("CAUGHT ERROR:", e);
}
