describe("Filials", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Filials Page", () => {
    it("should display filials page", () => {
      cy.visit("/dashboard/filials", { failOnStatusCode: false });
      cy.get("table, .filials-list, [class*='filial'], main", { timeout: 10000 }).should("exist");
    });
  });
});
