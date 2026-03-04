<template>
  <div v-show="hasValidPrimitive" class="my-drawer">
    <el-collapse class="collapse" v-model="activeName" accordion>
      <el-collapse-item title="Opacity" name="oControls" v-show="!isTextureSlides" >
        <opacity-controls
          :material="material"
          :zincObject="zincObject"
          ref="opacityControls" />
      </el-collapse-item>
      <el-collapse-item v-show="!isEditable" title="Transformation" name="trControls">
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
          ref="pointsetControls"
          @primitivesUpdated="$emit('primitivesUpdated', $event)"
        />
      </el-collapse-item>
      <el-collapse-item v-show="isLines" title="Lines" name="lControls">
        <lines-controls
          class="lines-controls"
          ref="linesControls"
          :createData="createData"
          :usageConfig="usageConfig"
          @primitivesUpdated="$emit('primitivesUpdated', $event)"
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { markRaw } from 'vue';
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
    viewingMode: {
      type: String,
      default: "Exploration",
    },
    usageConfig: {
      type: Object,
    }
  },
  data: function() {
    return {
      activeName: "oControls",
      material: undefined,
      isTextureSlides: false,
      isPointset: false,
      isLines: false,

      zincObject: undefined,
      isEditable: false,
      displayString: "100%"
    };
  },
  computed: {
    hasValidPrimitive: function () {
      if (this.viewingMode === 'Exploration' || this.viewingMode === 'Annotation') {
        return (this.material !== undefined || this.isTextureSlides === true);
      }
      return false;
    }
  },
  methods: {
    formatTooltip: function(val) {
      this.displayString = Math.floor(100 * val + 0.5) + "%";
      return this.displayString;
    },
    setObject: function(object) {
      if (object) {
        this.zincObject = markRaw(object);
      } else {
        this.zincObject = undefined;
      }
      this.isEditable = this.zincObject?.isEditable ? true : false;
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
        } else if (object.isLines2 || (object.isTubeLines &&
          this.usageConfig?.showTubeLinesControls)) {
          this.isLines = true;
          this.$refs.linesControls.setObject(object);
          this.activeName = "lControls";
        }
        this.$refs.transformationControls.setObject(object);
      }
      if (object && object.getMorph()) {
        this.material = object.getMorph().material;
      } else {
        this.material = undefined;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.my-drawer {
  .collapse {
    border-top: none;
    border-bottom: none;
  }

  :deep(.el-collapse-item__header) {
    height:36px;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 0px;
  }
}


</style>
