export const sliceNumberMaxLength = (inputElement, maxLength = 2) => {
  inputElement.addEventListener('input', function (e) {
    if (e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, -1);
    }
  });
};
