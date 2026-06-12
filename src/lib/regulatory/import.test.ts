import { describe, it, expect, vi, beforeEach } from "vitest";
import { importCosIngBatch } from "@/lib/regulatory/import";
import * as repository from "@/lib/data/repository";

vi.mock("@/lib/data/repository", () => ({
  getAllIngredients: vi.fn(),
  upsertIngredient: vi.fn(),
}));

describe("importCosIngBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips duplicate INCI names", async () => {
    vi.mocked(repository.getAllIngredients).mockResolvedValue([
      {
        id: "ing-aqua",
        commercialName: "Aqua",
        inciName: "Aqua",
        commonName: "Agua",
        function: "Vehículo",
        supplier: "Local",
        origin: "mineral",
        ionicCharge: "non_ionic",
        minPercentage: 0,
        maxPercentage: 100,
        solubility: "",
        allergens: [],
        biodegradable: true,
        certifications: [],
        approvedForHuman: true,
        recommendedUse: "",
        dogCompatibility: "approved",
        lickRisk: "low",
        fragranceRisk: "low",
        heatSensitive: false,
        costPerKg: 0,
        naturalOriginIndex: 0,
      },
    ]);
    vi.mocked(repository.upsertIngredient).mockResolvedValue(undefined as never);

    const result = await importCosIngBatch([
      { inciName: "Aqua", function: "Solvent" },
      { inciName: "Glycerin", function: "Humectant" },
    ]);

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(repository.upsertIngredient).toHaveBeenCalledTimes(1);
  });
});
