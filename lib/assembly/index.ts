import { assemblyBoltProps } from "./bolt"
import { assemblyCableProps } from "./cable"
import { assemblyDeviceProps } from "./device"
import { assemblyScreenProps } from "./screen"
import { assemblyScrewProps } from "./screw"

export * from "./bolt"
export * from "./cable"
export * from "./device"
export * from "./screen"
export * from "./screw"

export const assemblyProps = {
  bolt: assemblyBoltProps,
  cable: assemblyCableProps,
  device: assemblyDeviceProps,
  screen: assemblyScreenProps,
  screw: assemblyScrewProps,
} as const
