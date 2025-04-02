import React from "react";

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-400 py-4">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Digital Village. AI Buddy is a conceptual tool. All outputs should be reviewed by domain experts.</p>
      </div>
    </footer>
  );
}
