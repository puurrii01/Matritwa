var menubar = document.querySelector("#hamburger");
menubar.addEventListener("click", () => {
    var menu = document.querySelector(".hide")
    if (menubar.src.endsWith('menu.png')) {
        menubar.src = '../Images/close.png';
        console.log('clicked');
        menu.classList.add('extended-menu');
    } else {
        menubar.src = '../Images/menu.png';
        menu.classList.remove('extended-menu');
    }
})