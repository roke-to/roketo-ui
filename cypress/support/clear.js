export function clear(testParams) {
    cy.clearCookies();
    cy.clearLocalStorage();
}
