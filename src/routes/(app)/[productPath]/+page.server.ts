// since there's no dynamic data here, we can prerender

import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { building } from "$app/environment";

// it so that it gets served as a static asset in production
// export const prerender = true;

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Skip fetch during prerender/building to avoid 404 errors
  if (building) {
    return {
      products: [],
      productDetail: {},
    };
  }

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
    productPath: params.productPath,
  };
};
