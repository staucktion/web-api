import express from "express";

export const authCookieOptions: express.CookieOptions = {
	httpOnly: true,
	secure: false,
	sameSite: "lax", // important to prevent CSRF. supposed to be the default but sometimes not?
	maxAge: 3 * 30 * 24 * 60 * 60 * 1000,
	path: "/",
} as const;
