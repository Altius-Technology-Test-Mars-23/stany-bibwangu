<template>
  <q-page>
    <div class="column q-mt-lg items-center justify-center">
      <div
        class="col-auto relative-position"
        style="width: 702px; height: 702px"
      >
        <div class="absolute text-center" style="right: 0; z-index: 100">
          <div class="text-h1">
            {{ globaltime }}
          </div>

          <div class="q-mt-lg bg-grey-1 q-pa-sm" style="border-radius: 10px">
            <div class="text-weight-light text-body1">
              {{ "outbound cars" }}
            </div>
            <div class="text-weight-medium text-h6">
              {{ outboundList.length }}
            </div>
          </div>
        </div>

        <div class="absolute text-center" style="left: 0; z-index: 100">
          <div class="text-h1">
            {{ globalRuntimeTime }}
          </div>

          <div>
            <q-btn
              color="primary"
              label="START SIMULATION"
              @click="startSimulation"
            />
          </div>

          <div class="q-mt-lg bg-grey-1 q-pa-sm" style="border-radius: 10px">
            <div class="text-weight-light text-body1">
              {{ "Traffic light violation" }}
            </div>
            <div class="text-weight-medium text-h6">
              {{ redLightViolation }}
            </div>

            <div class="q-mt-md text-weight-light text-body1">
              {{ "Priority violation" }}
            </div>

            <div class="text-weight-medium text-h6">
              {{ priorityViolation }}
            </div>
          </div>
        </div>
        <div
          v-for="(row, rowIndex) in matrice"
          :key="rowIndex"
          class="row col-auto"
        >
          <div
            v-for="(column, columnIndex) in row"
            :key="columnIndex"
            :style="
              roadStripsXCoordinateIndex.includes(rowIndex) ||
              roadStripsYCoordinateIndex.includes(columnIndex)
                ? 'border:1px solid'
                : ''
            "
            style="width: 13px; height: 13px"
            class="col-auto relative-position"
          >
            <CarAndPositionComponent
              class="absolute"
              style="z-index: 20"
              v-if="
                roadStripsXCoordinateIndex.includes(rowIndex) ||
                roadStripsYCoordinateIndex.includes(columnIndex)
              "
              :coordinate="column"
              :cars="cars"
            />

            <div
              class="absolute"
              v-if="
                trafficLightsCoordinateY.filter(
                  (v) => v.toString() === column.toString()
                ).length
              "
              :class="'bg-' + currentTrafficLightSequence?.y"
              style="min-width: 12px; min-height: 12px; border-radius: 100%"
            ></div>

            <div
              class="absolute"
              v-if="
                trafficLightsCoordinateX.filter(
                  (v) => v.toString() === column.toString()
                ).length
              "
              :class="'bg-' + currentTrafficLightSequence?.x"
              style="min-width: 12px; min-height: 12px; border-radius: 100%"
            ></div>

            <div
              class="absolute"
              v-if="
                bottomTopStopBandCoordinate.filter(
                  (v) => v.toString() === column.toString()
                ).length ||
                topBottomStopBandCoordinate.filter(
                  (v) => v.toString() === column.toString()
                ).length ||
                leftRightStopBandCoordinate.filter(
                  (v) => v.toString() === column.toString()
                ).length ||
                rightLeftStopBandCoordinate.filter(
                  (v) => v.toString() === column.toString()
                ).length
              "
              :class="'bg-grey-6'"
              style="min-width: 12px; min-height: 12px"
            >
              <StopBandComponent
                :stop-band-coordinates="leftRightStopBandCoordinate"
                :coordinate="column"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import CarAndPositionComponent from "src/components/carAndPositionComponent.vue";
import StopBandComponent from "src/components/StopBandComponent.vue";
import { onBeforeMount, ref, computed, watch } from "vue";
import { useRoad } from "./roadmap.composable";
import { useCars } from "./cars.composable";

const matrice = ref(
  Array(54)
    .fill(0)
    .map(() => Array(54).fill(0))
);

