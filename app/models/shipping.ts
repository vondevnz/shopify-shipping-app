import type { ShippingRule } from "@prisma/client";

type WeightUnit = "GRAMS" | "KILOGRAMS" | "OUNCES" | "POUNDS";

export function toGrams(value: number, unit: WeightUnit): number {

  let grams = value;

  if (unit === "KILOGRAMS") {
    grams = grams * 1000;
  }
  else if (unit === "OUNCES") {
    grams = grams * 28.349523125;
  }
  else if (unit === "POUNDS") {
    grams = grams * 453.59237;
  }

  return Math.round(grams);

}

export function findRule(rules: ShippingRule[], country: string, grams: number) {

  return rules.find((rule) => rule.country === country && grams > rule.minWeightGrams && grams <= rule.maxWeightGrams);
}