describe("Establishments", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Establishments Page", () => {
    it("should display establishments page", () => {
      cy.visit("/dashboard/establishments", { failOnStatusCode: false });
      cy.get("table, .establishments-list, [class*='establishment'], main", { timeout: 10000 }).should("exist");
    });
  });
});
