import {
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  Form,
  useLoaderData,
  useActionData,
} from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { COUNTRIES } from "../countries";
import { CURRENCIES } from "../currencies";

// LOADER
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const rules = await db.shippingRule.findMany({ 
    orderBy: [
      {
        country: "asc"
      },
      {
        minWeightGrams: "asc"
      }
    ],
    where: {
      shop: session.shop
    }
  })

  return { shippingRules: rules };
}

// Admin page to add + edit rules
/* 
  country         String
  minWeightGrams  Int
  maxWeightGrams  Int
  price           Int
  currency        String
  shop            String
*/
// ACTION
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();

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

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // ADD TO DATABASE
  await db.shippingRule.create({ data: {
    country,
    minWeightGrams,
    maxWeightGrams,
    price,
    currency,
    shop: session.shop
  }})

  return { ok: true };
}

// FORM Component
export default function Rules() {
  const { shippingRules } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <s-page>
      <s-section heading="Shipping rules">
        <Form method="post">
          <label>
            Country
            <select name="country">
              {COUNTRIES.map(( country ) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price
            <input name="price" type="number" step="0.01" min="0"/>
          </label>
          <label>
            Currency
            <select name="currency">
              {CURRENCIES.map(( currency ) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
          <label>
            Minimum Weight (g)
            <input name="minWeightGrams" type="number" min="0"/>
          </label>
          <label>
            Maximum Weight (g)
            <input name="maxWeightGrams" type="number" min="0"/>
          </label>
          <button type="submit">Add rule</button>
        </Form>
      </s-section>

      <s-section heading="Rules">
        <s-paragraph>
            <s-table>
              <s-table-header-row>
                <s-table-header>Country</s-table-header>
                <s-table-header>Currency</s-table-header>
                <s-table-header>Price</s-table-header>
                <s-table-header>Minimum Weight (g)</s-table-header>
                <s-table-header>Maximum Weight (g)</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {shippingRules.map(( rules ) => (
                  <s-table-row>
                    <s-table-cell>{rules.country}</s-table-cell>
                    <s-table-cell>{rules.currency}</s-table-cell>
                    <s-table-cell>{rules.price}</s-table-cell>
                    <s-table-cell>{rules.minWeightGrams}</s-table-cell>
                    <s-table-cell>{rules.maxWeightGrams}</s-table-cell>
                  </s-table-row> 
                ))}
              </s-table-body>
            </s-table>
        </s-paragraph>
      </s-section>
    </s-page>
  )
}
