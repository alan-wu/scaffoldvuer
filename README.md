# scaffoldvuer

This project aims to wrap the OrganViwer in the PhysiomePortal project into a vue compoinent.


## Project setup
```
npm install
```

### Compiles and minifies for production
```
npm run build-bundle
```

## How to use
Install the package "npm i @abi-software/scaffoldvuer" to your vue app.
Include the package in your script.
```javascript
import '@abi-software/scaffoldvuer';
import '@abi-software/scaffoldvuer/dist/scaffoldvuer.css';
```

The codes above registers the ScaffoldVuer component into the global scope.
You can now use the ScaffoldVuer in your vue template as followed:
```html
<ScaffoldVuer url="Metafile.json" v-on:scaffold-selected="ScaffoldSelected"  style="height:50%"/>
```

url should be the variable/string containing the url of the compatible json model.
scaffold-selected is the custom event triggered when a part of the 3D-scaffold is selected, see below for a
sample callback.

```javascript
  methods: {
    ScaffoldSelected: function(annotation) {
     console.log(annotation);
    }
  }
```

The following example showcases ScaffoldVuer in action: https://github.com/ABI-Software/PortalVueComponentExample.
