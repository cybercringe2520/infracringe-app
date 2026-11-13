import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export type Project = {
  name: string;
  type: "certification" | "project" | "competition";
  date: string;
  url?: string;
  description?: string;
};

// Certifications and projects from content/projects.yaml, newest first.
export function getProjects(): Project[] {
  const file = path.join(process.cwd(), "content", "projects.yaml");
  const items = parse(fs.readFileSync(file, "utf8")) as Project[];
  return items
    .map((item) => ({ ...item, date: String(item.date) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
