


function showCreateRoom() {
    document.getElementById('option-selection').style.display = 'none';
    document.getElementById('create-room').style.display = 'block';
}

function showJoinRoom() {
    document.getElementById('option-selection').style.display = 'none';
    document.getElementById('join-room').style.display = 'block';
}

function goBack() {
    document.getElementById('create-room').style.display = 'none';
    document.getElementById('join-room').style.display = 'none';
    document.getElementById('option-selection').style.display = 'block';
}
function toggleMenu() {
    var menu = document.getElementById("dropdownMenu");
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

window.onclick = function(event) {
    if (!event.target.matches('.menu')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.style.display === "block") {
                openDropdown.style.display = "none";
            }
        }
    }
}


