console.log("CURSOR JS LOADED");
const cursor = document.createElement("img");

cursor.src = window.location.pathname.includes("/pages/")
    ? "../assets/cursor.png"
    : "assets/cursor.png";

cursor.className = "custom-image-cursor";

document.body.appendChild(cursor);


const glow = document.createElement("div");

glow.className = "cursor-glow";

document.body.appendChild(glow);


document.addEventListener("mousemove", function (event) {

    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";

    glow.style.left = event.clientX + "px";
    glow.style.top = event.clientY + "px";

});