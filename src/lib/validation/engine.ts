import type { SeedIngredient, SeedIncompatibility } from "@/data/seed";
import type { TargetAudience, ValidationAlert, ValidationStatus } from "@/types";

export interface FormulaLineInput {
  ingredientId: string;
  ingredient: SeedIngredient;
  phase: string;
  percentage: number;
  functionInFormula?: string;
}

export interface ValidationInput {
  lines: FormulaLineInput[];
  targetAudience: TargetAudience;
  targetPh?: number;
  productFormat?: string;
  positioning?: string[];
  incompatibilities: SeedIncompatibility[];
}

const DOG_AUDIENCES: TargetAudience[] = [
  "dog",
  "dog_puppy",
  "dog_sensitive",
  "dog_long_coat",
];

function isDogAudience(audience: TargetAudience): boolean {
  return DOG_AUDIENCES.includes(audience);
}

function getPhRange(
  audience: TargetAudience,
  productFormat?: string,
): {
  min: number;
  max: number;
  ideal: number;
} {
  if (isDogAudience(audience)) {
    if (productFormat === "foam" || productFormat === "liquid") {
      return { min: 5.0, max: 7.0, ideal: 5.5 };
    }
    return { min: 4.5, max: 7.5, ideal: 5.8 };
  }

  if (productFormat === "liquid" && audience === "human_adult") {
    return { min: 4.5, max: 6.5, ideal: 5.5 };
  }

  return { min: 4.0, max: 7.0, ideal: 5.5 };
}

