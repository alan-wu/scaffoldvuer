<template>
  <el-container class="pointset-container">
    <el-main class="slides-block">
      <el-row>
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
      <el-row>
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
      <template v-if="currentIndex > -1">
        <el-row>
          <el-col :offset="0" :span="4">
            <el-button
              size='small'
              :disabled="currentIndex === 0"
              :icon="ElIconArrowLeft"
              @click="changeIndex(false)"
            />
          </el-col>
          <el-col :offset="4" :span="9">
            Editing Point {{ currentIndex + 1}}
          </el-col>
          <el-col :offset="2" :span="2">
            <el-button
              size='small'
              :icon="ElIconArrowRight"
              @click="changeIndex(true)"
            />
          </el-col>
        </el-row>
        <el-row>
          <el-col :offset="0" :span="6">
            x:
          </el-col>
          <el-col :offset="0" :span="16">
            <el-slider
              v-model="translation[0]"
              :step="0.01"
              :min="min[0]"
              :max="max[0]"
              :show-tooltip="false"
              @input="onMoveSliding()"
              @change="reset()"
            />
          </el-col>
        </el-row>
        <el-row>
          <el-col :offset="0" :span="6">
            y:
          </el-col>
          <el-col :offset="0" :span="16">
            <el-slider
              v-model="translation[1]"
              :step="0.01"
              :min="min[1]"
              :max="max[1]"
              :show-tooltip="false"
              @input="onMoveSliding()"
              @change="reset()"
            />
          </el-col>
        </el-row>
        <el-row>
          <el-col :offset="0" :span="6">
            z:
          </el-col>
          <el-col :offset="0" :span="16">
            <el-slider
              v-model="translation[2]"
              :step="0.01"
              :min="min[2]"
              :max="max[2]"
              :show-tooltip="false"
              @input="onMoveSliding()"
              @change="reset()"
            />
          </el-col>
        </el-row>
      </template>
    </el-main>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { markRaw, shallowRef } from 'vue';
import {
  movePoint,
} from "../scripts/Utilities.js";
import {
  ElCol as Col,
  ElContainer as Container,
  ElInputNumber as InputNumber,
  ElMain as Main,
  ElRow as Row,
  ElSelect as Select,
  ElSlider as Slider,
  ElOption as Option,
} from "element-plus";
import{
  ArrowLeft as ElIconArrowLeft,
  ArrowRight as ElIconArrowRight,
} from '@element-plus/icons-vue';

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "PointsControls",
  components: {
    Col,
    Container,
    InputNumber,
    Main,
    Select,
    Slider,
    Row,
    Option,
    ElIconArrowLeft,
    ElIconArrowRight,
  },
  inject: ['boundingDims'],
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
      min: [0, 0, 0],
      max: [1, 1, 1],
      translation: [0, 0, 0],
      pTranslation: [0, 0, 0],
      currentIndex: -1,
      ElIconArrowLeft: shallowRef(ElIconArrowLeft),
      ElIconArrowRight: shallowRef(ElIconArrowRight),
      edited: false,
      zincObject: undefined,
    };
  },
  watch: {
    boundingDims: {
      handler: function (value) {
        const size = value.size;
        this.min = [
          -size[0] / 2,
          -size[1] / 2,
          -size[2] / 2,
        ];
        this.max = [
          size[0] / 2,
          size[1] / 2,
          size[2] / 2,
        ];
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    changeIndex: function(increment) {
      if (increment) {
        if (this.zincObject.drawRange > this.currentIndex + 1) {
          this.currentIndex++;
          this.reset();
        }
      } else {
        this.currentIndex--;
        this.reset();
      }
    },
    onMoveSliding: function() {
      const diff = [
        this.translation[0] - this.pTranslation[0],
        this.translation[1] - this.pTranslation[1],
        this.translation[2] - this.pTranslation[2],
      ];
      this.edited = movePoint(this.zincObject, this.currentIndex, diff) || this.edited;
      for (let i = 0; i < 3; i++) {
        this.pTranslation[i] = this.translation[i];
      }
    },
    reset: function() {
      this.translation = [0, 0, 0];
      this.pTranslation = [0, 0, 0];
      if (this.edited) {
        this.$emit("primitivesUpdated", this.zincObject);
        this.edited = false;
      }
    },
    setObject: function (object) {
      this.currentIndex = -1;
      if (object.isPointset) {
        this.zincObject = markRaw(object);
        this.size = this.zincObject.morph.material.size;
        this.attenuation = this.zincObject.morph.material.sizeAttenuation;
        if (object.isEditable) {
          if (this.zincObject.drawRange > 0) {
            this.currentIndex = 0;
          }
        }
      } else {
        this.zincObject = undefined;
        this.size = 10;
        this.attenuation = false;
      }
    },
    modifyAttenuation: function(flag) {
      this.attenuation = flag;
      this.zincObject.setSizeAttenuation(flag);
    },
    modifySize: function () {
      this.zincObject.setSize(this.size);
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

.pointset-container {
  width: 250px;
  height: auto;
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
