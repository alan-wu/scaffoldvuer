<template>
  <div id="app">
    <div v-if="displayUI">
      <p>{{ selectedCoordinates }}</p>
      <button v-on:click="autoTumble()">Auto Tumble</button>
      <button v-on:click="onClick('rat')">Rat</button>
      <button v-on:click="onClick('mouse')">Mouse</button>
      <input v-model="input" style="width:80%;padding-left: 15px;">
    </div>
    <ScaffoldVuer :displayUI="displayUI" :traditional="traditional"
      :url="url" ref="scaffold" @scaffold-selected="onSelected" 
      showColourPicker/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import ScaffoldVuer from './components/ScaffoldVuer.vue'
const axios = require('axios').default;

const alignToObject = function(cameracontrol, scene) {
  var object = scene.findGeometriesWithGroupName("Endocardium of left atrium")[0];
  console.log(object)
  const boundingBox = object.getBoundingBox();
  if (boundingBox) {
    const radius = boundingBox.min.distanceTo(boundingBox.max)/2.0;
    const centreX = (boundingBox.min.x + boundingBox.max.x) / 2.0;
    const centreY = (boundingBox.min.y + boundingBox.max.y) / 2.0;
    const centreZ = (boundingBox.min.z + boundingBox.max.z) / 2.0;
    const clip_factor = 8.0;
    const endingViewport = cameracontrol.getViewportFromCentreAndRadius(centreX, centreY, centreZ, radius, 40, radius * clip_factor );
    const startingViewport = cameracontrol.getCurrentViewport();
    cameracontrol.cameraTransition(startingViewport, endingViewport, 1500);
    cameracontrol.enableCameraTransition();
  }
  setTimeout(function(){ tumble(cameracontrol) }, 2000);

}

const tumble = function(cameracontrol) {
  cameracontrol.enableAutoTumble();
  cameracontrol.autoTumble([1.0, 0.0], Math.PI / 2, true);
}

export default {
  name: 'app',
  components: {
    ScaffoldVuer
  },
  methods: {
    autoTumble: function() {
      let cameracontrol = this.$refs.scaffold.$module.scene.getZincCameraControls();
      this.displayUI = false;
      let scene = this.$refs.scaffold.$module.scene;
      tumble(cameracontrol);
      setTimeout(function(){ alignToObject(cameracontrol, scene) }, 8000);
    },
    onSelected: function(data) {
      console.log(data);
    },
    onClick: function(species) {
      if (species == "rat") {
        this.input = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
      } else if (species == "mouse") {
        this.input = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/27_Feb_2020/mouse_heart/mouse_heart_1.json";
      }
    },
    parseInput: function() {
      if (this.input.includes("discover/scaffold/N:package:")) {
        let requestURL = "/services/bts/" + this.input;
        this.url = requestURL;
      } else if (this.input.includes("N:package:")) {
        let requestURL = "/services/bts/getInfo";
        axios.get(requestURL, {
          params: {
            id: this.input
          }
        })
        .then(response => {
          this.url = "/services/bts/scaffold/" + response.data.collectionId + "/" + response.data.fileName;
        })
        .catch(error => {
          console.log(error);
        })
        .then(() => {
          // always executed
        });
      } else {
        this.url = this.input;
      }
    }
  },
  data: function() {
    return {
      url: undefined,
      input: undefined,
      traditional: false,
      displayUI: true,
      selectedCoordinates: undefined
    };
  },
  beforeMount: function() {
    const queryString = require('query-string');
    const parsed = queryString.parse(location.search);
    console.log(parsed)
    if (parsed.url) {
      this.input= parsed.url;
    } else {
      this.input = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
    }
  },
  mounted: function() {
    this.selectedCoordinates = this.$refs.scaffold.getDynamicSelectedCoordinates();
  },
  watch: {
    input: function() {
      this.parseInput();
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  width: 100%;
  position:absolute;
}

body {
  margin: 0px;
}
</style>
