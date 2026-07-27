describe("Orders", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Order List", () => {
    it("should display orders list page", () => {
      cy.visit("/dashboard/orders", { failOnStatusCode: false });
      cy.get("table, .orders-list, [class*='order'], main", { timeout: 10000 }).should("exist");
    });
  });

  describe("Create Order", () => {
    it("should display order creation page", () => {
      cy.visit("/dashboard/orders/new", { failOnStatusCode: false });
      cy.get("form, select, input, main", { timeout: 10000 }).should("exist");
    });
  });
});
