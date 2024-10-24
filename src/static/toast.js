

export function createToast(msg, level, title='Notification') {
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
    </div>`
    const toastContainer = document.querySelector('.toast-container')
    toastContainer.insertAdjacentHTML('afterbegin', toast)
    const createdToast = document.querySelector('.toast');
    new bootstrap.Toast(createdToast).show()
}