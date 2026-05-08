import React from "react";

function InfoCard({ label, value }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}

export default InfoCard;
