<template>
  <el-container class="lines-container">
    <el-main class="slides-block">
      <el-row>
        <el-col :offset="0" :span="6">
          Width:
        </el-col>
        <el-col :offset="0" :span="10">
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
        <el-col :offset="0" :span="6">
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
      <el-row v-if="createData.faceIndex > -1">
        <el-col :offset="0" :span="4">
          <el-button :icon="ElIconArrowLeft" @click="onMoveClick(-unit)"/>
        </el-col>
        <el-col :offset="3" :span="3">
          Move
        </el-col>
        <el-col :offset="0" :span="7">
          <el-input-number
            v-model="unit"
            :controls="false"
            class="input-box number-input"
          />
        </el-col>
        <el-col :offset="2" :span="2">
          <el-button :icon="ElIconArrowRight" @click="onMoveClick(unit)"/>
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
  moveLine,
} from "../scripts/Utilities.js";
import {
  ElButton as Button,
  ElCol as Col,
  ElContainer as Container,
  ElInputNumber as InputNumber,
  ElMain as Main,
  ElSelect as Select,
  ElSlider as Slider,
  ElOption as Option,
} from "element-plus";
import {
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
    Select,
    Slider,
    Option,
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
      width: 1,
      unit: 0.1,
      ElIconArrowLeft: shallowRef(ElIconArrowLeft),
      ElIconArrowRight: shallowRef(ElIconArrowRight),
    };
  },
  mounted: function () {
    this._zincObject = undefined;
  },
  methods: {
    onMoveClick: function(unit) {
      moveLine(this._zincObject, this.createData.faceIndex, unit);
    },
    setObject: function (object) {
      if (object.isLines) {
        this._zincObject = object;
        this.width = this._zincObject.getMorph().material.linewidth;
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
