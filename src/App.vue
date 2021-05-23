<template>
    <router-view/>
  <!--    <div id="nav">-->
  <!--    </div>-->
<!--    <router-view v-slot="{ Component }">-->
<!--      <keep-alive :include="$store.state.keepLiveRoute">-->
<!--        <component :is="Component"/>-->
<!--      </keep-alive>-->
<!--    </router-view>-->
</template>
<script>

export default {
  name: "Home"
}
</script>
<style lang="less">
* {
  padding: 0;
  margin: 0;
}

#app {
  user-select: none;
  color: #323233;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  //a:visited {
  //  color: #323233;
  //}
}

</style>
