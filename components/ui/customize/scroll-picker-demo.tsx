import { useState } from "react";
import ScrollPickerPanel, { type PickerItem } from "./scroll-picker-panel";

const DEMO_10: PickerItem[] = [
    { key: "dashboard", label: "Dashboard", desc: "Overview of all metrics and KPIs." },
    { key: "analytics", label: "Analytics", desc: "Deep-dive into traffic and conversions." },
    { key: "users", label: "Users", desc: "Manage user accounts and permissions." },
    { key: "settings", label: "Settings", desc: "Application configuration." },
    { key: "billing", label: "Billing", desc: "Invoices, plans, payment methods." },
    { key: "notify", label: "Alerts", desc: "Alert rules and delivery channels." },
    { key: "integrations", label: "APIs", desc: "Connect third-party services." },
    { key: "security", label: "Security", desc: "2FA, sessions, audit logs." },
    { key: "reports", label: "Reports", desc: "Generate and schedule reports." },
    { key: "support", label: "Support", desc: "Help center, tickets, live chat." },
  ];
  
  const DEMO_5: PickerItem[] = [
    { key: "inbox", label: "Inbox", desc: "Your messages." },
    { key: "drafts", label: "Drafts", desc: "Unsent messages." },
    { key: "sent", label: "Sent", desc: "Sent messages." },
    { key: "archive", label: "Archive", desc: "Old conversations." },
    { key: "trash", label: "Trash", desc: "Deleted items." },
  ];
  
  function Detail({ item }: { item: PickerItem }) {
    return (
      <div>
        <p style={{ fontSize: 11, color: "#999", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Information</p>
        <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>{item.label}</h3>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6, margin: "0 0 24px" }}>{(item.desc as string) || "—"}</p>
        <span style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, background: "#e8e8e8", color: "#555" }}>key: {item.key}</span>
        <div style={{ marginTop: 28, padding: 18, borderRadius: 10, background: "#ebebeb", border: "1px dashed #ccc" }}>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            Use <code style={{ background: "#ddd", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>item.key = &quot;{item.key}&quot;</code> to fetch detail data.
          </p>
        </div>
      </div>
    );
  }
  
  export default function Demo() {
    const [mode, setMode] = useState<"ten" | "five">("ten");
    const list = mode === "ten" ? DEMO_10 : DEMO_5;
  
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["ten", "five"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
              border: mode === m ? "1.5px solid #000" : "1px solid #ddd",
              background: mode === m ? "#000" : "#fff",
              color: mode === m ? "#fff" : "#000",
              fontWeight: mode === m ? 600 : 400,
            }}>
              {m === "ten" ? "10 items" : "5 items"}
            </button>
          ))}
        </div>
        <ScrollPickerPanel
          items={list}
          visibleCount={7}
          panelHeight={560}
          renderDetail={(item) => <Detail item={item} />}
          defaultSelectedKey={list[0]?.key}
        />
      </div>
    );
  }