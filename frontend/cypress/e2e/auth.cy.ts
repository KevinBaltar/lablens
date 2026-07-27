describe("Authentication", () => {
  describe("Login", () => {
    beforeEach(() => {
      cy.visit("/login", { failOnStatusCode: false });
      cy.get("#email", { timeout: 10000 }).should("be.visible");
    });

    it("should display login form", () => {
      cy.get("#email").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });

    it("should login successfully with valid credentials", () => {
      cy.get("#email").type("admin@lablens.com.br");
      cy.get("#password").type("master123");
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 15000 }).should("include", "/dashboard");
    });

    it("should show error with invalid credentials", () => {
      cy.get("#email").type("wrong@email.com");
      cy.get("#password").type("wrongpassword");
      cy.get('button[type="submit"]').click();
      cy.get(".bg-red-50", { timeout: 10000 }).should("be.visible");
    });

    it("should show error with empty fields", () => {
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/login");
    });

    it("should navigate to forgot password page", () => {
      cy.get("button").contains("Esqueci minha senha").click();
      cy.get("#email").should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });
  });

  describe("Forgot Password", () => {
    beforeEach(() => {
      cy.visit("/login", { failOnStatusCode: false });
      cy.get("#email", { timeout: 10000 }).should("be.visible");
      cy.get("button").contains("Esqueci minha senha").click();
    });

    it("should display forgot password form", () => {
      cy.get("#email").should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });

    it("should send reset email successfully", () => {
      cy.get("#email").type("admin@lablens.com.br");
      cy.get('button[type="submit"]').click();
      cy.contains("Email enviado!", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Logout", () => {
    it("should logout successfully", () => {
      cy.login("admin@lablens.com.br", "master123");
      cy.url().should("include", "/dashboard");
      cy.wait(1000);
      cy.logout();
      cy.url().should("include", "/login");
    });
  });
});
