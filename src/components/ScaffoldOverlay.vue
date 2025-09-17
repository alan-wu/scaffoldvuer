<template>
  <div
    ref="overlay"
  >
    <div
      class="content-layer" ref="contentLayer"
      @mouseleave.capture="skipWhenInBound"
      @mousedown.capture="(event) => contentMouseActive(event, true)"
      @mouseup.capture="(event) => contentMouseActive(event, false)"
      @touchstart.capture="(event) => contentMouseActive(event, true)"
      @touchend.capture="(event) => contentMouseActive(event, false)"
    >
      <slot />
    </div>
    <div v-if="positionalRotation" ref="topLayer"
      @mousemove.capture="forwardEvent"
      @mouseover.capture="forwardEvent"
      @touchmove.capture="forwardTouchEvent"
      @click.capture="forwardEvent"
    >
      <div
        v-for="overlay in rotationOverlays"
        :key="overlay.position"
        :class="['rotation-overlay', overlay.position, touchActive ? 'touch-active' : '']"
        @mousedown="(event) => {setRotationMode(event, overlay.mode); forwardEvent(event)}"
        @mouseup="forwardEvent"
        @touchstart="(event) => {setRotationMode(event, overlay.mode); forwardTouchEvent(event)}"
        @touchend="forwardTouchEvent"
      >
        <span>{{ overlay.text }}</span>
      </div>
    </div>

  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */

const rotationOverlays = [
  { position: 'top', mode: 'vertical', text: 'Begin interaction here to rotate on the x-axis' },
  { position: 'bottom', mode: 'vertical', text: 'Begin interaction here to rotate on the x-axis' },
  { position: 'left', mode: 'horizontal', text: 'Begin interaction here to rotate on the y-axis' },
  { position: 'right', mode: 'horizontal', text: 'Begin interaction here to rotate on the y-axis' },
];

export default {
  name: "ScaffoldOverlay",
  data: function () {
    return {
      lockRotationMode: false,
      touchActive: false,
      rotationOverlays: rotationOverlays,
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
            if (event.type === "touchend") {
              this.touchActive = false;
            }
          }
          else {
            this.lockRotationMode = true;
            topLayer.style.pointerEvents = 'none';
            if (event.type === "touchstart") {
              this.touchActive = true;
            }
          }
        }
      }
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
    },
    forwardTouchEvent: function(event) {
      const topLayer = this.$refs.topLayer;
      if (!topLayer) return;
      // Find the element directly underneath the cursor
      const pointerEvents = topLayer.style.pointerEvents;
      topLayer.style.pointerEvents = 'none';
      const firstTouch = event.changedTouches[0];
      const clientX = firstTouch.clientX;
      const clientY = firstTouch.clientY;
      const elementBelow = document.elementFromPoint(clientX, clientY);
      topLayer.style.pointerEvents = pointerEvents;
      if (elementBelow) {
        const newTouch = new Touch({
          identifier: firstTouch.identifier,
          target: elementBelow,
          clientX: firstTouch.clientX,
          clientY: firstTouch.clientY,
          pageX: firstTouch.pageX,
          pageY: firstTouch.pageY,
          screenX: firstTouch.screenX,
          screenY: firstTouch.screenY,
          radiusX: firstTouch.radiusX,
          radiusY: firstTouch.radiusY,
          rotationAngle: firstTouch.rotationAngle,
          force: firstTouch.force,
        });
        const newEvent = new TouchEvent(
          event.type,
          {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: true,
            view: event.view,
            touches: [newTouch],
            targetTouches: [newTouch],
            changedTouches: [newTouch],
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
  &.touch-active {
    opacity: 1;
    background-color: rgba(173,216,230, 0.1)
  }
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
