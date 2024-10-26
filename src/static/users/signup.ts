import { createToast, MsgLevels } from "../toast.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const data = new FormData(form);
        const addError = (msg: string, title: string = "Error") => createToast(msg, MsgLevels.DANGER, title);
        fetch(window.location.origin + "/api/v1/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(data.entries())),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data?.success, "Data", data);
                if (data.error) {
                    addError(String(data.error))
                } else if (data.errors) {
                    Object.entries(data.errors).forEach(([key, value]) => addError(String(value), key));
                } else {
                    createToast("You've successfully created an account, to login you should activate your account by following the instructions sent to your email", MsgLevels.SUCCESS, "Account created");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                addError("Unexpected error, please try again later");
            });
    });
})