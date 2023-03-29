import { ref } from "vue";

export const useCars = () => {
  const cars = ref([]);
  const carsSubGroup = ref([]);
  const carsGroupTypes = ref([
    {
      color: "blue",
      roadmap: "bottom-top",
      init: {
        mainGroup: {
          coordinate: { x: [2], y: [-26] },
          gap: { axis: "y", commit: "increase" },
        },
        subGroup: {
          coordinate: { x: [2], y: [-27] },
          gap: { axis: "y", commit: "decrease" },
        },
      },
    },
    {
      color: "red",
      roadmap: "top-bottom",
      init: {
        mainGroup: {
          coordinate: { x: [-3], y: [27] },
          gap: { axis: "y", commit: "decrease" },
        },
        subGroup: {
          coordinate: { x: [-3], y: [28] },
          gap: { axis: "y", commit: "increase" },
        },
      },
    },
    {
      color: "dark",
      roadmap: "left-right",
      init: {
        mainGroup: {
          coordinate: { x: [-27], y: [-2] },
          gap: { axis: "x", commit: "increase" },
        },
        subGroup: {
          coordinate: { x: [-28], y: [-2] },
          gap: { axis: "x", commit: "decrease" },
        },
      },
    },
    {
      color: "purple",
      roadmap: "right-left",
      init: {
        mainGroup: {
          coordinate: { x: [26], y: [3] },
          gap: { axis: "x", commit: "decrease" },
        },
        subGroup: {
          coordinate: { x: [27], y: [3] },
          gap: { axis: "x", commit: "increase" },
        },
      },
    },
  ]);

  return {
    cars,
    carsSubGroup,
    carsGroupTypes,
  };
};
