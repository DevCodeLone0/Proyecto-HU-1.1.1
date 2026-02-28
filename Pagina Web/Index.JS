function addTeam() {
    var teamName = document.getElementById("teamName").value;
    if (teamName) {
        var teamList = document.getElementById("teamList");
        var listItem = document.createElement("li");
        listItem.textContent = teamName;
        teamList.appendChild(listItem);
        document.getElementById("teamName").value = ""; // Limpiar el campo de texto
    } else {
        alert("Por favor ingrese un nombre de equipo.");
    }
}

function addTeamLogo() {
    var teamLogoInput = document.getElementById("teamLogo");
    var file = teamLogoInput.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var teamList = document.getElementById("teamList");
            var listItem = document.createElement("li");
            var img = document.createElement("img");
            img.src = e.target.result;
            img.alt = "Logo del equipo";
            img.style.width = "100px"; // Ajusta el tamaño del logo
            listItem.appendChild(img);
            teamList.appendChild(listItem);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Por favor seleccione un archivo de imagen.");
    }
}
