/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types.d.ts';

export type ProductWeightQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ProductWeightQuery = { products: { nodes: Array<(
      Pick<AdminTypes.Product, 'title' | 'id'>
      & { variants: { nodes: Array<(
          Pick<AdminTypes.ProductVariant, 'title' | 'id'>
          & { inventoryItem: { measurement: { weight?: AdminTypes.Maybe<Pick<AdminTypes.Weight, 'value' | 'unit'>> } } }
        )> } }
    )> } };

interface GeneratedQueryTypes {
  "#graphql\n    query ProductWeight {\n      products(first: 10) {\n        nodes {\n          title\n          id\n          variants(first: 10) {\n            nodes {\n              title\n              id\n              inventoryItem {\n                measurement {\n                  weight {\n                    value\n                    unit\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }": {return: ProductWeightQuery, variables: ProductWeightQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
