<template>
  <div id="app">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap" />
    <drop-zone ref="dropzone" @files-drop="onFilesDrop">
      <ScaffoldVuer v-if="url" ref="scaffold" class="vuer" :flatmapAPI="flatmapAPI" :display-u-i="displayUI" :url="url"
        :help-mode="helpMode" :display-latest-changes="true" :display-minimap="displayMinimap"
        :display-markers="displayMarkers" :enableOpenMapUI="true" :minimap-settings="minimapSettings"
        :show-colour-picker="showColourPicker" :render="render" :region="region" :view-u-r-l="viewURL" :format="format"
        :marker-labels="markerLabels" @open-map="openMap" @on-ready="onReady" @scaffold-selected="onSelected"
        @scaffold-navigated="onNavigated" @timeChanged="updateCurrentTime" @zinc-object-added="objectAdded"
        @vue:mounted="viewerMounted"/>
    </drop-zone>

    <el-popover popper-class="options-container" placement="bottom" trigger="click" width="500" :teleported="false">
      <div>
        <el-row :gutter="20">
          <p>{{ selectedCoordinates }}</p>
        </el-row>
        <el-row :gutter="20">
          <p v-if="currentTime !== 0">
            time emited is: {{ currentTime.toFixed(2) }}
          </p>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="4" :offset="1">
            <el-switch v-model="displayUI" active-text="UI" />
          </el-col>
          <el-col :span="6" :offset="1">
            <el-switch v-model="displayMarkers" active-text="Markers" active-icon-class="el-icon-location"
              active-color="#8300bf" />
          </el-col>
          <el-col :span="4" :offset="1">
            <el-switch v-model="displayMinimap" active-text="Minimap" active-icon-class="el-icon-discover"
              active-color="#8300bf" />
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-switch v-model="tumbleOn" active-text="Tumble" active-color="#8300bf" />
          </el-col>
          <el-col :span="1"> x: </el-col>
          <el-col :span="3">
            <el-input-number class="tumble-direction" controls-position="right" v-model="tumbleDirection[0]" :min="-1.0"
              :max="1.0" :controls="false" placeholder="Please input" label="x" @change="autoTumble" />
          </el-col>
          <el-col :span="1" :offset="1"> y: </el-col>
          <el-col :span="3">
            <el-input-number class="tumble-direction" controls-position="right" v-model="tumbleDirection[1]" :min="-1.0"
              :max="1.0" :controls="false" placeholder="Please input" label="y" @change="autoTumble" />
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-button size="small" @click="helpMode = !helpMode">
            Help Mode
          </el-button>
          <el-button size="small" @click="screenCapture()"> Capture </el-button>
          <el-button size="small" @click="changeMarkers"> Change Markers </el-button>
        </el-row>
        <el-row :gutter="10">
          <el-button size="small" @click="saveSettings()">
            Save Settings
          </el-button>
          <el-button size="small" @click="restoreSettings()">
            Restore Settings
          </el-button>
          <el-button size="small" @click="exportGLB()"> Export GLB </el-button>
          <el-button size="small" @click="exportGLTF()"> Export GLTF </el-button>
        </el-row>
        <el-row :gutter="30">
          <el-col :span="7" :offset="2">
            <el-switch v-model="syncMode" active-text="Sync Mode" active-color="#8300bf" />
            <el-row v-if="syncMode">
              <el-input-number v-model="zoom" :min="1.0" :controls="false" placeholder="Please input" label="zoom" />
              <el-input-number v-model="pos[0]" :min="-1.0" :max="1.0" :controls="false" placeholder="Please input"
                label="x" />
              <el-input-number v-model="pos[1]" :min="-1.0" :max="1.0" :controls="false" label="y" />
            </el-row>
          </el-col>
        </el-row>
        <el-row :gutter="30">
          <el-col :span="7" :offset="4">
            <el-switch v-model="render" active-text="Rendering" active-color="#8300bf" />
          </el-col>
          <el-col :span="8" :offset="1">
            <el-switch v-model="renderInfoOn" active-text="Renderer Info" active-color="#8300bf" />
          </el-col>
        </el-row>
        <template v-if="renderInfoOn && rendererInfo">
          <el-row>
            <el-col v-for="(value, name) in rendererInfo.memory" :key="name" :offset="4" :span="6">
              {{ name }} : {{ value }}
            </el-col>
          </el-row>
          <el-row>
            <el-col v-for="(value, name) in rendererInfo.render" :key="name" :offset="1" :span="6">
              {{ name }} : {{ value }}
            </el-col>
          </el-row>
        </template>
        <el-row :gutter="20">
          Feature Demo:
          <el-button size="small" @click="featureTextureVolume(false)">
            Texture volume
          </el-button>
          <el-button size="small" @click="featureTextureSlides(false)">
            Texture slides
          </el-button>
          <el-button size="small" @click="featureTextureVolume(true)">
            Body volume
          </el-button>
          <el-button size="small" @click="featureTextureSlides(true)">
            Body slides
          </el-button>
          <el-switch v-model="onClickMarkers" active-text="Markers On Selection" active-color="#8300bf" />
          <el-switch
              v-model="wireframe"
              active-text="wireframe"
              active-color="#8300bf"
              @change="wireframeChanged"
            />
        </el-row>
        <el-row :gutter="20">
          <el-input v-model="input" type="textarea" autosize placeholder="Please input"
            style="padding-left: 5%; width: 90%" />
        </el-row>
      </div>
      <template #reference>
        <el-button class="options-button" :icon="ElIconSetting">
          Options
        </el-button>
      </template>
    </el-popover>
    <el-popover placement="bottom" trigger="click" width="800" popper-class="table-popover" :teleported="false">
      <template #default>
        <Suspense>
          <ModelsTable @viewModelClicked="viewModelClicked" />
        </Suspense>
      </template>
      <template #reference>
        <el-button class="models-button" :icon="ElIconFolderOpened">
          Models
        </el-button>
      </template>
    </el-popover>
    <el-autocomplete v-model="searchText" class="search-box" placeholder="Search" :fetch-suggestions="fetchSuggestions"
      :teleported="false" popper-class="autocomplete-popper" @keyup.enter="search(searchText)"
      @select="search(searchText)">
      <template #default="{ item }">
        <div class="value">
          {{ item.value }}
        </div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { shallowRef } from 'vue';
