window.Asc.plugin.init = function() {
    Api.ShowMessage("Das Plugin wurde erfolgreich gestartet.");
};

window.Asc.plugin.button = function(id) {
    if (id === "onButtonClick") {
        Api.ShowMessage("Die Auswertung wird erstellt...");
        // Hier kommt deine Logik hin
    }
};
