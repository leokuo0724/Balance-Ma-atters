import { TColorKey } from "~/constants";

export const hexToDecimal = (colorKey: TColorKey) => {
  const hex = colorKey.substring(1);
  const decimal = parseInt(hex, 16);
  return decimal;
};
