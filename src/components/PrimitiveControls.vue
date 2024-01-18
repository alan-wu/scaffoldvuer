<template>
  <div
    v-show="material || isTextureSlides"
    class="primitive-controls"
  >
    <el-drawer
      :class="{
        'my-drawer': true,
        'drawer-content': true,
        'opacity': material !== undefined,
        'texture-slides': isTextureSlides,
      }"
      :visible.sync="drawerOpen"
      :teleported="false"
      :modal-append-to-body="false"
      size="300"
      :with-header="false"
      :wrapper-closable="false"
      :modal="false"
    >
      <div
        v-if="drawerOpen"
        class="tab-button close"
        @click="toggleDrawer"
      >
      <el-icon><el-icon-arrow-right/></el-icon>
      </div>
      <opacity-controls
        :material="material"
        ref="opacityControls" />
      <texture-slides-controls
        v-show="isTextureSlides"
        class="controls"
        ref="tSlidesControls" />
    </el-drawer>
    <div
      v-if="!drawerOpen"
      class="tab-button open"
      @click="toggleDrawer"
    >
    <el-icon-arrow-left class="el-icon-arrow-left"/>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  ArrowRight as ElIconArrowRight,
  ArrowLeft as ElIconArrowLeft,
} from '@element-plus/icons-vue'
import OpacityControls from "./OpacityControls.vue";
import TextureSlidesControls from "./TextureSlidesControls.vue";
import { ElDrawer as Drawer } from "element-plus";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "PrimitiveControls",
  components: {
    Drawer,
    OpacityControls,
    TextureSlidesControls,
  },
  data: function() {
    return {
      material: undefined,
      isTextureSlides: false,
      drawerOpen: true,
    };
  },
  mounted: function() {
    this._zincobject = undefined;
  },
  methods: {
    formatTooltip: function(val) {
      this.displayString = Math.floor(100 * val + 0.5) + "%";
      return this.displayString;
    },
    toggleDrawer: function() {
      this.drawerOpen = !this.drawerOpen;
    },
    setObject: function(object) {
      this._zincobject = object;
      if (object.isTextureSlides) {
        this.isTextureSlides = true;
        this.$refs.tSlidesControls.setObject(object);
      } else {
        this.isTextureSlides = false;
      }
      if (object && object.getMorph()) {
        this.material = object.getMorph().material;
      }
      else this.material = undefined;
      this.$refs.opacityControls.setObject(object);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@use "element-plus/theme-chalk/src/container";
@use "element-plus/theme-chalk/src/drawer";
@use "element-plus/theme-chalk/src/slider";

.primitive-controls {
  text-align: left;
  width:350px;
  pointer-events:none;
}

.display {
  width: 44px;
}

.icon {
  right: 17px;
  position: absolute;
  top: 10px;
}

.drawer-content {
  position: relative;
  &.opacity {
    height: 93px;
  }
  &.texture-slides{
    height: 250px;
  }
}

:deep(.my-drawer) {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}

.tab-button {
  width: 20px;
  height: 40px;
  z-index: 8;
  right: 0px;
  
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #FFFFFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
  //transition: bottom 0.3s;

  &.close {
    float: left;
    flex: 1;
    border-right: 0;
    bottom: 26px;
  }

  &.open {
    position: absolute;
    bottom:26px;
  }

  i {
    margin-top: 12px;
    color: $app-primary-color;
    transform: scaleY(2.5);
  }
}

</style>
