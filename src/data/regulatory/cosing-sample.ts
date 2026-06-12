import type { CosIngEntry } from "@/lib/regulatory/import";

/** Subconjunto representativo de CosIng para importación inicial. */
export const cosingSampleEntries: CosIngEntry[] = [
  { inciName: "Aqua", function: "Solvent", restrictions: "None" },
  { inciName: "Glycerin", function: "Humectant", restrictions: "None" },
  { inciName: "Niacinamide", function: "Skin conditioning", restrictions: "None" },
  { inciName: "Panthenol", function: "Hair conditioning", restrictions: "None" },
  { inciName: "Tocopherol", function: "Antioxidant", restrictions: "None" },
  { inciName: "Sodium Hyaluronate", function: "Humectant", restrictions: "None" },
  { inciName: "Allantoin", function: "Skin protecting", restrictions: "None" },
  {
    inciName: "Butyrospermum Parkii Butter",
    function: "Emollient",
    restrictions: "None",
  },
  { inciName: "Cocos Nucifera Oil", function: "Emollient", restrictions: "None" },
  {
    inciName: "Aloe Barbadensis Leaf Juice",
    function: "Humectant",
    restrictions: "None",
  },
  { inciName: "Coco-Glucoside", function: "Surfactant", restrictions: "None" },
  { inciName: "Decyl Glucoside", function: "Surfactant", restrictions: "None" },
  { inciName: "Cocamidopropyl Betaine", function: "Surfactant", restrictions: "None" },
  { inciName: "Sodium Laureth Sulfate", function: "Surfactant", restrictions: "II/410" },
  { inciName: "Phenoxyethanol", function: "Preservative", restrictions: "III/169" },
  { inciName: "Sodium Benzoate", function: "Preservative", restrictions: "III/169" },
  { inciName: "Citric Acid", function: "pH adjuster", restrictions: "None" },
  { inciName: "Squalane", function: "Emollient", restrictions: "None" },
  {
    inciName: "Avena Sativa Kernel Flour",
    function: "Skin protecting",
    restrictions: "None",
  },
  {
    inciName: "Retinol",
    function: "Skin conditioning",
    restrictions: "III/376 — max 0.3% body, 0.05% face",
  },
];

export const ifraSampleEntries = [
  {
    ingredientName: "Linalool",
    category: "4",
    maxLevel: 1.0,
    restrictions: "Debe declararse si >0.001% en producto no enjuague",
  },
  {
    ingredientName: "Limonene",
    category: "4",
    maxLevel: 0.5,
    restrictions: "Alérgeno declarable UE",
  },
  {
    ingredientName: "Citral",
    category: "4",
    maxLevel: 0.2,
    restrictions: "Componente de fragancias naturales",
  },
  {
    ingredientName: "Geraniol",
    category: "4",
    maxLevel: 0.8,
    restrictions: "IFRA Standard 49",
  },
  {
    ingredientName: "Eugenol",
    category: "4",
    maxLevel: 0.5,
    restrictions: "Presente en aceites esenciales",
  },
];
