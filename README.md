# Scaffoldvuer

This project aims to provide high-level 3D physiological models viewing capability.


## Scaffoldvuer on NPM

Scaffoldvuer is available on npm and can be installed into your project with the following command:
```bash
npm i @abi-software/scaffoldvuer
```

## Project setup
```
npm install
```

### Compiles and minifies for production
```
npm run build-bundle
```

## How to use
Install the package in your vue app project with the following command "npm i @abi-software/scaffoldvuer".
Import the package in your script as followed:
```javascript
import '@abi-software/scaffoldvuer';
import '@abi-software/scaffoldvuer/dist/scaffoldvuer.css';
```

The codes above register the ScaffoldVuer component in the global scope.
You can now use the ScaffoldVuer in your vue template as followed:
```html
<ScaffoldVuer url="Metafile.json" v-on:scaffold-selected="ScaffoldSelected"  style="height:50%"/>
```

url should be a variable/string containing the url of a compatible json model.
scaffold-selected is the custom event triggered when a part of the 3D-scaffold is selected, see below for a
sample callback.

```javascript
  methods: {
    ScaffoldSelected: function(annotation) {
     console.log(annotation);
    }
  }
```
A more in depth API reference can be found here: https://abi-software.github.io/scaffoldvuer/ .

## Project setup from Github

The source code is available from Github, it can be found here: https://github.com/ABI-Software/scaffoldvuer .

### Clone the respositroy
```bash
git clone https://github.com/ABI-Software/scaffoldvuer.git
```

### Setup
```bash
npm install
```

### Compiles and minifies for production
```bash
npm run build-bundle
```

### Run the sample application
```bash
npm run serve
```


## Example
The following example showcases ScaffoldVuer in action: https://mapcore-demo.org/current/scaffoldvuer/

