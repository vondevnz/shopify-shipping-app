import {
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { validateRule } from "../models/shippingRule";
import { RuleFields } from "app/components/RuleFields";

// LOADER: load the one rule being edited
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!params.id) throw new Response("Rule not found", { status: 404 });

  const rule = await db.shippingRule.findFirst({
    where: { id: params.id, shop: session.shop },
  });
  if (!rule) throw new Response("Rule not found", { status: 404 });

  return { rule };
};

// ACTION: validate and save the changes
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session, redirect } = await authenticate.admin(request);
  if (!params.id) throw new Response("Rule not found", { status: 404 });

  const formData = await request.formData();
  const { errors, data } = validateRule(formData);
  if (Object.keys(errors).length > 0) return { errors };

  await db.shippingRule.updateMany({
    where: { id: params.id, shop: session.shop },
    data,
  });

  return redirect("/app/rules");
};

// PAGE
export default function EditRule() {
  const { rule } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <s-page heading="Edit rule">
      <s-section>
        <Form method="post">
          <s-stack gap="base">
            <RuleFields rule={rule} errors={actionData?.errors} />
            <s-stack direction="inline" gap="base">
              <s-button type="submit" variant="primary">Save</s-button>
              <s-button type="button" onClick={() => navigate("/app/rules")}>Cancel</s-button>
            </s-stack>
          </s-stack>
        </Form>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};