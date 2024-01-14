import {
  initHeader,
  getNode,
  getNodes,
  sliceNumberMaxLength,
  validationInput,
} from '/src/lib';
import pb from '/src/lib/api/pocketbase.js';
import '/src/styles/style.scss';

const userIdInput = getNode('#userId');
const idVerifyBtn = getNode('#id-verify-button');
const userPwInput = getNode('#userPw');
const userPwConfirmInput = getNode('#userPwConfirm');
const userNameInput = getNode('#userName');
const userEmailInput = getNode('#userEmail');
const emailVerifyBtn = getNode('#email-verify-button');
const userTelInput = getNode('#userTel');
const userBirthYear = getNode('#birthYear');
const userBirthMonth = getNode('#birthMonth');
const userBirthDay = getNode('#birthDay');
const birthInputs = getNodes('.birthday-input');
const registerBtn = getNode('.register-button');
const requiredInputs = getNodes('.register-input-group[required]');
const requiredCheckboxes = getNodes('.agree-state-checkbox[required]');

initHeader();

// 회원가입 기능

const sendRegisterUserData = async () => {
  if (!checkIdDuplication) {
    alert('아이디 중복 확인을 진행해 주세요.');
    return;
  }
  if (!checkEmailDuplication) {
    alert('이메일 중복 확인을 진행해 주세요.');
    return;
  }
  if (checkIdDuplication && checkEmailDuplication) {
    const userGender = getNode('.register-gender-group:checked');
    const userTerms = getNode('#agree-benefit');

    const userData = {
      username: userIdInput.value,
      password: userPwInput.value,
      passwordConfirm: userPwConfirmInput.value,
      email: userEmailInput.value,
      emailVisibility: true,
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
  }
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
validationInput('#userTel', /^(010|011)[0-9]{7,8}$/);
validationInput('#userName', /^[가-힣]{2,}|[a-zA-Z]{2,}$/);
sliceNumberMaxLength(userTelInput, 11);

// 비밀번호 확인 유효성 검사

const handleValidationPwConfirm = () => {
  const isMatch = userPwInput.value === userPwConfirmInput.value;
  userPwConfirmInput.classList.toggle('is--invalid', !isMatch);
};

userPwConfirmInput.addEventListener('input', handleValidationPwConfirm);

// 생년월일 유효성 검사

sliceNumberMaxLength(userBirthYear, 4);
sliceNumberMaxLength(userBirthMonth);
sliceNumberMaxLength(userBirthDay);

validationInput('#birthYear', /^19\d{2}$|^20\d{2}$|^2100$/);
validationInput('#birthMonth', /^(0[1-9]|1[0-2])$/);
validationInput('#birthDay', /^(0[1-9]|[1-2]\d|3[0-1])$/);

// 아이디 중복 확인

let checkIdDuplication;

const handleCheckIdDuplication = async () => {
  const userData = await pb.collection('users').getList(1, 1, {
    filter: `username = "${userIdInput.value}"`,
  });
  if (userData.totalItems) {
    alert('이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.');
    checkIdDuplication = false;
  } else {
    alert('사용 가능한 아이디입니다.');
    checkIdDuplication = true;
  }
};

idVerifyBtn.addEventListener('click', handleCheckIdDuplication);

const handleCheckDuplicationIdInput = () => {
  checkIdDuplication = false;
};

userIdInput.addEventListener('input', handleCheckDuplicationIdInput);

// 이메일 중복 확인

let checkEmailDuplication;

const handleCheckEmailDuplication = async () => {
  const userData = await pb.collection('users').getList(1, 1, {
    filter: `email = "${userEmailInput.value}"`,
  });
  if (userData.totalItems) {
    alert('이미 사용 중인 이메일입니다. 다른 아이디를 입력해주세요.');
    checkEmailDuplication = false;
  } else {
    alert('사용 가능한 이메일입니다.');
    checkEmailDuplication = true;
  }
};

emailVerifyBtn.addEventListener('click', handleCheckEmailDuplication);

const handleCheckDuplicationEmailInput = () => {
  checkEmailDuplication = false;
};

userEmailInput.addEventListener('input', handleCheckDuplicationEmailInput);

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
    toggleRegisterBtn();
  };

  mainCheckbox.addEventListener('change', handleChangeMainCheckbox);
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', handleChangeSubCheckbox);
  });
};

changeRegisterAllCheck('#allAgreeState', '.sub-checkbox');
