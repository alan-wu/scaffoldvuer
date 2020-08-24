<template>
  <div class="traditional-container">
    <el-checkbox
      v-if="sortedPrimitiveGroups.length > 1"
      :indeterminate="isIndeterminate"
      v-model="checkAll"
      @change="handleCheckAllChange"
    >Display all regions</el-checkbox>
    <el-checkbox-group v-model="checkedItems" size="small" @change="handleCheckedItemsChange">
      <el-row v-for="item in sortedPrimitiveGroups" :key="item" :label="item">
        <div class="checkbox-container">
          <el-color-picker
            style="margin-top:3px;display:inline-block;"
            :class="{ 'show-picker' : showColourPicker }"
            :value="getColour(item)"
            size="small"
            :popper-class="myPopperClass"
          ></el-color-picker>
          <el-checkbox
            class="my-checkbox"
            @click.native="itemClicked(item, $event)"
            style="margin-top:3px;"
            :label="item"
            @change="visibilityToggle(item, $event)"
            :checked="true"
            border
            @mouseover.native="checkboxHover(item)"
            :class="{ activeItem: activeRegion === item, 
              hoverItem: hoverRegion === item  }"
          >{{item}}</el-checkbox>
        </div>
      </el-row>
    </el-checkbox-group>
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
    }
  },
  props: { module: Object, showColourPicker: Boolean },
  data: function() {
    return {
      checkAll: true,
      isIndeterminate: false,
      checkedItems: [],
      sortedPrimitiveGroups: [],
      activeRegion: "",
      hoverRegion: "",
      myPopperClass: "hide-scaffold-colour-popup"
    };
  },
  watch: {
    myPopperClass: function() {
      if (this.showColourPicker) this.myPopperClass = "showPicker";
      else this.myPopperClass = "hide-scaffold-colour-popup";
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

.traditional-container {
  position: absolute;
  top: 54px;
  left: 17px;
  max-height: calc(100% - 154px);
  text-align: left;
  overflow: auto;
}

>>> .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #8300bf;
  border-color: #8300bf;
}

>>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #8300bf;
  border-color: #8300bf;
}

>>> .el-checkbox__label {
  color: #8300bf !important;
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
