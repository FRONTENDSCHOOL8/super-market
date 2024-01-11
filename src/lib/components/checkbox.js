export const changeAllCheck = (mainCheckboxSelector, checkboxesSelector) => {
  const mainCheckbox = document.querySelector(mainCheckboxSelector);
  const checkboxes = document.querySelectorAll(checkboxesSelector);

  const handleChangeCheckbox = () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = mainCheckbox.checked;
    });
  };

  mainCheckbox.addEventListener('change', handleChangeCheckbox);
};
