import type { CSSProperties } from "react";
import type { PlantDocument } from "../types/documents";

export default function DocumentsPage({ documents }: { documents: PlantDocument[] }) {
  const categories: PlantDocument["category"][] = [
    "Simulation",
    "Maintenance",
    "Program / Macro",
    "Print",
    "Manual",
    "Inspection",
    "Setup Guide",
  ];

  return (
    <div>
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Plant Documents</h3>
        <p style={{ color: "#64748b" }}>
          Read-only document hub for simulation references, prints, programs,
          macros, maintenance docs, manuals, and setup guides.
        </p>

        <div style={statGridStyle}>
          <DocumentStat label="Total Docs" value={String(documents.length)} />
          <DocumentStat
            label="Available"
            value={String(documents.filter((d) => d.status === "Available").length)}
          />
          <DocumentStat
            label="Placeholders"
            value={String(documents.filter((d) => d.status === "Placeholder").length)}
          />
          <DocumentStat
            label="Needs Upload"
            value={String(documents.filter((d) => d.status === "Needs Upload").length)}
          />
        </div>
      </div>

      <OfficialResourcesCard />

      {categories.map((category) => {
        const categoryDocs = documents.filter((doc) => doc.category === category);
        if (categoryDocs.length === 0) return null;

        return (
          <section key={category} style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={{ margin: 0 }}>{category}</h3>
              <span style={countStyle}>
                {categoryDocs.length} doc{categoryDocs.length === 1 ? "" : "s"}
              </span>
            </div>

            {categoryDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function DocumentCard({ doc }: { doc: PlantDocument }) {
  return (
    <div style={{ ...cardStyle, textAlign: "center" }}>
      <span style={documentPillStyle(doc.status)}>{doc.status}</span>

      <h3>{doc.title}</h3>

      <p style={{ color: "#64748b" }}>
        {doc.department} · {doc.category} · {doc.ownerRole}
      </p>

      {doc.machineId && (
        <p style={{ color: "#64748b", marginTop: -6 }}>Machine ID: {doc.machineId}</p>
      )}

      <p style={{ color: "#334155", lineHeight: 1.45 }}>{doc.description}</p>

      <div style={placeholderStyle}>File attachment/link coming later</div>
    </div>
  );
}

function OfficialResourcesCard() {
  const links = [
    { label: "JCM Resources", url: "https://www.jcmindustries.com/resources/" },
    {
      label: "Product Specifications",
      url: "https://www.jcmindustries.com/products/product-specifications/",
    },
    {
      label: "Installation Instructions",
      url: "https://www.jcmindustries.com/resources/installation-instructions/",
    },
    { label: "JCMU Training", url: "https://www.jcmindustries.com/JCM" },
  ];

  return (
    <div style={{ ...cardStyle, textAlign: "center", background: "#eff6ff" }}>
      <h3 style={{ marginTop: 0 }}>Official JCM Website Resources</h3>
      <p style={{ color: "#1e3a8a" }}>
        External links for product resources, installation instructions, specifications, and training.
      </p>

      <div style={quickActionGridStyle}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            style={resourceLinkStyle}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function DocumentStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function documentPillStyle(status: PlantDocument["status"]): CSSProperties {
  if (status === "Available") {
    return { ...pillStyle, background: "#dcfce7", color: "#166534" };
  }

  if (status === "Needs Upload") {
    return { ...pillStyle, background: "#fee2e2", color: "#b91c1c" };
  }

  return { ...pillStyle, background: "#fef3c7", color: "#92400e" };
}

const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 16,
  padding: 16,
  marginTop: 12,
  background: "white",
};

const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const statCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 10,
  background: "white",
};

const sectionStyle: CSSProperties = {
  marginTop: 18,
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 4px",
  color: "#111827",
};

const countStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#64748b",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 999,
  padding: "5px 10px",
};

const placeholderStyle: CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "rgba(255,255,255,0.65)",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontWeight: 700,
};

const quickActionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const resourceLinkStyle: CSSProperties = {
  display: "block",
  textDecoration: "none",
  textAlign: "center",
  padding: 12,
  borderRadius: 14,
  background: "white",
  border: "1px solid #93c5fd",
  color: "#1d4ed8",
  fontWeight: 900,
};

const pillStyle: CSSProperties = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};