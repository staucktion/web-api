import JSONdb from "simple-json-db";

// TODO: Replace with PG connection
export const db = new JSONdb("database/staucktion-temp-db.json", { asyncWrite: true });
