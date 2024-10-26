
// import { Toast } from 'bootstrap';


export enum MsgLevels {
  SUCCESS = 'success',
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info'
}


export function createToast(msg: string, level: MsgLevels, title: string ='Notification') {
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
    let toastContainer = document.querySelector('.toast-container')
    if (!toastContainer) {
      document.body.insertAdjacentHTML('beforeend', `<div class="toast-container position-fixed bottom-0 end-0 p-3"></div>`)
      toastContainer = document.querySelector('.toast-container') as HTMLDivElement
    }
    toastContainer.insertAdjacentHTML('afterbegin', toast)
    const createdToast = document.querySelector('.toast') as HTMLDivElement;
    new bootstrap.Toast(createdToast).show();
}