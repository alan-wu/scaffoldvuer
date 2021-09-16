<template>
  <div id="app">
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap"
    >
    <ScaffoldVuer
      ref="scaffold"
      class="vuer"
      :display-u-i="displayUI"
      :url="url"
      :help-mode="helpMode"
      :display-minimap="displayMinimap"
      :display-markers="displayMarkers"
      :minimap-settings="minimapSettings"
      :show-colour-picker="showColourPicker"
      :render="render"
      :region="region"
      :view-u-r-l="viewURL"
      @scaffold-selected="onSelected"
      @timeChanged="updateCurrentTime"
    />
    <el-popover
      placement="bottom"
      trigger="click"
      width="500"
      class="popover"
      :append-to-body="false"
    >
      <div class="options-container">
        <el-row :gutter="20">
          <p>{{ selectedCoordinates }}</p>
        </el-row>
        <el-row
          class="app-row"
          :gutter="20"
        >
          <p v-if="currentTime!==0">
            time emited is: {{ currentTime.toFixed(2) }}
          </p>
        </el-row>
        <el-row :gutter="20">
          <el-col
            :span="6"
            :offset="2"
          >
            <el-switch
              v-model="displayMarkers"
              active-text="Markers"
              active-icon-class="el-icon-location"
              active-color="#8300bf"
            />
          </el-col>
          <el-col
            :span="6"
            :offset="2"
          >
            <el-switch
              v-model="displayMinimap"
              active-text="Minimap"
              active-icon-class="el-icon-discover"
              active-color="#8300bf"
            />
          </el-col>
          <el-col
            :span="6"
            :offset="2"
          >
            <el-switch
              v-model="tumbleOn"
              active-text="Tumble"
              active-color="#8300bf"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-button
            size="mini"
            @click="helpMode = !helpMode"
          >
            Help Mode
          </el-button>
          <el-button
            size="mini"
            @click="screenCapture()"
          >
            Capture
          </el-button>
        </el-row>
        <el-row :gutter="20">
          <el-button
            size="mini"
            @click="saveSettings()"
          >
            Save Settings
          </el-button>
          <el-button
            size="mini"
            @click="restoreSettings()"
          >
            Restore Settings
          </el-button>
        </el-row>
        <el-row :gutter="20">
          <el-row :gutter="20">
            <el-switch
              v-model="render"
              active-text="Rendering"
              active-color="#8300bf"
            />
          </el-row>
        </el-row>
        <el-input
          v-model="input"
          type="textarea"
          autosize
          placeholder="Please input"
          style="padding-left:5%;width:90%;"
        />
      </div>
      <el-button
        slot="reference"
        icon="el-icon-setting"
      >
        Options
      </el-button>
    </el-popover>
    <el-popover
      placement="bottom"
      trigger="click"
      width="800"
      class="models-popover"
      popper-class="table-popover"
      :append-to-body="false"
    >
      <ModelsTable @viewModelClicked="viewModelClicked" />
      <el-button
        slot="reference"
        icon="el-icon-folder-opened"
      >
        Models
      </el-button>
    </el-popover>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { ScaffoldVuer } from "./components/index.js";
import ModelsTable from "./components/ModelsTable.vue";
import Vue from "vue";
import { Button, Col, Icon, Input, Popover, Row, Switch } from "element-ui";
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
  name: "App",
  components: {
    ScaffoldVuer,
    ModelsTable
  },
  data: function() {
    return {
      url: undefined,
      input: undefined,
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
        y_offset: 50,
        width: 128,
        height: 128,
        align: "top-right"
      },
      render: true,
      region: "",
      viewURL: ""
    };
  },
  watch: {
    input: function() {
      this.parseInput();
    },
    tumbleOn: function(val) {
      this.autoTumble(val);
    },
    "$route.query": {
      handler: "parseQuery",
      deep: true,
      immediate: true
    }
  },

  mounted: function() {
    this._sceneSettings = [];
    this.selectedCoordinates = this.$refs.scaffold.getDynamicSelectedCoordinates();
  },
  methods: {
    saveSettings: function() {
      this._sceneSettings.push(this.$refs.scaffold.getState());
    },
    restoreSettings: function() {
      if (this._sceneSettings.length > 0)
        this.$refs.scaffold.setState(this._sceneSettings.pop());
    },
    viewModelClicked: function(location) {
      this.input = location;
    },
    screenCapture: function() {
      this.$refs.scaffold.captureScreenshot("capture.png");
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
      if (data && data[0].data.group) {
        delete this.$route.query["viewURL"];
        this.$router.replace({
          query: { ...this.$route.query, region: data[0].data.group }
        });
      }
    },
    parseInput: function() {
      if (this.$route.query.url !== this.input)
        this.$router.replace({
          query: { ...this.$route.query, url: this.input }
        });
    },
    updateCurrentTime: function(val) {
      this.currentTime = val;
    },
    parseQuery: function(query) {
      if (query.url) {
        this.url = query.url;
      } else {
        this.url =
          "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
      }
      this.input = this.url;
      if (query.region) {
        this.region = query.region;
      } else {
        this.region = "";
      }
      if (query.viewURL) {
        this.viewURL = query.viewURL;
      } else {
        this.viewURL = "";
      }
    }
  }
};
</script>

<style lang="scss">
@import '@/assets/app';

#app {
  font-family: "Asap", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  position: absolute;
  overflow: hidden;
}

body {
  margin: 0px;
}

.options-container {
  text-align: center;
}

.vuer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.popover {
  top: 5px;
  right: 10px;
  position: absolute;
}

.app-row {
  .el-row {
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.models-popover {
  top: 5px;
  position: absolute;
}

.table-popover {
  opacity: 0.9;
}
</style>
