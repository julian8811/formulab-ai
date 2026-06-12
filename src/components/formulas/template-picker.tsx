"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Template {
  name: string;
  productType: string;
  targetAudience: string;
}

interface TemplatePickerProps {
  templates: Template[];
}

export function TemplatePicker({ templates }: TemplatePickerProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        Empezar desde plantilla ({templates.length} disponibles)
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, i) => (
          <Link key={i} href={`/formulas/new?template=${i}`}>
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm leading-snug">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {t.productType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {t.targetAudience}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
