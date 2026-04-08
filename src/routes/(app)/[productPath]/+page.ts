// since there's no dynamic data here, we can prerender

import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

// it so that it gets served as a static asset in production
export const prerender = true;

export const load: PageLoad = async ({ params, fetch }) => {
  const category = await fetch(
    "/api/v1/category/sub/" + params.productPath + "?productInclude=true",
  );
  const body = await category.json();

  let result: any[] = [];
  let catData: any = {};
  if (category.status == 200 && body?.data?.length > 0) {
    result = body.data[0].products;
    catData = body.data[0];
    delete catData.products;
  } else {
    redirect(302, "/");
  }
  return {
    products: result,
    productDetail: catData,
  };
};
