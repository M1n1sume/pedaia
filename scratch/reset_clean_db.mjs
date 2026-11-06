import fs from 'fs';

const users = [
  {
    id: "usr_admin_m1n1sume",
    username: "M1n1sume",
    email: "admin@pedaia.internal",
    passwordHash: null,
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isInitialized: false
  }
];

fs.writeFileSync("data/users.json", JSON.stringify(users, null, 2));
fs.writeFileSync("data/designs.json", "[]\n");
fs.writeFileSync("data/outputs.json", "[]\n");
fs.writeFileSync("data/profiles.json", "{}\n");
fs.writeFileSync("data/sessions.json", "{}\n");
fs.writeFileSync("data/audit.json", "[]\n");
console.log("Database cleanly reset for production with uninitialized M1n1sume.");
