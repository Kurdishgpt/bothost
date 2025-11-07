import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export interface ServerTypeDefinition {
  id: string;
  name: string;
  description: string;
  category: "language" | "database";
  icon: string; // Icon name from react-icons/si or lucide-react
  iconLibrary: "si" | "lucide";
  defaultEntryFile: string;
  defaultStartupCommand: string;
  defaultGitBranch: string;
}

export const SERVER_TYPES: Record<string, ServerTypeDefinition> = {
  nodejs: {
    id: "nodejs",
    name: "NodeJS",
    description: "A runtime for executing JavaScript server-side",
    category: "language",
    icon: "SiNodedotjs",
    iconLibrary: "si",
    defaultEntryFile: "index.js",
    defaultStartupCommand: "node index.js",
    defaultGitBranch: "main",
  },
  bun: {
    id: "bun",
    name: "Bun",
    description: "It's the same as NodeJS but faster!",
    category: "language",
    icon: "SiBun",
    iconLibrary: "si",
    defaultEntryFile: "index.js",
    defaultStartupCommand: "bun run index.js",
    defaultGitBranch: "main",
  },
  python: {
    id: "python",
    name: "Python",
    description: "Beginner-friendly, easy to understand",
    category: "language",
    icon: "SiPython",
    iconLibrary: "si",
    defaultEntryFile: "main.py",
    defaultStartupCommand: "python main.py",
    defaultGitBranch: "main",
  },
  java: {
    id: "java",
    name: "Java",
    description: "Object-oriented, reliable",
    category: "language",
    icon: "SiOpenjdk",
    iconLibrary: "si",
    defaultEntryFile: "Main.java",
    defaultStartupCommand: "java Main",
    defaultGitBranch: "main",
  },
  csharp: {
    id: "csharp",
    name: "C#",
    description: "Modern & powerful",
    category: "language",
    icon: "SiCsharp",
    iconLibrary: "si",
    defaultEntryFile: "Program.cs",
    defaultStartupCommand: "dotnet run",
    defaultGitBranch: "main",
  },
  rust: {
    id: "rust",
    name: "Rust",
    description: "Fearless concurrency!",
    category: "language",
    icon: "SiRust",
    iconLibrary: "si",
    defaultEntryFile: "main.rs",
    defaultStartupCommand: "cargo run",
    defaultGitBranch: "main",
  },
  lua: {
    id: "lua",
    name: "Lua",
    description: "Lightweight scripting & extensible",
    category: "language",
    icon: "SiLua",
    iconLibrary: "si",
    defaultEntryFile: "main.lua",
    defaultStartupCommand: "lua main.lua",
    defaultGitBranch: "main",
  },
  mongodb: {
    id: "mongodb",
    name: "MongoDB",
    description: "NoSQL, flexible document database",
    category: "database",
    icon: "SiMongodb",
    iconLibrary: "si",
    defaultEntryFile: "",
    defaultStartupCommand: "mongod --dbpath /data/db",
    defaultGitBranch: "main",
  },
  mariadb: {
    id: "mariadb",
    name: "MariaDB",
    description: "MySQL fork & open-source",
    category: "database",
    icon: "SiMariadb",
    iconLibrary: "si",
    defaultEntryFile: "",
    defaultStartupCommand: "mariadbd",
    defaultGitBranch: "main",
  },
  redis: {
    id: "redis",
    name: "Redis",
    description: "In-memory, fast key-value store",
    category: "database",
    icon: "SiRedis",
    iconLibrary: "si",
    defaultEntryFile: "",
    defaultStartupCommand: "redis-server",
    defaultGitBranch: "main",
  },
  postgresql: {
    id: "postgresql",
    name: "PostgreSQL",
    description: "Open-source relational database",
    category: "database",
    icon: "SiPostgresql",
    iconLibrary: "si",
    defaultEntryFile: "",
    defaultStartupCommand: "postgres -D /var/lib/postgresql/data",
    defaultGitBranch: "main",
  },
};

// Helper function to get server type definition
export function getServerTypeDefinition(typeId: string): ServerTypeDefinition | undefined {
  return SERVER_TYPES[typeId];
}

// Helper function to get all language server types
export function getLanguageServerTypes(): ServerTypeDefinition[] {
  return Object.values(SERVER_TYPES).filter((type) => type.category === "language");
}

// Helper function to get all database server types
export function getDatabaseServerTypes(): ServerTypeDefinition[] {
  return Object.values(SERVER_TYPES).filter((type) => type.category === "database");
}
