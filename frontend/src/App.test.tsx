import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App.tsx";
import test from "node:test";

test("renders Frontend Dashboard", () => {
	render(<App />);
	const headerElement = screen.getByText(/Frontend Dashboard/i);
	expect(headerElement).toBeInTheDocument();
});
