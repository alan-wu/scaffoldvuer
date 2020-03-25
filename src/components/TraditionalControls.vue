<template>
  <div class="check-list">
    <div class="control-menu" ref="control-menu" @click="toggleControl">
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
    </div>
    <div :style="toggleStyle">
      <el-row style="margin-bottom:10px;">
        <el-button type="primary" @click="viewAll" round>View all</el-button>
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
              <div style="display: flex;justify-content: space-between;">
                <el-checkbox
                  style="margin-top:3px;"
                  :label="item"
                  @change="visibilityToggle(item, $event, type)"
                  :checked="true"
                  border
                  @mouseover.native="checkboxHover(item)"
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
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  Collapse,
  CollapseItem,
  Row
} from "element-ui";
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
Vue.use(Row);

const getPrimitivesListWithGroupName = function(scene, type, name) {
  let array = [];
  if (type == "Surfaces") array = scene.findGeometriesWithGroupName(name);
  else if (type == "Lines") array = scene.findLinesWithGroupName(name);
  else if (type == "Glyphsets") array = scene.findGlyphsetsWithGroupName(name);
  else if (type == "Pointsets") array = scene.findPointsetsWithGroupName(name);
  return array;
};

export default {
  name: "TraditionalControls",
  methods: {
    toggleControl: function() {
      this.$refs["control-menu"].classList.toggle("change");
      if (this.toggleStyle.visibility == "hidden") {
        this.toggleStyle.visibility = "visible";
        this.toggleStyle.opacity = 1.0;
      }
      else {
        this.toggleStyle.opacity = 0.0;
        this.toggleStyle.visibility = "hidden";
      }
    },
    checkboxHover: function(item) {
      this.module.setHighlightedByGroupName(item);
    },
    viewAll: function() {
      this.module.viewAll();
    },
    visibilityToggle: function(item, event, type) {
      let typeName = type;
      if (typeName == "Surfaces") typeName = "Geometries";
      this.module.changeOrganPartsVisibility(
        item,
        event,
        typeName.toLowerCase()
      );
    },
    colourChanged: function(type, name, colour) {
      let array = getPrimitivesListWithGroupName(
        this.module.scene,
        type,
        name
      );
      let hexString = colour.replace("#", "0x");
      array.forEach(object => object.setColourHex(hexString));
      this.lastColourChanged = name;
    },
    colour: function(type, name) {
      let array = getPrimitivesListWithGroupName(
        this.module.scene,
        type,
        name
      );
      if (array.length > 0) return "#" + array[0].getColourHex();
      return undefined;
    }
  },
  props: { module: Object, showColourPicker: Boolean },
  data: function() {
    return {
      activeCollapseItems: [],
      toggleStyle: {visibility:"hidden", opacity:0, transition: "visibility  0s, opacity 0.5s"},
      primitivesList: {
        Surfaces: {
          checkbox: [],
          primitives: this.module.sceneData.geometries,
          sorted: []
        },
        Lines: {
          checkbox: [],
          primitives: this.module.sceneData.lines,
          sorted: []
        },
        Glyphsets: {
          checkbox: [],
          primitives: this.module.sceneData.glyphsets,
          sorted: []
        },
        Pointsets: {
          checkbox: [],
          primitives: this.module.sceneData.pointsets,
          sorted: []
        }
      }
    };
  },
  watch: {
    "primitivesList.Surfaces.primitives": function() {
      this.primitivesList.Surfaces.sorted = orderBy(
        this.primitivesList.Surfaces.primitives
      );
    },
    "primitivesList.Lines.primitives": function() {
      this.primitivesList.Lines.sorted = orderBy(
        this.primitivesList.Lines.primitives
      );
    },
    "primitivesList.Glyphsets.primitives": function() {
      this.primitivesList.Glyphsets.sorted = orderBy(
        this.primitivesList.Glyphsets.primitives
      );
    },
    "primitivesList.Pointsets.primitives": function() {
      this.primitivesList.Pointsets.sorted = orderBy(
        this.primitivesList.Pointsets.primitives
      );
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.check-list {
  position: absolute;
  top: 10px;
  left: 10px;
  height: calc(100% - 20px);
  text-align: left;
  overflow: auto;
}

.control-menu {
  display: inline-block;
  cursor: pointer;
}

.bar1,
.bar2,
.bar3 {
  width: 35px;
  height: 5px;
  background-color: #333;
  margin: 6px 0;
  transition: 0.4s;
}

.change .bar1 {
  -webkit-transform: rotate(-45deg) translate(-9px, 6px);
  transform: rotate(-45deg) translate(-9px, 6px);
}

.change .bar2 {
  opacity: 0;
}

.change .bar3 {
  -webkit-transform: rotate(45deg) translate(-8px, -8px);
  transform: rotate(45deg) translate(-8px, -8px);
}
</style>

<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/checkbox.css">
</style>
<style scoped src="../styles/purple/checkbox-group.css">
</style>
<style scoped src="../styles/purple/color-picker.css">
</style>
<style scoped src="../styles/purple/collapse.css">
</style>
<style scoped src="../styles/purple/collapse-item.css">
</style>
<style scoped src="../styles/purple/row.css">
</style>

