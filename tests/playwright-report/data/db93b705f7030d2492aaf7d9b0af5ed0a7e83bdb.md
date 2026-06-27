# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\auth.spec.ts >> BUG: POST /auth/signup - mensagem de email duplicado deveria ser E-mail ja cadastrado
- Location: api\auth.spec.ts:34:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "E-mail ja cadastrado"
Received: "E-mail já está em uso"
```

# Test source

```ts
  1  | ﻿import { test, expect } from "@playwright/test";
  2  | 
  3  | const API_URL = "http://localhost:8080";
  4  | 
  5  | test("POST /auth/signup - deve cadastrar novo usuario e retornar 200", async ({ request }) => {
  6  |   const uniqueEmail = "signup" + Date.now() + "@email.com";
  7  |   const response = await request.post(API_URL + "/auth/signup", {
  8  |     data: { email: uniqueEmail, password: "Senha123!" },
  9  |   });
  10 |   expect(response.status()).toBe(200);
  11 |   const body = await response.json();
  12 |   expect(body).toHaveProperty("id");
  13 |   expect(body.email).toBe(uniqueEmail);
  14 | });
  15 | 
  16 | test("POST /auth/signup - deve retornar 409 ao cadastrar email duplicado", async ({ request }) => {
  17 |   const email = "dup" + Date.now() + "@email.com";
  18 |   await request.post(API_URL + "/auth/signup", {
  19 |     data: { email, password: "Senha123!" },
  20 |   });
  21 |   const response = await request.post(API_URL + "/auth/signup", {
  22 |     data: { email, password: "Senha123!" },
  23 |   });
  24 |   expect(response.status()).toBe(409);
  25 | });
  26 | 
  27 | test("POST /auth/signup - deve retornar 422 ao cadastrar com senha invalida", async ({ request }) => {
  28 |   const response = await request.post(API_URL + "/auth/signup", {
  29 |     data: { email: "qualquer@email.com", password: "fraca" },
  30 |   });
  31 |   expect(response.status()).toBe(422);
  32 | });
  33 | 
  34 | test("BUG: POST /auth/signup - mensagem de email duplicado deveria ser E-mail ja cadastrado", async ({ request }) => {
  35 |   const email = "bugmsg" + Date.now() + "@email.com";
  36 |   await request.post(API_URL + "/auth/signup", {
  37 |     data: { email, password: "Senha123!" },
  38 |   });
  39 |   const response = await request.post(API_URL + "/auth/signup", {
  40 |     data: { email, password: "Senha123!" },
  41 |   });
  42 |   const body = await response.json();
> 43 |   expect(body.message).toBe("E-mail ja cadastrado");
     |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  44 | });
  45 | 
  46 | test("POST /auth/signin - deve fazer login com credenciais corretas", async ({ request }) => {
  47 |   const email = "login" + Date.now() + "@email.com";
  48 |   const password = "Senha123!";
  49 |   await request.post(API_URL + "/auth/signup", {
  50 |     data: { email, password },
  51 |   });
  52 |   const response = await request.post(API_URL + "/auth/signin", {
  53 |     data: { email, password },
  54 |   });
  55 |   expect(response.status()).toBe(200);
  56 |   const body = await response.json();
  57 |   expect(body).toHaveProperty("id");
  58 | });
  59 | 
  60 | test("POST /auth/signin - deve retornar 401 com senha incorreta", async ({ request }) => {
  61 |   const response = await request.post(API_URL + "/auth/signin", {
  62 |     data: { email: "naoexiste@email.com", password: "Senha123!" },
  63 |   });
  64 |   expect(response.status()).toBe(401);
  65 |   const body = await response.json();
  66 |   expect(body.message).toBe("Credenciais invalidas");
  67 | });
  68 | 
  69 | test("POST /auth/reset-password - deve retornar 404 para email nao cadastrado", async ({ request }) => {
  70 |   const response = await request.post(API_URL + "/auth/reset-password", {
  71 |     data: { email: "naoexiste@email.com" },
  72 |   });
  73 |   expect(response.status()).toBe(404);
  74 |   const body = await response.json();
  75 |   expect(body.message).toBe("Usuario nao encontrado");
  76 | });
  77 | 
```