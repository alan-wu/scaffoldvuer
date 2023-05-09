<template>
  <div
    class="tree-controls"
    :class="{ open: drawerOpen, close: !drawerOpen }"
  >
    <div class="traditional-container">
      <el-row>
        <el-col :span="12">
          <div class="regions-display-text">
            Regions
          </div>
        </el-col>
      </el-row>
      <div class="tree-container">
        <el-tree
          ref="regionTree"
          node-key="id"
          show-checkbox
          :check-strictly="false"
          :data="treeData[0].children"
          :expand-on-click-node="false"
          :render-after-expand="false"
          @check="checkChanged"
        >
          <span
            slot-scope="{ node, data }"
            class="region-tree-node"
            :class="{
              activeItem: nodeIsActive(data),
              hoverItem: nodeIsHover(data),
            }"
            @click="changeActiveByNode(data, true)"
            @mouseover="changeHoverByNode(data, true)"
          >
            <el-color-picker
              v-if="data.isPrimitives"
              :class="{ 'show-picker': showColourPicker }"
              :value="getColour(data)"
              size="small"
              :popper-class="myPopperClass"
              @change="setColour(data, $event)"
            />
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </div>
    <div
      class="drawer-button"
      :class="{ open: drawerOpen, close: !drawerOpen }"
      @click="toggleDrawer"
    >
      <i class="el-icon-arrow-left" />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Checkbox, CheckboxGroup, ColorPicker, Row, Tree } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import { createListFromPrimitives, extractAllIds, findObjectsWithNames } from "../scripts/utilities.js";

const orderBy = require("lodash/orderBy");
const uniq = require("lodash/uniq");
locale.use(lang);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(ColorPicker);
Vue.use(Row);
Vue.use(Tree);

const nameSorting = (a, b) => {
  const labelA = a.label.toUpperCase();
  const labelB = b.label.toUpperCase();
  if (labelA < labelB) {
    return -1;
  }
  if (labelA > labelB) {
    return 1;
  }
  return 0;
};

/**
 * A vue component for toggling visibility of various regions.
 */
