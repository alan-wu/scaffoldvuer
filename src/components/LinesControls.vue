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
    </el-main>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
// This is not in use at this moment, due to
// limited support to line width
import {
  ElCol as Col,
  ElContainer as Container,
  ElInputNumber as InputNumber,
  ElMain as Main,
  ElSelect as Select,
  ElSlider as Slider,
  ElOption as Option,
} from "element-plus";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "LinesControls",
  components: {
    Col,
    Container,
    InputNumber,
    Main,
    Select,
    Slider,
    Option,
  },
  data: function () {
    return {
      width: 1,
    };
  },
  mounted: function () {
    this._zincObject = undefined;
  },
  methods: {
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
