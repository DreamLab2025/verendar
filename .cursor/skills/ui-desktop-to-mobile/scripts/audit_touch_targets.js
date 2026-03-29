#!/usr/bin/env node
/**
 * audit_touch_targets.js
 * Scans JSX/TSX/HTML files for interactive elements that may have touch targets < 44px.
 * Reports risky patterns and suggests fixes.
 *
 * Usage:
 *   node scripts/audit_touch_targets.js <file-or-directory>
 *
 * Examples:
 *   node scripts/audit_touch_targets.js src/components/Nav.tsx
 *   node scripts/audit_touch_targets.js src/
 */

import fs from "fs";
import path from "path";

const INTERACTIVE_TAGS = ["button", "a", "input", "select", "textarea", "label"];
const MIN_SIZE = 44;

const RISKY_PATTERNS = [
  // Small padding classes (Tailwind)
  {
    pattern: /\b(p-0|p-1|p-2|px-0|px-1|px-2|py-0|py-1|py-2)\b/,
    msg: "Small padding — may result in touch target < 44px",
  },
  // Small height/width classes (Tailwind)
  { pattern: /\b(h-4|h-5|h-6|h-7|h-8|w-4|w-5|w-6|w-7|w-8)\b/, msg: "Small fixed size — may be < 44px touch target" },
  // Missing min-h/min-w (interactive without min constraint)
  {
    pattern: /<(button|a)[^>]*class="[^"]*"[^>]*>/,
    msg: "Interactive element — verify min-h-[44px] or min-w-[44px] is set",
  },
  // Inline icon-only buttons without aria-label
  {
    pattern: /<button[^>]*>[\s]*(<svg|<img|[A-Z][a-zA-Z]+Icon)/,
    msg: "Icon-only button — ensure aria-label and 44px touch target",
  },
];

const SAFE_PATTERNS = [
  /min-h-\[4[4-9]px\]/,
  /min-h-\[5\d+px\]/,
  /min-h-\[6\d+px\]/,
  /min-h-\[44/,
  /h-11/,
  /h-12/,
  /h-14/,
  /h-16/, // Tailwind h-11=44px, h-12=48px
  /py-3/,
  /py-4/,
  /py-5/,
  /py-6/, // likely ≥ 44px with content
  /p-3/,
  /p-4/,
  /p-5/,
  /p-6/,
];

function isSafelyLarge(line) {
  return SAFE_PATTERNS.some((p) => p.test(line));
}

function auditFile(filePath) {
  const ext = path.extname(filePath);
  if (![".jsx", ".tsx", ".html", ".vue"].includes(ext)) return [];

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const issues = [];

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const hasInteractive = INTERACTIVE_TAGS.some(
      (tag) => line.includes(`<${tag}`) || line.includes(`<${tag.charAt(0).toUpperCase()}${tag.slice(1)}`),
    );

    if (!hasInteractive) return;
    if (isSafelyLarge(line)) return;

    RISKY_PATTERNS.forEach(({ pattern, msg }) => {
      if (pattern.test(line)) {
        issues.push({ file: filePath, line: lineNum, code: line.trim(), msg });
      }
    });
  });

  return issues;
}

function auditPath(inputPath) {
  const stat = fs.statSync(inputPath);
  if (stat.isFile()) return auditFile(inputPath);

  // Directory: recurse
  const allIssues = [];
  const entries = fs.readdirSync(inputPath, { withFileTypes: true });

  entries.forEach((entry) => {
    if (entry.name.startsWith(".") || entry.name === "node_modules") return;
    const full = path.join(inputPath, entry.name);
    if (entry.isDirectory()) allIssues.push(...auditPath(full));
    else allIssues.push(...auditFile(full));
  });

  return allIssues;
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node scripts/audit_touch_targets.js <file-or-directory>");
    process.exit(1);
  }

  if (!fs.existsSync(target)) {
    console.error(`Path not found: ${target}`);
    process.exit(1);
  }

  console.log(`\n🔍 Auditing touch targets in: ${target}\n`);
  const issues = auditPath(target);

  if (issues.length === 0) {
    console.log("✅ No obvious touch target issues found.");
    return;
  }

  // Group by file
  const byFile = {};
  issues.forEach((issue) => {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  });

  let totalIssues = 0;
  Object.entries(byFile).forEach(([file, fileIssues]) => {
    const relPath = path.relative(process.cwd(), file);
    console.log(`📄 ${relPath} (${fileIssues.length} issue${fileIssues.length > 1 ? "s" : ""})`);
    fileIssues.forEach(({ line, msg, code }) => {
      console.log(`  Line ${line}: ${msg}`);
      console.log(`    → ${code.slice(0, 100)}${code.length > 100 ? "..." : ""}`);
    });
    console.log();
    totalIssues += fileIssues.length;
  });

  console.log(`\n⚠️  ${totalIssues} potential issue${totalIssues > 1 ? "s" : ""} found.`);
  console.log("\n💡 Fix suggestions:");
  console.log("   • Add min-h-[44px] min-w-[44px] to buttons/links");
  console.log("   • Or use h-11 (44px) / h-12 (48px) Tailwind classes");
  console.log("   • Add p-3 or py-3 px-4 for sufficient tap area");
  console.log('   • Wrap icon-only buttons: <button class="p-3" aria-label="...">');
  console.log("   • For bottom nav items: use min-h-[56px]");
  console.log();
  console.log("📖 Reference: https://developer.apple.com/design/human-interface-guidelines/buttons");
}

main();
