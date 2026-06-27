# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\signup.spec.ts >> deve cadastrar novo usuario e redirecionar para a home
- Location: e2e\signup.spec.ts:5:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/"
Received: "http://localhost:3000/signup"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:3000/signup"

```

```yaml
- banner:
  - heading "SQA Social Media" [level=1]
  - button "Entrar"
  - button "Criar Conta"
- main:
  - heading "Criar Conta" [level=1]
  - text: Email
  - textbox "seu@email.com": usuario1782275142371@email.com
  - text: Senha
  - textbox "••••••••": Senha123!
  - paragraph: "A senha deve conter: um caractere especial"
  - text: Confirmar Senha
  - textbox "••••••••": Senha123!
  - text: "A senha deve conter:"
  - list:
    - listitem: Mínimo de 8 caracteres
    - listitem: Pelo menos uma letra maiúscula
    - listitem: Pelo menos uma letra minúscula
    - listitem: Pelo menos um número
    - listitem: Pelo menos um caractere especial
  - button "Criar Conta"
  - text: Já tem uma conta?
  - button "Entrar"
- alert
```

# Test source

```ts
  1  | ﻿import { test, expect } from "@playwright/test";
  2  | 
  3  | const API_URL = "http://localhost:8080";
  4  | 
  5  | test("deve cadastrar novo usuario e redirecionar para a home", async ({ page }) => {
  6  |   const uniqueEmail = "usuario" + Date.now() + "@email.com";
  7  |   await page.goto("/signup");
  8  |   await page.getByPlaceholder("seu@email.com").fill(uniqueEmail);
  9  |   await page.getByPlaceholder("••••••••").first().fill("Senha123!");
  10 |   await page.getByPlaceholder("••••••••").nth(1).fill("Senha123!");
  11 |   await page.locator("button[type=submit]").click();
> 12 |   await expect(page).toHaveURL("/");
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  13 | });
  14 | 
  15 | test("BUG: deve exibir E-mail ja cadastrado ao cadastrar email duplicado", async ({ page, request }) => {
  16 |   const duplicateEmail = "duplicado" + Date.now() + "@email.com";
  17 |   await request.post(API_URL + "/auth/signup", {
  18 |     data: { email: duplicateEmail, password: "Senha123!" },
  19 |   });
  20 |   await page.goto("/signup");
  21 |   await page.getByPlaceholder("seu@email.com").fill(duplicateEmail);
  22 |   await page.getByPlaceholder("••••••••").first().fill("Senha123!");
  23 |   await page.getByPlaceholder("••••••••").nth(1).fill("Senha123!");
  24 |   await page.locator("button[type=submit]").click();
  25 |   await expect(page.getByText("E-mail ja cadastrado")).toBeVisible();
  26 | });
  27 | 
```