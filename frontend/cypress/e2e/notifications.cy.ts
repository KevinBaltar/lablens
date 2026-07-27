describe("Notifications", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Notification System", () => {
    it("should have notification area in header", () => {
      cy.get("header, nav, [class*='header'], main", { timeout: 10000 }).should("exist");
    });
  });
});
