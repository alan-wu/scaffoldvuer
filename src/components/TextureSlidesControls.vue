<template>
  <el-container v-show="settings.length > 0" class="t-slides-container">
    <el-header height="30px" class="header">
      <div>Texture Slides Settings</div>
    </el-header>
    <el-main class="block">
      <el-row v-for="(slide, index) in settings" :key="slide.id">
        <el-col :offset="0" :span="2">
          <el-select
            :teleported="false"
            :value="slide.direction"
            placeholder="Select"
            class="input-box"
            popper-class="viewer_dropdown"
            @change="modifyDirection($event, slide)"
          >
            <el-option
              v-for="item in directions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :offset="0" :span="14">
          <el-slider
            v-model="slide.value"
            class="my-slider"
            :step="0.01"
            :min="0"
            :max="1"
            :show-tooltip="false"
            @input="modifySlide(slide)"
          />
        </el-col>
        <el-col :offset="0" :span="3">
          <el-input-number
            v-model="slide.value"
            :step="0.01"
            :min="0"
            :max="1"
            :controls="false"
            class="input-box number-input"
          />
        </el-col>
        <el-col :offset="2" :span="2">
          <i
            class="el-icon-close close-icon"
            @click="removeSlide(index, slide)"
          />
        </el-col>
      </el-row>
    </el-main>
    <el-footer height="30px" class="add-slides-text" @click.native="addNewSlide">
      <el-row>
        <el-col :span="2">
          <i class="el-icon-plus" />
        </el-col>
        <el-col :span="10"> Add a new slide </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  ElCol as Col,
  ElContainer as Container,
  ElFooter as Footer,
  ElHeader as Header,
  ElIcon as Icon,
  ElInputNumber as InputNumber,
  ElMain as Main,
  ElRow as Row,
  ElSlider as Slider,
} from "element-plus";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "TextureSlidesControls",
  components: {
    Col,
    Container,
    Footer,
    Header,
    Icon,
    InputNumber,
    Main,
    Row,
    Slider,
  },
  data: function () {
    return {
      settings: [],
      directions: [
        {
          value: "x",
          label: "x",
        },
        {
          value: "y",
          label: "y",
        },
        {
          value: "z",
          label: "z",
        },
      ],
    };
  },
  watch: {
    settings: function () {
      if (this.material && this._zincObject) {
        this._zincObject.setAlpha(this.material.opacity);
      }
    },
  },
  mounted: function () {
    this._zincObject = undefined;
  },
  methods: {
    setObject: function (object) {
      if (object.isTextureSlides) {
        this._zincObject = object;
        this.settings = this._zincObject.getTextureSettings();
      } else {
        this._zincObject = undefined;
        this.settings = [];
      }
    },
    addNewSlide: function () {
      const newSettings = { direction: "x", value: 0 };
      const returnSettings = this._zincObject.createSlide(newSettings);
      this.settings.push(returnSettings);
    },
    modifyDirection: function(direction, slide) {
      if (slide) {
        slide.direction = direction;
        this._zincObject.modifySlideSettings(slide);
      }
    },
    modifySlide: function (slide) {
      if (slide) {
        this._zincObject.modifySlideSettings(slide);
      }
    },
    removeSlide: function (index, slide) {
      this._zincObject.removeSlideWithId(slide.id);
      this.settings.splice(index, 1);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@use "element-plus/theme-chalk/src/col";
@use "element-plus/theme-chalk/src/container";
@use "element-plus/theme-chalk/src/input-number";
@use "element-plus/theme-chalk/src/slider";
@use "element-plus/theme-chalk/src/row";

.header {
  color: #606266;
  line-height: 1;
  padding: 8px 17px 1px 15px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.add-slides-text {
  color: $app-primary-color;
  line-height: 1;
  padding: 9px 17px 9px 15px;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
  cursor: pointer;
  pointer-events: auto;
}

.display {
  width: 44px;
}

.block {
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
  width: 109px;
  top: -6px;
  left: 50px;
  position: relative;
}

.t-slides-container {
  width: 300px;
  height: 250px;
  border-radius: 4px;
  border: solid 1px #d8dce6;
  background-color: #fff;
  overflow-y: none;
}

:deep(.el-slider__bar) {
  background-color: $app-primary-color;
}

.input-box {
  width: 42px;
  border-radius: 4px;
  border: 1px solid rgb(144, 147, 153);
  background-color: var(--white);
  font-weight: 500;
  color: rgb(48, 49, 51);
  margin-left: 8px;

  &.number-input {
    width: 42px;
    :deep(.el-input__inner) {
      padding-left: 0px;
      padding-right: 0px;
    }
  }

  :deep(.el-input__inner) {
    color: $app-primary-color;
    height: 22px;
    padding-left: 8px;
    padding-right: 8px;
    border: none;
    font-family: "Asap", sans-serif;
    line-height: 22px;
  }

  :deep(.el-input),
  :deep(.el-input__icon) {
    line-height: 22px;
  }

  .viewer_dropdown .el-select-dropdown__item {
    white-space: nowrap;
    color: $app-primary-color;
    text-align: left;
    font-family: "Asap", sans-serif;
  }
}

.close-icon {
  color: $app-primary-color;
  top: 2px;
  position: relative;
  cursor: pointer;
}
</style>
