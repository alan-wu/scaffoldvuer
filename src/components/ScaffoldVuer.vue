<template>
  <div class="scaffold-container">
    <div id="organsDisplayArea" style="height:100%;width:100%;" ref="display">
    </div>
    <div id="timeSliderContainer" class="mpbrow" style="position:absolute;bottom: 6%;width:95%;">
      <div class="col-sm-1" >
      </div>
      <div class="col-sm-1" >
        <div id="organsPlayToggle" class="play" style="text-align:left;"></div>
      </div>
      <div class="col-sm-1" >
      </div>
      <div class="col-sm-9">
        <input id="organ_animation_slider" type="range" min="0" max="100" value ="0" step="1" style="height: 48px;width:95%"/>
      </div>
    </div>

  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
const OrgansViewer = require('physiomeportal/src/modules/organsRenderer').OrgansViewer;

export default {
  name: 'ScaffoldVuer',
  props: ['url'],
  mounted: function () {
    this.$module = new OrgansViewer();
    this.$module.initialiseRenderer(this.$refs.display);
    this.$module.loadOrgansFromURL(this.url, undefined, undefined, "Overlay", undefined);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.scaffold-container {
  height:100%;
}

</style>
