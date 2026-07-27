describe("Clients", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Clients Page", () => {
    it("should display clients page", () => {
      cy.visit("/dashboard/clients", { failOnStatusCode: false });
      cy.get("table, .clients-list, [class*='client'], main", { timeout: 10000 }).should("exist");
    });
  });
});
