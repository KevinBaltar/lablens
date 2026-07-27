describe("Lenses", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Lenses Page", () => {
    it("should display lenses page", () => {
      cy.visit("/dashboard/lenses", { failOnStatusCode: false });
      cy.get("table, .lenses-list, [class*='lens'], main", { timeout: 10000 }).should("exist");
    });
  });
});
