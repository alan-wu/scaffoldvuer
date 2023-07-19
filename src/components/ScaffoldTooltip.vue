<template>
  <div :style="position" class="region-tooltip">
    <el-popover
      ref="tooltip"
      v-model="display"
      placement="right"
      :visibleArrow="true"
      :append-to-body="false"
      trigger="manual"
      popper-class="tooltip-popper non-selectable"
    >
      <div class="tooltip-text">{{ label }}</div>
      <div class="tooltip-text" v-if="region">Region: {{ region }}</div>
      <provenance-tooltip
        class="p-tooltip"
        v-show="displayProvenance"
        ref="provenanceTooltip"
        :entry="provenance"
      />
      <i v-popover:tooltip />
    </el-popover>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Popover } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import ProvenanceTooltip from "@abi-software/flatmapvuer/src/components/Tooltip";
import { FlatmapQueries } from "@abi-software/flatmapvuer/src/services/flatmapQueries.js";
import { getNerveNames } from "../scripts/nerveMaps.js";

locale.use(lang);
Vue.use(Popover);

const createUnfilledTooltipData = function () {
  return {
    destinations: [],
    origins: [],
    components: [],
    destinationsWithDatasets: [],
    originsWithDatasets: [],
    componentsWithDatasets: [],
    resource: undefined,
  };
};

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "ScaffoldTooltip",
  components: {
    ProvenanceTooltip,
  },
  props: {
    label: {
      type: String,
      default: "",
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
    showProvenance: {
      type: Boolean,
      default: false,
    },
    /**
     * Specify the endpoint of the flatmap server.
     */
    flatmapAPI: {
      type: String,
      default: "https://mapcore-demo.org/current/flatmap/v3/",
    },
  },
  data: function () {
    return {
      display: false,
      provenance: createUnfilledTooltipData(),
      displayProvenance: false,
    };
  },
  computed: {
    position: function () {
      let xOffset = 5;

      return { left: this.x +  xOffset + "px", top: this.y + "px" };
    },
  },
  methods: {
    /**
     * Get the provenance using the a function from flatampvuer
     */
    getProvenance: async function () {
      this.displayProvenance = false;
      if (this.display && this.showProvenance) {
        if (this.label) {
          const names = getNerveNames(this.label);
          if (names.length > 0) {
            const data = {
              label: names[0],
              resource: names,
              feature: { source: undefined },
            };
            let results = await this.flatmapQueries.retrieveFlatmapKnowledgeForEvent(
              data
            );
            if (results[0]) {
              this.provenance = this.flatmapQueries.createTooltipData(data);
              this.displayProvenance = true;
            }
          }
        }
      }
    },
    /**
     * This is called when a new zinc object is read into the scene.
     */
    displayTooltip: function () {
      if (this.visible && this.label && this.label !== "") {
        this.display = true;
        this.getProvenance();
      } else {
        this.display = false;
      }
    },
  },
  watch: {
    label: {
      handler: function () {
        this.displayTooltip();
      },
      immediate: true,
    },
    visible: {
      handler: function () {
        this.displayTooltip();
      },
      immediate: true,
    },
    showProvenance: {
      handler: function () {
        this.getProvenance();
      },
      immediate: true,
    }
  },
  mounted: function () {
    this.flatmapQueries = new FlatmapQueries();
    this.flatmapQueries.initialise("", this.flatmapAPI);
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

    &.el-popper[x-placement^="left"] {
      .popper__arrow {
        border-left-color: $app-primary-color !important;
        &:after {
          border-left-color: #fff !important;
        }
      }
    }

    &.el-popper[x-placement^="right"] {
      .popper__arrow {
        border-right-color: $app-primary-color !important;
        &:after {
          border-right-color: #fff !important;
        }
      }
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

  .tooltip-text {
    text-align: center;
  }

  ::v-deep .non-selectable {
    user-select: none;
    pointer-events: none;
  }
}
</style>
