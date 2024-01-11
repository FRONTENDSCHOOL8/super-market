export const clickBtnMoveToSite = (selector, destination) => {
  document.querySelector(selector).addEventListener('click', () => {
    window.location.href = destination;
  });
};
