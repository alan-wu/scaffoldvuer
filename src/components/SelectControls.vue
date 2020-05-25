<template>
  <div class="select-container" ref="select">
    <el-select
      ref="elSelect"
      v-model="checkedItems"
      multiple
      placeholder="Region"
      :popper-append-to-body="appendToBody"
      @change="handleChange"
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
const differenceWith = require("lodash/differenceWith");
const isEqual = require("lodash/isEqual");

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
      if (name && name != "") {
        let tmpArray = uniq(this.sortedPrimitiveGroups.concat([name]));
        this.sortedPrimitiveGroups = orderBy(tmpArray);
        const index = this.sortedPrimitiveGroups.indexOf(undefined);
        if (index > -1) {
          this.sortedPrimitiveGroups.splice(index, 1);
        }
        if (this.displayAtStartUp) {
          this.checkedItems = this.sortedPrimitiveGroups.slice();
          this.previousSelection = this.checkedItems.slice();
          this.addTagsEventListenerNextTick();
        } else {
          this.module.changeOrganPartsVisibility(name, false);
        }
      }
    },
    /**
     * Use the element information make select a region.
     */
    changeStatusByElement: function(e, targetRegion, tag, callbackName) {
      if (targetRegion.name !== e.innerText) {
        if (targetRegion.element)
          targetRegion.element.classList.remove(tag);
        targetRegion.element = e.parentNode;
        targetRegion.element.classList.add(tag);
        targetRegion.name = e.innerText;
        let targetObject = this.getFirstZincObjectWithGroupName(
          this.module.scene,
          targetRegion.name
        );
        if (targetObject) this.$emit(callbackName, targetObject);
      }
    },
    /**
     * Use the element information make select a region.
     */
    changeActiveByElement: function(e) {
      this.changeStatusByElement(e, this.activeRegion,
        "activeTag", "object-selected");
    },
    /**
     * Use the element information make select a region.
     */
    changeHoverByElement: function(e) {
      this.changeStatusByElement(e, this.hoverRegion,
        "hoverTag", "object-hovered");
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
          this.removeHover();
          return;
        }
      }
    },
   /**
     * Hover a region by its name.
     */
    changeHoverByName: function(name) {
      const tags = Array.prototype.slice.call(
        this.$refs.select.querySelectorAll(".el-select__tags-text")
      );
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].innerText == name) {
          this.changeHoverByElement(tags[i]);
          return;
        }
      }
    },
    removeTag: function(targetRegion, tagToBeRemoved) {
      if (targetRegion.element)
        targetRegion.element.classList.remove(tagToBeRemoved);
      targetRegion.element = undefined;
      targetRegion.name = "";
    },
    /**
     * Unselect the current selected region.
     */
    removeActive: function() {
      this.removeTag(this.activeRegion, "activeTag");
      this.$emit("object-selected", undefined);
    },
    /**
     * Unselect the current hover region.
     */
    removeHover: function() {
      this.removeTag(this.hoverRegion, "hoverTag");
      this.$emit("object-hovered", undefined);
    },
    /**
     * Reset the controls.
     */
    clear: function() {
      this.sortedPrimitiveGroups = [];
      this.checkedItems = [];
      this.previousSelection = [];
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
    tagsOnMouseOver: function(e) {
      e.stopPropagation();
      this.changeHoverByElement(e.srcElement);
    },
    addTagsEventListener: function(tags) {
      tags.forEach(tag => {
        tag.addEventListener("click", this.tagsOnClicked);
        tag.addEventListener("mouseover", this.tagsOnMouseOver);
      });
    },
    addTagsEventListenerNextTick: function() {
      this.$nextTick(() => {
        const tags = Array.prototype.slice.call(
          this.$refs.select.querySelectorAll(".el-select__tags-text")
        );
        this.addTagsEventListener(tags);
      });
    },
    /**
     * Callback when changes is made on the active list.
     * This will toggle on the selected items and add callback
     * on them.
     */
    handleChange: function(changed) {
      if (this.checkedItems.length > this.previousSelection.length ) {
        for (let i = 0; i < this.checkedItems.length; i++)
          this.module.changeOrganPartsVisibility(this.checkedItems[i], true);
        this.addTagsEventListenerNextTick();
      } else {
        let diff = differenceWith(this.previousSelection,
          this.checkedItems, isEqual);
        for (let i = 0; i < diff.length; i++) {
          this.tagRemoved(diff[i]);
        }
      }
      this.previousSelection = changed;
    },
    /**
     * Called when a tag is removed which turns a region invisible.
     * See @handlChange
     */
    tagRemoved: function(removedValue) {
      this.module.changeOrganPartsVisibility(removedValue, false);
      if (this.activeRegion.name === removedValue) {
        this.removeActive();
      }
      if (this.hoverRegion.name === removedValue) {
        this.removeHover();
      }
    }
  },
  props: { 
    module: Object,
      /**
     * Display all graphics at start
     */
    displayAtStartUp: {
      type: Boolean,
      default: true
    },
  },
  data: function() {
    return {
      checkedItems: [],
      sortedPrimitiveGroups: [],
      previousSelection: [],
      appendToBody: false
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
    this.hoverRegion = { element: undefined, name: "" };
    let tmpArray = this.module.sceneData.geometries.concat(
      this.module.sceneData.lines
    );
    tmpArray = tmpArray.concat(this.module.sceneData.glyphsets);
    tmpArray = uniq(tmpArray.concat(this.module.sceneData.pointset));
    this.sortedPrimitiveGroups = orderBy(tmpArray);
    if (this.displayAtStartUp) {
      this.checkedItems = this.sortedPrimitiveGroups.slice();
      this.previousSelection = this.checkedItems.slice();
      this.addTagsEventListenerNextTick();
    } else {
      for (let i = 0; i < this.sortedPrimitiveGroups.length; i++) {
        if (this.sortedPrimitiveGroups[i])
          this.module.changeOrganPartsVisibility(
            this.sortedPrimitiveGroups[i],
            false
          );
      }
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

>>> .hoverTag {
  background-color: #ddd !important;
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

