import { initHeader, getNode, getNodes } from '/src/lib';
import pb from '/src/lib/api/pocketbase';
import '/src/styles/style.scss';

const userIdInput = getNode('#userId');
const userPwInput = getNode('#userPw');
const userPwConfirmInput = getNode('#userPwConfirm');
const userNameInput = getNode('#userName');
const userEmailInput = getNode('#userEmail');
const userTelInput = getNode('#userTel');
const userGenders = getNodes('.register-gender-group');
const userBirthDay = getNodes('.birthday-input');
const userTerms = getNode('#agree-benefit');
const registerBtn = getNode('.register-button');
const requiredInputs = getNodes('.register-input-group[required]');
const requiredCheckboxes = getNodes('.agree-state-checkbox[required]');

// 회원가입 기능

const sendRegisterUserData = async (e) => {
  e.preventDefault();
  const data = {
    username: userIdInput.value,
    password: userPwInput.value,
    passwordConfirm: userPwConfirmInput.value,
    email: userEmailInput.value,
    name: userNameInput.value,
    phone_number: userTelInput.value,
    gender: 0,
  };
  pb.collection('users')
    .create(data)
    .then(() => {
      location.href = '/src/pages/login/';
    })
    .catch(() => {
      alert('아이디 또는 이메일이 중복됩니다.');
    });
};

registerBtn.addEventListener('click', sendRegisterUserData);

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

const handleValidationPwConfirm = () => {
  const isMatch = userPwInput.value === userPwConfirmInput.value;
  userPwConfirmInput.classList.toggle('is--invalid', !isMatch);
};

userPwConfirmInput.addEventListener('input', handleValidationPwConfirm);

// 이름 유효성 검사

const handleValidationNameInput = () => {
  const isValid = userNameInput.value.length > 1;
  userNameInput.classList.toggle('is--invalid', !isValid);
};

userNameInput.addEventListener('input', handleValidationNameInput);

// 가입하기 버튼 활성화

const verifyElements = (elements, checkCondition) => {
  return Array.from(elements).every(checkCondition);
};

const toggleRegisterBtn = () => {
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

// 전체 동의

const changeRegisterAllCheck = (mainCheckboxSelector, checkboxesSelector) => {
  const mainCheckbox = getNode(mainCheckboxSelector);
  const checkboxes = getNodes(checkboxesSelector);

  const handleChangeCheckbox = () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = mainCheckbox.checked;
    });
    toggleRegisterBtn();
  };

  mainCheckbox.addEventListener('change', handleChangeCheckbox);
};

changeRegisterAllCheck('#allAgreeState', '.agree-state-checkbox');
