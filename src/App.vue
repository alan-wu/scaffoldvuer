<template>
  <div id="app">
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap"
    >
    <drop-zone
      ref="dropzone"
      @files-drop="onFilesDrop"
    >
      <ScaffoldVuer
        ref="scaffold"
        class="vuer"
        :display-u-i="displayUI"
        :url="url"
        :help-mode="helpMode"
        :display-latest-changes="true"
        :display-minimap="displayMinimap"
        :display-markers="displayMarkers"
        :enableOpenMapUI="true"
        :minimap-settings="minimapSettings"
        :show-colour-picker="showColourPicker"
        :render="render"
        :region="region"
        :view-u-r-l="viewURL"
        :format="format"
        @open-map="openMap"
        @on-ready="onReady"
        @scaffold-selected="onSelected"
        @scaffold-navigated="onNavigated"
        @timeChanged="updateCurrentTime"
        @zinc-object-added="objectAdded"
      />
    </drop-zone>

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
          <p v-if="currentTime !== 0">
            time emited is: {{ currentTime.toFixed(2) }}
          </p>
        </el-row>
        <el-row :gutter="20">
          <el-col
            :span="4"
            :offset="1"
          >
            <el-switch
              v-model="displayUI"
              active-text="UI"
            />
          </el-col>
          <el-col
            :span="4"
            :offset="1"
          >
            <el-switch
              v-model="displayMarkers"
              active-text="Markers"
              active-icon-class="el-icon-location"
              active-color="#8300bf"
            />
          </el-col>
          <el-col
            :span="4"
            :offset="1"
          >
            <el-switch
              v-model="displayMinimap"
              active-text="Minimap"
              active-icon-class="el-icon-discover"
              active-color="#8300bf"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col
            :span="6"
          >
            <el-switch
              v-model="tumbleOn"
              active-text="Tumble"
              active-color="#8300bf"
            />
          </el-col>
          <el-col
            :span="1"
          >
            x:
          </el-col>
          <el-col
            :span="3"
          >
            <el-input-number
              class="tumble-direction"
              controls-position="right"
              v-model="tumbleDirection[0]"
              :min="-1.0"
              :max="1.0"
              :controls="false"
              placeholder="Please input"
              label="x"
              @change="autoTumble"
            />
          </el-col>
          <el-col
            :span="1"
            :offset="1"
          >
            y:
          </el-col>
          <el-col
            :span="3"
          >
            <el-input-number
              class="tumble-direction"
              controls-position="right"
              v-model="tumbleDirection[1]"
              :min="-1.0"
              :max="1.0"
              :controls="false"
              placeholder="Please input"
              label="y"
              @change="autoTumble"
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
          <el-button
            size="mini"
            @click="featureTesting()"
          >
            Test 1
          </el-button>
          <el-button
            size="mini"
            @click="featureTesting2()"
          >
            Test 2
          </el-button>
        </el-row>
        <el-row :gutter="10">
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
          <el-button
            size="mini"
            @click="exportGLB()"
          >
            Export GLB
          </el-button>
          <el-button
            size="mini"
            @click="exportGLTF()"
          >
            Export GLTF
          </el-button>
        </el-row>
        <el-row :gutter="30">
          <el-col
            :span="7"
            :offset="2"
          >
            <el-switch
              v-model="syncMode"
              active-text="Sync Mode"
              active-color="#8300bf"
            />
            <el-row v-if="syncMode">
              <el-input-number
                v-model="zoom"
                :min="1.0"
                :controls="false"
                placeholder="Please input"
                label="zoom"
              />
              <el-input-number
                v-model="pos[0]"
                :min="-1.0"
                :max="1.0"
                :controls="false"
                placeholder="Please input"
                label="x"
              />
              <el-input-number
                v-model="pos[1]"
                :min="-1.0"
                :max="1.0"
                :controls="false"
                label="y"
              />
            </el-row>
          </el-col>
        </el-row>
        <el-row :gutter="30">
          <el-col
            :span="7"
            :offset="4"
          >
            <el-switch
              v-model="render"
              active-text="Rendering"
              active-color="#8300bf"
            />
          </el-col>
          <el-col
            :span="8"
            :offset="1"
          >
            <el-switch
              v-model="renderInfoOn"
              active-text="Renderer Info"
              active-color="#8300bf"
            />
          </el-col>
        </el-row>
        <template v-if="renderInfoOn && rendererInfo">
          <el-row>
            <el-col
              v-for="(value, name) in rendererInfo.memory"
              :key="name"
              :offset="4"
              :span="6"
            >
              {{ name }} : {{ value }}
            </el-col>
          </el-row>
          <el-row>
            <el-col
              v-for="(value, name) in rendererInfo.render"
              :key="name"
              :offset="1"
              :span="6"
            >
              {{ name }} : {{ value }}
            </el-col>
          </el-row>
        </template>
        <el-input
          v-model="input"
          type="textarea"
          autosize
          placeholder="Please input"
          style="padding-left: 5%; width: 90%"
        />
      </div>
      <el-button
        slot="reference"
        icon="el-icon-setting"
        @click="setSceneToWindo"
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
      <el-autocomplete
        slot="reference"
        v-model="searchText"
        class="search-box"
        placeholder="Search"
        :fetch-suggestions="fetchSuggestions"
        :popper-append-to-body="false"
        popper-class="autocomplete-popper"
        @keyup.enter.native="search(searchText)"
        @select="search(searchText)"
      >
        <template slot-scope="{ item }">
          <div class="value">
            {{ item.value }}
          </div>
        </template>
      </el-autocomplete>
    </el-popover>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { ScaffoldVuer } from "./components/index.js";
