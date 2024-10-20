import { createToast } from "./toast.js";
import serverUrl from "../../server.js";

function getAuthors() {
    fetch(serverUrl + "/api/v1/users/list")
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
            const select = document.getElementById("author_id");
            data.forEach((author) => {
                const option = document.createElement("option");
                option.value = author.id;
                option.text = author.fullname;
                select.appendChild(option);
            });
        })
}

document.addEventListener("DOMContentLoaded", () => {
    getAuthors();

    // create new post
    const form = document.getElementById("create-post");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.target;
        const data = {};
        form.querySelectorAll("input, select").forEach((input) => {
            console.log('input', input);
            data[input.name] = input.value;
        })
        fetch(serverUrl + "/api/v1/posts/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }) 
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
                if (data.error) {
                    createToast(data.error, "danger", "Error");
                    return;
                } else if (data.errors) {
                    Object.entries(data.errors).forEach(([key, value]) => {
                        createToast(value, "danger", key);
                    });
                    return;
                }
                createToast("Post succesfully Created", "success");
            })
            .catch((error) => {
                console.error("Error:", error);
                createToast("Something went wrong please try again later", "danger", "Error");
            });
    });
})