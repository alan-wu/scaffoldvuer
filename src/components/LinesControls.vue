<template>
  <el-container class="lines-container">
    <el-main class="slides-block">
      <el-row>
        <el-col :offset="0" :span="6">
          Width:
        </el-col>
        <el-col :offset="0" :span="12">
          <el-slider
            v-model="width"
            class="my-slider"
            :step="1"
            :min="1"
            :max="100"
            :show-tooltip="false"
            @input="modifyWidth"
          />
        </el-col>
        <el-col :offset="0" :span="4">
          <el-input-number
            v-model="width"
            :step="1"
            :min="1"
            :max="100"
            :controls="false"
            class="input-box number-input"
          />
        </el-col>
      </el-row>
      <el-row v-if="currentIndex > -1">
        <el-col :offset="0" :span="4">
          <el-button
            size='small'
            :disabled="currentIndex === 0"
            :icon="ElIconArrowLeft"
            @click="changeIndex(false)"
          />
        </el-col>
        <el-col :offset="4" :span="9">
          Editing Line {{ currentIndex + 1}}
        </el-col>
        <el-col :offset="2" :span="2">
          <el-button
            size='small'
            :icon="ElIconArrowRight"
            @click="changeIndex(true)"
          />
        </el-col>
      </el-row>
      <el-row v-if="currentIndex > -1 && distance > 0">
        <el-col :offset="0" :span="6">
          Move:
        </el-col>
        <el-col :offset="0" :span="16">
          <el-slider
            v-model="adjust"
            :step="0.01"
            :min="-3"
            :max="3"
            :show-tooltip="false"
            @input="onMoveSliding()"
            @change="reset()"
          />
        </el-col>
      </el-row>
      <el-row v-if="currentIndex > -1 && distance > 0">
        <el-col :offset="0" :span="6">
          Length:
        </el-col>
        <el-col :offset="0" :span="10">
          <el-slider
            v-model="lengthScale"
            :step="0.01"
            :min="-1"
            :max="1"
            :show-tooltip="false"
            @input="onLengthSliding()"
            @change="reset()"
          />
        </el-col>
        <el-col :offset="0" :span="6">
          <el-input-number
            v-model="newDistance"
            :controls="false"
            class="input-box number-input"
            @change="onLengthInput"
          />
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
// This is not in use at this moment, due to
// limited support to line width
import { shallowRef } from 'vue';
import {
  getLineDistance,
  moveAndExtendLine,
} from "../scripts/Utilities.js";
import {
  ElButton as Button,
  ElCol as Col,
  ElContainer as Container,
  ElInputNumber as InputNumber,
  ElMain as Main,
  ElSlider as Slider,
} from "element-plus";
import{
  ArrowLeft as ElIconArrowLeft,
  ArrowRight as ElIconArrowRight,
} from '@element-plus/icons-vue';
/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "LinesControls",
  components: {
    Button,
    Col,
    Container,
    InputNumber,
    Main,
    Slider,
    ElIconArrowLeft,
    ElIconArrowRight,
  },
  props: {
    createData: {
      type: Object,
    },
  },
  data: function () {
    return {
      adjust: 0,
      pAdjust: 0,
      lengthScale: 0,
      newDistance: 0, 
      width: 1,
      currentIndex: 0,
      ElIconArrowLeft: shallowRef(ElIconArrowLeft),
      ElIconArrowRight: shallowRef(ElIconArrowRight),
    };
  },
  watch: {
    "createData.faceIndex": {
      handler: function (value) {
        if (this._zincObject?.isLines2) {
          this.currentIndex = value;
          this.distance = getLineDistance(this._zincObject, this.currentIndex);
        }
      },
      immediate: true,
    },
  },
  mounted: function () {
    this._zincObject = undefined;
  },
  methods: {
    changeIndex: function(increment) {
      if (increment) {
        const dist = getLineDistance(this._zincObject, this.currentIndex + 1);
        if (dist > 0) {
          this.currentIndex++;
          this.reset();
        }
      } else {
        this.currentIndex--;
        this.reset();
      }
    },
    onLengthInput: function() {
      if (this.newDistance !== 0) {
        this.distance = this.newDistance;
        moveAndExtendLine(this._zincObject, this.currentIndex, this.newDistance, true);
      } else {
        this.newDistance = this.distance;
      }
    },
    onLengthSliding: function() {
      this.newDistance = Math.pow(10, this.lengthScale) * this.distance;
      moveAndExtendLine(this._zincObject, this.currentIndex, this.newDistance, true);
    },
    onMoveSliding: function() {
      const diff = (this.pAdjust - this.adjust) * this.distance;
      moveAndExtendLine(this._zincObject, this.currentIndex, diff, false);
      this.pAdjust = this.adjust;
    },
    reset: function() {
      this.adjust = 0;
      this.pAdjust = 0;
      this.lengthScale = 0;
      this.distance = getLineDistance(this._zincObject, this.currentIndex);
      this.newDistance = this.distance;
    },
    setObject: function (object) {
      this.currentIndex = -1;
      this.distance = 0;
      if (object.isLines2) {
        this._zincObject = object;
        this.width = this._zincObject.getMorph().material.linewidth;
        if (object.isEditable) {
          this.currentIndex = 0;
          this.distance = getLineDistance(object, this.currentIndex);
        }
      } else {
        this._zincObject = undefined;
        this.linewidth = 10;
      }
    },
    modifyWidth: function () {
      this._zincObject.setWidth(this.width);
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

.my-slider {
  top: -6px;
  position: relative;
}

.lines-container {
  width: 250px;
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

  :deep(.el-select__wrapper) {
    height: 24px;
    padding: 0;
    min-height: unset;
  }

  :deep(.el-select__selection) {
    color: $app-primary-color;
    height: 22px;
    padding-left: 4px;
    padding-right: 8px;
    border: none;
    font-family: "Asap", sans-serif;
    line-height: 22px;
  }

  :deep(.el-select__suffix),
  :deep(.el-icon) {
    line-height: 22px;
  }
}

</style>
