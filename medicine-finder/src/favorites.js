import {
getFavorites,
removeFavorite
} from "./storage.js";

const container =
document.querySelector("#favoritesList");

displayFavorites();

function displayFavorites(){

const favorites =
getFavorites();

if(favorites.length===0){

container.innerHTML=
"<h2>No favorite medicines saved.</h2>";

return;

}

container.innerHTML="";

favorites.forEach(item=>{

const card=document.createElement("div");

card.className="card";

card.innerHTML=`

<h2>${item.brand}</h2>

<p>${item.generic}</p>

<button>Remove</button>

`;

card.querySelector("button")
.addEventListener("click",()=>{

removeFavorite(item.id);

displayFavorites();

});

container.appendChild(card);

});

}