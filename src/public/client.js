// const res = require("express/lib/response")

// const res = require("express/lib/response")

//const res = require("express/lib/response")
let store = {
    user: { name: "Student" },
    photos: {},
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    
}
let roverClicked 

// add our markup to the page
const root = document.getElementById('root')
const curiosityBtn = document.getElementById("curiosity")

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
    clickableBtn()
    modal()
}


// create content


function clickableBtn() {
    let btn = document.querySelectorAll('.btn')
    btn.forEach(btn => btn.addEventListener('click', (e) => {
        const rover = e.target.textContent
        getRecentPhotos(rover)
        roverClicked = true
    }))
}

function modal() {

    let detailBtn = document.querySelectorAll('.detail-btn')
    let modal = document.querySelector('.modal')
    let closeBtn = document.querySelector('.close-btn')

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none'
    })
    
    detailBtn.forEach(btn => btn.addEventListener('click', e => {
        getRoverInfo(e.target.dataset.key)
        roverClicked = false
    }))
    if (roverClicked || !store.roverDetail?.rover) return
    showModal()

    function showModal() {
        modal.style.display = 'block'
    }
}

const App = (state) => {
    let { rovers, apod } = state

    return `
        <header><link rel="stylesheet" href="./assets/stylesheets/index.css" media="screen" type="text/css" /></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Choose a Mars Rover</h3>
                <div class="container">
                <section class='card'>
                <div class="tab-menu">
                <ul class="list">
                <li>
                    <div class="btn">${rovers[0]}</div>
                    <button class="detail-btn" data-key="${rovers[0]}">More Details</button>
                </li>
                <li>
                <div class="btn">${rovers[1]}</div>
                <button class="detail-btn"  data-key="${rovers[1]}">More Details</button>
                </li>
                <li>
                <div class="btn">${rovers[2]}</div>
                <button class="detail-btn"  data-key="${rovers[2]}">More Details</button>
                </li>
                </ul>
                </div>
                </section>
                <section class='card'>
                ${SelectedRoverPhoto()}
                </section>
                <section><div class="modal">
                <div class="modal-content">
                <span class="close-btn">X</span>
                ${RoverDetail()}
                
                </div>
            </div>
            </div></section>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                <div class="apod">
                <h1>NASA's Image of the day!</h1>
                ${ImageOfTheDay(apod)}</div>
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return
}

const SelectedRoverPhoto = () => {
    
    const photos = store.photos
    const photoArrays = Object.values(photos)
    if (!photoArrays.length > 0) return `<div> Choose rover above in blue button for most recent pictures to load </div>`
    return photoArrays[0].map(photo => {
        return (
            ` <img key="${photo.id}" src="${photo.img_src}" class="rover-img"/>`)
    }).join('')

}

const RoverDetail = () => {
    if (store.roverDetail?.rover) {
        const { landing_date, launch_date, max_date, max_sol, name, status } = store.roverDetail.rover
        return (
            `
            <div class="modal-detail">
            <div>name : ${name}</div>
            <div>status : ${status}</div>
            <div>landing date : ${landing_date}</div>
            <div>launch date : ${launch_date}</div>
            <div>max date : ${max_date}</div>
            <div>max sol : ${max_sol}</div>
            </div>
            `
        )
    }
    return `<div>Rover details error</div>`
}


const getRecentPhotos = (rover_name) => {
    return fetch(`http://localhost:3000/photos/${rover_name}`)
        .then(res => res.json())
        .then(result => 
            updateStore(store, {
                photos: { [rover_name]: [...result.latest_photos]}
            }))
            return 
}

const getRoverInfo = (rover_name) => {
    if (!rover_name) return
    return fetch(`http://localhost:3000/rover/${rover_name}`)
        .then(res => res.json())
        .then(({ photo_manifest }) => {
            const { landing_date, launch_date, max_date, max_sol, name, status } = photo_manifest
            updateStore(store, {
                roverDetail: {
                    rover: {
                        landing_date,
                        launch_date,
                        max_date,
                        max_sol,
                        name,
                        status,
                    }
                }
            })
        })
}