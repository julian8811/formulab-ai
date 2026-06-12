import { NextRequest, NextResponse } from "next/server";
import { importCosIngBatch, importIFRABatch } from "@/lib/regulatory/import";
import { cosingSampleEntries, ifraSampleEntries } from "@/data/regulatory/cosing-sample";
import { cosingExtendedEntries } from "@/data/regulatory/cosing-extended";

export async function POST(request: NextRequest) {
  try {
    const { source } = await request.json();

    if (source === "cosing") {
      const result = await importCosIngBatch(cosingSampleEntries);
      return NextResponse.json(result);
    }

    if (source === "cosing-full") {
      const result = await importCosIngBatch(cosingExtendedEntries);
      return NextResponse.json(result);
    }

    if (source === "ifra") {
      const result = await importIFRABatch(ifraSampleEntries);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "source debe ser cosing, cosing-full o ifra" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}
