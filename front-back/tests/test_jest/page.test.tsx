import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectCompetition from "./page";
import { useAuth } from "@/contexts/AuthContext";

// front-back/app/competitions/page.test.tsx

// Mock dependencies
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn(() => Promise.resolve("mock-qrcode-url")),
}));

global.fetch = jest.fn();

describe("SelectCompetition Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { type: "administrateur" } });
  });

  it("renders loading state", () => {
    render(<SelectCompetition />);
    expect(screen.getByText("Chargement des compétitions...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));
    render(<SelectCompetition />);
    await waitFor(() => {
      expect(screen.getByText("Erreur lors du chargement des compétitions")).toBeInTheDocument();
    });
  });

  it("renders competition list", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        competitions: [
          { id: 1, numero: "001", intitule: "Competition 1", type: "Type A", epreuves: [] },
        ],
      }),
    });
    render(<SelectCompetition />);
    await waitFor(() => {
      expect(screen.getByText("Competition 1")).toBeInTheDocument();
    });
  });

  it("generates QR codes for competitions", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        competitions: [
          { id: 1, numero: "001", intitule: "Competition 1", type: "Type A", epreuves: [] },
        ],
      }),
    });
    render(<SelectCompetition />);
    await waitFor(() => {
      expect(screen.getByAltText("QR Code for 001")).toBeInTheDocument();
    });
  });

  it("handles competition creation", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          competitions: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 2,
          numero: "002",
          intitule: "New Competition",
          type: "Type B",
        }),
      });

    render(<SelectCompetition />);
    fireEvent.click(screen.getByText("Créer une nouvelle compétition"));

    fireEvent.change(screen.getByLabelText("Numéro"), { target: { value: "002" } });
    fireEvent.change(screen.getByLabelText("Intitulé"), { target: { value: "New Competition" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "Type B" } });

    fireEvent.click(screen.getByText("Créer"));

    await waitFor(() => {
      expect(screen.getByText("New Competition")).toBeInTheDocument();
    });
  });

  it("handles competition deletion", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        competitions: [
          { id: 1, numero: "001", intitule: "Competition 1", type: "Type A", epreuves: [] },
        ],
      }),
    });

    render(<SelectCompetition />);
    await waitFor(() => {
      expect(screen.getByText("Competition 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Supprimer la compétition"));
    fireEvent.click(screen.getByText("Supprimer"));

    await waitFor(() => {
      expect(screen.queryByText("Competition 1")).not.toBeInTheDocument();
    });
  });
});