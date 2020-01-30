<template>
  <div class="scaffold-container">
    <div style="height:100%;width:100%;position:relative">
      <div id="organsDisplayArea" style="height:100%;width:100%;" ref="display"></div>
      <div class="check-list">
        <el-row style="margin-bottom:10px;">
          <el-button type="success" @click="viewAll" round>View all</el-button>
        </el-row>
        <el-collapse v-model="activeCollapseItems">
          <el-collapse-item
            v-for="(group, type) in primitivesList"
            :title="type"
            :key="type"
            :name="type"
          >
            <el-checkbox-group v-model="group.checkbox" size="small">
              <el-row v-for="item in group.sorted" :key="item">
                <div style= "display: flex;justify-content: space-between;">
                  <el-checkbox
                    style="margin-top:3px;"
                    :label="item"
                    @change="visibilityToggle(item, $event, type)"
                    :checked="true"
                    border
                  >{{item}}</el-checkbox>
                  <el-color-picker
                    v-if="showColourPicker&&colour(type, item)"
                    style="margin-top:3px;"
                    :value="colour(type, item)"
                    @change="colourChanged(type, item, $event)"
                    size="small"
                  ></el-color-picker>
                </div>
              </el-row>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="timeSlider" v-if="sceneData.timeVarying">
        <el-button
          type="success"
          v-if="isPlaying"
          @click="play(false)"
          icon="el-icon-video-pause"
          round
        >Pause</el-button>
        <el-button type="success" v-else @click="play(true)" icon="el-icon-video-play" round>Play</el-button>
        <el-slider
          :min="0"
          :max="100"
          :value="sceneData.currentTime"
          :step="0.1"
          @input="timeChange($event)"
        ></el-slider>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Collapse,
  CollapseItem,
  ColorPicker,
  Container,
  Row,
  Slider
} from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
var orderBy = require("lodash/orderBy");
locale.use(lang);
Vue.use(Button);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(ColorPicker);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Container);
Vue.use(Row);
Vue.use(Slider);

const OrgansViewer = require("physiomeportal/src/modules/organsRenderer")
  .OrgansViewer;
const EventNotifier = require("physiomeportal/src/utilities/eventNotifier")
  .EventNotifier;

const eventNotifierCallback = function(component) {
  return function(event) {
    if (event.eventType == 1)
      component.$emit("scaffold-selected", event.identifiers);
    else if (event.eventType == 2)
      component.$emit("scaffold-highlighted", event.identifiers);
  };
};

const getPrimitivesListWithGroupName = function(scene, type, name) {
  let array = [];
  if (type == "Geometries") array = scene.findGeometriesWithGroupName(name);
  else if (type == "Lines") array = scene.findLinesWithGroupName(name);
  else if (type == "Glyphsets") array = scene.findGlyphsetsWithGroupName(name);
  else if (type == "Pointsets") array = scene.findPointsetsWithGroupName(name);
  return array;
};

export default {
  name: "ScaffoldVuer",
  beforeCreate: function() {
    let eventNotifier = new EventNotifier();
    eventNotifier.subscribe(this, eventNotifierCallback(this));
    this.$module = new OrgansViewer();
    this.$module.addNotifier(eventNotifier);
  },
  methods: {
    viewAll: function() {
      this.$module.viewAll();
    },
    visibilityToggle: function(item, event, type) {
      this.$module.changeOrganPartsVisibility(item, event, type.toLowerCase());
    },
    timeChange: function(event) {
      if (event != this.sceneData.currentTime) this.$module.updateTime(event);
    },
    play: function(flag) {
      this.$module.playAnimation(flag);
      this.isPlaying = flag;
    },
    colourChanged: function(type, name, colour) {
      let array = getPrimitivesListWithGroupName(
        this.$module.scene,
        type,
        name
      );
      let hexString = colour.replace("#", "0x");
      array.forEach(object => object.setColourHex(hexString));
      this.lastColourChanged = name;
    },
    colour: function(type, name) {
      let array = getPrimitivesListWithGroupName(
        this.$module.scene,
        type,
        name
      );
      if (array.length > 0) return "#" + array[0].getColourHex();
      return undefined;
    }
  },
  props: { url: String, showColourPicker: Boolean },
  data: function() {
    return {
      sceneData: this.$module.sceneData,
      isPlaying: false,
      step: 0.1,
      primitivesList: {
        Geometries: {
          checkbox: [],
          primitives: this.$module.sceneData.geometries,
          sorted: []
        },
        Lines: {
          checkbox: [],
          primitives: this.$module.sceneData.lines,
          sorted: []
        },
        Glyphsets: {
          checkbox: [],
          primitives: this.$module.sceneData.glyphsets,
          sorted: []
        },
        Pointsets: {
          checkbox: [],
          primitives: this.$module.sceneData.pointsets,
          sorted: []
        }
      },
      activeCollapseItems: []
    };
  },
  watch: {
    "primitivesList.Geometries.primitives": function() {
      this.primitivesList.Geometries.sorted = orderBy(this.primitivesList.Geometries.primitives);
    },
    "primitivesList.Lines.primitives": function() {
      this.primitivesList.Lines.sorted = orderBy(this.primitivesList.Lines.primitives);
    },
    "primitivesList.Glyphsets.primitives": function() {
      this.primitivesList.Glyphsets.sorted = orderBy(this.primitivesList.Glyphsets.primitives);
    },
    "primitivesList.Pointsets.primitives": function() {
      this.primitivesList.Pointsets.sorted = orderBy(this.primitivesList.Pointsets.primitives);
    },
    "url": function(newValue) {
      if (newValue) {
        this.$module.loadOrgansFromURL(
          newValue,
          undefined,
          undefined,
          "scene",
          undefined
        );
      }
    }
  },
  mounted: function() {
    if (this.url) {
      this.$module.loadOrgansFromURL(
        this.url,
        undefined,
        undefined,
        "Overlay",
        undefined
      );
    }
    this.$module.initialiseRenderer(this.$refs.display);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.scaffold-container {
  height: 100%;
  width: 100%;
}

.check-list {
  position: absolute;
  top: 10px;
  left: 10px;
  height: calc(100% - 20px);
  text-align: left;
  overflow:auto;
}

.timeSlider {
  text-align:center;
  position: absolute;
  left: 2.5%;
  height: 48px;
  width: 95%;
  bottom: 40px;
}
</style>
