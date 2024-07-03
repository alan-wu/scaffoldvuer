<template>
  <div
    v-show="material || isTextureSlides"
    class="primitive-controls"
    :class="{ open: drawerOpen, close: !drawerOpen }"
  >
    <div class="my-drawer" :class="{ open: drawerOpen, close: !drawerOpen }">
      <el-collapse class="collapse" v-model="activeName" accordion>
        <el-collapse-item title="Opacity" name="oControls" v-show="!isTextureSlides" >
          <opacity-controls
            :material="material"
            :zincObject="zincObject"
            ref="opacityControls" />
        </el-collapse-item>
        <el-collapse-item title="Transformation" name="trControls">
          <transformation-controls
            class="transformation-controls"
            ref="transformationControls" />
        </el-collapse-item>
        <el-collapse-item v-show="isTextureSlides" title="Texture Slides" name="tsControls">
          <texture-slides-controls
            class="texture-controls"
            ref="tSlidesControls" />
        </el-collapse-item>
        <el-collapse-item v-show="isPointset" title="Points" name="pControls">
          <points-controls
            class="pointset-controls"
            ref="pointsetControls" />
        </el-collapse-item>
        <el-collapse-item v-show="isLines" title="Lines" name="lControls">
          <lines-controls
            class="lines-controls"
            ref="linesControls"
            :createData="createData" />
        </el-collapse-item>
      </el-collapse>
    </div>
    <div
      class="drawer-button"
      :class="{ open: drawerOpen, close: !drawerOpen }"
      @click="toggleDrawer"
    >
      <el-icon><el-icon-arrow-right /></el-icon>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { ref, shallowRef } from 'vue';
import {
  ArrowRight as ElIconArrowRight,
} from '@element-plus/icons-vue';
import {
  ElCollapse as Collapse,
  ElCollapseItem as CollapseItem,
} from "element-plus";

import OpacityControls from "./OpacityControls.vue";
import PointsControls from "./PointsControls.vue";
import LinesControls from "./LinesControls.vue";
import TextureSlidesControls from "./TextureSlidesControls.vue";
import TransformationControls from "./TransformationControls.vue";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "PrimitiveControls",
  components: {
    Collapse,
    CollapseItem,
    LinesControls,
    OpacityControls,
    PointsControls,
    TextureSlidesControls,
    TransformationControls,
    ElIconArrowRight,
  },
  props: {
    createData: {
      type: Object,
    },
  },
  data: function() {
    return {
      activeName: "oControls",
      material: undefined,
      isTextureSlides: false,
      isPointset: false,
      isLines: false,
      drawerOpen: true,
      zincObject: undefined,
    };
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
      if (object) {
        this.zincObject = shallowRef(object);
      } else {
        this.zincObject = undefined;
      }
      this.isPointset = false;
      this.isTextureSlides = false;
      this.isLines = false;
      this.activeName  = "trControls";
      if (object) {
        if (object.isTextureSlides) {
          this.isTextureSlides = true;
          this.$refs.tSlidesControls.setObject(object);
          this.activeName = "tsControls";
        } else if (object.isPointset) {
          this.isPointset = true;
          this.$refs.pointsetControls.setObject(object);
          this.activeName = "pControls";
        } else if (object.isLines2) {
          this.isLines = true;
          this.$refs.linesControls.setObject(object);
          this.activeName = "lControls";
        }
        if (!object.isTextureSlides) {
          this.$refs.transformationControls.setObject(object);
        }
      }
      if (object && object.getMorph()) {
        this.material = ref(object.getMorph().material);
      } else {
        this.material = undefined;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.primitive-controls {
  position: absolute;
  bottom: 30%;
  transition: all 1s ease;

  &.open {
    right: 0px;
    .my-drawer {
      opacity: 1;
    }
  }
  &.close {
    right: -250px;
    .my-drawer {
      pointer-events: none;
      opacity: 0;
    }
  }
}
.my-drawer {
  transition: all 1s ease;
  float: right;
  max-height: 150px;
  text-align: left;
  background: #ffffff;
  width:250px;
  .collapse {
    border: 1px solid rgb(220, 223, 230);
    :deep(.el-collapse-item__header) {
      padding-left: 8px;
    }
    :deep(.el-collapse-item__content) {
      padding-bottom: 8px;
    }
  }
}

.drawer-button {
  float: right;
  width: 20px;
  height: 40px;
  z-index: 8;
  border: solid 1px $app-primary-color;
  background-color: #f9f2fc;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
  margin-top: 25px;

  i {
    font-weight: 600;
    margin-top: 12px;
    color: $app-primary-color;
    transition-delay: 0.9s;
  }
  &.open {
    i {
      transform: rotate(0deg) scaleY(2.5);
    }
  }
  &.close {
    i {
      transform: rotate(180deg) scaleY(2.5);
    }
  }
}

</style>