import DropZone from "./components/DropZone.vue";
import ModelsTable from "./components/ModelsTable.vue";
import Vue from "vue";
import {
  Button,
  Col,
  Icon,
  Input,
  InputNumber,
  Popover,
  Row,
  Switch,
  Autocomplete,
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import taShader from "zincjs/src/shaders/textureArray.js";
import volumeRender from "zincjs/src/shaders/volumeRender.js";
import volumeTexture from "zincjs/src/shaders/volumeTexture.js";

locale.use(lang);
Vue.use(Button);
Vue.use(Col);
Vue.use(Icon);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Popover);
Vue.use(Row);
Vue.use(Switch);
Vue.use(Autocomplete);

let texture_prefix = undefined;

const getVolumeRender = (texture) => {
  const myUniforms = volumeRender.getUniforms();
  console.log(myUniforms);
  myUniforms.u_size.value.set(
    texture.size.width,
    texture.size.height,
    texture.size.depth
  );
  myUniforms.u_data.value = texture.impl;
  const options = {
    fs: volumeRender.fs,
    vs: volumeRender.vs,
    uniforms: myUniforms,
    glslVersion: volumeRender.glslVersion,
  };
  return options;
};

const getVolumeTexture = (texture) => {
  const myUniforms = volumeTexture.getUniforms();
  console.log(myUniforms);
  myUniforms.volume_scale.value.set(
    texture.size.width / texture.size.depth,
    texture.size.height / texture.size.depth,
    1
  );
  myUniforms.diffuse.value = texture.impl;
  myUniforms.depth.value = texture.size.depth;
  myUniforms.volume_dims.value = [200, 200, 200];
  const options = {
    fs: volumeTexture.fs,
    vs: volumeTexture.vs,
    uniforms: myUniforms,
    glslVersion: volumeTexture.glslVersion,
  };
  return options;
};

const getTestShader = (texture) => {
  const myUniforms = taShader.getUniforms();
  myUniforms.depth.value = texture.size.depth;
  myUniforms.diffuse.value = texture.impl;
  const options = {
    fs: taShader.fs,
    vs: taShader.vs,
    uniforms: myUniforms,
    glslVersion: taShader.glslVersion,
  };
  console.log(options);
  return options;
};

