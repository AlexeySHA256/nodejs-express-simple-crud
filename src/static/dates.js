document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("getCurrentDate").addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const url = new URL(e.target.action);
        url.search = new URLSearchParams(data).toString();
        fetch(url).then(res => res.json()).then((data) => {
            const resultContainer = document.getElementById("result");
            resultContainer.innerText = "Текущая дата: " + data.currDate;
        }).catch((e) => {
            console.error(e);
            alert(e);
        })
    });
})