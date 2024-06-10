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
          v-loading="!isReady"
          show-checkbox
          element-loading-background="rgba(0, 0, 0, 0.3)"
          :check-strictly="false"
          :data="treeDataEntry"
          :expand-on-click-node="false"
          :render-after-expand="false"
          @check="checkChanged"
        >
          <template #default="{ node, data }">
            <span
              class="region-tree-node"
              :class="{
                activeItem: active.includes(data.id),
                hoverItem: hover.includes(data.id),
              }"
              @click="changeActiveByNode(data, true)"
              @mouseover="changeHoverByNode(data, true)"
            >
              <el-color-picker
                v-if="data.isPrimitives"
                :class="{ 'show-picker': showColourPicker }"
                v-model="data.activeColour"
                size="small"
                :popper-class="myPopperClass"
                @change="setColour(data, $event)"
              />
              <span>{{ node.label }}</span>
              <span v-if="data.isTextureSlides" class="node-options">
                (Texture)
              </span>
          </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div
      class="drawer-button"
      :class="{ open: drawerOpen, close: !drawerOpen }"
      @click="toggleDrawer"
    >
      <el-icon><el-icon-arrow-left /></el-icon>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  ArrowLeft as ElIconArrowLeft,
} from '@element-plus/icons-vue'
import {
  ElCheckbox as Checkbox,
  ElCheckboxGroup as CheckboxGroup,
  ElColorPicker as ColorPicker,
  ElLoading as Loading,
  ElRow as Row,
  ElTree as Tree,
} from "element-plus";
import {
  convertUUIDsToFullPaths,
  createListFromPrimitives,
  extractAllFullPaths,
  findObjectsWithNames,
} from "../scripts/Utilities.js";

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
  components: {
    ElIconArrowLeft,
    Checkbox,
    CheckboxGroup,
    ColorPicker,
    Loading,
    Row,
    Tree,
  },
  props: {
    /**
     * Enable/disable colour picker
     */
    showColourPicker: Boolean,
    isReady: Boolean,
  },
  data: function () {
    return {
      treeData: [{ label: "Root", regionPath: "", id: undefined, children: [] }],
      active: [],
      hover: [],
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
  computed: {
    treeDataEntry: function () {
      this.treeData[0].children.map((data) => {
        this.setColourField(data)
      });
      return this.treeData[0].children;
    },
  },
  unmounted: function () {
    this.sortedPrimitiveGroups = undefined;
  },
  methods: {
    addTreeItem: function (parentContainer, item, object) {
      //The following block prevent duplicate graphics with the same name
      if (parentContainer.some(child => child.label === item.label)) {
        return;
      }
      parentContainer.push(item);
      parentContainer.sort((a, b) => {
        return nameSorting(a, b);
      });
      this.__nodeNumbers++;
      this.$nextTick(() => {
        const checked = this.$refs.regionTree.getCheckedKeys();
        if (!checked.includes(item.id) && object.getVisibility()) {
          this.$refs.regionTree.setChecked(item.id, true);
        }
      });
    },
    // find or create new region, region id is always prefixed with
    // '__r/'
    findOrCreateRegion: function (data, paths, prefix) {
      //check if root region has been set
      if (
        this.rootID === undefined &&
        this.$module &&
        this.$module.scene
      ) {
        this.treeData[0].id = this.$module.scene.getRootRegion().uuid;
        this.treeData[0].isRegion = true;
      }
      if (paths.length > 0) {
        const _paths = [...paths];
        let childRegionItem = data.children.find(
          (child) => child.label == _paths[0]
        );
        const path = prefix + "/" + paths[0];
        const region = this.$module.scene.getRootRegion().findChildFromPath(path);
        if (!childRegionItem) {
          childRegionItem = {
            label: _paths[0],
            id: region.uuid,
            children: [],
            regionPath: path,
            isRegion: true,
          };
          this.addTreeItem(data.children, childRegionItem, region);
        }
        _paths.shift();
        return this.findOrCreateRegion(childRegionItem, _paths, path);
      } else {
        return data;
      }
    },
    /**
     * This is called when a new zinc object is read into the scene.
     */
    zincObjectAdded: function (zincObject) {
      // Using the new uuid, the cavaet of that is graphics with
      // same groupName will have different uuid. So in the tree control
      // We use the first uuid found for a group of primitives with same
      // group names to represent all of them.
      const region = zincObject.region;
      if (region) {
        const paths = region.getFullSeparatedPath();
        const regionData = this.findOrCreateRegion(this.treeData[0], paths, "");
        if (zincObject.groupName) {
          if (regionData) {
            if (!regionData.children) {
              regionData.children = [];
            }
            const child = {
              label: zincObject.groupName,
              id: region.uuid + "/" + zincObject.uuid,
              isPrimitives: true,
              regionPath: zincObject.region.getFullPath(),
              isTextureSlides: zincObject.isTextureSlides ? true : false,
            };
            this.addTreeItem(regionData.children, child, zincObject);
          }
        }
      }
    },
    checkChanged: function (node, data) {
      const isRegion = node.isRegion;
      const isPrimitives = node.isPrimitives;
      const isChecked = data.checkedKeys.includes(node.id);
      const region = this.$module.scene
        .getRootRegion()
        .findChildFromPath(node.regionPath);
      if (isRegion) {
        isChecked ? region.showAllPrimitives() : region.hideAllPrimitives();
      }
      if (isPrimitives) {
        const primitives = region.findObjectsWithGroupName(node.label);
        primitives.forEach((primitive) => {
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
      const targetObjects = findObjectsWithNames(
        rootRegion,
        names,
        regionPath,
        true
      );
      this.changeActiveByPrimitives(targetObjects, propagate);
    },
    /**
     * Hover a region by its name.
     */
    changeHoverByNames: function (names, regionPath, propagate) {
      const rootRegion = this.$module.scene.getRootRegion();
      const targetObjects = findObjectsWithNames(
        rootRegion,
        names,
        regionPath,
        true
      );
      this.changeHoverByPrimitives(targetObjects, propagate);
    },
    changeActiveByNode: function (node, propagate) {
      if (node.isPrimitives || node.isRegion) {
        const transverse = node.isRegion ? true : false;
        const targetObjects = this.getZincObjectsFromNode(node, transverse);
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
      this.active.length = 0;
      this.hover.length = 0;
      this.__nodeNumbers = 0;
      this.$refs.regionTree.updateKeyChildren(this.treeData[0].id, []);
      this.treeData[0].children.length = 0;
      this.treeData[0].id = undefined;
      this.$emit("object-selected", []);
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
    getZincObjectsFromNode: function (node, transverse) {
      const rootRegion = this.$module.scene.getRootRegion();
      if (node.isPrimitives) {
        return findObjectsWithNames(
          rootRegion,
          node.label,
          node.regionPath,
          transverse
        );
      } else if (node.isRegion) {
        if (node.regionPath) {
          let targetRegion = rootRegion.findChildFromPath(node.regionPath);
          if (targetRegion) {
            return targetRegion.getAllObjects(transverse);
          }
        }
      }
      return [];
    },
    //Set this right at the beginning.
    setModule: function (moduleIn) {
      this.$module = moduleIn;
      this.__nodeNumbers = 0;
      const objects = this.$module.scene.getRootRegion().getAllObjects(true);
      objects.forEach((zincObject) => {
        this.zincObjectAdded(zincObject);
      });
      this.$module.addOrganPartAddedCallback(this.zincObjectAdded);

    },
    setColourField: function (nodeData) {
      this.treeData[0].children
        .filter((data) => data.id === nodeData.id)
        .map((data) => {
          const colour = this.getColour(data)
          if (!data.defaultColour) {
            data['defaultColour'] = colour
          }
          data['activeColour'] = colour
        });
    },
    setColour: function (nodeData, value) {
      if (nodeData && nodeData.isPrimitives) {
        const targetObjects = this.getZincObjectsFromNode(nodeData, false);
        targetObjects.forEach((primitive) => {
          // Click clear will return null, so set it to the default colour
          const activeColour = value ? value : nodeData.defaultColour;
          let hexString = activeColour.replace("#", "0x");
          primitive.setColourHex(hexString);
          this.setColourField(nodeData)
        });
      }
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
    //Set visibility using full paths and add found id to the ids list
    //and remove item from list if remove is set to true.
    setTreeVisibilityWithFullPaths: function (node, list, ids, remove) {
      let flag = false;
      let nodeName = "";
      if (node.isRegion) {
        nodeName = `__r${node.regionPath}`;
      }
      if (node.isPrimitives) {
        nodeName = `${node.regionPath}/${node.label}`;
      }
      //Find the node in list, remove it from list if remove flag is on
      const index = list.indexOf(nodeName);
      if (index > -1) {
        flag = true;
        list.splice(index, 1);
        ids.push(node.id);
      }
      const region = this.$module.scene
        .getRootRegion()
        .findChildFromPath(node.regionPath);
      if (nodeName && (nodeName !== "__r")) {
        if (node.isPrimitives) {
          const primitives = region.findObjectsWithGroupName(node.label);
          primitives.forEach((primitive) => primitive.setVisibility(flag));
        }
      }
      if (node.children) {
        node.children.forEach((child) => {
          this.setTreeVisibilityWithFullPaths(child, list, ids, true);
        });
      }
    },
    checkAllKeys: function () {
      const keysList = [];
      const ids = [];
      extractAllFullPaths(this.treeData[0], keysList);
      this.setTreeVisibilityWithFullPaths(this.treeData[0],
        keysList, ids, true);
      this.$refs.regionTree.setCheckedKeys(ids);
    },
    getState: function () {
      let checkedItems = this.$refs.regionTree.getCheckedKeys();
      if (checkedItems.length === this.__nodeNumbers) {
        return { checkAll: true, version: "2.0" };
      } else {
        //We cannot use the generated uuid as the identifier for permastate,
        //convert it back to paths
        let paths = convertUUIDsToFullPaths(this.$module.scene.getRootRegion(),
          checkedItems);
        return { checkedItems: paths, version: "2.0" };
      }
    },
    setState: function (state) {
      if (state) {
        if (state.checkAll) {
          this.checkAllKeys();
        } else if (state.checkedItems) {
          let list = [];
          if (state.version !== "2.0") {
            list = state.checkedItems.map((item) => "/" + item);
            list.shift("__r/");
          } else {
            list.push(...state.checkedItems);
          }
          const ids = [];
          this.setTreeVisibilityWithFullPaths(this.treeData[0], list,
            ids, true);
          this.$refs.regionTree.setCheckedKeys(ids);
        }
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

:deep(.el-loading-spinner) {
  .path {
    stroke: $app-primary-color;
  }
  .el-loading-text {
    color: $app-primary-color;
  }
}

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

  :deep(.el-tree) {
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

  :deep(.el-tree-node__content) {
    height: 22px;
  }
}

:deep(.el-checkbox__input) {
  &.is-indeterminate,
  &.is-checked {
    .el-checkbox__inner {
      background-color: $app-primary-color;
      border-color: $app-primary-color;
    }
  }
}

:deep(.el-color-picker__color) {
  border: 1px solid $app-primary-color;
}

:deep(.el-checkbox__label) {
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

  :deep(.el-color-picker) {
    height: 14px !important;
  }

  :deep(.el-color-picker__trigger) {
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

:deep(.el-color-picker__icon) {
  &.el-icon-arrow-down {
    display: none;
  }
}

:deep(.show-picker) {
  .el-color-picker__icon {
    &.el-icon-arrow-down {
      display: block;
    }
  }
}

.drawer-button {
  float: left;
  width: 20px;
  height: 40px;
  z-index: 8;
  margin-top: calc(50% - 52px);
  border: solid 1px $app-primary-color;
  background-color: #f9f2fc;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.drawer-button {
  i {
    font-weight: 600;
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

.node-options {
  text-align: right;
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