export function validateFormula(input: ValidationInput): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const {
    lines,
    targetAudience,
    targetPh,
    productFormat,
    positioning,
    incompatibilities,
  } = input;

  const totalPercentage = lines.reduce((sum, l) => sum + l.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.5) {
    alerts.push({
      id: "total-percentage",
      category: "percentage",
      status: totalPercentage > 100 ? "fail" : "warning",
      title: "Total de fórmula",
      message: `La suma de porcentajes es ${totalPercentage.toFixed(2)}%. Debe ser ~100%.`,
      suggestion: "Ajusta los porcentajes para que sumen 100%.",
    });
  }

  const phRange = getPhRange(targetAudience, productFormat);
  const phToCheck = targetPh ?? phRange.ideal;

  if (phToCheck < phRange.min || phToCheck > phRange.max) {
    alerts.push({
      id: "ph-range",
      category: "ph",
      status: "fail",
      title: "pH fuera de rango",
      message: `pH ${phToCheck} fuera del rango recomendado (${phRange.min}-${phRange.max}) para ${targetAudience}.`,
      suggestion: `Ajustar pH hacia ${phRange.ideal} con ácido cítrico o hidróxido de sodio.`,
    });
  } else if (Math.abs(phToCheck - phRange.ideal) > 0.5) {
    alerts.push({
      id: "ph-suboptimal",
      category: "ph",
      status: "warning",
      title: "pH subóptimo",
      message: `pH ${phToCheck} aceptable pero no ideal. Rango óptimo cercano a ${phRange.ideal}.`,
      suggestion: "Considera ajuste fino de pH.",
    });
  }

  if (isDogAudience(targetAudience)) {
    alerts.push({
      id: "dog-context",
      category: "dog",
      status: "warning",
      title: "Formulación canina",
      message:
        "Esta fórmula está diseñada para perros. No se recomienda extrapolar directamente desde cosmética humana porque la piel, el pelaje, el lamido y la tolerancia a fragancias son diferentes.",
    });
  }

  for (const line of lines) {
    const ing = line.ingredient;
    if (line.percentage < ing.minPercentage || line.percentage > ing.maxPercentage) {
      alerts.push({
        id: `pct-${line.ingredientId}`,
        category: "percentage",
        status: line.percentage > ing.maxPercentage * 1.5 ? "fail" : "warning",
        title: `${ing.commonName}: porcentaje fuera de rango`,
        message: `${ing.inciName} al ${line.percentage}%. Rango sugerido: ${ing.minPercentage}-${ing.maxPercentage}%.`,
        suggestion:
          ing.restrictions ??
          `Ajustar entre ${ing.minPercentage} y ${ing.maxPercentage}%.`,
      });
    }

    if (isDogAudience(targetAudience)) {
      if (ing.dogCompatibility === "avoid") {
        alerts.push({
          id: `dog-avoid-${line.ingredientId}`,
          category: "dog",
          status: "fail",
          title: `No recomendado para perros: ${ing.commonName}`,
          message:
            ing.restrictions ??
            `${ing.inciName} no es compatible con formulación canina.`,
          suggestion: "Eliminar o sustituir por alternativa aprobada para perros.",
        });
      } else if (ing.dogCompatibility === "caution") {
        alerts.push({
          id: `dog-caution-${line.ingredientId}`,
          category: "dog",
          status: "warning",
          title: `Precaución canina: ${ing.commonName}`,
          message:
            ing.restrictions ??
            `Usar con precaución en perros. Riesgo por lamido: ${ing.lickRisk}.`,
          suggestion: "Revisar concentración y frecuencia de uso.",
        });
      }

      if (ing.fragranceRisk === "high" || ing.inciName === "Parfum") {
        alerts.push({
          id: `fragrance-${line.ingredientId}`,
          category: "dog",
          status: "warning",
          title: "Fragancia en producto canino",
          message:
            "Revisar seguridad en perros; evitar concentraciones altas y especies sensibles.",
          suggestion:
            "Mantener ≤0.2% y preferir fragancia certificada IFRA baja alérgenos.",
        });
      }

      if (ing.lickRisk === "high" || ing.lickRisk === "medium") {
        alerts.push({
          id: `lick-${line.ingredientId}`,
          category: "dog",
          status: ing.lickRisk === "high" ? "fail" : "warning",
          title: `Riesgo por lamido: ${ing.commonName}`,
          message: `El perro puede lamer el producto aplicado. Riesgo: ${ing.lickRisk}.`,
          suggestion: "Reducir concentración o usar alternativa de menor riesgo.",
        });
      }
    }

    if (ing.ionicCharge === "anionic" && ing.inciName.includes("Sulfate")) {
      alerts.push({
        id: `anionic-${line.ingredientId}`,
        category: "compatibility",
        status: "warning",
        title: "Tensioactivo aniónico fuerte",
        message: "Puede ser irritante para piel sensible o uso frecuente.",
        suggestion: "Considerar glucósidos o betaína para limpieza más suave.",
      });
    }

    if (ing.heatSensitive) {
      alerts.push({
        id: `heat-${line.ingredientId}`,
        category: "compatibility",
        status: "warning",
        title: `Activo sensible al calor: ${ing.commonName}`,
        message: "Agregar en fase de enfriamiento (<40°C).",
        suggestion: `Incorporar ${ing.commonName} después de enfriar la base.`,
      });
    }

    if (ing.inciName.includes("Benzoate") && phToCheck > 6) {
      alerts.push({
        id: `preservative-ph-${line.ingredientId}`,
        category: "microbiology",
        status: "fail",
        title: "Conservante incompatible con pH propuesto",
        message: "Benzoato/sorbato pierde eficacia por encima de pH 6.",
        suggestion: "Ajustar pH a 5.0-5.5 o cambiar sistema conservante.",
      });
    }
  }

  const hasWater = lines.some(
    (l) => l.ingredient.inciName === "Aqua" || l.percentage > 50,
  );
  const hasPreservative = lines.some((l) =>
    l.ingredient.function.toLowerCase().includes("conserv"),
  );
  const hasBotanical = lines.some(
    (l) =>
      l.ingredient.origin === "vegetal" &&
      l.ingredient.function.toLowerCase().includes("extracto"),
  );

  if (hasWater && !hasPreservative) {
    alerts.push({
      id: "micro-no-preservative",
      category: "microbiology",
      status: "fail",
      title: "Fase acuosa sin conservante",
      message:
        "La fórmula contiene fase acuosa. Requiere sistema conservante y prueba de eficacia conservante/challenge test antes de comercializar.",
      suggestion: "Agregar conservante compatible con el pH objetivo.",
    });
  }

  if (hasBotanical && hasWater) {
    alerts.push({
      id: "micro-botanical",
      category: "microbiology",
      status: "warning",
      title: "Extractos vegetales en base acuosa",
      message:
        "Los extractos aumentan carga microbiológica. Refuerza conservación y considera challenge test.",
      suggestion: "Usar conservante de amplio espectro y validar con challenge test.",
    });
  }

  for (const rule of incompatibilities) {
    if (rule.ingredientAId && rule.ingredientBId) {
      const hasA = lines.some((l) => l.ingredientId === rule.ingredientAId);
      const hasB = lines.some((l) => l.ingredientId === rule.ingredientBId);
      if (hasA && hasB) {
        alerts.push({
          id: rule.id,
          category: "compatibility",
          status: rule.severity === "high" ? "fail" : "warning",
          title: "Incompatibilidad detectada",
          message: rule.message,
          suggestion: rule.suggestion,
        });
      }
    }

    if (rule.ionicChargeA && rule.ionicChargeB) {
      const charges = lines.map((l) => l.ingredient.ionicCharge);
      if (charges.includes(rule.ionicChargeA) && charges.includes(rule.ionicChargeB)) {
        const alreadyReported = alerts.some((a) => a.id === rule.id);
        if (!alreadyReported) {
          alerts.push({
            id: rule.id,
            category: "compatibility",
            status: rule.severity === "high" ? "fail" : "warning",
            title: "Incompatibilidad iónica",
            message: rule.message,
            suggestion: rule.suggestion,
          });
        }
      }
    }
  }

  if (positioning?.includes("paraben_free")) {
    const hasParaben = lines.some((l) =>
      l.ingredient.inciName.toLowerCase().includes("paraben"),
    );
    if (hasParaben) {
      alerts.push({
        id: "paraben-positioning",
        category: "compatibility",
        status: "fail",
        title: "Conflicto con posicionamiento sin parabenos",
        message:
          "La fórmula contiene parabenos pero el posicionamiento indica sin parabenos.",
        suggestion: "Cambiar a benzoato/sorbato u otro conservante alternativo.",
      });
    }
  }

  if (productFormat === "foam") {
    const viscosityRisk = lines.some(
      (l) =>
        l.ingredient.function.toLowerCase().includes("espesante") && l.percentage > 1,
    );
    if (viscosityRisk) {
      alerts.push({
        id: "foam-viscosity",
        category: "stability",
        status: "warning",
        title: "Compatibilidad con bomba foamer",
        message:
          "Exceso de espesante puede impedir dosificación adecuada en bomba espumadora.",
        suggestion:
          "Mantener fórmula suficientemente líquida; validar con envase foamer.",
      });
    }
  }

  return alerts;
}

export function getValidationSummary(alerts: ValidationAlert[]): {
  overall: ValidationStatus;
  pass: number;
  warning: number;
  fail: number;
} {
  const pass = alerts.filter((a) => a.status === "pass").length;
  const warning = alerts.filter((a) => a.status === "warning").length;
  const fail = alerts.filter((a) => a.status === "fail").length;

  let overall: ValidationStatus = "pass";
  if (fail > 0) overall = "fail";
  else if (warning > 0) overall = "warning";

  return { overall, pass, warning, fail };
}
