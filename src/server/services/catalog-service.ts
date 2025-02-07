import type { NFTType } from "server/database/models/nft.model";
import type { Product, ProductType } from "server/database/models/catalog.model";
import catalogModel from "server/database/models/catalog.model";

export const getProductsByTypeAndCollection = async (
  type: ProductType,
  collection?: NFTType | null
): Promise<Product | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { type };
  if (collection) {
    query.collection = collection;
  }
  return await catalogModel().findOne(query);
};

export const getAll = async (): Promise<Product[]> => {
  return await catalogModel().find({});
};

const service = { getProductsByTypeAndCollection, getAll };
export default service;
