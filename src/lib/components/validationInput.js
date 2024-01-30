import {toggleClass} from "../dom/index.js";

export const validationInput = (inputSelector, reg) => {
  const RegTestInput = (inputNode, reg) => {
    if (inputNode.value === '') {
      removeClass(inputNode, 'is--invalid');
      return;
    }
    const isValid = reg.test(String(inputNode.value).toLowerCase());
    inputNode.classList.toggle('is--invalid', !isValid);
  };

  const userInput = document.querySelector(inputSelector);
  userInput.addEventListener('input', () => RegTestInput(userInput, reg));
};
