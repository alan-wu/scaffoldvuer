<template>
  <div id="app">
    <input v-model="url" style="width:80%">
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
  data: function() {
    return {
      url:"https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json"
    };
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
