describe("Profile", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Profile Page", () => {
    it("should display profile page", () => {
      cy.visit("/dashboard/profile", { failOnStatusCode: false });
      cy.get("form, input, main", { timeout: 10000 }).should("exist");
    });
  });
});
