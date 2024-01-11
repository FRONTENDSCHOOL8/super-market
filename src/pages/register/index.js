import { initHeader, changeAllCheck, getNode, getNodes } from '/src/lib';
import '/src/styles/style.scss';

initHeader();
changeAllCheck('#allAgreeState', '.agree-state-checkbox');

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

validationInput('#userId', /^[A-Za-z0-9]{6,16}$/);
validationInput(
  '#userPw',
  /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s]).{6,16}$/
);
validationInput(
  '#userEmail',
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
validationInput('#userTel', /^[0-9]{9,}$/);

// 비밀번호 확인 유효성 검사

const userPwInput = getNode('#userPw');
const userPwConfirmInput = getNode('#userPwConfirm');

const handleValidationPwConfirm = () => {
  const isMatch = userPwInput.value === userPwConfirmInput.value;
  userPwConfirmInput.classList.toggle('is--invalid', !isMatch);
};

userPwConfirmInput.addEventListener('input', handleValidationPwConfirm);

// 이름 유효성 검사

const userNameInput = getNode('#userName');

const handleValidationNameInput = () => {
  const isValid = userNameInput.value.length > 1;
  userNameInput.classList.toggle('is--invalid', !isValid);
};

userNameInput.addEventListener('input', handleValidationNameInput);

// 가입하기 버튼 활성화

const registerBtn = document.querySelector('.register-button');
const requiredInputs = document.querySelectorAll(
  '.register-input-group[required]'
);
const requiredCheckboxes = document.querySelectorAll(
  '.agree-state-checkbox[required]'
);

const verifyElements = (elements, checkCondition) => {
  return Array.from(elements).every(checkCondition);
};

export const toggleRegisterBtn = () => {
  const verifyInputsValid = verifyElements(
    requiredInputs,
    (input) => input.value !== '' && !input.classList.contains('is--invalid')
  );
  const verifyCheckboxesChecked = verifyElements(
    requiredCheckboxes,
    (checkbox) => checkbox.checked
  );

  if (verifyInputsValid && verifyCheckboxesChecked) {
    registerBtn.removeAttribute('disabled');
  } else {
    registerBtn.setAttribute('disabled', '');
  }
};

requiredInputs.forEach((input) =>
  input.addEventListener('input', toggleRegisterBtn)
);
requiredCheckboxes.forEach((checkbox) =>
  checkbox.addEventListener('change', toggleRegisterBtn)
);
