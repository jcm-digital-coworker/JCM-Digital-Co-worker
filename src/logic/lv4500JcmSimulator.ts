import {
  LV4500_CAUTION_DEPTH,
  LV4500_FIXTURE_LIMIT,
  implementedCastings,
  suitePrograms,
  tapCodeTable,
} from "../data/lv4500JcmSuite";
import type { GeometryResult, LogicInput, LogicResult, SimStatus } from "../types/lv4500Jcm";

export function findCasting(castingNumber: string) {
  return implementedCastings.find((c) => c.castingNumber === castingNumber);
}

export function findTapCode(tapCode: string) {
  return tapCodeTable.find((t) => t.code === tapCode);
}

function worstStatus(current: SimStatus, next: SimStatus): SimStatus {
  if (current === "FAIL" || next === "FAIL") return "FAIL";
  if (current === "CAUTION" || next === "CAUTION") return "CAUTION";
  return "PASS";
}

export function runLv4500Logic(input: LogicInput): LogicResult {
  let status: SimStatus = "PASS";
  const messages: string[] = [];

  const casting = findCasting(input.castingNumber);
  const tap = findTapCode(input.tapCode);

  if (!casting) {
    status = "FAIL";
    messages.push("Invalid or unsupported casting number.");
  }

  if (!tap) {
    status = "FAIL";
    messages.push("Invalid tap code. Enter 06 through 16.");
  }

  if (input.batchTarget <= 0) {
    status = "FAIL";
    messages.push("Batch target must be 1 or greater.");
  }

  const realBossType = casting?.bossType ?? input.bossType;
  const smallBossViolation =
    realBossType === "small" && !["06", "07", "08", "09", "10"].includes(input.tapCode);

  if (smallBossViolation) {
    status = "FAIL";
    messages.push("Small boss accepts up to 1-1/4 IP only. Tap code is rejected.");
  }

  const allowedTapCode = Boolean(casting?.allowedTapCodes.includes(input.tapCode));

  if (casting && !allowedTapCode) {
    status = "FAIL";
    messages.push("Tap code is not allowed for this casting.");
  }

  const warmupRequired = !input.warmupDone;

  if (warmupRequired) {
    status = worstStatus(status, "CAUTION");
    messages.push("Warm-up cycle would be required before production.");
  }

  const firstPart = input.actualCount === 0;
  const fivePartGaugeDue = input.gaugeCount >= 5;
  const gaugeRequired = firstPart || input.interruptFlag || fivePartGaugeDue;

  if (firstPart) messages.push("First part requires thread gauge check.");
  if (input.interruptFlag) messages.push("Interrupted cycle forces guarded mode and gauge check.");
  if (fivePartGaugeDue) messages.push("5-part gauge interval is due.");

  const remainingBeforeCycle = Math.max(input.batchTarget - input.actualCount, 0);
  const lastTwoOfBatch = input.batchTarget > 2 && input.actualCount >= input.batchTarget - 2;

  let adaptiveThreadMode: 0 | 1 | 2 = 0;
  if (input.interruptFlag || firstPart) adaptiveThreadMode = 1;
  else if (lastTwoOfBatch) adaptiveThreadMode = 2;

  const cycleCanCount = status !== "FAIL";
  const nextActualCount = input.actualCount + (cycleCanCount ? 1 : 0);
  const nextGaugeCount =
    cycleCanCount && gaugeRequired ? 0 : cycleCanCount ? input.gaugeCount + 1 : input.gaugeCount;

  const remainingCount = Math.max(input.batchTarget - nextActualCount, 0);
  const batchComplete = remainingCount === 0 && input.batchTarget > 0;

  const nextProgramPath =
    status === "FAIL"
      ? "REJECT / DO NOT RUN"
      : warmupRequired
      ? suitePrograms.warmupCycle
      : `${suitePrograms.logicCommander} → ${suitePrograms.borePrepEngine} → ${suitePrograms.threadEngine}`;

  if (status === "PASS") {
    messages.push("Logic validation passed.");
  }

  return {
    status,
    valid: status !== "FAIL",
    messages,
    allowedTapCode,
    smallBossViolation,
    warmupRequired,
    nextProgramPath,
    gaugeRequired,
    adaptiveThreadMode,
    batchComplete,
    nextActualCount,
    nextGaugeCount,
    remainingCount,
  };
}

export function runLv4500Geometry(castingNumber: string, tapCode: string): GeometryResult {
  let status: SimStatus = "PASS";
  const messages: string[] = [];

  const casting = findCasting(castingNumber);
  const tap = findTapCode(tapCode);

  if (!casting) return failGeometry("Invalid or unsupported casting.");
  if (!tap) return failGeometry("Invalid tap code.");

  if (casting.bossType === "small" && Number(tap.code) > 10) {
    return failGeometry("Small boss + tap code greater than 10 is not allowed.");
  }

  const threadStartZ = tap.threadStartPlane;
  const threadEndZ = Math.abs(tap.threadDepth);
  const fullStroke = Math.abs(tap.threadDepth) + tap.threadStartPlane;
  const g76R = fullStroke * tap.taperFactor;
  const threadFinalX = tap.faceMajor - 2 * (Math.abs(tap.threadDepth) * tap.taperFactor);

  const maxDepth = Math.max(tap.drillDepth, tap.boreTaperEndZ, tap.reliefEndZ, threadEndZ);
  const fixtureMargin = LV4500_FIXTURE_LIMIT - maxDepth;

  if (maxDepth >= LV4500_FIXTURE_LIMIT) {
    status = "FAIL";
    messages.push("CRITICAL: simulated depth reaches or exceeds the 1.5 inch fixture danger limit.");
  } else if (maxDepth >= LV4500_CAUTION_DEPTH) {
    status = worstStatus(status, "CAUTION");
    messages.push("CAUTION: simulated depth is near the 1.5 inch fixture danger limit.");
  }

  if (tap.reliefEndZ < threadEndZ) {
    status = "FAIL";
    messages.push("FAIL: relief is shallower than thread end.");
  }

  if (tap.boreTaperEndZ > tap.reliefEndZ) {
    status = "FAIL";
    messages.push("FAIL: taper end is deeper than straight relief end.");
  }

  if (tap.drillDepth > casting.maxDrillDepth) {
    status = "FAIL";
    messages.push("FAIL: drill depth exceeds this casting boss depth limit.");
  }

  if (tap.boreTaperEndZ > casting.maxBoreDepth) {
    status = "FAIL";
    messages.push("FAIL: bore taper depth exceeds this casting boss depth limit.");
  }

  if (messages.length === 0) messages.push("Geometry validation passed.");

  return {
    status,
    messages,
    drillZ: tap.drillDepth,
    boreTaperZ: tap.boreTaperEndZ,
    reliefZ: tap.reliefEndZ,
    threadStartZ,
    threadEndZ,
    g76R,
    threadFinalX,
    maxDepth,
    fixtureMargin,
    estimatedCycleMinutes: tap.estimatedCycleMinutes,
  };
}

function failGeometry(message: string): GeometryResult {
  return {
    status: "FAIL",
    messages: [message],
    drillZ: 0,
    boreTaperZ: 0,
    reliefZ: 0,
    threadStartZ: 0,
    threadEndZ: 0,
    g76R: 0,
    threadFinalX: 0,
    maxDepth: 0,
    fixtureMargin: LV4500_FIXTURE_LIMIT,
    estimatedCycleMinutes: 0,
  };
}