import {
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  Form,
  useLoaderData,
  useActionData,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
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
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = String(formData.get("id"));
    await db.shippingRule.deleteMany({ where: { id, shop: session.shop } });
    return { ok: true };
  }

  const { errors, data } = validateRule(formData);
  if (Object.keys(errors).length > 0) return { errors };

  await db.shippingRule.create({ data: { ...data, shop: session.shop } });
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
          <input type="hidden" name="intent" value="create" />
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
          {actionData?.errors?.country && <p>{actionData.errors.country}</p>}

          <label>
            Price
            <input name="price" type="number" step="0.01" min="0"/>
          </label>
          {actionData?.errors?.price && <p>{actionData.errors.price}</p>}

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
          {actionData?.errors?.currency && <p>{actionData.errors.currency}</p>}

          <label>
            Minimum Weight (g)
            <input name="minWeightGrams" type="number" min="0"/>
          </label>
          {actionData?.errors?.minWeightGrams && <p>{actionData.errors.minWeightGrams}</p>}

          <label>
            Maximum Weight (g)
            <input name="maxWeightGrams" type="number" min="0"/>
          </label>
           {actionData?.errors?.maxWeightGrams && <p>{actionData.errors.maxWeightGrams}</p>}

          <button type="submit">Add rule</button>
        </Form>
      </s-section>

      <s-section heading="Rules">
        <s-table>
          <s-table-header-row>
            <s-table-header>Country</s-table-header>
            <s-table-header>Currency</s-table-header>
            <s-table-header>Price</s-table-header>
            <s-table-header>Minimum Weight (g)</s-table-header>
            <s-table-header>Maximum Weight (g)</s-table-header>
            <s-table-header>Actions</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {shippingRules.map((rule) => (
              <s-table-row key={rule.id}>
                <s-table-cell>{rule.country}</s-table-cell>
                <s-table-cell>{rule.currency}</s-table-cell>
                <s-table-cell>{(rule.price / 100).toFixed(2)}</s-table-cell>
                <s-table-cell>{rule.minWeightGrams}</s-table-cell>
                <s-table-cell>{rule.maxWeightGrams}</s-table-cell>
                <s-table-cell>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={rule.id} />
                    <button type="submit">Delete</button>
                  </Form>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

function validateRule(formData: FormData) {
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