// ***********************************************
// Cypress Custom Commands for LabLens
// ***********************************************

// Login command
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get("#email", { timeout: 10000 }).should("be.visible");
  cy.get("#email").type(email);
  cy.get("#password").type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to dashboard
  cy.url({ timeout: 15000 }).should("include", "/dashboard");
  // Wait for page to be stable
  cy.window().then((win) => {
    cy.stub(win, "fetch").callsFake((...args) => {
      return win.fetch(...args);
    });
  });
});

// Logout command
Cypress.Commands.add("logout", () => {
  cy.get("body").then(($body) => {
    if ($body.find('button:contains("Sair")').length) {
      cy.get('button:contains("Sair")').click();
    } else {
      cy.get("button").contains("admin").click({ force: true });
      cy.get("button").contains("Sair").click({ force: true });
    }
  });
  cy.url().should("include", "/login");
});

// Navigate to page
Cypress.Commands.add("navigateTo", (page: string) => {
  cy.visit(`/dashboard/${page}`);
  // Wait for any pending requests to complete
  cy.wait(500);
});

// Type declaration for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      navigateTo(page: string): Chainable<void>;
    }
  }
}

export {};
