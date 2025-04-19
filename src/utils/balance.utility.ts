import { COLOR_KEY, TColorKey } from "~/constants";
import { EBalanceType } from "~/type";

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
