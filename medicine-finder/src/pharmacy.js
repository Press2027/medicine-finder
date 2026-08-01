import { initializeMap } from "../services/googleMaps.js";

const pharmacyList=document.querySelector("#pharmacyList");

window.initMap=function(){

if(!navigator.geolocation){

alert("Geolocation is not supported.");

return;

}

navigator.geolocation.getCurrentPosition(loadMap);

}

function loadMap(position){

const {service,userLocation}=initializeMap(position);

service.nearbySearch({

location:userLocation,

radius:5000,

type:["pharmacy"]

},displayResults);

}

function displayResults(results,status){

if(status!==google.maps.places.PlacesServiceStatus.OK){

pharmacyList.innerHTML="<p>No nearby pharmacies found.</p>";

return;

}

results.forEach(createCard);

}

function createCard(place){

const card=document.createElement("div");

card.className="pharmacy-card";

card.innerHTML=`

<h3>${place.name}</h3>

<p>${place.vicinity}</p>

<button>
Directions
</button>

`;

card.querySelector("button").addEventListener("click",()=>{

window.open(

`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name+" "+place.vicinity)}`,

"_blank"

);

});

pharmacyList.appendChild(card);

}