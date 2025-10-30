import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LateralInputField from "./LateralInputField";

vi.mock("tailwind-merge", () => ({
  twMerge: (...classes: string[]) => classes.join(" "),
}));

vi.mock("@atoms/Input/input", () => ({
  default: ({ placeholder, onChange, value, disabled }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-testid="input-element"
    />
  ),
}));

vi.mock("@atoms/FormError/formError", () => ({
  default: ({ children, className }: any) => (
    <span data-testid="error-label" className={className}>
      {children}
    </span>
  ),
}));

describe("LateralInputField Component", () => {
  test("renders label and input correctly", () => {
    render(
      <LateralInputField
        label="Email"
        name="email"
        type="text"
        placeholder="Enter your email"
      />
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  test("shows error message when formErrors contains message", () => {
    const formErrors = {
      email: { message: "Invalid email address" },
    };

    render(
      <LateralInputField
        label="Email"
        name="email"
        type="text"
        formErrors={formErrors}
      />
    );

    expect(screen.getByTestId("error-label")).toHaveTextContent("Invalid email address");
  });

  test("calls onChange when input value changes", () => {
    const handleChange = vi.fn();

    render(
      <LateralInputField
        label="Email"
        name="email"
        type="text"
        placeholder="Enter your email"
        onChange={handleChange}
      />
    );

    const input = screen.getByTestId("input-element");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
