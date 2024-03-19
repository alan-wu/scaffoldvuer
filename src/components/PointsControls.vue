<template>
  <el-container class="pointset-container">
    <el-header height="30px" class="header">
      <div>Points settings</div>
    </el-header>
    <el-main class="slides-block">
      <el-row class="row">
        <el-col :offset="0" :span="6">
          Size:
        </el-col>
        <el-col :offset="0" :span="10">
          <el-slider
            v-model="size"
            class="my-slider"
            :step="1"
            :min="0"
            :max="100"
            :show-tooltip="false"
            @input="modifySize()"
          />
        </el-col>
        <el-col :offset="0" :span="6">
          <el-input-number
            v-model="size"
            :step="1"
            :min="0"
            :max="100"
            :controls="false"
            class="input-box number-input"
          />
        </el-col>
      </el-row>
      <el-row class="slide-row">
        <el-col :offset="0" :span="16">
          Size attenuation:
        </el-col>
        <el-col :offset="0" :span="5">
          <el-select
            :teleported="false"
            :model-value="attenuation"
            placeholder="Select"
            class="input-box"
            popper-class="viewer_dropdown"
            @change="modifyAttenuation($event, slide)"
          >
            <el-option
              v-for="item in choices"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
  ElHeader as Header,
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
  name: "PointsControls",
  components: {
    Col,
    Container,
    Header,
    InputNumber,
    Main,
    Select,
    Slider,
    Option,
  },
  data: function () {
    return {
      attenuation: false,
      size: 10,
      choices: [
        {
          value: true,
          label: "On",
        },
        {
          value: false,
          label: "off",
        },
      ],
    };
  },
  mounted: function () {
    this._zincObject = undefined;
  },
  methods: {
    setObject: function (object) {
      if (object.isPointset) {
        this._zincObject = object;
        this.size = this._zincObject.morph.material.size;
        this.attenuation = this._zincObject.morph.material.sizeAttenuation
      } else {
        this._zincObject = undefined;
        this.size = 10;
        this.attenuation = false;
      }
    },
    modifyAttenuation: function(flag) {
      this.attenuation = flag;
      this._zincObject.setSizeAttenuation(flag);
    },
    modifySize: function () {
      this._zincObject.setSize(this.size);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.header {
  color: #606266;
  line-height: 1;
  padding: 8px 17px 1px 15px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

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

.pointset-container {
  width: 250px;
  height: auto;
  border-radius: 4px;
  border: solid 1px #d8dce6;
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
