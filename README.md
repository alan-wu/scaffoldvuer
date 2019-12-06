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

The following example showcases ScaffoldVuer in action: https://github.com/ABI-Software/PortalVueComponentExample.
