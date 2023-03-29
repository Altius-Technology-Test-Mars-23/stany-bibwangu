<template>
  <div>
    <div class="bg-grey-6" style="min-width: 12px; min-height: 12px"></div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";

const $props = defineProps({
  stopBandCoordinates: Array,
  coordinate: Array,
});

onMounted(() => {});
</script>