const redLightViolation = ref(0);
const priorityViolation = ref(0);

const runtimeTimer = ref(0);
const globalTimer = ref(0);

const trafficLightTimeStart = ref(null);
const globalTimerTimestampStart = ref(null);
const subGroupSequenceTimestampStart = ref(0);

const similationIntervalId = ref(null);
const simulationIntervalTimeStart = ref(null);
const simulationStarted = ref(false);

const currentTrafficLightSequence = ref(null);
const currentTrafficLightSequenceIndex = ref(0);

const outboundList = ref([]);

const {
  rightLeftStopBandCoordinate,
  topBottomStopBandCoordinate,
  bottomTopStopBandCoordinate,
  leftRightStopBandCoordinate,
  roadMapOptions,
  directionsList,
  roadMapDirections,
  crossRoadsCordinate,
  trafficLightSequences,
  trafficLightsCoordinateX,
  trafficLightsCoordinateY,
} = useRoad();

const { cars, carsSubGroup, carsGroupTypes } = useCars();

const roadStripsXCoordinateIndex = ref([24, 25, 26, 27, 28, 29]);
const roadStripsYCoordinateIndex = ref([24, 25, 26, 27, 28, 29]);

const globaltime = computed(() => getTime(globalTimer.value));
const globalRuntimeTime = computed(() => getTime(runtimeTimer.value * 1000));

const carsInCrossRoad = computed(() =>
  cars.value.filter((car) => {
    const carRoadMapOptions = roadMapOptions.value[car.roadmap];
    const carMoveAxis = carRoadMapOptions.moveOptions.axis;
    const carMoveCommit = carRoadMapOptions.moveOptions.commit;

    return nearOfCrossRoad(
      car,
      { axis: carMoveAxis, commit: carMoveCommit },
      { exact: true }
    );
  })
);

function getTime(millisecond) {
  const timeInSecond = millisecond / 1000;
  const hours = Math.floor(timeInSecond / 3600);
  const minutes = Math.floor(timeInSecond / 60 - hours / 60);
  const secondes = Math.floor(timeInSecond - hours * 3600 - minutes * 60);

  return `${hours > 9 ? "" : hours !== 0 ? "0" : ""}${
    hours > 0 ? hours + ":" : ""
  }${minutes > 9 ? "" : "0"}${minutes}:${secondes > 9 ? "" : "0"}${secondes}`;
}

function stopSimulation() {
  cancelAnimationFrame(similationIntervalId.value);
  simulationStarted.value = false;
}

function simulatonAnimationFrame(timestamp) {
  if (!simulationIntervalTimeStart.value)
    simulationIntervalTimeStart.value = timestamp;

  const timeElapsed = timestamp - simulationIntervalTimeStart.value;

  if (timeElapsed < 1000) {
    trafficLightSequencesTimeout(timestamp);
    cancelAnimationFrame(similationIntervalId.value);
    similationIntervalId.value = requestAnimationFrame(simulatonAnimationFrame);
    return;
  }

  for (const car of cars.value) {
    changeRoadMapDirection(car, roadMapOptions.value[car.roadmap]);
    moveCar(car, roadMapOptions.value[car.roadmap]);
  }

  runtimeTimer.value++;

  if (runtimeTimer.value - subGroupSequenceTimestampStart.value >= 30) {
    subGroupSequenceTimestampStart.value = runtimeTimer.value;
    cars.value.push(...carsSubGroup.value.shift());
  }

  trafficLightSequencesTimeout(timestamp);

  simulationIntervalTimeStart.value = 0;
  cancelAnimationFrame(similationIntervalId.value);
  similationIntervalId.value = requestAnimationFrame(simulatonAnimationFrame);
}

function startSimulation() {
  if (simulationStarted.value) {
    stopSimulation();
    return;
  }

  simulationStarted.value = true;

  similationIntervalId.value = window.requestAnimationFrame(
    simulatonAnimationFrame
  );
}

