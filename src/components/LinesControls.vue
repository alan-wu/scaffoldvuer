<template>
  <el-container class="lines-container">
    <el-main class="slides-block">
      <template v-if="optionalLines">
        <template v-if="linesType === 'tubelines'">
          <el-row>
            <el-col :offset="0" :span="6">
              Tubular Segments:
            </el-col>
            <el-col :offset="0" :span="12">
              <el-slider
                v-model="tubularSegments"
                class="my-slider"
                :step="1"
                :min="1"
                :max="100"
                :show-tooltip="false"
                @input="modifyTubularSegments"
              />
            </el-col>
            <el-col :offset="0" :span="4">
              <el-input-number
                v-model="tubularSegments"
                :step="1"
                :min="1"
                :max="100"
                :controls="false"
                @change="modifyTubularSegments"
                class="input-box number-input"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-col :offset="0" :span="6">
              Radius:
            </el-col>
            <el-col :offset="0" :span="12">
              <el-slider
                v-model="radius"
                class="my-slider"
                :step="1"
                :min="1"
                :max="100"
                :show-tooltip="false"
                @input="modifyRadius"
              />
            </el-col>
            <el-col :offset="0" :span="4">
              <el-input-number
                v-model="radius"
                :step="1"
                :min="1"
                :max="100"
                :controls="false"
                @change="modifyRadius"
                class="input-box number-input"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-col :offset="0" :span="6">
              Radial Segments:
            </el-col>
            <el-col :offset="0" :span="12">
              <el-slider
                v-model="radialSegments"
                class="my-slider"
                :step="1"
                :min="1"
                :max="100"
                :show-tooltip="false"
                @input="modifyRadialSegments"
              />
            </el-col>
            <el-col :offset="0" :span="4">
              <el-input-number
                v-model="radialSegments"
                :step="1"
                :min="1"
                :max="100"
                :controls="false"
                @change="modifyRadialSegments"
                class="input-box number-input"
              />
            </el-col>
          </el-row>
        </template>
        <el-row>
          <el-col :offset="0" :span="18">
            Lines type: {{ linesType }}
          </el-col>
          <el-col :offset="0" :span="4">
            <el-button size="small" @click="SwitchLineType">Switch</el-button>
          </el-col>
        </el-row>
      </template>
      <template v-else>
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
      </template>
      <template v-if="currentIndex > -1 && distance > 0">
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
        <el-row>
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
        <el-row>
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
      </template>
    </el-main>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
// This is not in use at this moment, due to
// limited support to line width
import { markRaw, shallowRef } from 'vue';
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
      distance: 0,
      newDistance: 0, 
      width: 1,
      tubularSegments: 100,
      radius: 1,
      radialSegments: 1,
      currentIndex: 0,
      ElIconArrowLeft: shallowRef(ElIconArrowLeft),
      ElIconArrowRight: shallowRef(ElIconArrowRight),
      edited: false,
      zincObject: undefined,
      optionalLines: false,
      linesType: ""
    };
  },
  watch: {
    "createData.faceIndex": {
      handler: function (value) {
        if (this.zincObject?.isLines2) {
          this.currentIndex = value;
          this.distance = getLineDistance(this.zincObject, this.currentIndex);
        }
      },
      immediate: true,
    },
  },
  methods: {
    changeIndex: function(increment) {
      if (increment) {
        const dist = getLineDistance(this.zincObject, this.currentIndex + 1);
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
        this.edited = moveAndExtendLine(
          this.zincObject, this.currentIndex, this.newDistance, true) || this.edited;
      } else {
        this.newDistance = this.distance;
      }
    },
    onLengthSliding: function() {
      this.newDistance = Math.pow(10, this.lengthScale) * this.distance;
      this.edited = moveAndExtendLine(
        this.zincObject, this.currentIndex, this.newDistance, true) || this.edited;
    },
    onMoveSliding: function() {
      const diff = (this.adjust - this.pAdjust) * this.distance;
      this.edited =  moveAndExtendLine(
        this.zincObject, this.currentIndex, diff, false) || this.edited;
      this.pAdjust = this.adjust;
    },
    reset: function() {
      this.adjust = 0;
      this.pAdjust = 0;
      this.lengthScale = 0;
      this.distance = getLineDistance(this.zincObject, this.currentIndex);
      this.newDistance = this.distance;
      if (this.edited) {
        this.$emit("primitivesUpdated", this.zincObject);
        this.edited = false;
      }
    },
    setObject: function (object) {
      this.currentIndex = -1;
      this.distance = 0;
      if (object.isLines2 || object.isOptionalLines) {
        this.zincObject = markRaw(object);
        this.width = this.zincObject.getMorph().material.linewidth;
        this.optionalLines = object.isOptionalLines;
        this.linesType = object.isLines ? "lines" : object.isTubeLines ? "tubelines" : ""
        if (object.isEditable) {
          this.currentIndex = 0;
          this.distance = getLineDistance(object, this.currentIndex);
        }
      } else {
        this.zincObject = undefined;
        this.width = 10;
      }
    },
    modifyWidth: function () {
      this.zincObject.setWidth(this.width);
    },
    modifyTubularSegments: function () {
      this.zincObject.setTubeLines(this.tubularSegments, this.radius/100, this.radialSegments);
    },
    modifyRadius: function () {
      this.zincObject.setTubeLines(this.tubularSegments, this.radius/100, this.radialSegments);
    },
    modifyRadialSegments: function () {
      this.zincObject.setTubeLines(this.tubularSegments, this.radius/100, this.radialSegments);
    },
    SwitchLineType: function () {
      this.linesType = this.linesType === "lines" ? "tubelines" : "lines";
      if (this.linesType === "lines") { 
        this.zincObject.useLines();
      } else if (this.linesType === "tubelines") {
        this.zincObject.useTubeLines(this.tubularSegments, this.radius/100, this.radialSegments);
      }
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
