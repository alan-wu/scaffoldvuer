<template>
  <el-container v-show="settings.length > 0" class="t-slides-container">
    <el-header height="30px" class="header">
      <div>Texture Slides Settings</div>
    </el-header>
    <el-main class="slides-block">
      <el-row v-for="(slide, index) in settings" :key="slide.id" class="slide-row">
        <el-col :offset="0" :span="6">
          <el-select
            :teleported="false"
            :model-value="slide.direction"
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
        <el-col :offset="0" :span="10">
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
        <el-col :offset="0" :span="6">
          <el-input-number
            v-model="slide.value"
            :step="0.01"
            :min="0"
            :max="1"
            :controls="false"
            class="input-box number-input"
          />
        </el-col>
        <el-col :offset="0" :span="2">
          <el-icon
            class="delete-icon"
            @click="removeSlide(index, slide)"
          >
            <el-icon-delete />
          </el-icon>
        </el-col>
      </el-row>
    </el-main>
    <el-footer height="30px" class="add-slides-text" @click="addNewSlide">
      <el-row>
        <el-col :span="2">
          <el-icon><el-icon-plus /></el-icon>
        </el-col>
        <el-col :span="20"> Add a new slide </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  Delete as ElIconDelete,
  Plus as ElIconPlus,
} from '@element-plus/icons-vue'
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
    ElIconDelete,
    ElIconPlus,
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
      console.log(slide.value)
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
  direction:ltr;
}

.slides-block {
  direction:rtl;
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

#scroll div{
    direction:ltr;
}

.my-slider {
  top: -6px;
  position: relative;
}

.t-slides-container {
  width: 250px;
  height: 250px;
  border-radius: 4px;
  border: solid 1px #d8dce6;
  background-color: #fff;
  overflow-y: none;
}

.input-box {
  width: 38px;
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

.delete-icon {
  color: $app-primary-color;
  top: 2px;
  position: relative;
  cursor: pointer;
}

.slide-row {
  direction:ltr;
}
</style>
