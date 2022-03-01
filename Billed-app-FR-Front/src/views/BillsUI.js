// Import des élements utiles a la page des billets (page des employes)
import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

// Implémentation d'un billet (ligne)
const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
  `)
}

// Implémentation des billets (toutes les lignes)
const rows = (data) => {
  // Tri date Bill (pour test Bills.js)----------------------
  const antiChrono = (a, b) => ((a.date < b.date) ? 1 : -1);
  const billsSorted = data.sort(antiChrono);               
  //---------------------------------------------------------
  return (billsSorted && billsSorted.length) ? billsSorted.map(bill => row(bill)).join("") : ""
}

export default ({ data: billsSorted, loading, error }) => {
  // Implémentation structure modale ouverte lorsque l'on clic sur l'icone oeil bleu
  // Pour l'activation voir dans "./containers/Bills.js"
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  //Si chargement voir LoadingPage.js autrement erreur voir ErrorPage.js
  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  debugger;
  // Affichage du contenu de la page des billets employes
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'>Mes notes de frais</div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(billsSorted)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}