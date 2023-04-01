<template>
  <div>
    <div :class="carsColor" style="min-width: 13px; min-height: 13px"></div>
  </div>
</template>
<script setup>
import { onMounted, computed } from "vue";

const $props = defineProps({
  coordinate: Array,
  cars: Array,
});

const carsInCoordinate = computed(() =>
  $props.cars.filter(
    (v) =>
      v.body.coordinate.x.includes($props.coordinate[0]) &&
      v.body.coordinate.y.includes($props.coordinate[1])
  )
);

const carsColor = computed(() => "bg-" + carsInCoordinate.value[0]?.color);

function findCoordinateIndex(x, y) {
  let i, j;
  const matriceLength = matrice.value.length;

  for (let rowIndex = 0; rowIndex < matriceLength; rowIndex++) {
    const row = matrice.value[rowIndex];
    const columnLength = row.length;

    for (let columnIndex = 0; columnIndex < columnLength; columnIndex++) {
      const column = row[columnIndex];

      if (column.join(", ") !== [x, y].join(", ")) continue;

      i = rowIndex;
      j = columnIndex;
      break;
    }
  }

  return { i, j };
}

onMounted(() => {});
</script>