function trafficLightSequencesTimeout(timestamp) {
  currentTrafficLightSequence.value =
    trafficLightSequences.value[currentTrafficLightSequenceIndex.value];

  if (!trafficLightTimeStart.value)
    trafficLightTimeStart.value = runtimeTimer.value;

  if (!globalTimerTimestampStart.value)
    globalTimerTimestampStart.value = timestamp;

  const timeElapsed = runtimeTimer.value - trafficLightTimeStart.value;

  const globalTimeElapsed = timestamp - globalTimerTimestampStart.value;

  globalTimer.value = globalTimeElapsed;

  if (timeElapsed < currentTrafficLightSequence.value.timePerSecond) {
    return;
  }

  currentTrafficLightSequenceIndex.value++;

  if (
    currentTrafficLightSequenceIndex.value ===
    trafficLightSequences.value.length
  ) {
    currentTrafficLightSequenceIndex.value = 0;
  }

  trafficLightTimeStart.value = null;
}

function retrieveBand(car, { moveOptions, overtakeOptions, roadOptions }) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  const { bandLimit } = roadOptions;

  car.coordinate[overtakeAxis] = [
    Math.min(...bandLimit[overtakeAxis]),

    car.coordinate[overtakeAxis].length === 2
      ? car.coordinate[overtakeAxis][1]
      : [],
  ].flat();
}

function isCarOutBound(car, { moveOptions, overtakeOptions, roadOptions }) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  return car.coordinate[moveAxis].includes(roadOptions.outbound[moveAxis][0]);
}

function moveCar(car, { moveOptions, overtakeOptions, roadOptions }) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  let inBandLimit = isInBandLimit(car, {
    moveOptions,
    overtakeOptions,
    roadOptions,
  });

  if (!inBandLimit) {
    retrieveBand(car, { moveOptions, overtakeOptions, roadOptions });
  }

  const isStopBandNear = nearOfStopBand(car, {
    axis: moveAxis,
    commit: moveCommit,
  });

  const isNearOfCrossRoad = nearOfCrossRoad(car, {
    axis: moveAxis,
    commit: moveCommit,
  });

  const trafficAllowed = /green|amber/.test(
    currentTrafficLightSequence.value[moveAxis]
  );

  let isDistanceUnsatisfied;

  if (isNearOfCrossRoad) {
    isDistanceUnsatisfied = distanceUnsatisfied(
      car,
      {
        moveOptions,
        overtakeOptions,
      },
      { skipRoadmap: true }
    );
    const isThereCarWithRightPriority = findCarWithRightPriority(car, {
      moveOptions,
      overtakeOptions,
      roadOptions,
    });

    if (
      isThereCarWithRightPriority &&
      (isDistanceUnsatisfied || !trafficAllowed) &&
      carsInCrossRoad.value.length
    ) {
      console.log(
        car.color,
        car.roadmap,
        "found priority",
        isThereCarWithRightPriority.color,
        isThereCarWithRightPriority.roadmap
      );
      return;
    }
  }

  if (!isDistanceUnsatisfied) {
    isDistanceUnsatisfied = distanceUnsatisfied(car, {
      moveOptions,
      overtakeOptions,
    });
  }

  if (isStopBandNear && !trafficAllowed) return;

  if (car.speed === 1 && isDistanceUnsatisfied) return;

  if (isDistanceUnsatisfied && isNearOfCrossRoad) return;

  if (isDistanceUnsatisfied && isStopBandNear) return;

  if (isStopBandNear && carsInCrossRoad.value.length > 3) return;

  const isThereCarAheadToOvertake = findCarAheadToOverTake(car, {
    moveOptions,
    overtakeOptions,
  });

  const isThereCarInPassingLane = findCarInPassingLane(car, {
    moveOptions,
    overtakeOptions,
  });

  inBandLimit = isInBandLimit(
    car,
    {
      moveOptions,
      overtakeOptions,
      roadOptions,
    },
    { overtake: true }
  );

  if (isThereCarAheadToOvertake && isNearOfCrossRoad) return;

  if (
    isThereCarAheadToOvertake &&
    !isThereCarInPassingLane &&
    inBandLimit &&
    car.speed === 2
  )
    carOvertake(car, { moveOptions, overtakeOptions });

  if (
    isThereCarAheadToOvertake &&
    (isThereCarInPassingLane || !inBandLimit) &&
    car.speed === 2
  ) {
    return;
  }

  car.coordinate[moveAxis] = updateCarCoordinate(car, {
    moveOptions,
    overtakeOptions,
  });

  const isOutbound = isCarOutBound(car, {
    moveOptions,
    overtakeOptions,
    roadOptions,
  });

  if (!isOutbound) return;

  outboundList.value.push(car);

  const index = cars.value.findIndex((v) => v.id === car.id);
  cars.value.splice(index, 1);
}

