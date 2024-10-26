import { createToast, MsgLevels } from "../toast.js";
import { serverUrl } from "../../server.js";

function getAuthors() {
    fetch(serverUrl + "/api/v1/users/list")
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
            const authorsSelect = document.getElementById("author_id");
            data.forEach((author: { id: number, fullName: string }) => {
                const option = document.createElement("option");
                option.value = String(author.id);
                option.text = author.fullName;
                authorsSelect?.appendChild(option);
            });
        })
}

document.addEventListener("DOMContentLoaded", () => {
    getAuthors();

    // create new post
    const form = document.getElementById("create-post");
    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data: { [key: string]: string } = {};
        const inputs = form.querySelectorAll("input, select") as NodeListOf<HTMLInputElement>;
        inputs.forEach((input) => {
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
                    createToast(data.error, MsgLevels.DANGER, "Error");
                    return;
                } else if (data.errors) {
                    Object.entries(data.errors).forEach(([key, value]) => {
                        createToast(String(value), MsgLevels.DANGER, key);
                    });
                    return;
                }
                createToast("Post succesfully Created", MsgLevels.SUCCESS);
            })
            .catch((error) => {
                console.error("Error:", error);
                createToast("Something went wrong please try again later", MsgLevels.DANGER, "Error");
            });
    });
})