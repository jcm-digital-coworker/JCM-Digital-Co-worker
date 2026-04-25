import type { PlantDocument } from "../types/documents";

export const plantDocuments: PlantDocument[] = [
  {
    id: "doc-1",
    title: "LV4500 JCM Macro Suite Reference",
    department: "Saddles Dept",
    machineId: "7",
    category: "Program / Macro",
    status: "Available",
    ownerRole: "Lead / Engineer",
    description:
      "Reference for O0001 setup menu, O0002 logic commander, O8000 bore prep, O9000 thread engine, and O8888 warm-up.",
  },
  {
    id: "doc-2",
    title: "LV4500 Fixture Clearance Guide",
    department: "Saddles Dept",
    machineId: "7",
    category: "Setup Guide",
    status: "Available",
    ownerRole: "Operator",
    description:
      "Hard reminder that simulated prep/thread depth near the 1.5 inch top-of-part to fixture limit must be treated as high risk.",
  },
  {
    id: "doc-3",
    title: "JCM Casting / Tap Code Reference",
    department: "Saddles Dept",
    machineId: "7",
    category: "Simulation",
    status: "Available",
    ownerRole: "Shared",
    description:
      "Reference for casting validation, small boss restrictions, tap code routing, and simulator audit checks.",
  },
  {
    id: "doc-4",
    title: "KH80 Heavy Roughing Notes",
    department: "Machine Shop",
    machineId: "1",
    category: "Setup Guide",
    status: "Placeholder",
    ownerRole: "Operator",
    description:
      "Placeholder for spindle load trends, heavy roughing tool condition, entry engagement notes, and alarm recovery checks.",
  },
  {
    id: "doc-5",
    title: "Yama Touch-off / Offset Guide",
    department: "Machine Shop",
    machineId: "3",
    category: "Setup Guide",
    status: "Placeholder",
    ownerRole: "Operator",
    description:
      "Placeholder for setup-sensitive touch-off notes, reused offset warnings, heavy tool alignment, and Z0 verification.",
  },
  {
    id: "doc-6",
    title: "Fleet PM Reference",
    department: "Machine Shop",
    category: "Maintenance",
    status: "Placeholder",
    ownerRole: "Maintenance",
    description:
      "Placeholder for PM sheets, lubrication checks, coolant checks, recurring problems, and weekly/monthly inspection items.",
  },
  {
    id: "doc-7",
    title: "LV4500 Maintenance Manual",
    department: "Saddles Dept",
    machineId: "7",
    category: "Manual",
    status: "Needs Upload",
    ownerRole: "Maintenance",
    description:
      "Future equipment manual location for LV4500 maintenance, troubleshooting, lubrication, and control documentation.",
  },
  {
    id: "doc-8",
    title: "Material Handling Cut File Reference",
    department: "Material Handling",
    category: "Program / Macro",
    status: "Needs Upload",
    ownerRole: "Shared",
    description:
      "Future location for plasma, laser, roll, and material handling program/file readiness references.",
  },
  {
    id: "doc-9",
    title: "Plasma / Laser Consumable Checklist",
    department: "Material Handling",
    category: "Maintenance",
    status: "Placeholder",
    ownerRole: "Maintenance",
    description:
      "Placeholder for consumables, nozzle/torch/optics checks, cut quality issues, and staging readiness.",
  },
  {
    id: "doc-10",
    title: "Shop Print Library",
    department: "Machine Shop",
    category: "Print",
    status: "Needs Upload",
    ownerRole: "Shared",
    description:
      "Future location for prints tied to machine, part family, setup, and simulator workflows.",
  },
];