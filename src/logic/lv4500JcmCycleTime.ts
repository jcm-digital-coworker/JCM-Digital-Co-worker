import { findTapCode } from "./lv4500JcmSimulator";

export type CycleTimeEstimate = {
  totalMinutes: number;
  cuttingMinutes: number;
  rapidMinutes: number;
  overheadMinutes: number;
  confidence: "rough" | "medium";
  notes: string[];
};

const START_X_DISTANCE = 23.4;
const START_Z_DISTANCE = 12.0;

// Conservative placeholders.
// Tune these later from real stopwatch data.
const ASSUMED_RAPID_IPM = 600;
const TOOL_CHANGE_SECONDS = 8;
const M_CODE_SECONDS = 2;
const G28_HOME_SECONDS = 5;
const CHIP_CLEAN_SECONDS = 3;

function secondsToMinutes(seconds: number) {
  return seconds / 60;
}

function rapidMinutes(distanceInches: number) {
  return distanceInches / ASSUMED_RAPID_IPM;
}

export function estimateLv4500CycleTime(tapCode: string): CycleTimeEstimate {
  const tap = findTapCode(tapCode);

  if (!tap) {
    return {
      totalMinutes: 0,
      cuttingMinutes: 0,
      rapidMinutes: 0,
      overheadMinutes: 0,
      confidence: "rough",
      notes: ["Cannot estimate cycle time because tap code data is missing."],
    };
  }

  const notes: string[] = [];

  // Drill feed estimate.
  // The macro uses feed-per-rev drilling. We approximate from typical RPM already embedded by tap family.
  const drillRpm =
    tap.code === "16" ? 500 :
    ["13", "14", "15"].includes(tap.code) ? 654 :
    ["10", "11", "12"].includes(tap.code) ? 785 :
    1264;

  const drillFeedPerRev = ["11", "13"].includes(tap.code) ? 0.004 : 0.006;
  const drillIpm = drillRpm * drillFeedPerRev;
  const drillMinutes = tap.drillDepth / drillIpm;

  // Bore prep rough estimate.
  // G71 pass count is controller-generated, so this is intentionally approximate.
  const boreProfileLength = tap.boreTaperEndZ + tap.reliefEndZ + 0.35;
  const estimatedG71Passes =
    Number(tap.code) >= 14 ? 7 :
    Number(tap.code) >= 10 ? 5 :
    4;

  const boreFeedIpm = 10; // Macro uses F.01 in G99/G96 context; this is a practical simplified estimate.
  const boreMinutes = (boreProfileLength * estimatedG71Passes) / boreFeedIpm;

  // Threading estimate.
  // Thread feed per rev = 1 / TPI. RPM is derived in the macro from SFM and face major.
  const threadSfm =
    tap.code === "16" ? 200 :
    tap.type === "AWWA" ? 200 :
    200;

  const threadRpm = Math.floor((3.82 * threadSfm) / tap.faceMajor);
  const threadFeedIpm = threadRpm * (1 / tap.tpi);

  const springPassAllowance = 2;
  const roughThreadPasses =
    Number(tap.code) >= 16 ? 8 :
    Number(tap.code) >= 14 ? 7 :
    Number(tap.code) >= 10 ? 6 :
    5;

  const threadStroke = Math.abs(tap.threadDepth) + tap.threadStartPlane;
  const threadMinutes = (threadStroke * (roughThreadPasses + springPassAllowance)) / threadFeedIpm;

  const cuttingMinutes = drillMinutes + boreMinutes + threadMinutes;

  // Rapid travel estimate.
  // Uses your starting distance assumption plus multiple home/reposition cycles in prep + thread programs.
  const startTravelDistance = START_X_DISTANCE + START_Z_DISTANCE;
  const rapidCycles = 6;
  const rapidTravelMinutes = rapidMinutes(startTravelDistance * rapidCycles);

  // Overhead estimate.
  const overheadSeconds =
    TOOL_CHANGE_SECONDS * 3 +
    M_CODE_SECONDS * 10 +
    G28_HOME_SECONDS * 5 +
    CHIP_CLEAN_SECONDS;

  const overheadMinutes = secondsToMinutes(overheadSeconds);

  const totalMinutes = cuttingMinutes + rapidTravelMinutes + overheadMinutes;

  notes.push("Estimate excludes operator stops, gauge hold time, and manual inspection.");
  notes.push("Estimate includes rough rapid travel using X 23.4 in and Z 12.0 in starting distance.");
  notes.push("G71 and G76 pass counts are approximated because the control generates the exact motion internally.");
  notes.push("Use real stopwatch data later to tune rapid rate, tool-change time, and pass allowances.");

  return {
    totalMinutes,
    cuttingMinutes,
    rapidMinutes: rapidTravelMinutes,
    overheadMinutes,
    confidence: "rough",
    notes,
  };
}