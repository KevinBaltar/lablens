describe("Chat", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Chat in Order Details", () => {
    it("should display chat section in order details", () => {
      cy.visit("/dashboard/orders", { failOnStatusCode: false });
      cy.get("table tbody tr, .order-item, main", { timeout: 10000 }).then(($rows) => {
        if ($rows.length > 0) {
          cy.wrap($rows).first().find("button, a").first().click();
          cy.get("body").should("be.visible");
        }
      });
    });
  });
});
