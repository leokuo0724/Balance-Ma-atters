import { COLOR_KEY, TColorKey } from "~/constants";
import { EBalanceSetType, EBalanceType } from "~/type";

export const getBalanceColor = (type: EBalanceType): TColorKey => {
  switch (type) {
    case EBalanceType.PHY:
    case EBalanceType.MAG:
      return COLOR_KEY.RED_6;
    case EBalanceType.DEF:
    case EBalanceType.ATK:
      return COLOR_KEY.YELLOW_6;
    case EBalanceType.SHT:
    case EBalanceType.LNG:
      return COLOR_KEY.GREEN_6;
    case EBalanceType.DUT:
    case EBalanceType.FIR:
      return COLOR_KEY.BLUE_6;
  }
};

export const getBalanceSetColor = (type: EBalanceSetType): TColorKey => {
  switch (type) {
    case EBalanceSetType.PHY_MAG:
      return COLOR_KEY.RED_6;
    case EBalanceSetType.DEF_ATK:
      return COLOR_KEY.YELLOW_6;
    case EBalanceSetType.SHT_LNG:
      return COLOR_KEY.GREEN_6;
    case EBalanceSetType.DUT_FIR:
      return COLOR_KEY.BLUE_6;
  }
};

export const getBalanceShortText = (type: EBalanceType): string => {
  const map = {
    [EBalanceType.PHY]: "PHY",
    [EBalanceType.MAG]: "MAG",
    [EBalanceType.DEF]: "DEF",
    [EBalanceType.ATK]: "ATK",
    [EBalanceType.SHT]: "SHT",
    [EBalanceType.LNG]: "LNG",
    [EBalanceType.DUT]: "DUT",
    [EBalanceType.FIR]: "FIR",
  };
  return map[type];
};

export const getBalanceLongText = (type: EBalanceType): string => {
  const map = {
    [EBalanceType.PHY]: "Physical",
    [EBalanceType.MAG]: "Magical",
    [EBalanceType.DEF]: "Defense",
    [EBalanceType.ATK]: "Attack",
    [EBalanceType.SHT]: "Short",
    [EBalanceType.LNG]: "Long",
    [EBalanceType.DUT]: "Dust",
    [EBalanceType.FIR]: "Fire",
  };
  return map[type];
};

export const getBalanceLeftRightSet = (type: EBalanceSetType) => {
  switch (type) {
    case EBalanceSetType.PHY_MAG:
      return [EBalanceType.PHY, EBalanceType.MAG];
    case EBalanceSetType.DEF_ATK:
      return [EBalanceType.DEF, EBalanceType.ATK];
    case EBalanceSetType.SHT_LNG:
      return [EBalanceType.SHT, EBalanceType.LNG];
    case EBalanceSetType.DUT_FIR:
      return [EBalanceType.DUT, EBalanceType.FIR];
  }
};

export const getIsRightLibraValue = (type: EBalanceType) => {
  switch (type) {
    case EBalanceType.PHY:
    case EBalanceType.DEF:
    case EBalanceType.SHT:
    case EBalanceType.DUT:
      return false;
    case EBalanceType.MAG:
    case EBalanceType.ATK:
    case EBalanceType.LNG:
    case EBalanceType.FIR:
      return true;
  }
};

export const getBalanceSetType = (type: EBalanceType): EBalanceSetType => {
  switch (type) {
    case EBalanceType.PHY:
    case EBalanceType.MAG:
      return EBalanceSetType.PHY_MAG;
    case EBalanceType.DEF:
    case EBalanceType.ATK:
      return EBalanceSetType.DEF_ATK;
    case EBalanceType.SHT:
    case EBalanceType.LNG:
      return EBalanceSetType.SHT_LNG;
    case EBalanceType.DUT:
    case EBalanceType.FIR:
      return EBalanceSetType.DUT_FIR;
  }
};
