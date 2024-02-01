<template>
  <div :style="position" class="region-tooltip">
    <el-popover
      ref="tooltip"
      :visible="visible"
      placement="top"
      :show-arrow="false"
      :teleported="false"
      trigger="manual"
      popper-class="tooltip-popper non-selectable"
      virtual-triggering
    >
      <template #default>
        <div class="tooltip-text">{{ label }}</div>
        <div class="tooltip-text" v-if="region">Region: {{ region }}</div>
        <Tooltip
          class="p-tooltip"
          v-show="annotationDisplay"
          ref="annotationTooltip"
          :annotationDisplay="true"
          :annotationEntry="annotationEntry"
        />
      </template>
    </el-popover>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { ElPopover as Popover } from "element-plus";
import { Tooltip } from "@abi-software/flatmapvuer";
import "@abi-software/flatmapvuer/dist/style.css";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "ScaffoldTooltip",
  components: {
    Popover,
    Tooltip,
  },
  props: {
    label: {
      type: String,
      default: "",
    },
    annotationDisplay: {
      type: Boolean,
      default: false,
    },
    region: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: false,
    },
    x: {
      type: Number,
      default: 200,
    },
    y: {
      type: Number,
      default: 200,
    },
  },
  inject: ['scaffoldUrl'],
  data: function () {
    return {
      display: false,
      annotationEntry: { }
    };
  },
  computed: {
    position: function () {
      let yOffset = 40;
      if (this.region) {
        yOffset = 55;
      }
      const x = this.x - 40;
      return { left: x + "px", top: this.y - yOffset + "px" };
    },
  },
  methods: {
    checkForDisplay: function () {
      if (this.visible && this.label && this.label !== "") {
        this.display = true;
        if (this.annotationDisplay) {
          const region = this.region ? this.region +"/" : "";
          this.annotationEntry = {
            "featureId": encodeURIComponent(region + this.label),
            "resourceId": encodeURIComponent(this.scaffoldUrl),
          };
        }
      }
      else {
        this.display = false;
        this.annotationEntry = { };
      }
    }
  },
  watch: {
    label: {
      handler: function () {
        this.checkForDisplay();
      },
      immediate: true,
    },
    visible: {
      handler: function () {
        this.checkForDisplay();
      },
      immediate: true,
    },
    annotationDisplay: {
      handler: function () {
        this.checkForDisplay();
      },
      immediate: true,
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.region-tooltip {
  position: absolute;
  height: 50px;
  z-index: 2;
  :deep(.tooltip-popper.el-popover.el-popper) {
    padding: 2px 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    color: $app-primary-color;
    background-color: #fff;
    border: 1px solid $app-primary-color;
    border-radius: 4px;
    white-space: nowrap;
    min-width: unset!important;
    max-width:330px;
    width:unset!important;
    pointer-events: none;
    top: -15px !important;
    .el-popper__arrow {
      &:before {
        border-color: $app-primary-color;
      }
    }
  }

  .tooltip-text {
    text-align: center;
    color: $app-primary-color;
  }

  :deep(.non-selectable) {
    user-select: none;
    pointer-events: none;
  }

  .p-tooltip {
    display: flex;
    width: 300px;
    white-space:normal;
    .attribute-content {
      color: rgb(44, 62, 80);
    }
    &::before, &::after {
      display:none;
    }
  }
}
</style>