function updateCarCoordinate(
  car,
  { moveOptions, overtakeOptions, roadOptions }
) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  if (
    car.size === 2 &&
    car.coordinate[overtakeAxis].length > car.coordinate[moveAxis].length
  ) {
    car.coordinate[moveAxis] = /increase/.test(moveCommit)
      ? [
          car.coordinate[moveAxis][0] + car.speed,
          car.coordinate[moveAxis][0] + (car.speed + 1),
        ]
      : [
          car.coordinate[moveAxis][0] - car.speed,
          car.coordinate[moveAxis][0] - (car.speed - 1),
        ];

    car.coordinate[overtakeAxis] = [car.coordinate[overtakeAxis][0]];

    return car.coordinate[moveAxis];
  }

  return car.coordinate[moveAxis].map((v) =>
    /increase/.test(moveCommit) ? v + car.speed : v - car.speed
  );
}

function isInBandLimit(
  car,
  { moveOptions, overtakeOptions, roadOptions },
  options
) {
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;
  const { bandLimit } = roadOptions;

  return options?.overtake
    ? bandLimit[overtakeAxis].includes(
        /increase/.test(overtakeCommit)
          ? car.coordinate[overtakeAxis][0] + 1
          : car.coordinate[overtakeAxis][0] - 1
      )
    : bandLimit[overtakeAxis].includes(car.coordinate[overtakeAxis][0]);
}

function distanceUnsatisfied(car, { moveOptions, overtakeOptions }, options) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  return cars.value
    .filter(
      (v) =>
        v.id !== car.id && (v.roadmap === car.roadmap || options?.skipRoadmap)
    )
    .find((v) =>
      /decrease/.test(moveCommit)
        ? //v.coordinate[moveAxis].at(-1) ===
          // car.coordinate[moveAxis][0] - 3 - v.size ||
          (v.coordinate[moveAxis].at(-1) ===
            car.coordinate[moveAxis][0] - 0 - v.size ||
            v.coordinate[moveAxis].at(-1) ===
              car.coordinate[moveAxis][0] - 2 - v.size ||
            v.coordinate[moveAxis].at(-1) ===
              car.coordinate[moveAxis][0] - 1 - v.size ||
            v.coordinate[moveAxis].at(-1) === car.coordinate[moveAxis][0]) &&
          v.coordinate[overtakeAxis][0] === car.coordinate[overtakeAxis][0]
        : //v.coordinate[moveAxis].at(-1) ===
          //car.coordinate[moveAxis][0] + 3 + v.size ||
          (v.coordinate[moveAxis].at(-1) ===
            car.coordinate[moveAxis][0] + 0 + v.size ||
            v.coordinate[moveAxis].at(-1) ===
              car.coordinate[moveAxis][0] + 2 + v.size ||
            v.coordinate[moveAxis].at(-1) ===
              car.coordinate[moveAxis][0] + 1 + v.size ||
            v.coordinate[moveAxis].at(-1) === car.coordinate[moveAxis][0]) &&
          v.coordinate[overtakeAxis][0] === car.coordinate[overtakeAxis][0]
    );
}

