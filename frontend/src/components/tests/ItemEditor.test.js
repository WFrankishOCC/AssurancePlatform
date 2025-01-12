/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import "regenerator-runtime/runtime";
import React from "react";
import ItemEditor from "../ItemEditor.js";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        id: 1,
        name: "Test goal",
        short_description: "short",
        long_description: "long",
        keywords: "key",
      }),
  }),
);

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders item editor layer", async () => {
  render(<ItemEditor type="TopLevelNormativeGoal" id="1" />);
  await waitFor(() =>
    expect(screen.getByDisplayValue("Test goal")).toBeInTheDocument(),
  );
});

test("updates item properties correctly", async () => {
  render(<ItemEditor type="TopLevelNormativeGoal" id="1" />);

  await waitFor(() => screen.getByDisplayValue("Test goal"));
  const nameInput = screen.getByDisplayValue("Test goal");
  const shortDescInput = screen.getByDisplayValue("short");
  const longDescInput = screen.getByDisplayValue("long");
  const keywordsInput = screen.getByDisplayValue("key");

  fireEvent.change(nameInput, { target: { value: "Updated name" } });
  fireEvent.change(shortDescInput, { target: { value: "Updated short" } });
  fireEvent.change(longDescInput, { target: { value: "Updated long" } });
  fireEvent.change(keywordsInput, { target: { value: "Updated key" } });

  expect(nameInput.value).toBe("Updated name");
  expect(shortDescInput.value).toBe("Updated short");
  expect(longDescInput.value).toBe("Updated long");
  expect(keywordsInput.value).toBe("Updated key");
});

test("renders delete item button", async () => {
  render(<ItemEditor type="TopLevelNormativeGoal" id="1" />);
  await waitFor(() => screen.getByText("Delete item"));
  const deleteButton = screen.getByText("Delete item");
  expect(deleteButton).toBeInTheDocument();
});
