<template>
  <el-container class="transformation-container">
    <el-main class="slides-block">
      <el-row class="tool-row">
        <el-col :offset="0" :span="6">
          x:
        </el-col>
        <el-col :offset="0" :span="10">
          <el-slider
            v-model="x"
            :step="0.01"
            :min="min[0]"
            :max="max[0]"
            :show-tooltip="false"
            @input="modifyPosition()"
          />
        </el-col>
        <el-col :offset="0" :span="6">
          <el-input-number
            v-model="x"
            :step="0.01"
            :min="min[0]"
            :max="max[0]"
            :controls="false"
            class="input-box number-input"
            @change="modifyPosition()"
          />
        </el-col>
      </el-row>
      <el-row class="tool-row">
        <el-col :offset="0" :span="6">
          y:
        </el-col>
        <el-col :offset="0" :span="10">
          <el-slider
            v-model="y"
            :step="0.01"
            :min="min[1]"
            :max="max[1]"
            :show-tooltip="false"
            @input="modifyPosition()"
          />
        </el-col>
        <el-col :offset="0" :span="6">
          <el-input-number
            v-model="y"
            :step="0.01"
            :min="min[1]"
            :max="max[1]"
            :controls="false"
            class="input-box number-input"
            @change="modifyPosition()"
          />
        </el-col>
      </el-row>
      <el-row class="tool-row">
        <el-col :offset="0" :span="6">
          z:
        </el-col>
        <el-col :offset="0" :span="10">
          <el-slider
            v-model="z"
            :step="0.01"
            :min="min[2]"
            :max="max[2]"
            :show-tooltip="false"
            @input="modifyPosition()"
          />
        </el-col>
        <el-col :offset="0" :span="6">
          <el-input-number
            v-model="z"
            :step="0.01"
            :min="min[2]"
            :max="max[2]"
            :controls="false"
            class="input-box number-input"
            @change="modifyPosition()"
          />
        </el-col>
      </el-row>
      <el-row class="tool-row" v-if="enableScaling">
        <el-col :offset="0" :span="6">
          Scale:
        </el-col>
        <el-col :offset="0" :span="10">
          <el-slider
            v-model="scale"
            :step="0.01"
            :min="0"
            :max="5"
            :show-tooltip="false"
            @input="modifyScale()"
          />
        </el-col>
        <el-col :offset="0" :span="6">
          <el-input-number
            v-model="scale"
            :step="0.01"
            :min="0"
            :max="5"
            :controls="false"
            class="input-box number-input"
            @change="modifyScale()"
          />
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */

import {
  ElCol as Col,
  ElContainer as Container,
  ElInputNumber as InputNumber,
  ElMain as Main,
  ElSlider as Slider,
} from "element-plus";
import { markRaw } from "vue";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "TransformationControls",
  components: {
    Col,
    Container,
    InputNumber,
    Main,
    Slider,
  },
  inject: ['boundingDims'],
  data: function () {
    return {
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      min: [0, 0, 0],
      max: [1, 1, 1],
      zincObject: undefined,
      enableScaling: true
    };
  },
  watch: {
    boundingDims: {
      handler: function (value) {
        this.calculateMinAndMax();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    calculateMinAndMax: function() {
      if (this.zincObject) {
        const originalPos = this.zincObject?.userData?.originalPos;
        if (originalPos && this.boundingDims) {
          this.min = [
            originalPos[0] - this.boundingDims.size[0],
            originalPos[1] - this.boundingDims.size[1],
            originalPos[2] - this.boundingDims.size[2]
          ];
          this.max = [
            originalPos[0] + this.boundingDims.size[0],
            originalPos[1] + this.boundingDims.size[1],
            originalPos[2] + this.boundingDims.size[2]
          ];
        }
      }
    },
    setObject: function (object) {
      if (object.isZincObject) {
        this.zincObject = markRaw(object);
        const morph = this.zincObject.getGroup();
        const originalPos = this.zincObject.userData.originalPos;
        if (morph && morph.position) {
          this.x = morph.position.x;
          this.y = morph.position.y;
          this.z = morph.position.z;
          if (this.zincObject.isGlyphset) {
            this.scale = this.zincObject.globalScale;
          } else {
            this.scale = morph.scale.x;
          }
          this.enableScaling = this.zincObject.isTextureSlides ? false : true;
          this.calculateMinAndMax();
        }
      } else {
        this.zincObject = undefined;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.scale = 1;
      }
    },
    modifyPosition: function() {
      if (this.zincObject) {
        this.zincObject.setPosition(this.x, this.y, this.z);
      }
    },
    modifyScale: function() {
      this.zincObject.setScaleAll(this.scale);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.slides-block {
  pointer-events: auto;
  &.el-main {
    padding: 5px;
    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      box-shadow: inset 0 0 6px #c0c4cc;
    }
  }
}

.transformation-container {
  width: 250px;
  height: auto;
  background-color: #fff;
  overflow-y: none;
}

.input-box {
  width: 42px;
  border-radius: 4px;
  border: 1px solid rgb(144, 147, 153);
  background-color: var(--white);
  font-weight: 500;
  color: rgb(48, 49, 51);
  margin-left: 8px;
  height: 24px;

  &.number-input {
    width: 42px;
    :deep(.el-input__wrapper) {
      padding-left: 0px;
      padding-right: 0px;
    }
  }
}

.my-slider {
  position: absolute;
  width: 135px;
  left: 50px;
  pointer-events: auto;
}

.tool-row {
  align-items:center;
  text-align: center;
  padding-top:8px;
}

</style>
