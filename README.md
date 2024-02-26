# Scaffoldvuer

This project aims to provide high-level 3D physiological models viewing capability.

Scaffoldvuer is now built with Vue3 frameworks. Vue 2 version of Scaffoldvuer is no longer maintained and the source
can be found in this [branch](https://github.com/ABI-Software/scaffoldvuer/tree/Vue-2).


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
import { ScaffoldVuer } from '@abi-software/scaffoldvuer';
import '@abi-software/scaffoldvuer/dist/style.css';
```
Local registration in vue component:
```javascript
export default {
  ...
  components: {
    ScaffoldVuer,
  }
  ...
}
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

## Scaffoldvuer release process:

### Versioning

Scaffoldvuer uses [semantic versioning](https://semver.org/).

If any changes are experimental or parallel to the main development, [npm dist tags](https://docs.npmjs.com/cli/v9/commands/npm-dist-tag) are used to keep this version from being the default when `npm install @abi-software/scaffoldvuer` is used.

Dist tags can be used like so:
```
npm publish --tag <tag>
```

`<tag>` is the dist tag to add. In example: `npm publish --tag beta`

### Publishing 

#### 1. Update the package number in [package.json](https://github.com/ABI-Software/scaffoldvuer/blob/main/package.json)
#### 2. Bundles for scaffoldvuer can be built by using 
```
npm run build-bundle
```

This builds the package to be digested by other vue packages by importing either the build or the source.

##### Build import 
```
import { ScaffoldVuer } from "@abi-software/scaffoldvuer";
import '@abi-software/scaffoldvuer/dist/map-side-bar.css';
```

##### Source import (used in  [abi-software/mapintegratedvuer](https://github.com/abi-Software/mapintegratedvuer))
```
import { ScaffoldVuer } from "@abi-software/scaffoldvuer/src/components/index.js";
```

#### 3. Publish with `npm publish` in the package directory

### Testing

#### Testing [`zincjs`](https://github.com/alan-wu/ZincJS)
Check that the version of zincjs used is running correctly and passing the tests.

Test runs can be found here:
https://autotest.bioeng.auckland.ac.nz/jenkins/blue/organizations/jenkins/ZincJS/activity

Click on the latest test and search for `zincjs@` to find the zincjs version number.

#### Visual check
Open the links below, checking that they load in, render correctly and are usable:

Region
http://localhost:8081/#/?url=https://mapcore-bucket1.s3.us-west-2.amazonaws.com/format-testing/MyExport_metadata.json

Glyph small
http://localhost:8081/#/?url=https://mapcore-bucket1.s3.us-west-2.amazonaws.com/format-testing/TimeGlyphs/timeGlyphs_1.json

Lines
http://localhost:8081/#/?url=https://mapcore-bucket1.s3.us-west-2.amazonaws.com/format-testing/Lines/lines_metadata.json

Glyph large
http://localhost:8081/#/?url=https://mapcore-bucket1.s3.us-west-2.amazonaws.com/format-testing/TimeGlyphs/timeGlyphs_large_metadata.json

Points
http://localhost:8081/#/?url=https://mapcore-bucket1.s3.us-west-2.amazonaws.com/format-testing/Points/point_time_metadata.json

Surfaces
http://localhost:8081/#/?url=https://mapcore-bucket1.s3.us-west-2.amazonaws.com/format-testing/Surfaces/beating_heart_metadata.json

#### Testing the build bundle in other packages
Use one of the following methods for testing the scaffoldvuer build in apps that depend on this package:
 1. Use [`npm link`](https://docs.npmjs.com/cli/v8/commands/npm-link) to test scaffoldvuer works in apps that import it.
 2. Use symlink, or copy and paste the `/dist` directory.
 3. Modify the package.json to <your-npm-account>/scaffoldvuer and publish. (Careful! If this is not done the version will need to be [deprecated](https://docs.npmjs.com/cli/v8/commands/npm-deprecate)

One of the above methods will often need to be used in [abi-software/mapintegratedvuer](https://github.com/abi-Software/mapintegratedvuer)
