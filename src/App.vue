<template>
  <div id="app">
    <button v-on:click="onClick('rat')">Rat</button>
    <button v-on:click="onClick('mouse')">Mouse</button>
    <input v-model="url" style="width:80%;padding-left: 15px;">
    <ScaffoldVuer :url="url" ref="scaffold" showColourPicker/>
  </div>
</template>

<script>
import ScaffoldVuer from './components/ScaffoldVuer.vue'

export default {
  name: 'app',
  components: {
    ScaffoldVuer
  },
  methods: {
    onClick: function(species) {
      if (species == "rat") {
        this.url = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
      } else if (species == "mouse") {
        this.url = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/27_Feb_2020/mouse_heart/mouse_heart_1.json";
      }
    }
  },
  data: function() {
    return {
      url:"https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json"
    };
  },
  beforeMount: function() {
    const queryString = require('query-string');
    const parsed = queryString.parse(location.search);
    if (parsed.url)
      this.url= parsed.url;
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  width: 100%;
  position:absolute;
}

body {
  margin: 0px;
}
</style>
