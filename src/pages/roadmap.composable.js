import { ref } from "vue";
import { trafficLightSequencesList } from "./trafficLightSequences";

export const useRoad = () => {
  const crossRoadsCordinate = ref([
    [0, -0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, -1],
    [0, -2],
    [1, -0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, -1],
    [1, -2],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, -1],
    [2, -2],

    [-1, -0],
    [-1, 1],
    [-1, 2],
    [-1, 3],
    [-1, -1],
    [-1, -2],

    [-2, 0],
    [-2, 1],
    [-2, 2],
    [-2, 3],
    [-2, -1],
    [-2, -2],

    [-3, 0],
    [-3, 1],
    [-3, 2],
    [-3, 3],
    [-3, -1],
    [-3, -2],
  ]);

  const trafficLightSequences = ref(trafficLightSequencesList);

  const trafficLightsCoordinateY = ref([
    [-4, 5],
    [3, -4],
  ]);

  const trafficLightsCoordinateX = ref([
    [-6, -3],
    [5, 4],
  ]);

  const topBottomStopBandCoordinate = ref([
    [0, 4],
    [1, 4],
    [2, 4],

    [-1, 4],
    [-2, 4],
    [-3, 4],
  ]);

  const bottomTopStopBandCoordinate = ref([
    [0, -3],
    [1, -3],
    [2, -3],

    [-1, -3],
    [-2, -3],
    [-3, -3],
  ]);

  const leftRightStopBandCoordinate = ref([
    [-4, 3],
    [-4, 2],
    [-4, 1],
    [-4, 0],
    [-4, -1],
    [-4, -2],
  ]);

  const rightLeftStopBandCoordinate = ref([
    [3, 3],
    [3, 2],
    [3, 1],
    [3, 0],
    [3, -1],
    [3, -2],
  ]);

  const directionsList = ref(["left", "right", "center"]);

  const roadMapDirections = ref({
    "bottom-top": {
      left: "right-left",
      right: "left-right",
      center: "bottom-top",
    },
    "top-bottom": {
      left: "left-right",
      right: "right-left",
      center: "top-bottom",
    },
    "left-right": {
      left: "bottom-top",
      right: "top-bottom",
      center: "left-right",
    },
    "right-left": {
      left: "top-bottom",
      right: "bottom-top",
      center: "right-left",
    },
  });

  const roadMapOptions = ref({
    "bottom-top": {
      roadOptions: {
        bandLimit: {
          x: [2, 1, -0, 0],
          y: [],
        },
        outbound: {
          x: [],
          y: [29],
        },
        priority: { axis: "x", roadmap: "right-left" },
      },
      moveOptions: { axis: "y", commit: "increase" },
      overtakeOptions: { axis: "x", commit: "decrease" },
    },

    "top-bottom": {
      roadOptions: {
        bandLimit: { x: [-3, -2, -1], y: [] },
        priority: { axis: "x", roadmap: "left-right" },
        outbound: {
          x: [],
          y: [-28],
        },
      },
      moveOptions: { axis: "y", commit: "decrease" },
      overtakeOptions: { axis: "x", commit: "increase" },
    },

    "left-right": {
      roadOptions: {
        bandLimit: { x: [], y: [-2, -1, 0] },
        priority: { axis: "y", roadmap: "bottom-top" },
        outbound: {
          x: [28],
          y: [],
        },
      },
      moveOptions: { axis: "x", commit: "increase" },
      overtakeOptions: { axis: "y", commit: "increase" },
    },

    "right-left": {
      roadOptions: {
        bandLimit: { x: [], y: [3, 2, 1] },
        priority: { axis: "y", roadmap: "top-bottom" },
        outbound: {
          x: [-29],
          y: [],
        },
      },
      moveOptions: { axis: "x", commit: "decrease" },
      overtakeOptions: { axis: "y", commit: "decrease" },
    },
  });

  return {
    roadMapOptions,
    directionsList,
    roadMapDirections,
    rightLeftStopBandCoordinate,
    topBottomStopBandCoordinate,
    bottomTopStopBandCoordinate,
    leftRightStopBandCoordinate,
    crossRoadsCordinate,
    trafficLightSequences,
    trafficLightsCoordinateX,
    trafficLightsCoordinateY,
  };
};
