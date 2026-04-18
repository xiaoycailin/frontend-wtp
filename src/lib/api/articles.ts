const BASE_URL = "http://192.168.18.217:3000";

async function getAuthToken() {
  const authState = localStorage.getItem("auth");
  if (authState) {
    const { jwt } = JSON.parse(authState);
    return jwt;
  }
  return null;
}

export async function fetchArticles(params?: { 
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  status?: string;
  search?: string;
}) {
  const token = await getAuthToken();
  
  const queryParams = new URLSearchParams({
    page: params?.page?.toString() || "1",
    limit: params?.limit?.toString() || "20",
  });

  if (params?.categoryId) queryParams.set("categoryId", params.categoryId);
  if (params?.tagId) queryParams.set("tagId", params.tagId);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.search) queryParams.set("search", params.search);

  const res = await fetch(`${BASE_URL}/articles?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function fetchArticleById(id: string) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/articles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function fetchArticleBySlug(slug: string) {
  const res = await fetch(`${BASE_URL}/articles/slug/${slug}`);
  return res.json();
}

export async function createArticle(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  tags?: string[];
}) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/articles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updateArticle(id: string, data: Partial<{
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  tags?: string[];
}>) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/articles/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deleteArticle(id: string) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/articles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.ok;
}

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/article-categories`);
  return res.json();
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
}) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/article-categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function fetchTags() {
  const res = await fetch(`${BASE_URL}/article-tags`);
  return res.json();
}

export async function createTag(data: {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  featured?: boolean;
}) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/article-tags`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function likeArticle(articleId: string) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/articles/${articleId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  return res.json();
}

export async function bookmarkArticle(articleId: string) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/articles/${articleId}/bookmark`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  return res.json();
}

export async function addComment(articleId: string, content: string, parentId?: string) {
  const token = await getAuthToken();
  
  const res = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, parentId }),
  });

  return res.json();
}

export async function fetchComments(articleId: string, page = 1) {
  const res = await fetch(`${BASE_URL}/articles/${articleId}/comments?page=${page}`);
  return res.json();
}
