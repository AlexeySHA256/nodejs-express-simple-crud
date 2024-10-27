import { createToast, MsgLevels } from "../toast.js";
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("activation-form");
    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        fetch(window.location.origin + "/api/v1/users/activate", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(data.entries())),
        })
            .then((response) => response.json())
            .then((data) => {
            console.log("Success:", data?.success, "Data", data);
            if (data.error) {
                createToast(data.error, MsgLevels.DANGER, "Error");
            }
            else if (data.errors) {
                Object.entries(data.errors).forEach(([key, value]) => {
                    createToast(String(value), MsgLevels.DANGER, "Error");
                });
            }
            else {
            }
            createToast("Account activated successfully. Now you'll be redirected to login page", MsgLevels.SUCCESS, "Success");
            setTimeout(() => {
                window.location.href = "/users/signin";
            }, 2000);
        })
            .catch((error) => {
            console.error("Error:", error);
            createToast("Unexpected error, please try again later", MsgLevels.DANGER, "Error");
        });
    });
});
//# sourceMappingURL=activate.js.map