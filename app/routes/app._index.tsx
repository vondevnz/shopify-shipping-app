import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query ProductWeight {
      products(first: 10) {
        nodes {
          title
          id
          variants(first: 10) {
            nodes {
              title
              id
              inventoryItem {
                measurement {
                  weight {
                    value
                    unit
                  }
                }
              }
            }
          }
        }
      }
    }`,
  );
  const responseJson = await response.json();

  return { products: responseJson.data?.products.nodes ?? [] };
};

export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Product weights">
      <s-section heading="Products">
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.title}
              <ul>
                {product.variants.nodes.map((variant) => {
                  const weight = variant.inventoryItem?.measurement?.weight;

                  return (
                    <li key={variant.id}>
                      {variant.title}: {weight ? `${weight.value} ${weight.unit}` : "No weight"}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};