function nearOfCrossRoad(car, { axis, commit }, options) {
  return !options?.exact
    ? crossRoadsCordinate.value.find((crossRoad) => {
        const coord = car.coordinate[axis].map((v) =>
          /increase/.test(commit) ? v + car.speed : v - car.speed
        )[0];

        if (car.speed === 2)
          return /increase/.test(commit)
            ? axis === "x"
              ? crossRoad[0] === coord || crossRoad[0] === coord + 1
              : crossRoad[1] === coord || crossRoad[1] === coord + 1
            : axis === "x"
            ? crossRoad[0] === coord || crossRoad[0] === coord - 1
            : crossRoad[1] === coord || crossRoad[1] === coord - 1;

        return axis === "x" ? crossRoad[0] === coord : crossRoad[1] === coord;
      })
    : crossRoadsCordinate.value.find((crossRoad) => {
        const coord = car.coordinate[axis][0];
        return axis === "x" ? crossRoad[0] === coord : crossRoad[1] === coord;
      });
}

function nearOfStopBand(car, { axis, commit }) {
  let stopBand;

  switch (axis) {
    case "y":
      stopBand =
        car.roadmap === "bottom-top"
          ? findStopBand(car, bottomTopStopBandCoordinate.value, {
              axis,
              commit,
            })
          : findStopBand(car, topBottomStopBandCoordinate.value, {
              axis,
              commit,
            });

      break;

    case "x":
      stopBand =
        car.roadmap === "left-right"
          ? findStopBand(car, leftRightStopBandCoordinate.value, {
              axis,
              commit,
            })
          : findStopBand(car, rightLeftStopBandCoordinate.value, {
              axis,
              commit,
            });
      break;

    default:
      break;
  }

  return stopBand;
}

function findStopBand(car, stopBandList, { axis, commit }) {
  return stopBandList.find((stopBand) => {
    const coord = car.coordinate[axis].map((v) =>
      /increase/.test(commit) ? v + car.speed : v - car.speed
    )[0];

    if (car.speed === 2)
      return /increase/.test(commit)
        ? axis === "x"
          ? stopBand[0] === coord || stopBand[0] === coord + 1
          : stopBand[1] === coord || stopBand[1] === coord + 1
        : axis === "x"
        ? stopBand[0] === coord || stopBand[0] === coord - 1
        : stopBand[1] === coord || stopBand[1] === coord - 1;

    return axis === "x" ? stopBand[0] === coord : stopBand[1] === coord;
  });
}

function findCarWithRightPriority(
  car,
  { moveOptions, overtakeOptions, roadOptions }
) {
  return cars.value
    .filter(
      (v) =>
        v.id !== car.id &&
        v.roadmap === roadOptions.priority.roadmap &&
        roadMapOptions.value[car.roadmap].moveOptions.axis !==
          roadMapOptions.value[v.roadmap].moveOptions.axis
    )
    .find((v) => {
      const cursorCarRoadMapOptions = roadMapOptions.value[v.roadmap];
      const cursorCarMoveAxis = cursorCarRoadMapOptions.moveOptions.axis;
      const cursorCarMoveCommit = cursorCarRoadMapOptions.moveOptions.commit;

      const isInCrossRoad = nearOfCrossRoad(
        v,
        {
          axis: cursorCarMoveAxis,
          commit: cursorCarMoveCommit,
        },
        { exact: true }
      );

      const isCarTooNear = v.coordinate[cursorCarMoveAxis].filter((coord) =>
        /increase/.test(cursorCarMoveCommit)
          ? car.coordinate[moveOptions.axis]
              .map((val) =>
                /increase/.test(moveOptions.commit)
                  ? val + car.speed
                  : val - car.speed
              )
              .includes(coord + v.speed) ||
            car.coordinate[moveOptions.axis]
              .map((val) =>
                /increase/.test(moveOptions.commit)
                  ? val + car.speed
                  : val - car.speed
              )
              .includes(coord)
          : car.coordinate[moveOptions.axis]
              .map((val) =>
                /decrease/.test(moveOptions.commit)
                  ? val - car.speed
                  : val + car.speed
              )
              .includes(coord - v.speed) ||
            car.coordinate[moveOptions.axis]
              .map((val) =>
                /decrease/.test(moveOptions.commit)
                  ? val - car.speed
                  : val + car.speed
              )
              .includes(coord)
      );

      const isThereCarAheadToOvertake = findCarAheadToOverTake(car, {
        moveOptions,
        overtakeOptions,
      });

      const isDistanceUnsatisfied = distanceUnsatisfied(
        v,
        cursorCarRoadMapOptions,
        { skipRoadmap: true }
      );

      return (
        (/green|amber/.test(
          currentTrafficLightSequence.value[cursorCarMoveAxis]
        ) ||
          !isDistanceUnsatisfied) &&
        isCarTooNear.length &&
        !isThereCarAheadToOvertake
      );
    });
}

