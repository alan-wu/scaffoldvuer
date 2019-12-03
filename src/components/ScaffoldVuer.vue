<template>
  <div class="scaffold-container">
    <div id="organsDisplayArea" style="height:100%;width:100%;" ref="display">
    </div>
    <div id="check-list">
      <button @click="viewAll">View all</button>
      <div v-for="item in sceneData.groups" v-bind:key="item">
        <input type="checkbox" :id="item" :value="item" @change="visibilityToggle(item, $event)" checked>
        <label :for="item">{{item}}</label>
      </div>
      <button v-if="isPlaying" @click="play(false)">Stop</button>
      <button v-else @click="play(true)">Play</button>
    </div>
    <input v-if="sceneData.timeVarying" id="timeSlider" type="range" min="0" max="100" :value="sceneData.currentTime" step="0.1" @input="timeChange($event)"/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
const OrgansViewer = require('physiomeportal/src/modules/organsRenderer').OrgansViewer;
const EventNotifier = require("physiomeportal/src/utilities/eventNotifier").EventNotifier;

const eventNotifierCallback = function(component) {
  return function(event) {
    if (event.eventType == 1)
      component.$emit('scaffold-selected', event.identifiers);
    else if (event.eventType == 2)
      component.$emit('scaffold-highlighted', event.identifiers);
  }
}

export default {
  name: 'ScaffoldVuer',
  beforeCreate: function() {
    let eventNotifier = new EventNotifier();
    eventNotifier.subscribe(this, eventNotifierCallback(this));
    this.$module = new OrgansViewer();
    this.$module.addNotifier(eventNotifier);
  },
  methods: {
    viewAll: function() {
      this.$module.viewAll();
    },
    visibilityToggle: function(item, event) {
      this.$module.changeOrganPartsVisibility(item, event.srcElement.checked);
    },
    timeChange: function(event) {
      this.$module.updateTime(event.srcElement.value);
    },
    play: function(flag) {
      this.$module.playAnimation(flag);
      this.isPlaying = flag;
    }
  },
  props: ['url'],
  data: function() {
    return {
       sceneData: this.$module.sceneData,
       isPlaying: false
    }
  },
  mounted: function () {
    this.$module.loadOrgansFromURL(this.url, undefined, undefined, "Overlay", undefined);
    this.$module.initialiseRenderer(this.$refs.display);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.scaffold-container {
  height:100%;
}

#check-list {
  position: absolute;
  top:10px;
  left: 10px;
  text-align:left;
}

#timeSlider {
  position: absolute;
  left: 2.5%;
  height: 48px;
  width:95%;
  bottom: 10px;
}

</style>
