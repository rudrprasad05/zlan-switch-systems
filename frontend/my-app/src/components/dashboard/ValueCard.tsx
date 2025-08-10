"use client";

import { Zap } from "lucide-react";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export interface ICardData {
  title: string;
  unit: { value: number; label: string };
  icon: React.ElementType;
}

export default function ValueCard({ data }: { data: ICardData }) {
  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(2)} ${unit}`;
  };
  const Icon = data.icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(data.unit.value, data.unit.label)}
        </div>
      </CardContent>
    </Card>
  );
}
