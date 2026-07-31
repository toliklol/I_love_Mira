const burger=document.getElementById("burger");
const menu=document.getElementById("menu");

burger.onclick=function(){

burger.classList.toggle("active");
menu.classList.toggle("active");

}

function showPage(id){

document.querySelectorAll(".page").forEach(page=>{
page.classList.remove("active");
});

document.getElementById("page"+id).classList.add("active");

burger.classList.remove("active");
menu.classList.remove("active");

}