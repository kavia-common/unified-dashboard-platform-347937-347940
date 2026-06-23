import React from "react";
import { render, screen } from "@testing-library/react";

// Mock next/navigation (App Router) so useRouter() is safe in tests.
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    prefetch: jest.fn()
  })
}));

// Mock the app's auth hook so the page can render without Firebase credentials.
jest.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: () => ({ user: null, loading: false })
}));

import HomePage from "@/app/page";

describe("HomePage smoke", () => {
  it("renders loading UI without requiring Firebase credentials", () => {
    render(<HomePage />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.getByText(/Preparing your dashboard/i)).toBeInTheDocument();
  });
});
