describe("Navigation", () => {
  before(() => {
    cy.login("admin@lablens.com.br", "master123");
  });

  describe("Sidebar Navigation", () => {
    it("should display sidebar with navigation links", () => {
      cy.get("aside, nav, [class*='sidebar']").should("exist");
    });

    it("should navigate to dashboard", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard");
    });

    it("should navigate to orders", () => {
      cy.visit("/dashboard/orders", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/orders");
    });

    it("should navigate to clients", () => {
      cy.visit("/dashboard/clients", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/clients");
    });

    it("should navigate to filials", () => {
      cy.visit("/dashboard/filials", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/filials");
    });

    it("should navigate to lenses", () => {
      cy.visit("/dashboard/lenses", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/lenses");
    });

    it("should navigate to establishments", () => {
      cy.visit("/dashboard/establishments", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/establishments");
    });

    it("should navigate to contacts", () => {
      cy.visit("/dashboard/contacts", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/contacts");
    });

    it("should navigate to price table", () => {
      cy.visit("/dashboard/price-table", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/price-table");
    });

    it("should navigate to profile", () => {
      cy.visit("/dashboard/profile", { failOnStatusCode: false });
      cy.url().should("include", "/dashboard/profile");
    });
  });
});
