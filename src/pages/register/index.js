import {
  initHeader,
  getNode,
  getNodes,
  sliceNumberMaxLength,
  validationInput,
} from '/src/lib';
import pb from '/src/lib/api/pocketbase';
import '/src/styles/style.scss';

initHeader();

const userIdInput = getNode('#userId');
const userPwInput = getNode('#userPw');
const userPwConfirmInput = getNode('#userPwConfirm');
const userNameInput = getNode('#userName');
const userEmailInput = getNode('#userEmail');
const userTelInput = getNode('#userTel');
const userBirthYear = getNode('#birthYear');
const userBirthMonth = getNode('#birthMonth');
const userBirthDay = getNode('#birthDay');
const birthInputs = getNodes('.birthday-input');
const registerBtn = getNode('.register-button');
const requiredInputs = getNodes('.register-input-group[required]');
const requiredCheckboxes = getNodes('.agree-state-checkbox[required]');

// 회원가입 기능

const sendRegisterUserData = async (e) => {
  e.preventDefault();

  const userGender = getNode('.register-gender-group:checked');
  const userTerms = getNode('#agree-benefit');

  const userData = {
    username: userIdInput.value,
    password: userPwInput.value,
    passwordConfirm: userPwConfirmInput.value,
    email: userEmailInput.value,
    name: userNameInput.value,
    phone_number: userTelInput.value,
    gender: userGender.value,
    birthday: `${userBirthYear.value}-${userBirthMonth.value}-${userBirthDay.value} 00:00:00.123Z`,
    terms: userTerms.checked,
  };

  const cartData = {
    product: '{}',
  };
  let cart;
  pb.collection('cart')
    .create(cartData)
    .then(async () => {
      cart = await pb.collection('cart').getList(1, 1, {
        sort: '-created',
      });
      console.log(cart);
    })
    .then(() => {
      userData['cart_id'] = cart.items[0].id;
    })
    .then(() => {
      pb.collection('users').create(userData);
    })
    .then(() => {
      alert('회원가입을 축하드립니다. 로그인 페이지로 이동합니다.');
      location.href = '/src/pages/login/';
    })
    .catch(() => {
      alert('아이디 또는 이메일이 중복됩니다.');
    });
};

registerBtn.addEventListener('click', sendRegisterUserData);

// 유효성 검사

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
sliceNumberMaxLength(userTelInput, 11);

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

// 생년월일 유효성 검사

sliceNumberMaxLength(userBirthYear, 4);
sliceNumberMaxLength(userBirthMonth);
sliceNumberMaxLength(userBirthDay);

validationInput('#birthYear', /^19\d{2}$|^20\d{2}$|^2100$/);
validationInput('#birthMonth', /^(0[1-9]|1[0-2])$/);
validationInput('#birthDay', /^(0[1-9]|[1-2]\d|3[0-1])$/);

// 가입하기 버튼 활성화

const verifyElements = (elements, checkCondition) => {
  return Array.from(elements).every(checkCondition);
};

const toggleRegisterBtn = () => {
  const verifyRequiredInputsValid = verifyElements(
    requiredInputs,
    (input) => input.value !== '' && !input.classList.contains('is--invalid')
  );
  const verifyBirthInputsValid = verifyElements(
    birthInputs,
    (input) => !input.classList.contains('is--invalid')
  );
  const verifyCheckboxesChecked = verifyElements(
    requiredCheckboxes,
    (checkbox) => checkbox.checked
  );

  if (
    verifyRequiredInputsValid &&
    verifyBirthInputsValid &&
    verifyCheckboxesChecked
  ) {
    registerBtn.removeAttribute('disabled');
  } else {
    registerBtn.setAttribute('disabled', '');
  }
};

birthInputs.forEach((input) =>
  input.addEventListener('input', toggleRegisterBtn)
);

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
