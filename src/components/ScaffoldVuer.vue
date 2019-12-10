<template>
  <div class="scaffold-container">
    <div style="height:100%;width:100%;position:relative">
      <div id="organsDisplayArea" style="height:100%;width:100%;" ref="display">
      </div>
      <div class="check-list">
        <el-row style="margin-bottom:10px;">
          <el-button type="success" @click="viewAll" round>View all</el-button>
        </el-row>
        <el-row v-for="item in sceneData.groups" :key="item">
          <el-checkbox-button :label="item" @change="visibilityToggle(item, $event)" :checked=true size="small">{{item}}</el-checkbox-button>
        </el-row>
      </div>
      <div class="timeSlider" v-if="sceneData.timeVarying">
        <el-button type="success" v-if="isPlaying" @click="play(false)" icon="el-icon-video-pause" round>Pause</el-button>
        <el-button type="success" v-else @click="play(true)" icon="el-icon-video-play" round>Play</el-button>
        <el-slider :min=0 :max=100 :value="sceneData.currentTime" :step=0.1 @input="timeChange($event)"></el-slider>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Button, CheckboxButton, Row, Slider } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Button);
Vue.use(CheckboxButton);
Vue.use(Row);
Vue.use(Slider);

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
      this.$module.changeOrganPartsVisibility(item, event);
    },
    timeChange: function(event) {
      if (event != this.sceneData.currentTime)
        this.$module.updateTime(event);
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
       isPlaying: false,
       step: 0.1
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
  width:100%;
}

.check-list {
  position: absolute;
  top:10px;
  left: 10px;
  text-align:left;
}

.timeSlider {
  position: absolute;
  left: 2.5%;
  height: 48px;
  width:95%;
  bottom: 40px;
}

</style>
