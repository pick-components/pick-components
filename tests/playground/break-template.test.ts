import { expect, test } from "@playwright/test";

for (const [locale, title, increment, reason] of [
  ["en", "Break the template", "Increment", "Expression rejected."],
  ["es", "Rompe la plantilla", "Incrementar", "Expresión rechazada."],
]) {
  test(`should open the ${locale} demo from the landing and show the real binding results`, async ({
    page,
  }) => {
    // Arrange
    await page.goto("/");
    const link = page.getByRole("link", { name: title, exact: true });
    await expect(
      page.getByRole("heading", { name: "Pick Components" }),
    ).toBeVisible();

    // Act
    await link.click();
    const demo = page.frameLocator("code-playground #preview-frame");
    const allowed = demo.locator('[data-result="allowed"]');
    await expect(allowed).toHaveText("6");
    await demo.getByRole("button", { name: increment, exact: true }).click();

    // Assert
    await expect(allowed).toHaveText("7");
    await expect(demo.locator('[data-result="rejected"]')).toHaveText("");
    await expect(demo.getByText(reason, { exact: false })).toBeVisible();
  });
}
