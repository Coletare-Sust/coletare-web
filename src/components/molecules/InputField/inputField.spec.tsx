import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InputField from "./inputField";

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
  default: ({ children }: any) => <span data-testid="error-label">{children}</span>,
}));

describe("InputField Component", () => {
  // Teste 1  
  test("renders label, input, and required mark", () => {
    render(
      <InputField
        label="Username"
        name="username"
        type="text"
        placeholder="Enter your username"
        mandatory
      />
    );

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
  });

  // Teste 2
  test("shows error message when formErrors contains message", () => {
    const formErrors = {
      username: { message: "This field is required" },
    };

    render(
      <InputField
        label="Username"
        name="username"
        type="text"
        formErrors={formErrors}
      />
    );

    expect(screen.getByTestId("error-label")).toHaveTextContent("This field is required");
  });

  // Teste 3
  test("calls onChange when input value changes", () => {
    const handleChange = vi.fn();

    render(
      <InputField
        label="Email"
        name="email"
        type="text"
        placeholder="Type your email"
        onChange={handleChange}
      />
    );

    const input = screen.getByTestId("input-element");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
