// src/utils/missionHelper.js
let missionAdvanceFn = null;

export const setMissionAdvanceFn = (fn) => {
  missionAdvanceFn = fn;
};

export const advanceMissions = async (tipo, cantidad = 1) => {
  if (missionAdvanceFn) {
    await missionAdvanceFn(tipo, cantidad);
  }
};
