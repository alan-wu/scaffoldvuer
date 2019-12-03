<template>
  <div id="app">
    <ScaffoldVuer url="https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/scaffold/use_case4/rat_heart_metadata.json" ref="scaffold"/>
  </div>
</template>

<script>
import ScaffoldVuer from './components/ScaffoldVuer.vue'

export default {
  name: 'app',
  components: {
    ScaffoldVuer
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
