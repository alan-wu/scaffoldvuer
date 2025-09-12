<template>
  <div
    ref="overlay"
  >
    <div class="content-layer" ref="contentLayer"
      @mouseleave.capture="skipWhenInBound"
      @mousedown.capture="(event) => contentMouseActive(event, true)"
      @mouseup.capture="(event) => contentMouseActive(event, false)"
    >
      <slot />
    </div>
    <div v-if="positionalRotation" ref="topLayer"
      @mousemove.capture="forwardEvent"
      @mouseover.capture="forwardEvent"
      @click.capture="forwardEvent"
    >
      <div class="rotation-overlay top"
        @mousedown="(event) => {setRotationMode(event, 'vertical'); forwardEvent(event)}"
        @mouseup="forwardEvent"
      >
        <span>Click and drag here to rotate vertically</span>
      </div>
      <div class="rotation-overlay bottom"
        @mousedown="(event) => {setRotationMode(event, 'vertical'); forwardEvent(event)}"
        @mouseup="forwardEvent"
      >
        <span>Click and drag here to rotate vertically</span>
      </div>
      <div class="rotation-overlay left"
        @mousedown="(event) => {setRotationMode(event, 'horizontal'); forwardEvent(event)}"
        @mouseup="forwardEvent"
      >
        <span>Click and drag here to rotate horizontally</span>
      </div>
      <div class="rotation-overlay right"
        @mousedown="(event) => {setRotationMode(event, 'horizontal'); forwardEvent(event)}"
        @mouseup="forwardEvent"
      >
        <span>Click and drag here to rotate horizontally</span>
      </div>
    </div>

  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */

export default {
  name: "ScaffoldOverlay",
  data: function () {
    return {
      lockRotationMode: false,
    }
  },
  props: {
    /**
     * Experimental feature to restrict rotation at
     * one-axis based on position of the initial click
     */
     positionalRotation: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    contentMouseActive: function(event, flag) {
      if (this.positionalRotation) {
        const topLayer = this.$refs.topLayer;
        
        if (topLayer) {
          if (!flag) {
            this.lockRotationMode = false;
            this.setRotationMode(undefined, "free");
            topLayer.style.pointerEvents = 'auto';
          }
          else {
            this.lockRotationMode = true;
            topLayer.style.pointerEvents = 'none';
          }
        }
      }
      event.preventDefault();
    },
    setRotationMode: function(event, mode) {
      if (!this.lockRotationMode) {
        this.$emit('onRotationModeChange', mode);
      }
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    skipWhenInBound: function(event) {
      if (this.positionalRotation) {
        const topLayer = this.$refs.topLayer;
        const contentLayer = this.$refs.contentLayer;
        if (topLayer && contentLayer) {
          const pointerEvents = topLayer.style.pointerEvents;
          topLayer.style.pointerEvents = 'none';
          const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
          topLayer.style.pointerEvents = pointerEvents;
          if (contentLayer.contains(elementBelow)) {
            event.stopPropagation();
          }
        }
      }
    },
    forwardEvent: function(event) {
      const topLayer = this.$refs.topLayer;
      if (!topLayer) return;
      // Find the element directly underneath the cursor
      const pointerEvents = topLayer.style.pointerEvents;
      topLayer.style.pointerEvents = 'none';
      const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
      //const elementBelow = this.$el;
      topLayer.style.pointerEvents = pointerEvents;
      //const elementBelow = this.$refs.contentLayer;
      // Hide the top layer from pointer events
      // If there's an element below, dispatch a new event on it
      if (elementBelow) {
        // We create a new MouseEvent, copying the properties from the original event.
        // This is more robust than dispatching the original event itself.
        const newEvent = new MouseEvent(
          event.type,
          {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            view: event.view,
            clientX: event.clientX,
            clientY: event.clientY,
            button: event.button,
          }
        );
        elementBelow.dispatchEvent(newEvent);
        event.stopPropagation();
      }

      event.preventDefault();
    }
  }
}
</script>

<style scoped lang="scss">
.rotation-overlay {
  z-index: 1;
  background-color: transparent;
  position:absolute;
  opacity: 0;
  &:hover {
    opacity: 1;
    background-color: rgba(173,216,230, 0.1)
  }
  &.top {
    top:0%;
    height:20%;
    left: 35%;
    width: 30%;
  }
  &.bottom {
    bottom:0%;
    height:20%;
    left: 35%;
    width: 30%;
  }
  &.left {
    top:35%;
    height:30%;
    left: 0%;
    width: 20%;
  }
  &.right {
    top:35%;
    height:30%;
    right: 0%;
    width: 20%;
  }
  span {
    position: relative;
    color:black;
    opacity:0.5;
    top: 50%;
  }
}

.content-layer {
  width: 100%;
  height: 100%;
}

</style>
