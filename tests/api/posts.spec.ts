import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:8080";

test("GET /posts - deve retornar lista de posts com status 200", async ({ request }) => {
  const response = await request.get(API_URL + "/posts?limit=5");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty("posts");
  expect(Array.isArray(body.posts)).toBeTruthy();
  expect(body.posts.length).toBeGreaterThan(0);
  const firstPost = body.posts[0];
  expect(firstPost).toHaveProperty("id");
  expect(firstPost).toHaveProperty("title");
  expect(firstPost).toHaveProperty("body");
});
