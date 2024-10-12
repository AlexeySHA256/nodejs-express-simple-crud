document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("getCurrentDate")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        const url = new URL(form.action);
        const urlParams: string[][] = []
        for (const [key, value] of data.entries()) {
            urlParams.push([key, value.toString()]);
        }
        url.search = new URLSearchParams(urlParams).toString();
        fetch(url).then(res => res.json()).then((data) => {
            const resultContainer = document.getElementById("result");
            if (!resultContainer) {
                throw new Error("result element not found, can't insert date");
            }
            resultContainer.innerText = "Текущая дата: " + data.currDate;
        }).catch((e) => {
            console.error(e);
            alert(e);
        })
    });
})