const getTexture = async (scaffoldModule) => {
  const imgArray = [];
  const texture = new scaffoldModule.Zinc.TextureArray();
  for (let i = 1733; i < 1860; i++) {
    imgArray.push(`${texture_prefix}/foot${i}.jpg`);
    //imgArray.push(`${process.env.VUE_APP_TEXTURE_FOOT_PREFIX}/foot${i}.jpg`);
  }
  await texture.loadFromImages(imgArray);
  return texture;
};

const testVolume = async (scaffoldModule, objects) => {
  if (objects) {
    const texture = await getTexture(scaffoldModule);
    //const options = getTestShader(texture);
    const options = getVolumeTexture(texture);
    const material = texture.getMaterial(options);
    console.log(material, texture, objects);
    objects[0].morph.material = material;
  }
};

const testSlides = async (scaffoldModule) => {
  const texture = await getTexture(scaffoldModule);
  const textureSlides = new scaffoldModule.Zinc.TextureSlides(texture);
  textureSlides.createSlides([
    {
      direction: "y",
      value: 0.1,
    },
    {
      direction: "y",
      value: 0.3,
    },
    {
      direction: "y",
      value: 0.5,
    },
    {
      direction: "y",
      value: 0.7,
    },
    {
      direction: "y",
      value: 0.9,
    },
    {
      direction: "x",
      value: 0.5,
    },
    {
      direction: "z",
      value: 0.5,
    },
  ]);
  scaffoldModule.scene.addZincObject(textureSlides);
};

export default {
  name: "App",
  components: {
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
    };
  },
  watch: {
    input: function () {
      this.parseInput();
    },
    tumbleOn: function () {
      this.autoTumble();
    },
    "$route.query": {
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
    this.selectedCoordinates =
      this.$refs.scaffold.getDynamicSelectedCoordinates();
    this.rendererInfo = this.$refs.scaffold.getRendererInfo();
  },
  created: function () {
    texture_prefix = process.env.VUE_APP_TEXTURE_FOOT_PREFIX;
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
      console.log(zincObject);
      this._objects.push(zincObject);
    },
    openMap: function (map) {
      console.log(map)
    },
    featureTesting: async function () {
      //Test texture
      testVolume(this.$refs.scaffold.$module, this._objects);
    },
    featureTesting2: async function () {
      //Test texture
      //testVolume(this.$refs.scaffold.$module, this._objects);
      testSlides(this.$refs.scaffold.$module);
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
    fetchSuggestions: function (term, cb) {
      if ( term === "" || !this.$refs.scaffold ) {
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
    onReady: function () {
      console.log("ready");
      //window.scaffoldvuer = this.$refs.scaffold;
      this.$refs.dropzone.revokeURLs();
    },
    onSelected: function (data) {
      console.log(data);
      if (data && data.length > 0 && data[0].data.group) {
        delete this.$route.query["viewURL"];
        this.$refs.scaffold.showRegionTooltip(data[0].data.group, true, true);
        //this.$router.replace({
        //  query: { ...this.$route.query, region: data[0].data.group }
        //});
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
      if (this.$route.query.url !== this.input) {
        const queries = { ...this.$route.query };
        if (this.input && this.input !== "") queries.url = this.input;
        this.$router.replace({
          query: { ...this.$route.query, url: this.input },
        });
      }
    },
    updateCurrentTime: function (val) {
      this.currentTime = val;
    },
    parseQuery: function (query) {
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
    },
  },
};
</script>

<style lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/col";
@import "~element-ui/packages/theme-chalk/src/icon";
@import "~element-ui/packages/theme-chalk/src/input";
@import "~element-ui/packages/theme-chalk/src/input-number";
@import "~element-ui/packages/theme-chalk/src/switch";
@import "~element-ui/packages/theme-chalk/src/popover";
@import "~element-ui/packages/theme-chalk/src/row";

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
  .el-row {
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }
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

.autocomplete-popper {
  li {
    line-height: normal;
    padding: 7px;

    .value {
      white-space: initial;
    }
  }
}

.models-popover {
  top: 5px;
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
