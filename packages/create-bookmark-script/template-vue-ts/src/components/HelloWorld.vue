<template>
  <h2>
    <a href="https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/packages/bookmark-script" target="_blank"
      rel="bookmark-script readme">
      bookmark-script
    </a>
    +
    <a href="https://vuejs.org/" target="_blank">Vue</a>
  </h2>
  <button type="button" @click="count++">Count {{ count }}</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
</script>