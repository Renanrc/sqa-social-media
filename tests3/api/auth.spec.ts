import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:8080";

test("POST /auth/signup - deve cadastrar novo usuario e retornar 200", async ({ request }) => {
  const uniqueEmail = "signup" + Date.now() + "@email.com";
  const response = await request.post(API_URL + "/auth/signup", {
    data: { email: uniqueEmail, password: "Senha123!" },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty("id");
  expect(body.email).toBe(uniqueEmail);
});

test("POST /auth/signup - deve retornar 409 ao cadastrar email duplicado", async ({ request }) => {
  const email = "dup" + Date.now() + "@email.com";
  await request.post(API_URL + "/auth/signup", {
    data: { email, password: "Senha123!" },
  });
  const response = await request.post(API_URL + "/auth/signup", {
    data: { email, password: "Senha123!" },
  });
  expect(response.status()).toBe(409);
});

test("POST /auth/signup - deve retornar 422 ao cadastrar com senha invalida", async ({ request }) => {
  const response = await request.post(API_URL + "/auth/signup", {
    data: { email: "qualquer@email.com", password: "fraca" },
  });
  expect(response.status()).toBe(422);
});

test("BUG: POST /auth/signup - mensagem de email duplicado deveria ser E-mail ja cadastrado", async ({ request }) => {
  const email = "bugmsg" + Date.now() + "@email.com";
  await request.post(API_URL + "/auth/signup", {
    data: { email, password: "Senha123!" },
  });
  const response = await request.post(API_URL + "/auth/signup", {
    data: { email, password: "Senha123!" },
  });
  const body = await response.json();
  expect(body.message).toBe("E-mail ja cadastrado");
});

test("POST /auth/signin - deve fazer login com credenciais corretas", async ({ request }) => {
  const email = "login" + Date.now() + "@email.com";
  const password = "Senha123!";
  await request.post(API_URL + "/auth/signup", {
    data: { email, password },
  });
  const response = await request.post(API_URL + "/auth/signin", {
    data: { email, password },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty("id");
});


test("POST /auth/signin - deve retornar 401 com senha incorreta", async ({ request }) => {
  const response = await request.post(API_URL + "/auth/signin", {
    data: { email: "naoexiste@email.com", password: "Senha123!" },
  });
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.message).toBe("Credenciais invalidas");
});

test("POST /auth/reset-password - deve retornar 404 para email nao cadastrado", async ({ request }) => {
  const response = await request.post(API_URL + "/auth/reset-password", {
    data: { email: "naoexiste@email.com" },
  });
  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.message).toBe("Usuario nao encontrado");
});
