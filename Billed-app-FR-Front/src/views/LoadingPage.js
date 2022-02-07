// Import de la barre de navigation gauche sur la page des employés
import VerticalLayout from './VerticalLayout.js'

// Implémentation Page de Chargement
export default () => {

  return (`
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content' id='loading'>
        Loading...
      </div>
    </div>`
  )
}