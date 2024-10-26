// import { Toast } from 'bootstrap';
export var MsgLevels;
(function (MsgLevels) {
    MsgLevels["SUCCESS"] = "success";
    MsgLevels["DANGER"] = "danger";
    MsgLevels["WARNING"] = "warning";
    MsgLevels["INFO"] = "info";
})(MsgLevels || (MsgLevels = {}));
export function createToast(msg, level, title = 'Notification') {
    let currDate = new Date();
    let toast = `
    <div class="toast text-bg-${level}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">${title}</strong>
          <small class="text-body-secondary">${currDate.toLocaleString()}</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${msg}
        </div>
    </div>`;
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        document.body.insertAdjacentHTML('beforeend', `<div class="toast-container position-fixed bottom-0 end-0 p-3"></div>`);
        toastContainer = document.querySelector('.toast-container');
    }
    toastContainer.insertAdjacentHTML('afterbegin', toast);
    const createdToast = document.querySelector('.toast');
    new bootstrap.Toast(createdToast).show();
}
//# sourceMappingURL=toast.js.map