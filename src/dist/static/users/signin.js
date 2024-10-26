import { createToast, MsgLevels } from "../toast.js";
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signin-form");
    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        fetch(window.location.origin + "/api/v1/users/signin", {
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
                createToast(data.error, MsgLevels.DANGER, "Error");
                return;
            }
            else if (data.errors) {
                Object.entries(data.errors).forEach(([key, value]) => {
                    createToast(String(value), MsgLevels.DANGER, "Error");
                });
                return;
            }
            document.cookie = `token=${data.token.text}; path=/; max-age=${data.token.expiry}`;
            window.location.href = "/";
        })
            .catch((error) => {
            console.error("Error:", error);
            createToast("Unexpected error, please try again later", MsgLevels.DANGER, "Error");
        });
    });
});
//# sourceMappingURL=signin.js.map