/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'
import userEvent from "@testing-library/user-event"
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  // Tests du Fichier BillsUi.js
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
      const billIconClass = document.getElementsByClassName("active-icon");
      expect(billIconClass).toBeTruthy();
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Changement de getAllByText par getByText
    test("It should renders Bills page", () => {
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    });
  })

  describe('When I am on Bills Page and she is loading', () => {
    it('Should be render Loading Page', () => {
      const loadingHtml = BillsUI({ loading: true });
      document.body.innerHTML = loadingHtml;
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    })
  })

  describe('When I am on Bills Page and Server send an error message', () => {
    it('Should be render Error Page', () => {
      const errorHtml = BillsUI({ error: 'any error message' });
      document.body.innerHTML = errorHtml;
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    })
  })

  // Tests sur le Fichier Bills.js
  describe('When I am on Bills Page and I click on new bill button', () => {
    it('Should be render a new bill form', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const mockStore = null
      const bill = new Bills({
        document, onNavigate, mockStore, localStorage: window.localStorage
      });
      const billHtml = BillsUI({ data: bills });
      document.body.innerHTML = billHtml;
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e));
      const btnNewBill = screen.getByTestId('btn-new-bill');
      btnNewBill.addEventListener('click', handleClickNewBill);
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    })
  })

  describe('When I am on Bills Page and I click on blue-eye icon', () => {
    it('Should be render modal picture', () => {
      const onNavigate = (pathname) => {
        document.body.innerHtml = ROUTES({ pathname })
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock});
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const mockStore = null;
      const bill = new Bills({
        document, onNavigate, mockStore, localStorage: window.localStorage
      });
      
      document.body.innerHTML = BillsUI({ data: bills });
      const handleClickIconEye = jest.fn((icon) => bill.handleClickIconEye(icon));
      const iconEye = screen.getAllByTestId('icon-eye');
      Array.prototype.forEach.call(iconEye, (el) => {
        el.addEventListener('click', handleClickIconEye(el))
      });
      const primaryIconEye = iconEye[0];
      userEvent.click(primaryIconEye);
      expect(handleClickIconEye).toHaveBeenCalled();
      const modal = screen.getAllByText('Justificatif');
      expect(modal).toBeTruthy();
      expect(primaryIconEye).toHaveAttribute('data-bill-url');
    })
  })
})
// Tests d'integration
// Utilisation des mocks localStorage et store
describe("Given I am a user connected as Employee", () => {
  describe('When I navigate to Bills Page', () => {
    it('Should get Bills from data', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      
      const data = await mockStore.bills().list();
      const bill = jest.fn( new Bills({
        document, onNavigate, mockStore: data, localStorage: window.localStorage
      }));     
      expect(bill).toBeTruthy();
    })

    it('Should fetches bills from mock API GET', async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentPending  = await screen.getByText("Accepté")
      expect(contentPending).toBeTruthy()
      const contentRefused  = await screen.getAllByText("Refused")
      expect(contentRefused).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })

      it('Should fetch bills from mock file store.js and fail with error message 404', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }})

          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
      })

      it('Should fetch bills from mock file store.js and fail with error message 500', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})

