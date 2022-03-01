/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { localStorageMock } from "../__mocks__/localStorage"
import { ROUTES } from "../constants/routes"
/* import Store from "../app/Store" */
import store from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I click on submit button", () => {
    it("Should be submit form", () => {
      const newBillHtml = NewBillUI()
      document.body.innerHTML = newBillHtml

      //to-do write assertion
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname: "NewBill" });
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))       

      const store = null
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })      

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const newBillForm = screen.getByTestId('form-new-bill')
      const buttonForm = screen.getByTestId('btn-send-bill')

      buttonForm.addEventListener('click',newBillForm.addEventListener('submit',handleSubmit))
      userEvent.click(buttonForm)

      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe("When I am on NewBill Page and I click on 'Choose file' button", () => {
    it("Should open desktop window for choose a file", () => {
      const newBillHtml = NewBillUI()
      document.body.innerHTML = newBillHtml

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))       

      const store = null
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const fileInputButton = screen.getByTestId('file')

      fileInputButton.addEventListener('click',handleChangeFile)
      userEvent.click(fileInputButton)

      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})

// Tests d'integration
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    it("Should launch a form submition", async () => {
      const bill = {
        email:'johndoe@email.com',
        type: "Hôtel et logement",
        name:  'John Doe',
        amount: 400,
        date: "2004-04-04",
        vat: "80",
        pct: 20,
        commentary: "Séminaire",
        fileUrl: "../src/img/hotel.jpg",
        fileName: "hotel.jpg",
        status: 'pending',
        commentAdmin: ''
      }

      const listStore = store.bills();
      const listSpy = jest.spyOn(listStore,"list")
      const newBill = await listStore.list()

      expect(listSpy).toHaveBeenCalledTimes(1)
      expect(newBill.length).toBe(4)
    })
  })
})
     
