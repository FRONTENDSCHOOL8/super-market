export const changeAllCheck = (mainCheckboxSelector, checkboxesSelector) => {
  const mainCheckbox = document.querySelector(mainCheckboxSelector);
  const checkboxes = document.querySelectorAll(checkboxesSelector);

  const handleChangeSubCheckbox = () => {
    const isAnyUnchecked = Array.from(checkboxes).some(
      (checkbox) => !checkbox.checked
    );
    mainCheckbox.checked = !isAnyUnchecked;
  };

  const handleChangeMainCheckbox = () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = mainCheckbox.checked;
    });
  };

  mainCheckbox.addEventListener('change', handleChangeMainCheckbox);
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', handleChangeSubCheckbox);
  });
};
