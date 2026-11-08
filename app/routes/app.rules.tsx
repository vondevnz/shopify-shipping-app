import {
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  Form,
  useLoaderData,
  useActionData,
  useNavigate,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { validateRule } from "app/models/shippingRule";
import { RuleFields } from "app/components/RuleFields";

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
  const navigate = useNavigate();

  return (
    <s-page>
      <s-section heading="Add a rule">
        <Form method="post">
          <input type="hidden" name="intent" value="create" />
          <s-stack gap="base">
            <RuleFields errors={actionData?.errors} />
            <s-stack direction="inline">
              <s-button type="submit" variant="primary">Add rule</s-button>
            </s-stack>
          </s-stack>
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
                  <s-stack direction="inline" gap="small">
                    <s-button onClick={() => navigate(`/app/rules/${rule.id}`)}>Edit</s-button>
                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={rule.id} />
                      <s-button type="submit" tone="critical">Delete</s-button>
                    </Form>
                  </s-stack>
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

