import type { ShippingRule } from "@prisma/client";
import { COUNTRIES } from "../countries";
import { CURRENCIES } from "../currencies";

type RuleFieldsProps = {
  rule?: ShippingRule;
  errors?: Record<string, string>;
};

export function RuleFields({ rule, errors }: RuleFieldsProps) {
  return (
    <s-stack gap="base">
      <s-select label="Country" name="country" value={rule?.country} error={errors?.country}>
        {COUNTRIES.map((country) => (
          <s-option key={country.code} value={country.code}>
            {country.name}
          </s-option>
        ))}
      </s-select>

      <s-stack direction="inline" gap="base">
        <s-number-field
          label="Price"
          name="price"
          step={0.01}
          min={0}
          value={rule ? (rule.price / 100).toFixed(2) : undefined}
          error={errors?.price}
        />
        <s-select label="Currency" name="currency" value={rule?.currency} error={errors?.currency}>
          {CURRENCIES.map((currency) => (
            <s-option key={currency} value={currency}>
              {currency}
            </s-option>
          ))}
        </s-select>
      </s-stack>

      <s-stack direction="inline" gap="base">
        <s-number-field
          label="Minimum weight"
          name="minWeightGrams"
          suffix="g"
          step={1}
          min={0}
          value={rule ? String(rule.minWeightGrams) : undefined}
          error={errors?.minWeightGrams}
        />
        <s-number-field
          label="Maximum weight"
          name="maxWeightGrams"
          suffix="g"
          step={1}
          min={0}
          value={rule ? String(rule.maxWeightGrams) : undefined}
          error={errors?.maxWeightGrams}
        />
      </s-stack>
    </s-stack>
  );
}