function findCarInPassingLane(car, { moveOptions, overtakeOptions }) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  return cars.value
    .filter((v) => v.id !== car.id && v.roadmap === car.roadmap)
    .find((v) => {
      const isCarAhead = car.coordinate[moveAxis].filter((coord) =>
        /increase/.test(moveCommit)
          ? v.coordinate[moveAxis].includes(coord + car.speed) ||
            v.coordinate[moveAxis].includes(coord + car.speed + 1)
          : v.coordinate[moveAxis].includes(coord - car.speed) ||
            v.coordinate[moveAxis].includes(coord - car.speed - 1)
      );

      const isCarInPassingLane = car.coordinate[overtakeAxis].filter(
        (coord) =>
          (/increase/.test(overtakeCommit)
            ? v.coordinate[overtakeAxis].includes(coord + 1)
            : v.coordinate[overtakeAxis].includes(coord - 1)) &&
          v.id !== car.id &&
          v.roadmap === car.roadmap
      );

      return isCarAhead.length && isCarInPassingLane.length;
    });
}

function findCarAheadToOverTake(
  car,
  { moveOptions, overtakeOptions },
  options
) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  return cars.value
    .filter(
      (v) =>
        v.id !== car.id && (v.roadmap === car.roadmap || options?.skipRoadmap)
    )
    .find((v) => {
      const isCarAhead = car.coordinate[moveAxis].filter((coord) =>
        /increase/.test(moveCommit)
          ? v.coordinate[moveAxis].includes(coord + car.speed) ||
            v.coordinate[moveAxis].includes(coord + car.speed + 1)
          : v.coordinate[moveAxis].includes(coord - car.speed) ||
            v.coordinate[moveAxis].includes(coord - car.speed - 1)
      );

      const isCarOnSameBand = car.coordinate[overtakeAxis].filter(
        (coord) =>
          v.coordinate[overtakeAxis].includes(coord) &&
          v.id !== car.id &&
          v.roadmap === car.roadmap
      );

      return (
        isCarAhead.length && (isCarOnSameBand.length || options?.skipSameBand)
      );
    });
}

function carOvertake(car, { moveOptions, overtakeOptions }) {
  const { axis: moveAxis, commit: moveCommit } = moveOptions;
  const { axis: overtakeAxis, commit: overtakeCommit } = overtakeOptions;

  if (/decrease/.test(overtakeCommit)) {
    car.coordinate[overtakeAxis] = car.coordinate[overtakeAxis].map(
      (v) => v - 1
    );
    return;
  }

  car.coordinate[overtakeAxis] = car.coordinate[overtakeAxis].map((v) => v + 1);
}

function fillMatrice() {
  const matriceLength = matrice.value.length;

  for (let rowIndex = 0; rowIndex < matriceLength; rowIndex++) {
    const row = matrice.value[rowIndex];
    const yCoordinate = matriceLength / 2 - rowIndex;

    const columnLength = row.length;

    for (let columnIndex = 0; columnIndex < columnLength; columnIndex++) {
      const xCoordinate = -(matriceLength / 2 - columnIndex);
      row[columnIndex] = [xCoordinate, yCoordinate];
    }
  }
}

