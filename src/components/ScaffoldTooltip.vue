<template>
  <div :style="position" class="region-tooltip">
    <el-popover
      ref="tooltip"
      v-model="display"
      placement="top"
      :visibleArrow="false"
      :append-to-body="false"
      trigger="manual"
      popper-class="tooltip-popper non-selectable"
    >
      <template v-popover:tooltip>
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
import Vue from "vue";
import { Popover } from "element-ui";
import Tooltip from "@abi-software/flatmapvuer/src/components/Tooltip";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

locale.use(lang);
Vue.use(Popover);

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "ScaffoldTooltip",
 components: {
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
@import "~element-ui/packages/theme-chalk/src/popover";

.region-tooltip {
  position: absolute;
  height: 50px;
  z-index: 2;
  ::v-deep .tooltip-popper {
    padding: 2px 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    color: $app-primary-color;
    background-color: #fff;
    border: 1px solid $app-primary-color;
    border-radius: 4px;
    white-space: nowrap;
    min-width: unset;
    pointer-events: none;
    top: -15px !important;

    &.el-popper[x-placement^="top"] {
      .popper__arrow {
        border-top-color: $app-primary-color !important;
        &:after {
          border-top-color: #fff !important;
        }
      }
    }

    &.el-popper[x-placement^="bottom"] {
      .popper__arrow {
        border-bottom-color: $app-primary-color !important;
        &:after {
          border-bottom-color: #fff !important;
        }
      }
    }
  }

  .tooltip-text {
    text-align: center;
  }

  ::v-deep .non-selectable {
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
