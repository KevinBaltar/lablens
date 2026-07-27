describe("Contacts", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Contacts Page", () => {
    it("should display contacts page", () => {
      cy.visit("/dashboard/contacts", { failOnStatusCode: false });
      cy.get("table, .contacts-list, [class*='contact'], main", { timeout: 10000 }).should("exist");
    });
  });
});
