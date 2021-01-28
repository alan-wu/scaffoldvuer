<template>
  <div class="traditional-location" :class="{ open: drawerOpen, close: !drawerOpen }">
    <div class="traditional-container">
      <el-row>
        <el-col :span="12">
          <div class="regions-display-text">
            Regions
          </div>
        </el-col>
        <el-col :span="12">
          <el-checkbox class="all-checkbox" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">Display all</el-checkbox>
        </el-col>         
      </el-row>
      <el-checkbox-group v-model="checkedItems" size="small" 
        class="checkbox-group" @change="handleCheckedItemsChange">
        <div class="checkbox-group-inner">
          <el-row v-for="item in sortedPrimitiveGroups" :key="item" :label="item">
            <div class="checkbox-container">
              <el-checkbox
                class="my-checkbox"
                @click.native="itemClicked(item, $event)"
                :label="item"
                @change="visibilityToggle(item, $event)"
                :checked="true"
                @mouseover.native="checkboxHover(item)"
                :class="{ activeItem: activeRegion === item, 
                hoverItem: hoverRegion === item  }">          
                <el-color-picker
                  :class="{ 'show-picker' : showColourPicker }"
                  :value="getColour(item)"
                  @change="setColour(item, $event)"
                  size="small"
                  :popper-class="myPopperClass"/>
                  {{item}}
                </el-checkbox>
            </div>
          </el-row>
        </div>
      </el-checkbox-group>
    </div>
    <div @click="toggleDrawer" class="drawer-button" :class="{ open: drawerOpen, close: !drawerOpen }">
      <i class="el-icon-arrow-left"></i>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Checkbox, CheckboxGroup, ColorPicker, Row } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
const orderBy = require("lodash/orderBy");
const uniq = require("lodash/uniq");
locale.use(lang);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(ColorPicker);
Vue.use(Row);

/**
 * A vue component for toggling visibility of various regions.
 */
export default {
  name: "TraditionalControls",
  methods: {
    /**
     * This is called when a new organ is read into the scene.
     */
    organsAdded: function(name) {
      if (name && name != "") {
        let tmpArray = uniq(this.sortedPrimitiveGroups.concat([name]));
        tmpArray = orderBy(tmpArray);
        const index = tmpArray.indexOf(undefined);
        if (index > -1) {
          tmpArray.splice(index, 1);
        }
        this.sortedPrimitiveGroups = tmpArray;
      }
    },
    /**
     * Select a region by its name.
     */
    changeActiveByName: function(name) {
      let targetObject = this.getFirstZincObjectWithGroupName(name);
      if (targetObject && targetObject.getVisibility()) {
        this.activeRegion = name;
        /**
         * Triggers when an item has been selected.
         *
         * @property {object} target selected object.
         */
        this.$emit("object-selected", targetObject);
      }
      this.removeHover();
    },
    /**
     * Hover a region by its name.
     */
    changeHoverByName: function(name) {
      let targetObject = this.getFirstZincObjectWithGroupName(name);
      if (targetObject) {
        this.hoverRegion = name;
        /**
         * Triggers when an item has been hovered over.
         *
         * @property {object} target hovered object.
         */
        this.$emit("object-hovered", targetObject);
      }
    },
    /**
     * Unselect the current selected region.
     */
    removeActive: function() {
      this.activeRegion = "";
      this.$emit("object-selected", undefined);
    },
    /**
     * Unselect the current hover region.
     */
    removeHover: function() {
      this.hoverRegion = "";
      this.$emit("object-hovered", undefined);
    },
    /**
     * Reset the controls.
     */
    clear: function() {
      this.sortedPrimitiveGroups = [];
      this.checkedItems = [];
      this.activeRegion = "";
      this.hoverRegion = "";
      this.$emit("object-selected", undefined);
    },
    getFirstZincObjectWithGroupName: function(name) {
      if (this.module && this.module.scene) {
        let array = this.module.scene.findGeometriesWithGroupName(name);
        if (array.length > 0) return array[0];
        array = this.module.scene.findGlyphsetsWithGroupName(name);
        if (array.length > 0) return array[0];
        array = this.module.scene.findLinesWithGroupName(name);
        if (array.length > 0) return array[0];
        array = this.module.scene.findPointsetsWithGroupName(name);
        if (array.length > 0) return array[0];
      }
      return undefined;
    },
    getColour: function(name) {
      let graphic = this.getFirstZincObjectWithGroupName(name);
      if (graphic) {
        let hex = graphic.getColourHex();
        if (hex) return "#" + hex;
      }
      return "#FFFFFF";
    },
    setColour: function(name, value) {
      let graphic = this.getFirstZincObjectWithGroupName(name);
      if (graphic) {
        let hexString = value.replace("#", "0x");
        graphic.setColourHex(hexString);
      }
    },
    checkboxHover: function(name) {
      this.changeHoverByName(name);
    },
    itemClicked: function(name, event) {
      if (
        !(
          event.target.classList.contains("el-checkbox__inner") ||
          event.target.classList.contains("el-checkbox__original")
        )
      ) {
        this.changeActiveByName(name);
        event.preventDefault();
      }
    },
    handleCheckedItemsChange: function(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.sortedPrimitiveGroups.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.sortedPrimitiveGroups.length;
    },
    handleCheckAllChange(val) {
      this.checkedItems = val ? this.sortedPrimitiveGroups : [];
      this.isIndeterminate = false;
      for (let i = 0; i < this.sortedPrimitiveGroups.length; i++) {
        this.visibilityToggle(this.sortedPrimitiveGroups[i], this.checkAll);
      }
    },
    viewAll: function() {
      this.module.viewAll();
    },
    visibilityToggle: function(item, event) {
      this.module.changeOrganPartsVisibility(item, event);
      if (event == false) {
        if (this.activeRegion === item) {
          this.removeActive();
        }
        if (this.hoverRegion === item) {
          this.removeHover();
        }
      }
    },
    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen;
      this.$emit("drawer-toggled", this.drawerOpen);
    },
  },
  props: { 
    /**
     * @ignore
     */
    module: Object,
    /**
     * Enable/disable colour picker
     */
    showColourPicker: Boolean },
  data: function() {
    return {
      checkAll: true,
      isIndeterminate: false,
      checkedItems: [],
      sortedPrimitiveGroups: [],
      activeRegion: "",
      hoverRegion: "",
      myPopperClass: "hide-scaffold-colour-popup",
      drawerOpen: true,
    };
  },
  watch: {
    showColourPicker: {
      immediate: true,
      handler: function() {
        if (this.showColourPicker) this.myPopperClass = "showPicker";
        else this.myPopperClass = "hide-scaffold-colour-popup";
      }
    }
  },
  created: function() {
    let tmpArray = this.module.sceneData.geometries.concat(
      this.module.sceneData.lines
    );
    tmpArray = tmpArray.concat(this.module.sceneData.glyphsets);
    tmpArray = uniq(tmpArray.concat(this.module.sceneData.pointset));
    this.sortedPrimitiveGroups = orderBy(tmpArray);
    this.module.addOrganPartAddedCallback(this.organsAdded);
    this.module.graphicsHighlight.selectColour = 0x444444;
  },
  destroyed: function() {
    this.sortedPrimitiveGroups = undefined;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.checkbox-container {
  display: flex;
  cursor: pointer;
}

.traditional-location {
  position: absolute;
  bottom: 0px;
  transition: all 1s ease;
}

.traditional-location:focus {
    outline: none;
}

.traditional-location.open {
  left: 0px;
}
.traditional-location.close {
  left: -298px;
}

.traditional-container {
  float: left;
  padding-left: 16px;
  padding-right: 18px;
  max-height: calc(100% - 154px);
  text-align: left;
  overflow: none;
  border: 1px solid rgb(220, 223, 230);
  padding-top:7px;
  padding-bottom:16px;
  background:#ffffff;
}

.regions-display-text {
  width: 59px;
  height: 20px;
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
  margin-left: 8px;
}

.all-checkbox {
  float: right;
}

.checkbox-group {
  width: 260px;
  border: 1px solid rgb(144, 147, 153);
  border-radius: 4px;
  background: #ffffff;
  margin-top:6px;
}

.checkbox-group-inner {
  padding:18px;
  max-height:240px;
  min-height: 130px;
  overflow:auto;
  scrollbar-color: #c0c4cc rgba(1,1,1,0);
  scrollbar-width: thin;
}

.checkbox-group-inner::-webkit-scrollbar {
  width:4px;
}

.checkbox-group-inner::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 6px #c0c4cc; 
}

