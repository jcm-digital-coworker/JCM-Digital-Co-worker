export type BossType = "small" | "large";
export type ThreadType = "NPT" | "AWWA";
export type SimStatus = "PASS" | "CAUTION" | "FAIL";

export type TapCodeData = {
  code: string;
  label: string;
  type: ThreadType;
  nominalSize: string;
  tpi: number;
  taperFactor: number;
  faceMajor: number;
  threadDepth: number;
  threadStartPlane: number;
  drillDepth: number;
  boreTaperEndZ: number;
  boreTaperEndX: number;
  reliefEndZ: number;
  drillTool: string;
  boreTool: string;
  threadTool: string;
  estimatedCycleMinutes: number;
};

export type CastingData = {
  castingNumber: string;
  displayName: string;
  lastThree: string;
  bossType: BossType;
  maxDrillDepth: number;
  maxBoreDepth: number;
  allowedTapCodes: string[];
};

export type LogicInput = {
  castingNumber: string;
  tapCode: string;
  batchTarget: number;
  actualCount: number;
  gaugeCount: number;
  interruptFlag: boolean;
  warmupDone: boolean;
  proveOutMode: boolean;
  bossType: BossType;
};

export type LogicResult = {
  status: SimStatus;
  valid: boolean;
  messages: string[];
  allowedTapCode: boolean;
  smallBossViolation: boolean;
  warmupRequired: boolean;
  nextProgramPath: string;
  gaugeRequired: boolean;
  adaptiveThreadMode: 0 | 1 | 2;
  batchComplete: boolean;
  nextActualCount: number;
  nextGaugeCount: number;
  remainingCount: number;
};

export type GeometryResult = {
  status: SimStatus;
  messages: string[];
  drillZ: number;
  boreTaperZ: number;
  reliefZ: number;
  threadStartZ: number;
  threadEndZ: number;
  g76R: number;
  threadFinalX: number;
  maxDepth: number;
  fixtureMargin: number;
  estimatedCycleMinutes: number;
};