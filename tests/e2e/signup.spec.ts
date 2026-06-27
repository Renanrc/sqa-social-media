import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:8080";

test("deve cadastrar novo usuario e redirecionar para a home", async ({ page }) => {
  const uniqueEmail = "usuario" + Date.now() + "@email.com";
  await page.goto("/signup");
  await page.getByPlaceholder("seu@email.com").fill(uniqueEmail);
  await page.getByPlaceholder("••••••••").first().fill("Senha123!");
  await page.getByPlaceholder("••••••••").nth(1).fill("Senha123!");
  await page.locator("button[type=submit]").click();
  await expect(page).toHaveURL("/");
});

test("BUG: deve exibir E-mail ja cadastrado ao cadastrar email duplicado", async ({ page, request }) => {
  const duplicateEmail = "duplicado" + Date.now() + "@email.com";
  await request.post(API_URL + "/auth/signup", {
    data: { email: duplicateEmail, password: "Senha123!" },
  });
  await page.goto("/signup");
  await page.getByPlaceholder("seu@email.com").fill(duplicateEmail);
  await page.getByPlaceholder("••••••••").first().fill("Senha123!");
  await page.getByPlaceholder("••••••••").nth(1).fill("Senha123!");
  await page.locator("button[type=submit]").click();
  await expect(page.getByText("E-mail ja cadastrado")).toBeVisible();
});
