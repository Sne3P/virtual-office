document.addEventListener("DOMContentLoaded", function () {
    console.log("Agenda.js chargé !");
    
    var calendarEl = document.getElementById("calendar");

    if (!calendarEl) {
        console.error("Erreur : Élément #calendar introuvable !");
        return;
    }

    var csrfToken = getCookie("csrftoken");

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: "/agenda/events/",
        editable: true,
        selectable: true,

        select: function(info) {
            let title = prompt("Nom de l'événement :");
            if (title) {
                fetch("/agenda/add_event/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify({
                        title: title,
                        start: info.startStr,
                        end: info.endStr
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Événement ajouté :", data);
                        calendar.refetchEvents();
                    } else {
                        console.error("Erreur lors de l'ajout :", data.error);
                    }
                })
                .catch(error => console.error("Erreur de requête :", error));
            }
        }
    });

    calendar.render();
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
document.addEventListener("DOMContentLoaded", function () {
    console.log("Agenda.js chargé !");

    var calendarEl = document.getElementById("calendar");

    if (!calendarEl) {
        console.error("Erreur : Élément #calendar introuvable !");
        return;
    }

    var csrfToken = getCookie("csrftoken");

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: "/agenda/events/",
        editable: true,
        selectable: true,

        select: function(info) {
            let title = prompt("Nom de l'événement :");
            if (title) {
                fetch("/agenda/add_event/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify({
                        title: title,
                        start: info.startStr,
                        end: info.endStr
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Événement ajouté :", data);
                        calendar.refetchEvents();
                    } else {
                        console.error("Erreur lors de l'ajout :", data.error);
                    }
                })
                .catch(error => console.error("Erreur de requête :", error));
            }
        },

        
        eventClick: function(info) {
            if (confirm(`Supprimer l'événement "${info.event.title}" ?`)) {
                fetch(`/agenda/delete_event/${info.event.id}/`, {
                    method: "DELETE",
                    headers: { "X-CSRFToken": csrfToken },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Événement supprimé !");
                        info.event.remove(); 
                    } else {
                        console.error("Erreur suppression :", data.error);
                    }
                })
                .catch(error => console.error("Erreur requête :", error));
            }
        }
    });

    calendar.render();
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
