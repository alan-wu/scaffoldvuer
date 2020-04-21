<template>
  <div class="select-container" ref="select">
    <el-select
      ref="elSelect"
      v-model="checkedItems"
      multiple
      placeholder="Region"
      @change="handleChange"
      @remove-tag="tagRemoved"
    >
      <el-option v-for="item in sortedPrimitiveGroups" :key="item" :label="item" :value="item"></el-option>
    </el-select>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Option, Select } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Option);
Vue.use(Select);
var orderBy = require("lodash/orderBy");
var uniq = require("lodash/uniq");

/**
 * A vue component for toggling visibility of various regions.
 */
export default {
  name: "SelectControls",
  methods: {
    /**
     * This is called when a new organ is read into the scene.
     */
    organsAdded: function(name) {
      let tmpArray = uniq(this.sortedPrimitiveGroups.concat([name]));
      this.sortedPrimitiveGroups = orderBy(tmpArray);
      this.module.changeOrganPartsVisibility(name, false);
    },
    /**
     * Use the element information make select a region.
     */
    changeActiveByElement: function(e) {
      if (this.activeRegion.name !== e.innerText) {
        if (this.activeRegion.element)
          this.activeRegion.element.classList.remove("activeTag");
        this.activeRegion.element = e.parentNode;
        this.activeRegion.element.classList.add("activeTag");
        this.activeRegion.name = e.innerText;
        let activeObject = this.getFirstZincObjectWithGroupName(
          this.module.scene,
          this.activeRegion.name
        );
        if (activeObject) this.$emit("object-selected", activeObject);
      }
    },
    /**
     * Select a region by its name.
     */
    changeActiveByName: function(name) {
      const tags = Array.prototype.slice.call(
        this.$refs.select.querySelectorAll(".el-select__tags-text")
      );
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].innerText == name) {
          this.changeActiveByElement(tags[i]);
          return;
        }
      }
    },
    /**
     * Unselect the current selected region.
     */
    removeActive: function() {
      if (this.activeRegion.element)
        this.activeRegion.element.classList.remove("activeTag");
      this.activeRegion.element = undefined;
      this.activeRegion.name = "";
      this.$emit("object-selected", undefined);
    },
    /**
     * Reset the controls.
     */
    clear: function() {
      this.sortedPrimitiveGroups = [];
      this.checkedItems = [];
      this.$emit("object-selected", undefined);
    },
    getFirstZincObjectWithGroupName: function(scene, name) {
      let array = this.module.scene.findGeometriesWithGroupName(name);
      if (array.length > 0) return array[0];
      array = this.module.scene.findGlyphsetsWithGroupName(name);
      if (array.length > 0) return array[0];
      array = this.module.scene.findLinesWithGroupName(name);
      if (array.length > 0) return array[0];
      array = this.module.scene.findPointsetsWithGroupName(name);
      if (array.length > 0) return array[0];
      return undefined;
    },
    
    tagsOnClicked: function(e) {
      if (this.$refs.elSelect.visible === false)
        e.stopPropagation();
      this.changeActiveByElement(e.srcElement);
      
    },
    addTagsEventListener: function(tags) {
      tags.forEach(tag => {
        tag.addEventListener("click", this.tagsOnClicked);
      });
    },
    /**
     * Callback when changes is made on the active list.
     * This will toggle on the selected items and add callback
     * on them.
     */
    handleChange: function() {
      for (let i = 0; i < this.checkedItems.length; i++)
        this.module.changeOrganPartsVisibility(this.checkedItems[i], true);
      this.$nextTick(() => {
        const tags = Array.prototype.slice.call(
          this.$refs.select.querySelectorAll(".el-select__tags-text")
        );
        this.addTagsEventListener(tags);
      });
    },
    /**
     * Callback when a tag is remove which turns a region invisible.
     */
    tagRemoved: function(removedValue) {
      this.module.changeOrganPartsVisibility(removedValue, false);
      if (this.activeRegion.name === removedValue) {
        this.removeActive();
      }
    }
  },
  props: { module: Object },
  data: function() {
    return {
      checkedItems: [],
      sortedPrimitiveGroups: []
    };
  },
  watch: {
    "module.sceneData.geometries": function() {
      let tmpArray = uniq(
        this.sortedPrimitiveGroups.concat(this.module.sceneData.geometries)
      );
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    },
    "module.sceneData.lines": function() {
      let tmpArray = uniq(
        this.sortedPrimitiveGroups.concat(this.module.sceneData.lines)
      );
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    },
    "module.sceneData.glyphsets": function() {
      let tmpArray = uniq(
        this.sortedPrimitiveGroups.concat(this.module.sceneData.glyphsets)
      );
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    },
    "module.sceneData.pointsets": function() {
      let tmpArray = uniq(
        this.sortedPrimitiveGroups.concat(this.module.sceneData.pointset)
      );
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    }
  },
  created: function() {
    this.activeRegion = { element: undefined, name: "" };
    let tmpArray = this.module.sceneData.geometries.concat(
      this.module.sceneData.lines
    );
    tmpArray = tmpArray.concat(this.module.sceneData.glyphsets);
    tmpArray = uniq(tmpArray.concat(this.module.sceneData.pointset));
    this.sortedPrimitiveGroups = orderBy(tmpArray);
    for (let i = 0; i < this.sortedPrimitiveGroups.length; i++) {
      if (this.sortedPrimitiveGroups[i])
        this.module.changeOrganPartsVisibility(
          this.sortedPrimitiveGroups[i],
          false
        );
    }
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
>>> .el-select .el-input .el-input__inner {
  border-color: #8300bf;
}

>>> .el-select .el-tag__close.el-icon-close {
  background-color: #8300bf;
}

.select-container {
  position: absolute;
  top: 54px;
  left: 17px;
  max-height: 500px;
  text-align: left;
}

>>> .activeTag {
  background-color: #ccc !important;
}

>>> .el-tag.el-tag--info {
  color: #8300bf;
  cursor: pointer;
}
</style>

<style scoped src="../styles/purple/option.css">
</style>
<style scoped src="../styles/purple/select.css">
</style>

