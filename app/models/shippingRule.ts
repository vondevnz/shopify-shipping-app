import { COUNTRIES } from "../countries";
import { CURRENCIES } from "../currencies";

export function validateRule(formData: FormData) {
  const formCountry = formData.get("country");
  const formMinWeightGrams = formData.get("minWeightGrams")
  const formMaxWeightGrams = formData.get("maxWeightGrams")
  const formPrice = formData.get("price");
  const formCurrency = formData.get("currency");

    // CONVERT TO CORRECT TYPES
  const country = String(formCountry);
  const price = Math.round(Number(formPrice) * 100);
  const minWeightGrams = Number(formMinWeightGrams);
  const maxWeightGrams = Number(formMaxWeightGrams);
  const currency = String(formCurrency);

  // VALIDATION CHECK
  const errors: Record<string, string> = {};

  const isValidCountry = COUNTRIES.some((c) => c.code === country);
  if (!isValidCountry) {
    errors.country = "Choose a country from the list";
  }

  if (!formMinWeightGrams || !Number.isInteger(minWeightGrams) || minWeightGrams < 0) {
    errors.minWeightGrams = "Enter a whole number of grams, 0 or more";
  }

  if (!formMaxWeightGrams || !Number.isInteger(maxWeightGrams) || maxWeightGrams <= minWeightGrams) {
    errors.maxWeightGrams = "Enter a whole number of grams, greater than min value";
  }

  if (!formPrice || !Number.isInteger(price) || price < 0) {
    errors.price = "Enter a price, 0 or more";
  }

  if (!formCurrency || !CURRENCIES.includes(currency)) {
    errors.currency = "Choose a currency from the list";
  }

  return {
    errors,
    data: { country, minWeightGrams, maxWeightGrams, price, currency },
  };
}