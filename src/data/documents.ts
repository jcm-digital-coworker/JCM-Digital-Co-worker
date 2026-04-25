import type { PlantDocument } from "../types/documents";

export const plantDocuments: PlantDocument[] = [
  {
    id: "d1",
    title: "LV4500 JCM Macro Suite Notes",
    department: "Saddles Dept",
    machineId: "7",
    category: "Macro",
    description: "O0001, O0002, O8000, O9000, and O8888 simulator reference.",
    status: "Available",
  },
  {
    id: "d2",
    title: "LV4500 Fixture Clearance Notes",
    department: "Saddles Dept",
    machineId: "7",
    category: "Setup Guide",
    description: "Hard 1.5 inch top-of-part to fixture clearance reminder.",
    status: "Available",
  },
  {
    id: "d3",
    title: "KH80 Heavy Roughing Notes",
    department: "Machine Shop",
    machineId: "1",
    category: "Setup Guide",
    description: "Placeholder for roughing load, tool condition, and entry engagement notes.",
    status: "Placeholder",
  },
  {
    id: "d4",
    title: "Material Handling Cut File Reference",
    department: "Material Handling",
    category: "Program",
    description: "Placeholder for plasma, laser, and roll program/file readiness.",
    status: "Needs Upload",
  },
  {
    id: "d5",
    title: "Fleet PM Reference",
    department: "Machine Shop",
    category: "Maintenance",
    description: "Placeholder for maintenance PM sheets and recurring checks.",
    status: "Placeholder",
  },
];