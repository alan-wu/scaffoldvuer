<template>
  <div id="app">
    <ScaffoldVuer class="vuer" :displayUI="displayUI" :traditional="traditional"
      :url="url" ref="scaffold" @scaffold-selected="onSelected"
      :helpMode="helpMode" :displayMinimap="displayMinimap" 
      :displayMarkers="displayMarkers" :minimapSettings="minimapSettings"
      :showColourPicker="showColourPicker" @timeChanged="updateCurrentTime"
    />
    <el-popover
      placement="bottom"
      trigger="click"
      width=500
      class="popover"
      :appendToBody=false
      >
      <div class="options-container">
        <el-row :gutter="20">
          <p>{{ selectedCoordinates }}</p>
        </el-row>
        <el-row :gutter="20">
          <p v-if="currentTime!==0">time emited is: {{currentTime.toFixed(2)}}</p>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6" :offset="2">
            <el-switch class="app-switch" 
              active-text="Markers"
              active-icon-class="el-icon-location"
              active-color="#8300bf"
              v-model="displayMarkers">
            </el-switch>
          </el-col>
          <el-col :span="6" :offset="2">
            <el-switch class="app-switch"
              active-text="Minimap"
              active-icon-class="el-icon-discover"
              active-color="#8300bf"
              v-model="displayMinimap">
            </el-switch>
          </el-col>
          <el-col :span="6" :offset="2">
            <el-switch class="app-switch"
              active-text="Tumble"
              active-color="#8300bf"
              v-model="tumbleOn">
            </el-switch>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-button @click="helpMode = !helpMode" size="mini">Help Mode</el-button>
          <el-button @click="screenCapture()" size="mini">Capture</el-button>
        </el-row>
        <el-row :gutter="20">
          <el-button @click="saveSettings()" size="mini">Save Settings</el-button>
          <el-button @click="restoreSettings()" size="mini">Restore Settings</el-button>
        </el-row>
        <el-input type="textarea" autosize placeholder="Please input"
          v-model="input" style="padding-left:5%;width:90%;" />
      </div>
      <el-button icon="el-icon-setting" slot="reference">Options</el-button>
    </el-popover>
    <el-popover
      placement="bottom"
      trigger="click"
      width=800
      class="models-popover"
      popper-class="table-popover"
      :appendToBody=false
      >
      <ModelsTable @viewModelClicked="viewModelClicked">
      </ModelsTable>
      <el-button icon="el-icon-folder-opened" slot="reference">Models</el-button>
    </el-popover>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import ScaffoldVuer from './components/ScaffoldVuer.vue'
import ModelsTable from './components/ModelsTable.vue'
import Vue from "vue";
import {
  Button,
  Col,
  Icon,
  Input,
  Popover,
  Row,
  Switch
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Button);
Vue.use(Col);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Popover);
Vue.use(Row);
Vue.use(Switch);
const axios = require('axios').default;
/*
const alignToObject = function(cameracontrol, scene) {
  var object = scene.findGeometriesWithGroupName("Endocardium of left atrium")[0];
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
*/
export default {
  name: 'app',
  components: {
    ScaffoldVuer,
    ModelsTable
  },
  methods: {
    saveSettings: function() {
      this._sceneSettings.push(this.$refs.scaffold.exportStates());
    },
    restoreSettings: function() {
      if (this._sceneSettings.length > 0)
        this.$refs.scaffold.importStates(this._sceneSettings.pop());
    },
    viewModelClicked: function(location) {
      this.input = location;
    },
    screenCapture: function() {
      this.$refs.scaffold.captureScreenshot("capture.png");
    },
    getStates: function() {
      console.log(this.$refs.scaffold.getStates());
    },
    autoTumble: function(flag) {
      let cameracontrol = this.$refs.scaffold.$module.scene.getZincCameraControls();
      if (flag) {
        this.displayUI = false;
        cameracontrol.enableAutoTumble();
        cameracontrol.autoTumble([1.0, 0.0], Math.PI / 2, true);
      } else {
        this.displayUI = true;
        cameracontrol.stopAutoTumble();
      }
    },
    onSelected: function(data) {
      console.log(data);
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
    },
    updateCurrentTime: function(val){
      this.currentTime = val;
    }
  },
  data: function() {
    return {
      url: undefined,
      input: undefined,
      traditional: true,
      displayUI: true,
      selectedCoordinates: undefined,
      helpMode: false,
      displayMarkers: true,
      currentTime: 0,
      displayMinimap: true,
      tumbleOn: false,
      showColourPicker: true,
      minimapSettings: {
        x_offset: 16,
        y_offset: 16,
        width: 128,
        height: 128,
        align: "bottom-right"
      },
    };
  },
  beforeMount: function() {
    const queryString = require('query-string');
    const parsed = queryString.parse(location.search);
    if (parsed.url) {
      this.input= parsed.url;
    } else {
      this.input = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
    }
  },
  mounted: function() {
    this._sceneSettings = [];
    this.selectedCoordinates = this.$refs.scaffold.getDynamicSelectedCoordinates();
  },
  watch: {
    input: function() {
      this.parseInput();
    },
    tumbleOn: function(val) {
      this.autoTumble(val);
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  width: 100%;
  position:absolute;
  overflow:hidden;
}

body {
  margin: 0px;
}

.options-container{
text-align: center;
}

.vuer {
  position:absolute;
  width:100%;
  height:100%;
}

.popover{
  top:5px;
  right:10PX;
  position:absolute;
}

.app-switch .el-switch__label.is-active span{
  color: #8300bf
}

.el-row {
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
}

.models-popover {
  top:5px;
  position:absolute;
}

.table-popover {
  opacity: 0.9;
}
</style>

<style scoped src="./styles/purple/button.css">
</style>
<style scoped src="./styles/purple/icon.css">
</style>
<style scoped src="./styles/purple/input.css">
</style>
<style scoped src="./styles/purple/popover.css">
</style>
