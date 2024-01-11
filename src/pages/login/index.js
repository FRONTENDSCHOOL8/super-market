import { initHeader, getNode } from '/src/lib';
import '/src/styles/style.scss';

initHeader();

// 공통 유효성 검사 함수
const validateInput = (inputNode, reg) => {
  const isValid = reg.test(String(inputNode.value).toLowerCase());
  inputNode.classList.toggle('is--invalid', !isValid);
};

// 유효성 검사 할 대상 함수

const validationInput = (inputSelector, reg) => {
  const userInput = getNode(inputSelector);
  userInput.addEventListener('input', () => validateInput(userInput, reg));
};

validationInput('#loginUserId', /^[A-Za-z0-9]{6,16}$/);
validationInput(
  '#loginUserPw',
  /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s]).{6,16}$/
);
