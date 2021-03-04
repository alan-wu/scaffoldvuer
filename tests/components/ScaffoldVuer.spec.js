/// <reference types="cypress" />
import { mount } from '@cypress/vue'
import { ScaffoldVuer } from '../../src/components/ScaffoldVuer.vue'

describe('ScaffoldVuer', () => {
  it('renders the component with a default name', () => {
    mount(ScaffoldVuer)

    // now we can use any Cypress command to interact with the component
    // https://on.cypress.io/api
    cy.get('.scaffold-container').should('exist')
  })

})
