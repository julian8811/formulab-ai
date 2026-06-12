import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { StoredFormula } from "@/lib/actions/index";
import type { SeedIngredient } from "@/data/seed";
import type { ValidationAlert, FormulaScore } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  subtitle: { fontSize: 12, marginBottom: 8, color: "#444" },
  section: { marginBottom: 15 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    borderBottom: "1pt solid #ccc",
    paddingBottom: 3,
  },
  row: { flexDirection: "row", marginBottom: 3 },
  cell: { flex: 1 },
  alert: { marginBottom: 4, padding: 4, backgroundColor: "#f5f5f5" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#888",
    textAlign: "center",
  },
});

interface DocumentData {
  formula: StoredFormula;
  ingredients: SeedIngredient[];
  alerts: ValidationAlert[];
  score?: FormulaScore;
}

function FormulaDocument({ formula, ingredients, alerts, score }: DocumentData) {
  const lines = formula.lines.map((line) => {
    const ing = ingredients.find((i) => i.id === line.ingredientId);
    return { ...line, ingredient: ing };
  });

  const inciList = lines
    .filter((l) => l.ingredient)
    .sort((a, b) => b.percentage - a.percentage)
    .map((l) => l.ingredient!.inciName)
    .join(", ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>FormuLab AI — Dossier Técnico</Text>
        <Text style={styles.subtitle}>{formula.name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del producto</Text>
          <Text>Tipo: {formula.productType}</Text>
          <Text>Público: {formula.targetAudience}</Text>
          <Text>Formato: {formula.productFormat}</Text>
          <Text>pH objetivo: {formula.targetPh ?? "Por definir"}</Text>
          <Text>Mercado: {formula.market}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fórmula maestra</Text>
          <View style={styles.row}>
            <Text style={[styles.cell, { fontWeight: "bold" }]}>Fase</Text>
            <Text style={[styles.cell, { fontWeight: "bold" }]}>INCI</Text>
            <Text style={[styles.cell, { fontWeight: "bold" }]}>Función</Text>
            <Text style={[styles.cell, { fontWeight: "bold" }]}>%</Text>
          </View>
          {lines.map((line, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{line.phase}</Text>
              <Text style={styles.cell}>
                {line.ingredient?.inciName ?? line.ingredientId}
              </Text>
              <Text style={styles.cell}>
                {line.functionInFormula ?? line.ingredient?.function}
              </Text>
              <Text style={styles.cell}>{line.percentage}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Procedimiento de fabricación</Text>
          <Text>1. Pesar ingredientes de fase A y calentar a 70°C si aplica.</Text>
          <Text>2. Incorporar fase B, mezclar suavemente.</Text>
          <Text>
            3. Enfriar a &lt;40°C antes de agregar activos termosensibles (fase C).
          </Text>
          <Text>4. Ajustar pH con ácido cítrico o hidróxido de sodio (c.s.).</Text>
          <Text>5. Envasar y rotular.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lista INCI</Text>
          <Text>{inciList}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claims</Text>
          {formula.claims.map((c, i) => (
            <Text key={i}>• {c}</Text>
          ))}
        </View>

        {score && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Puntuación de validación</Text>
            <Text>
              Seguridad: {score.safety}/100 | Estabilidad: {score.stability}/100
            </Text>
            <Text>
              Regulatorio: {score.regulatory}/100 | Naturalidad: {score.naturalness}/100
            </Text>
            <Text>{score.summary}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de validación ({alerts.length})</Text>
          {alerts.slice(0, 10).map((alert, i) => (
            <View key={i} style={styles.alert}>
              <Text>
                [{alert.status.toUpperCase()}] {alert.title}
              </Text>
              <Text>{alert.message}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist de pruebas</Text>
          <Text>☐ Estabilidad acelerada (40°C, 4 semanas)</Text>
          <Text>☐ Estabilidad en tiempo real (3-6 meses)</Text>
          <Text>☐ Challenge test microbiológico</Text>
          <Text>☐ Compatibilidad con envase</Text>
          <Text>☐ Prueba de uso controlada</Text>
          <Text>☐ Validación de pH final</Text>
        </View>

        <Text style={styles.footer}>
          FormuLab AI — Copiloto técnico de formulación. No sustituye evaluación de
          químico/regulador. Generado: {new Date().toLocaleDateString("es-CO")}
        </Text>
      </Page>
    </Document>
  );
}

export async function generateFormulaPdf(data: DocumentData): Promise<Buffer> {
  const blob = await pdf(<FormulaDocument {...data} />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function generateFormulaDocumentJson(data: DocumentData) {
  return {
    title: data.formula.name,
    formula: data.formula,
    alerts: data.alerts,
    score: data.score,
    generatedAt: new Date().toISOString(),
    disclaimer:
      "FormuLab AI es un copiloto técnico. No sustituye evaluación profesional de químico, microbiólogo o regulador.",
  };
}
