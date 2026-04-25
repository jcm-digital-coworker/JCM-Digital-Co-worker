import type { Machine } from "../types/machine";

export type LightSimulationResult = {
  status: "READY" | "CAUTION" | "BLOCKED";
  title: string;
  summary: string;
  checks: string[];
  warnings: string[];
  recommendedAction: string;
};

export function runLightMachineSimulation(machine: Machine): LightSimulationResult {
  const name = machine.name.toLowerCase();

  if (name.includes("kh80")) return simulateKh80(machine);
  if (name.includes("yama") || name.includes("yami") || name.includes("gv-1200")) {
    return simulateYama(machine);
  }
  if (name.includes("nlx")) return simulateTurning(machine);
  if (name.includes("sl400")) return simulateLegacyRestart(machine);
  if (name.includes("l300")) return simulateTurning(machine);
  if (name.includes("quickmill")) return simulateQuickmill(machine);
  if (
    name.includes("plasma") ||
    name.includes("laser") ||
    name.includes("roll") ||
    machine.department === "Material Handling"
  ) {
    return simulateMaterialHandling(machine);
  }

  return {
    status: machine.simulationStatus,
    title: "General Readiness Check",
    summary: machine.simulationSummary,
    checks: ["Confirm setup, program, tooling, and operator handoff before running."],
    warnings: [],
    recommendedAction: "Use normal setup verification.",
  };
}

function simulateKh80(machine: Machine): LightSimulationResult {
  const peakLoad = Math.max(0, ...machine.recentSpindleLoad.map((x) => x.percent));
  const heavyTool = machine.lastTool.weight === "HEAVY";
  const alarm = machine.state === "ALARM";

  const warnings: string[] = [];
  if (alarm) warnings.push("Machine is currently in alarm state.");
  if (peakLoad >= 90) warnings.push("Recent spindle load reached high-risk range.");
  if (heavyTool) warnings.push("Heavy tool is active or was recently active.");

  return {
    status: alarm || peakLoad >= 90 ? "BLOCKED" : heavyTool || peakLoad >= 70 ? "CAUTION" : "READY",
    title: "KH80 Heavy Roughing Risk",
    summary: "Checks heavy-tool roughing risk using state, tool weight, and recent spindle load trend.",
    checks: [
      "Review recent spindle load before restart.",
      "Inspect heavy roughing tool condition.",
      "Confirm entry engagement and chip evacuation.",
      "Verify alarm cause before returning to production.",
    ],
    warnings,
    recommendedAction:
      alarm || peakLoad >= 90
        ? "Do not restart until alarm/load cause is understood."
        : "Proceed only after tool and roughing conditions are verified.",
  };
}

function simulateYama(machine: Machine): LightSimulationResult {
  const heavyTool = machine.lastTool.weight === "HEAVY";
  const setupSensitive = machine.behaviorTags.includes("Setup-Sensitive");
  const operatorDependent = machine.behaviorTags.includes("Operator-Dependent");

  const warnings: string[] = [];
  if (setupSensitive) warnings.push("Machine is marked setup-sensitive.");
  if (operatorDependent) warnings.push("Operator handoff/setup discipline affects risk.");
  if (heavyTool) warnings.push("Heavy tool increases touch-off and alignment risk.");

  return {
    status: heavyTool && setupSensitive ? "CAUTION" : "READY",
    title: "Touch-off / Offset Confidence",
    summary: "Checks setup sensitivity, heavy tooling, and operator handoff risk.",
    checks: [
      "Confirm active work offset.",
      "Confirm correct tool offset call.",
      "Verify Z0 before running.",
      "Confirm heavy tool seating/alignment.",
      "Review any reused offset condition.",
    ],
    warnings,
    recommendedAction:
      heavyTool && setupSensitive
        ? "Use second-look touch-off verification before running."
        : "Proceed with normal setup confirmation.",
  };
}

function simulateTurning(machine: Machine): LightSimulationResult {
  const alarm = machine.state === "ALARM";
  const offline = machine.state === "OFFLINE";

  const warnings: string[] = [];
  if (alarm) warnings.push("Machine is in alarm state.");
  if (offline) warnings.push("Machine state is offline or not trusted.");

  return {
    status: alarm || offline ? "BLOCKED" : "READY",
    title: "Turning Cell Restart Readiness",
    summary: "Checks whether the turning machine appears ready for normal restart or continued operation.",
    checks: [
      "Confirm current program matches work order.",
      "Confirm last tool and offset are expected.",
      "Review alarm/reset state before restart.",
      "Confirm operator handoff if restarting mid-cycle.",
    ],
    warnings,
    recommendedAction:
      alarm || offline
        ? "Do not restart until current machine state is confirmed."
        : "Proceed with normal restart/readiness checks.",
  };
}

function simulateLegacyRestart(machine: Machine): LightSimulationResult {
  const offline = machine.state === "OFFLINE";
  const warnings: string[] = [];

  if (offline) warnings.push("Offline state lowers trust in dashboard context.");
  if (machine.alarmPriority === "RESET") warnings.push("Reset/offline condition should be verified locally.");

  return {
    status: offline ? "BLOCKED" : machine.alarmPriority === "RESET" ? "CAUTION" : "READY",
    title: "Legacy Restart Confidence",
    summary: "Checks machine-state confidence for older or less-connected equipment.",
    checks: [
      "Verify physical machine state at the control.",
      "Confirm program and tool before restart.",
      "Confirm lubrication/coolant readiness.",
      "Do not rely on stale digital state if disconnected.",
    ],
    warnings,
    recommendedAction: offline
      ? "Physically verify the machine before using dashboard information."
      : "Use normal restart checks.",
  };
}

function simulateQuickmill(machine: Machine): LightSimulationResult {
  const heavyTool = machine.lastTool.weight === "HEAVY";

  return {
    status: heavyTool ? "CAUTION" : "READY",
    title: "Large-format Milling Readiness",
    summary: "Checks large-format milling risk around heavy tools, chip evacuation, and long cycle stability.",
    checks: [
      "Confirm cutter condition before long roughing run.",
      "Confirm chip evacuation and coolant path.",
      "Confirm part support and fixture clearance.",
      "Review program/tool change notes before unattended cutting.",
    ],
    warnings: heavyTool ? ["Heavy tool or heavy cut should be verified before long run."] : [],
    recommendedAction: "Proceed after cutter, chip, coolant, and fixture checks are complete.",
  };
}

function simulateMaterialHandling(machine: Machine): LightSimulationResult {
  const roll = machine.name.toLowerCase().includes("roll");
  const laser = machine.name.toLowerCase().includes("laser");
  const plasma = machine.name.toLowerCase().includes("plasma");

  const checks = roll
    ? [
        "Confirm material thickness.",
        "Confirm roll setup and orientation.",
        "Confirm part support/handling plan.",
        "Confirm program or setup sheet when available.",
      ]
    : [
        "Confirm material is staged.",
        "Confirm cut file/program is ready.",
        "Confirm consumables/nozzle/torch condition.",
        "Confirm table condition and material thickness.",
      ];

  const title = roll
    ? "Roll Readiness Check"
    : laser
    ? "Laser Table Readiness Check"
    : plasma
    ? "Plasma Table Readiness Check"
    : "Material Readiness Check";

  return {
    status: "CAUTION",
    title,
    summary: "Placeholder readiness check for Material Handling equipment until exact machine details are added.",
    checks,
    warnings: ["Placeholder simulator: details should be updated when actual machine data is available."],
    recommendedAction: "Use this as a staging and readiness checklist until the full profile is built.",
  };
}