<template>
  <div class="select-container" ref="select">
    <el-select ref="select" v-model="checkedItems" multiple placeholder="Region" @change="handleChange"
      @remove-tag="tagRemoved">
      <el-option
        v-for="item in sortedPrimitiveGroups"
        :key="item"
        :label="item"
        :value="item">
      </el-option>
    </el-select>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Option,
  Select
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Option);
Vue.use(Select);
var orderBy = require("lodash/orderBy");
var uniq = require("lodash/uniq");

export default {
  name: "SelectControls",
  methods: {
    organsAdded: function(name) {
      let tmpArray = uniq(this.sortedPrimitiveGroups.concat([name]));
      this.sortedPrimitiveGroups = orderBy(tmpArray);
      this.module.changeOrganPartsVisibility(name, false);
    },
    clear: function() {
      this.sortedPrimitiveGroups = [];
      this.checkedItems = [];
      this.$emit("object-selected", undefined);
    },
    getPrimitivesListWithGroupName: function(scene, type, name) {
      let array = [];
      if (type == "Surfaces") 
        array = this.module.scene.findGeometriesWithGroupName(name);
      return array[0];
    }, 
    tagsOnClicked: function(e) {
      e.stopPropagation();
      if (this.activeRegion.element)
        this.activeRegion.element.classList.remove("activeTag");
      this.activeRegion.element = e.srcElement.parentNode;
      this.activeRegion.element.classList.add("activeTag");
      this.activeRegion.name = e.srcElement.innerText;
      let activeObject = this.getPrimitivesListWithGroupName(this.module.scene, "Surfaces",
        this.activeRegion.name);
      if (activeObject)
        this.$emit("object-selected", activeObject);
    },
    addTagsEventListener: function(tags) {
      tags.forEach(tag => {
        tag.addEventListener('click', this.tagsOnClicked);
      });
    },
    handleChange: function() {
      for (let i = 0; i < this.checkedItems.length; i++)
        this.module.changeOrganPartsVisibility(this.checkedItems[i], true);
      this.$nextTick(() => {
        const tags = Array.prototype.slice.call(this.$refs.select.querySelectorAll('.el-select__tags-text'))
        this.addTagsEventListener(tags);
      })
    },
    tagRemoved: function(removedValue) {
      this.module.changeOrganPartsVisibility(removedValue, false);
      if (this.activeRegion.name === removedValue) {
        this.activeRegion.element.classList.remove("activeTag");
        this.$emit("object-selected", undefined);
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
      let tmpArray = uniq(this.sortedPrimitiveGroups.concat(this.module.sceneData.geometries));
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    },
    "module.sceneData.lines": function() {
      let tmpArray = uniq(this.sortedPrimitiveGroups.concat(this.module.sceneData.lines));
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    },
    "module.sceneData.glyphsets": function() {
      let tmpArray = uniq(this.sortedPrimitiveGroups.concat(this.module.sceneData.glyphsets));
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    },
    "module.sceneData.pointsets": function() {
      let tmpArray = uniq(this.sortedPrimitiveGroups.concat(this.module.sceneData.pointset));
      this.sortedPrimitiveGroups = orderBy(tmpArray);
    }
  },
  created: function() {
    this.activeRegion = {element: undefined, name: ""};
    let tmpArray = this.module.sceneData.geometries.concat(this.module.sceneData.lines);
    tmpArray = tmpArray.concat(this.module.sceneData.glyphsets);
    tmpArray = uniq(tmpArray.concat(this.module.sceneData.pointset));
    this.sortedPrimitiveGroups = orderBy(tmpArray);
    for (let i = 0; i < this.sortedPrimitiveGroups.length; i++) {
      if (this.sortedPrimitiveGroups[i])
        this.module.changeOrganPartsVisibility(this.sortedPrimitiveGroups[i], false);
    }
    this.module.addOrganPartAddedCallback(this.organsAdded);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

>>> .el-select .el-input .el-input__inner {
  border-color:#8300bf;
}

>>> .el-select .el-tag__close.el-icon-close {
  background-color:#8300bf;
}

.select-container {
  position: absolute;
  top: 54px;
  left: 17px;
  max-height: 500px;
  text-align: left;
}

>>> .activeTag {
  background-color:#ccc;
}

>>> .el-tag.el-tag--info {
  color:#8300bf;
  cursor: pointer;
}

</style>

<style scoped src="../styles/purple/option.css">
</style>
<style scoped src="../styles/purple/select.css">
</style>