function generateCars() {
  for (const carsGroupType of carsGroupTypes.value) {
    const carsList = createCars(
      5,
      carsGroupType,
      carsGroupType.init.mainGroup.coordinate
    );

    setCarsGap(carsList, carsGroupType.init.mainGroup.gap);

    cars.value.push(...carsList);
  }
}

function generateSubGroupCars() {
  carsSubGroup.value = Array(9)
    .fill(null)
    .reduce((accumulator, curr) => {
      const subGroup = [];

      for (const carsGroupType of carsGroupTypes.value) {
        const carsList = createCars(
          5,
          carsGroupType,
          carsGroupType.init.mainGroup.coordinate
        );

        setCarsGap(carsList, carsGroupType.init.mainGroup.gap, true);

        subGroup.push(...carsList);
      }

      accumulator.push(subGroup);

      return accumulator;
    }, []);
}

function changeRoadMapDirection(
  car,
  { moveOptions, overtakeOptions, roadOptions }
) {
  if (car.previousRoadmap) return;

  const { axis: moveAxis, commit: moveCommit } = moveOptions;

  const crossRoadCoordinate = nearOfCrossRoad(car, {
    axis: moveAxis,
    commit: moveCommit,
  });

  if (!crossRoadCoordinate) return;

  const newRoadmapDirection =
    roadMapDirections.value[car.roadmap][car.direction];

  const newRoadmap = roadMapOptions.value[newRoadmapDirection];

  const newOvertakeAxis = newRoadmap.overtakeOptions.axis;

  if (
    !newRoadmap.roadOptions.bandLimit[newOvertakeAxis].includes(
      /x/.test(newOvertakeAxis)
        ? crossRoadCoordinate[0]
        : crossRoadCoordinate[1]
    )
  )
    return;

  if (newRoadmapDirection === car.roadmap) return;

  moveCar(car, { moveOptions, overtakeOptions, roadOptions });

  car.previousRoadmap = car.roadmap;
  car.roadmap = newRoadmapDirection;
}

function randomSpeedAndSize() {
  return {
    size: Math.max(1, Math.floor(Math.random() * 3)),
    speed: Math.max(1, Math.floor(Math.random() * 3)),
  };
}

function isTrafficLightViolated(neared) {}

function createCar({ color, coordinate, roadmap }) {
  return {
    id: crypto.randomUUID(),
    color,
    coordinate,
    roadmap,
    direction:
      directionsList.value[
        Math.floor(Math.random() * directionsList.value.length)
      ],
    ...randomSpeedAndSize(),
  };
}

function createCars(numberOfCar, carsGroupType, { x, y }) {
  return Array(numberOfCar)
    .fill(null)
    .map(() =>
      createCar({
        color: carsGroupType.color,
        coordinate: { x, y },
        roadmap: carsGroupType.roadmap,
      })
    );
}

function setCarsGap(carsList, { axis, commit }, subGroup) {
  let gap = 0;

  for (const car of subGroup ? carsList : carsList.reverse()) {
    if (/decrease/.test(commit)) {
      car.coordinate[axis] = [car.coordinate[axis][0] - gap];

      if (car.size == 2) car.coordinate[axis].push(car.coordinate[axis][0] - 1);

      gap = !subGroup ? gap + car.size + 2 : gap - car.size - 2;

      continue;
    }

    car.coordinate[axis] = [car.coordinate[axis][0] + gap];

    if (car.size == 2) car.coordinate[axis].push(car.coordinate[axis][0] + 1);

    gap = !subGroup ? gap + car.size + 2 : gap - car.size - 2;
  }

  subGroup ? carsList : carsList.reverse();
}

onBeforeMount(() => {
  fillMatrice();
  generateCars();
  generateSubGroupCars();

  currentTrafficLightSequence.value =
    trafficLightSequences.value[currentTrafficLightSequenceIndex.value];
});
</script>
