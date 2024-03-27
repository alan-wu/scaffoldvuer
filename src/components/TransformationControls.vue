<template>
  <el-container class="transformation-container">
    <el-header height="30px" class="header">
      <div>Transformation settings</div>
    </el-header>
    <el-main class="slides-block">
      <el-row class="row">
        <el-col :offset="0" :span="8">
          Position:
        </el-col>
      </el-row>
      <el-row class="slide-row">
        <el-col :offset="3" :span="1">
          x:
        </el-col>
        <el-col :span="3">
          <el-input-number
            v-model="x"
            :step="1"
            :controls="false"
            class="input-box number-input"
            @change="modifyPosition"
          />
        </el-col>
        <el-col :offset="3" :span="1">
          y:
        </el-col>
        <el-col :span="3">
          <el-input-number
            v-model="y"
            :step="1"
            :controls="false"
            class="input-box number-input"
            @change="modifyPosition"
          />
        </el-col>
        <el-col :offset="3" :span="1">
          z:
        </el-col>
        <el-col :span="3">
          <el-input-number
            v-model="z"
            :step="1"
            :controls="false"
            class="input-box number-input"
            @change="modifyPosition"
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
  ElHeader as Header,
  ElInputNumber as InputNumber,
  ElMain as Main,
} from "element-plus";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "TransformationControls",
  components: {
    Col,
    Container,
    Header,
    InputNumber,
    Main,
  },
  data: function () {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  },
  mounted: function () {
    this._zincObject = undefined;
  },
  methods: {
    setObject: function (object) {
      if (object.isZincObject) {
        this._zincObject = object;
        const morph = this._zincObject.getMorph();
        if (morph && morph.position) {
          this.x = morph.position.x;
          this.y = morph.position.y;
          this.z = morph.position.z;
        }
      } else {
        this._zincObject = undefined;
        this.x = 0;
        this.y = y;
        this.z = z;
      }
    },
    modifyPosition: function() {
      const morph = this._zincObject.getMorph();
      if (morph) {
        morph.position.set(this.x, this.y, this.z);
        morph.updateMatrix();
      }
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

.transformation-container {
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
}

</style>