>>> .el-color-picker {
  height:16px!important;
  top:3px;
}

>>> .el-color-picker__trigger {
  margin-left: 8px;
  margin-right: 8px;
  padding: 0px;
  height:16px;
  width:16px;
  border:0px;
}

>>> .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #8300bf;
  border-color: #8300bf;
}

>>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #8300bf;
  border-color: #8300bf;
}

>>> .el-color-picker__color {
  border: 1px solid #8300bf;
}

>>> .el-checkbox__label {
  padding-left:5px;
  color: rgb(131, 0, 191)!important;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
}

.activeItem {
  background-color: #bbb !important;
}

.my-checkbox {
  background-color: #fff;
  width: 100%;
}

.hoverItem {
  background-color: #eee !important;
}

>>> .el-color-picker__icon.el-icon-arrow-down {
  display: none;
}

>>> .show-picker .el-color-picker__icon.el-icon-arrow-down {
  display: block;
}


>>> .my-drawer {
  background: rgba(0,0,0,0);
  box-shadow: none;
}

.drawer >>> .el-drawer:focus{
  outline:none;
}

.open-drawer{
  width: 20px;
  height: 40px;
  z-index: 8;
  position: absolute;
  left: 0px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #F7FAFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.drawer-button {
  float: left;
  width: 20px;
  height: 40px;
  z-index: 8;
  margin-top:calc(50% - 52px);
  border: solid 1px #e4e7ed;
  border-left: 0;
  background-color: #FFFFFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.drawer-button i{
  margin-top:12px;
  color: #8300bf;
  transition-delay: 0.9s;
}

.drawer-button.open i{
  transform: rotate(0deg) scaleY(2.5);
}

.drawer-button.close i{
  transform: rotate(180deg) scaleY(2.5);
}
</style>

<style>
.hide-scaffold-colour-popup {
  display: none;
}
</style>


<style scoped src="../styles/purple/checkbox.css">
</style>
<style scoped src="../styles/purple/checkbox-group.css">
</style>
<style scoped src="../styles/purple/color-picker.css">
</style>
