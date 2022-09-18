const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeSwitchers = document.querySelector('#switch-mode')

function modeSwitch(mode) {
  if (dataPanel.dataset.mode === mode) return
  dataPanel.dataset.mode = mode
}

function renderMovieList(data) {
  if (dataPanel.dataset.mode === 'card-mode'){
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode'){
    let rawHTML = '<ul class="list-group">'

    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item d-flex flex-row justify-content-between align-items-center border-start-0 border-end-0">     
      <div>
      <h6 class="card-title ">${item.title}</h6>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
      </li>
    `
    })
    rawHTML += '</ul>'

    dataPanel.innerHTML = rawHTML

  }
}



// function renderMovieListToListMode(data) {
//   let rawHTML = '<ul class="list-group">'

//   data.forEach((item) => {
//     rawHTML += `
//       <li class="list-group-item d-flex flex-row justify-content-between align-items-center border-start-0 border-end-0">     
//       <div>
//       <h6 class="card-title ">${item.title}</h6>
//       </div>
//       <div class="card-footer">
//         <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
//         <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
//       </div>
//       </li>
//     `
//   })
//   rawHTML += '</ul>'

//   dataPanel.innerHTML = rawHTML
// }






function renderPaginator (amount){
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
paginator.innerHTML = rawHTML

}


function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}




searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() 
  const keyword = searchInput.value.trim().toLowerCase()

  // if(!keyword.length){
  //   return alert('Please enter valid string')
  // }

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  // for (const movie of movies){
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  if (!filteredMovies.length) {
    return alert('cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(currentPage))
})






function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  
  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}"
      class="card-img-top" alt="movie-poster class="img-fluid">
      `
  })
}


function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie)=> movie.id === id)) {
    return alert('此電影已經在收藏中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  console.log(list)
}



modeSwitchers.addEventListener('click', function onSwitchModeClicked(event){
  if (event.target.matches('#card-mode-btn')) {
    modeSwitch('card-mode')
    renderMovieList(getMovieByPage(currentPage))
  } else if (event.target.matches('#list-mode-btn')) {
    modeSwitch('list-mode')
    renderMovieList(getMovieByPage(currentPage))
  }

  


})


dataPanel.addEventListener('click', function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event){
  if(event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(currentPage))
})




axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(currentPage))  
  })
  .catch((error) => {
    console.log(error);
  })
