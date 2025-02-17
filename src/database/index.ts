import JSONdb from "simple-json-db";

// TODO: Replace with PG connection
export const db = new JSONdb("staucktion-temp-db.json", { asyncWrite: true });
