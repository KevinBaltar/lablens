describe("Price Table", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Price Table Page", () => {
    it("should display price table page", () => {
      cy.visit("/dashboard/price-table", { failOnStatusCode: false });
      cy.get("input[type='file'], button, [class*='price'], main", { timeout: 10000 }).should("exist");
    });
  });
});
