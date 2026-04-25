import type { Machine } from "../types/machine";

function isYamaFamily(machine: Machine) {
  const name = machine.name.toLowerCase();
  return name.includes("yama") || name.includes("yami");
}

export function getMachineWarning(machine: Machine) {
  const isHeavyTool = machine.lastTool.weight === "HEAVY";
  const setupSensitive = machine.behaviorTags.includes("Setup-Sensitive");

  if (isYamaFamily(machine) && isHeavyTool && setupSensitive) {
    return "⚠️ High risk: heavy tool + setup sensitivity. Verify touch-off and alignment.";
  }

  return null;
}

export function getTouchOffWarning(machine: Machine) {
  const operatorDependent = machine.behaviorTags.includes("Operator-Dependent");
  const setupSensitive = machine.behaviorTags.includes("Setup-Sensitive");

  if (isYamaFamily(machine) && operatorDependent && setupSensitive) {
    return "⚠️ Manual touch-off risk: verify the correct tool offset call and confirm Z0 before running.";
  }

  return null;
}

export function getOffsetReuseWarning(machine: Machine) {
  const operatorDependent = machine.behaviorTags.includes("Operator-Dependent");
  const setupSensitive = machine.behaviorTags.includes("Setup-Sensitive");

  if (isYamaFamily(machine) && operatorDependent && setupSensitive) {
    return "⚠️ Offset reuse risk: confirm the current work offset was not carried over from a different part.";
  }

  return null;
}

export function getOperatorRisks(machine: Machine) {
  const risks: string[] = [];

  const machineWarning = getMachineWarning(machine);
  const touchOffWarning = getTouchOffWarning(machine);
  const offsetReuseWarning = getOffsetReuseWarning(machine);

  if (machineWarning) risks.push(machineWarning);
  if (touchOffWarning) risks.push(touchOffWarning);
  if (offsetReuseWarning) risks.push(offsetReuseWarning);

  return risks;
}

export function getLikelyIssueSummary(machine: Machine) {
  const highestLoad =
    machine.recentSpindleLoad.length > 0
      ? Math.max(...machine.recentSpindleLoad.map((x) => x.percent))
      : 0;

  const hadRecentToolChange = machine.recentEvents.some(
    (event) => event.type === "TOOL_CHANGE"
  );

  if (isYamaFamily(machine)) {
    if (hadRecentToolChange && machine.lastTool.weight === "HEAVY") {
      return "This machine is showing a classic setup-sensitive pattern: recent tool change + heavy tool + manual setup risk. Most likely issue is process/setup related rather than a pure machine fault.";
    }

    return "This machine has higher operator/setup risk than most. Review touch-off, offsets, and tool seating before assuming a hardware problem.";
  }

  if (machine.state === "ALARM" && highestLoad >= 90) {
    return "Recent spindle load suggests the machine likely failed under cutting load rather than a simple idle/reset condition.";
  }

  if (machine.state === "OFFLINE") {
    return "Current issue is loss of confidence in machine state, not necessarily a machining fault.";
  }

  return "No elevated diagnostic pattern is currently highlighted beyond normal machine behavior.";
}

export function getSuggestedChecks(machine: Machine) {
  const checks: string[] = [];

  if (isYamaFamily(machine)) {
    checks.push("Verify the correct tool offset call was active before touch-off.");
    checks.push("Confirm Z0 was set for the current tool and current part.");
    checks.push("Check that the active work offset was not reused from a previous part.");
    checks.push("Inspect tool seating and alignment after the last tool change.");
  }

  if (machine.lastTool.weight === "HEAVY") {
    checks.push("Review heavy-tool setup, seating, and alignment.");
  }

  if (machine.state === "ALARM") {
    checks.push("Review the last event before alarm and compare it to spindle load trend.");
  }

  return checks;
}