export default {
  name: "TreeControls",
  props: {
    /**
     * Enable/disable colour picker
     */
    showColourPicker: Boolean,
  },
  data: function () {
    return {
      treeData: [{ label: "Root", id: "__r/", children: [] }],
      active: [{group: "", regionPath: undefined}],
      hover: [{group: "", regionPath: undefined}],
      myPopperClass: "hide-scaffold-colour-popup",
      drawerOpen: true,
    };
  },
  watch: {
    showColourPicker: {
      immediate: true,
      handler: function () {
        if (this.showColourPicker) this.myPopperClass = "showPicker";
        else this.myPopperClass = "hide-scaffold-colour-popup";
      },
    },
  },
  destroyed: function () {
    this.sortedPrimitiveGroups = undefined;
  },
  methods: {
    addTreeItem: function (parentContainer, item) {
      //The following block prevent duplicate graphics with the same name
      for (let i = 0; i < parentContainer.length; i++) {
        if (parentContainer[i].id === item.id) {
          if (item.isPrimitives && parentContainer[i].isPrimitives) {
            return;
          }
        }
      }
      parentContainer.push(item);
      parentContainer.sort((a, b) => {
        return nameSorting(a, b);
      });
      this.__nodeNumbers++;
      this.$nextTick(() => {
        this.$refs.regionTree.setChecked(item.id, true);
      });
    },
    // find or create new region, region id is always prefixed with
    // '__r/'
    findOrCreateRegion: function (data, paths, prefix) {
      //check if root region has been set
      if ((this.treeData[0].regionPath === undefined) && this.$module && this.$module.scene) {
        this.treeData[0].regionPath = "";
        this.treeData[0].isRegion = true;
      }
      if (paths.length > 0) {
        const _paths = [...paths];
        let childRegion = data.children.find(
          (child) => child.label == _paths[0]
        );
        const path = prefix + "/" + paths[0];
        const id = "__r" + path;
        if (!childRegion) {
          childRegion = {
            label: _paths[0],
            id: id,
            children: [],
            regionPath: path,
            isRegion: true,
          };
          this.addTreeItem(data.children, childRegion);
        }
        _paths.shift();
        return this.findOrCreateRegion(childRegion, _paths, path);
      } else {
        return data;
      }
    },
    nodeIsActive: function(data) {
      for (let i = 0; i < this.active.length; i++) {
        let item = this.active[i];
        if (item.group === data.label && 
          ((item.regionPath === data.regionPath) || 
          item.regionPath === undefined)) {
          return true;
        }
      }
      return false;
    },
    nodeIsHover: function(data) {
      for (let i = 0; i < this.hover.length; i++) {
        let item = this.hover[i];
        if (item.group === data.label && 
          ((item.regionPath === data.regionPath) || 
          item.regionPath === undefined)) {
          return true;
        }
      }
      return false;
    },
    /**
     * This is called when a new zinc object is read into the scene.
     */
    zincObjectAdded: function (zincObject) {
      const region = zincObject.region;
      if (region) {
        const paths = region.getFullSeparatedPath();
        const regionData = this.findOrCreateRegion(this.treeData[0], paths, "");
        if (zincObject.groupName) {
          if (regionData) {
            if (!regionData.children) {
              regionData.children = [];
            }
            let id =
              regionData.id.replace("__r/", "") + "/" + zincObject.groupName;
            const child = {
              label: zincObject.groupName,
              id: id,
              isPrimitives: true,
              regionPath: zincObject.region.getFullPath(),
            };
            this.addTreeItem(regionData.children, child);
          }
        }
      }
    },
    checkChanged: function (node, data) {
      const isRegion = node.isRegion;
      const isPrimitives = node.isPrimitives;
      const isChecked = data.checkedKeys.includes(node.id);
      const region = this.$module.scene.getRootRegion().findChildFromPath(node.regionPath);
      if (isRegion) {
        isChecked ? region.showAllPrimitives() : region.hideAllPrimitives();
      }
      if (isPrimitives) {
        const primitives = region.findObjectsWithGroupName(node.label);
        primitives.forEach(primitive => {
          primitive.setVisibility(isChecked);
        });
      }
    },
    updateActiveUI: function (primitives) {
      this.active.length = 0;
      createListFromPrimitives(primitives, this.active);
    },
    changeActiveByPrimitives: function (primitives, propagate) {
      if (primitives && primitives.length > 0) {
        this.updateActiveUI(primitives);
        this.$emit("object-selected", primitives, propagate);
      } else {
        this.removeActive(propagate);
      }
      this.removeHover(propagate);
    },
    updateHoverUI: function (primitives) {
      this.hover.length = 0;
      createListFromPrimitives(primitives, this.hover);
    },
    changeHoverByPrimitives: function (primitives, propagate) {
      if (primitives && primitives.length > 0) {
        this.updateHoverUI(primitives);
        this.$emit("object-hovered", primitives, propagate);
      } else {
        this.removeHover(propagate);
      }
    },
    /**
     * Select a region by its name.
     */
    changeActiveByNames: function (names, regionPath, propagate) {
      const rootRegion = this.$module.scene.getRootRegion();
      const targetObjects = findObjectsWithNames(rootRegion, names,
        regionPath, true);
      this.changeActiveByPrimitives(targetObjects, propagate);
    },
    /**
     * Hover a region by its name.
     */
    changeHoverByNames: function (names, regionPath, propagate) {
      const rootRegion = this.$module.scene.getRootRegion();
      const targetObjects = findObjectsWithNames(rootRegion, names,
        regionPath, true);
      this.changeHoverByPrimitives(targetObjects, propagate);
    },
    changeActiveByNode: function (node, propagate) {
      if (node.isPrimitives) {
        const targetObjects = this.getZincObjectsFromNode(node, false);
        this.changeActiveByPrimitives(targetObjects, propagate);
      }
    },
    changeHoverByNode: function (node, propagate) {
      if (node.isPrimitives) {
        const targetObjects = this.getZincObjectsFromNode(node, false);
        this.changeHoverByPrimitives(targetObjects, propagate);
      }
    },
    /**
     * Unselect the current selected region.
     */
    removeActive: function (propagate) {
      this.active = [];
      this.$emit("object-selected", [], propagate);
    },
    /**
     * Unselect the current hover region.
     */
    removeHover: function (propagate) {
      this.hover = [];
      this.$emit("object-hovered", [], propagate);
    },
    /**
     * Reset the controls.
     */
    clear: function () {
      this.active.group = "";
      this.active.regionPath = undefined;
      this.hover.group = "";
      this.hover.regionPath = undefined;
      this.$refs.regionTree.updateKeyChildren( "__r/", []);
      this.treeData[0].children.length = 0;
      this.$emit("object-selected", undefined);
    },
    getColour: function (nodeData) {
      //Do not need to check for primitives as this is checked on the template
      if (nodeData) {
        const targetObjects = this.getZincObjectsFromNode(nodeData, false);
        let graphic = targetObjects[0];
        if (graphic) {
          let hex = graphic.getColourHex();
          if (hex) return "#" + hex;
        }
      }
      return "#FFFFFF";
    },
    getZincObjectsFromNode: function(node, transverse) {
      const rootRegion = this.$module.scene.getRootRegion();
      return findObjectsWithNames(rootRegion, node.label,
        node.regionPath, transverse);
    },
    //Set this right at the beginning.
    setModule: function (moduleIn) {
      this.$module = moduleIn;
      this.$module.primitiveData.geometries.forEach(zincObject => {
        this.zincObjectAdded(zincObject);
      });
      this.$module.primitiveData.lines.forEach(zincObject => {
        this.zincObjectAdded(zincObject);
      });
      this.$module.primitiveData.glyphsets.forEach(zincObject => {
        this.zincObjectAdded(zincObject);
      });
      this.$module.primitiveData.pointsets.forEach(zincObject => {
        this.zincObjectAdded(zincObject);
      });
      this.$module.addOrganPartAddedCallback(this.zincObjectAdded);
      this.__nodeNumbers = 1;
    },
    setColour: function (nodeData, value) {
      if (nodeData && nodeData.isPrimitives) {
        const targetObjects = this.getZincObjectsFromNode(nodeData, false);
        targetObjects.forEach(primitive => {
          let hexString = value.replace("#", "0x");
          primitive.setColourHex(hexString);
        });
      }
    },
    viewAll: function () {
      this.$module.viewAll();
    },
    visibilityToggle: function (item, event) {
      this.$module.changeOrganPartsVisibility(item, event);
      if (event == false) {
        if (this.activeRegion === item) {
          this.removeActive(true);
        }
        if (this.hoverRegion === item) {
          this.removeHover(true);
        }
      }
    },
    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen;
      this.$emit("drawer-toggled", this.drawerOpen);
    },
    setTreeVisibility: function(node, list) {
      let flag = false;
      if (list.includes(node.id)) flag = true;
      const region = this.$module.scene.getRootRegion().findChildFromPath(node.regionPath);
      if (node.isRegion)
        region.setVisibility(flag);
      if (node.isPrimitives) {
        const primitives = region.findObjectsWithGroupName(node.label);
        primitives.forEach(primitive => primitive.setVisibility(flag))
      }
      if (node.children)
        node.children.forEach(child => this.setTreeVisibility(child, list));
    },
    checkAllKeys: function () {
      const keysList = [];
      extractAllIds(this.treeData[0], keysList);
      this.setTreeVisibility(this.treeData[0], keysList);
      this.$refs.regionTree.setCheckedKeys(keysList);
    },
    getState: function () {
      let checkedItems = this.$refs.regionTree.getCheckedKeys();
      if (checkedItems.length === this.__nodeNumbers)
        return { checkAll: true, version: "2.0" };
      return { checkedItems: checkedItems, version: "2.0" };
    },
    setState: function (state) {
      if (state) {
        if (state.checkAll) {
          this.checkAllKeys(); 
        } else if (state.checkedItems) {
          let list = [];
          if (state.version !== "2.0") {
            list = state.checkedItems.map(item => "/" + item);
            list.shift("__r/");
          } else {
            list.push(...state.checkedItems);
          }
          this.setTreeVisibility(this.treeData[0], list);
          this.$refs.regionTree.setCheckedKeys(list);
        }
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/checkbox";
@import "~element-ui/packages/theme-chalk/src/color-picker";
@import "~element-ui/packages/theme-chalk/src/row";
@import "~element-ui/packages/theme-chalk/src/tree";

.checkbox-container {
  display: flex;
  cursor: pointer;
}

.tree-controls {
  position: absolute;
  bottom: 0px;
  transition: all 1s ease;

  &:focus {
    outline: none;
  }
  &.open {
    left: 0px;
    .traditional-container {
      opacity: 1;
    }
  }
  &.close {
    left: -298px;
    .traditional-container {
      pointer-events: none;
      opacity: 0;
    }
  }
}

.traditional-container {
  transition: all 1s ease;
  float: left;
  padding-left: 16px;
  padding-right: 18px;
  max-height: calc(100% - 154px);
  text-align: left;
  overflow: none;
  border: 1px solid rgb(220, 223, 230);
  padding-top: 7px;
  padding-bottom: 16px;
  background: #ffffff;
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

.tree-container {
  width: 260px;
  border: 1px solid rgb(144, 147, 153);
  border-radius: 4px;
  background: #ffffff;
  margin-top: 6px;
  scrollbar-width: thin;

  ::v-deep .el-tree {
    max-height: 240px;
    min-height: 130px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      box-shadow: inset 0 0 6px #c0c4cc;
    }
  }

  ::v-deep .el-tree-node__content {
    height: 22px;
  }
}

::v-deep .el-checkbox__input {
  &.is-indeterminate,
  &.is-checked {
    .el-checkbox__inner {
      background-color: $app-primary-color;
      border-color: $app-primary-color;
    }
  }
}

::v-deep .el-color-picker__color {
  border: 1px solid $app-primary-color;
}

::v-deep .el-checkbox__label {
  padding-left: 5px;
  color: $app-primary-color !important;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
}

.activeItem {
  background-color: #bbb !important;
}

.region-tree-node {
  flex: 1;
  color: $app-primary-color !important;
  display: flex;
  font-size: 12px;
  line-height: 14px;
  padding-left: 0px;
  background-color: #fff;
  width: 100%;

  ::v-deep .el-color-picker {
    height: 14px !important;
  }

  ::v-deep .el-color-picker__trigger {
    margin-left: 8px;
    margin-right: 8px;
    padding: 0px;
    height: 14px;
    width: 14px;
    border: 0px;
  }
}

.hoverItem {
  background-color: #eee !important;
}

::v-deep .el-color-picker__icon {
  &.el-icon-arrow-down {
    display: none;
  }
}

::v-deep .show-picker {
  .el-color-picker__icon {
    &.el-icon-arrow-down {
      display: block;
    }
  }
}

::v-deep .my-drawer {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}

.drawer {
  ::v-deep .el-drawer:focus {
    outline: none;
  }
}

.open-drawer {
  width: 20px;
  height: 40px;
  z-index: 8;
  position: absolute;
  left: 0px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #f7faff;
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
  margin-top: calc(50% - 52px);
  border: solid 1px $app-primary-color;
  background-color: #F9F2FC;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.drawer-button {
  i {
    font-weight:600;
    margin-top: 12px;
    color: $app-primary-color;
    transition-delay: 0.9s;
  }
  &.open {
    i {
      transform: rotate(0deg) scaleY(2);
    }
  }
  &.close {
    i {
      transform: rotate(180deg) scaleY(2);
    }
  }
}

.drawer-button.open i {
  transform: rotate(0deg) scaleY(2.5);
}

.drawer-button.close i {
  transform: rotate(180deg) scaleY(2.5);
}
</style>

<style>
.hide-scaffold-colour-popup {
  display: none;
}
</style>