import { ScaffoldVuer } from "./components/index.js";
import DropZone from "./app/DropZone.vue";
import ModelsTable from "./app/ModelsTable.vue";
import { testSlides, testVolume } from "./app/TextureDemos.js";
import {
  FolderOpened as ElIconFolderOpened,
  Setting as ElIconSetting,
} from '@element-plus/icons-vue'
import {
  ElAutocomplete as Autocomplete,
  ElButton as Button,
  ElCol as Col,
  ElIcon as Icon,
  ElInput as Input,
  ElInputNumber as InputNumber,
  ElPopover as Popover,
  ElRow as Row,
  ElSwitch as Switch,
} from "element-plus";
import { useRoute, useRouter } from 'vue-router'

let texture_prefix = undefined;

export default {
  name: "app",
  components: {
    Autocomplete,
    Button,
    Col,
    Icon,
    Input,
    InputNumber,
    Popover,
    Row,
    Switch,
    ElIconFolderOpened,
    ElIconSetting,
    DropZone,
    ScaffoldVuer,
    ModelsTable,
  },
  data: function () {
    return {
      url: undefined,
      input: undefined,
      displayUI: true,
      selectedCoordinates: undefined,
      helpMode: false,
      displayMarkers: false,
      onClickMarkers: false,
      wireframe: false,
      syncMode: false,
      currentTime: 0,
      displayMinimap: false,
      tumbleOn: false,
      tumbleDirection: [1.0, 0.0],
      showColourPicker: true,
      minimapSettings: {
        x_offset: 16,
        y_offset: 50,
        width: 128,
        height: 128,
        align: "top-right",
      },
      markerLabels: ["left atrium", "epicardium"],
      render: true,
      region: "",
      viewURL: "",
      renderInfoOn: false,
      rendererInfo: undefined,
      zoom: 1,
      pos: [0, 0],
      format: "metadata",
      sceneSettings: [],
      searchInput: "",
      searchText: "",
      loadTextureVolumeOnReady: false,
      readyCallback: undefined,
      flatmapAPI: "https://mapcore-demo.org/devel/flatmap/v4/",
      route: useRoute(),
      router: useRouter(),
      ElIconSetting: shallowRef(ElIconSetting),
      ElIconFolderOpened: shallowRef(ElIconFolderOpened)
    };
  },
  watch: {
    input: function () {
      this.parseInput();
    },
    tumbleOn: function () {
      this.autoTumble();
    },
    "route.query": {
      handler: "parseQuery",
      deep: true,
      immediate: true,
    },
    syncMode: function (val) {
      this.$refs.scaffold.toggleSyncControl(val);
    },
  },
  mounted: function () {
    this._objects = [];
  },
  created: function () {
    texture_prefix = import.meta.env.VITE_TEXTURE_FOOT_PREFIX;
  },
  methods: {
    exportGLTF: function () {
      this.$refs.scaffold.exportGLTF(false).then((data) => {
        let dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(data));
        let hrefElement = document.createElement("a");
        document.body.append(hrefElement);
        hrefElement.download = `export.gltf`;
        hrefElement.href = dataStr;
        hrefElement.click();
        hrefElement.remove();
      });
    },
    exportGLB: function () {
      this.$refs.scaffold.exportGLTF(true).then((data) => {
        let blob = new Blob([data], { type: "octet/stream" });
        let url = window.URL.createObjectURL(blob);
        let hrefElement = document.createElement("a");
        document.body.append(hrefElement);
        hrefElement.download = `export.glb`;
        hrefElement.href = url;
        hrefElement.click();
        hrefElement.remove();
      });
    },
    objectAdded: function (zincObject) {
      if (this._objects.length === 0) {
        zincObject.setMarkerMode("on");
      }
      if (zincObject.isGeometry) {
        zincObject._lod._material.wireframe = this.wireframe;
      }
      this._objects.push(zincObject);
    },
    openMap: function (map) {
      console.log(map);
    },
    featureTextureVolume: async function (overlap) {
      //this.$refs.scaffold.clearScene();
      //volume matrix to fit the human body
      //[-100, 0, 0, 0, 0, -100, 0, 0, 0, 0, -100, 0, -60, -100, 30, 1]
      if (overlap) {
        const url =
          "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/WholeBody/6-match-2023/human/nerve_metadata.json";
        if (this.route.query.url !== encodeURI(url)) {
          this.router.replace({ path: "/", query: { url } });
          this.readyCallback = testVolume;
          return;
        } else {
          testVolume(this.$refs.scaffold, texture_prefix);
          return;
        }
      }
      this.$refs.scaffold.clearScene();
      testVolume(this.$refs.scaffold, texture_prefix);
    },
    featureTextureSlides: async function (overlap) {
      //Test texture
      if (overlap) {
        const url =
          "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/WholeBody/6-match-2023/human/nerve_metadata.json";
        if (this.route.query.url !== encodeURI(url)) {
          this.router.replace({ path: "/", query: { url } });
          this.readyCallback = testSlides;
          return;
        } else {
          testSlides(this.$refs.scaffold, texture_prefix);
          return;
        }
      }
      this.$refs.scaffold.clearScene();
      testSlides(this.$refs.scaffold, texture_prefix);
    },
    saveSettings: function () {
      this.sceneSettings.push(this.$refs.scaffold.getState());
    },
    restoreSettings: function () {
      if (this.sceneSettings.length > 0)
        this.$refs.scaffold.setState(this.sceneSettings.pop());
    },
    viewModelClicked: function (location) {
      this.input = location;
    },
    screenCapture: function () {
      this.$refs.scaffold.captureScreenshot("capture.png");
    },
    setSceneToWindo: function () {
      window.scene = this.$refs.scaffold.$module.scene;
    },
    search: function (term) {
      this.$refs.scaffold.search(term, true);
    },
    viewerMounted: function() {
      this.selectedCoordinates =
        this.$refs.scaffold.getDynamicSelectedCoordinates();
      this.rendererInfo = this.$refs.scaffold.getRendererInfo();
    },
    fetchSuggestions: function (term, cb) {
      if (term === "" || !this.$refs.scaffold) {
        cb([]);
      }
      cb(
        this.$refs.scaffold.fetchSuggestions(term).map((item) => {
          const value = item.terms.length > 1 ? item.terms[1] : item.terms[0];
          return {
            value: value,
            label: value
          };
        })
      );
      console.log(
        "found suggestions",
        this.$refs.scaffold.fetchSuggestions(term)
      );
    },
    autoTumble: function () {
      const flag = this.tumbleOn;
      let cameracontrol =
        this.$refs.scaffold.$module.scene.getZincCameraControls();
      if (flag) {
        this.displayUI = false;
        cameracontrol.enableAutoTumble();
        if (this.tumbleDirection[0] === 0 && this.tumbleDirection[1] === 0) {
          this.tumbleDirection[0] = 1;
        }
        cameracontrol.autoTumble(this.tumbleDirection, Math.PI / 2, true);
      } else {
        this.displayUI = true;
        cameracontrol.stopAutoTumble();
      }
    },
    wireframeChanged: function (value) {
      this._objects.forEach((zincObject) => {
        if (zincObject.isGeometry) {
          zincObject._lod._material.wireframe = value;
        }
      });
    },
    onReady: function () {
      //window.scaffoldvuer = this.$refs.scaffold;
      this.$refs.dropzone.revokeURLs();
      if (this.readyCallback) {
        this.readyCallback(this.$refs.scaffold, texture_prefix);
        this.readyCallback = undefined;
      }
    },
    onSelected: function (data) {
      if (data && data.length > 0 && data[0].data.group) {
        delete this.route.query["viewURL"];
        this.$refs.scaffold.showRegionTooltipWithAnnotations(data, true, true);
        if (this.onClickMarkers) this.$refs.scaffold.setMarkerModeForObjectsWithName(data[0].data.group, "on");
      }
    },
    changeMarkers: function () {
      if (this.markerLabels[0] === "right ventricle") {
        this.markerLabels = ["left atrium", "epicardium", "stomach"];
      } else {
        this.markerLabels = ["right ventricle"];
      }
    },
    onNavigated: function (data) {
      this.zoom = data.zoom;
      this.pos[0] = data.target[0];
      this.pos[1] = data.target[1];
    },
    onFilesDrop: function (payload) {
      if (payload.format == "gltf") this.format = "gltf";
      else this.format = "metadata";
      this.input = payload.url;
    },
    parseInput: function () {
      if (this.route.query.url !== this.input) {
        const queries = { ...this.route.query };
        if (this.input && this.input !== "") queries.url = this.input;
        this.router.replace({
          path: "/",
          query: { ...this.route.query, url: this.input },
        });
      }
    },
    updateCurrentTime: function (val) {
      this.currentTime = val;
    },
    parseQuery: function (query) {
      this.router.isReady().then(() => {
        if (query.url != this.url) {
          this._objects = [];
        }
        if (query.url) {
          this.url = query.url;
        } else {
          this.url =
            "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
        }
        if (this.url.includes(".gltf") || this.url.includes(".glb")) {
          this.format = "gltf";
        } else if (this.url.includes(".json")) {
          this.format = "metadata";
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
      })
    }
  },
};
</script>

<style lang="scss">

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

.options-container.el-popover.el-popper {
  text-align: center;

  .el-row {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-switch {
    white-space: pre;
  }
}

.vuer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.options-button {
  top: 5px;
  right: 10px;
  position: absolute;
}

.options-container {
  .el-row {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.autocomplete-popper {
  li {
    line-height: normal;
    padding: 7px;

    .value {
      text-align: left;
      white-space: initial;
    }
  }
}

.search-box {
  left: calc(50% + 100px);
  position: absolute;
}

.models-button {
  position: absolute;
}

.tumble-direction {
  height: 20px;

  .el-input {
    width: 80px;
    height: 20px;
    padding: 0;

    input {
      padding: 0px;
      height: 20px;
      vertical-align: top;
    }
  }
}

.table-popover {
  opacity: 0.9;
}

svg.map-icon {
  color: $app-primary-color;
}
</style>
