import {
  initHeader,
  getNode,
  getNodes,
  sliceNumberMaxLength,
  validationInput,
  setStorage,
  getRandomMinMax,
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
const telVerifyBtn = getNode('#tel-verify-button');
const userBirthYear = getNode('#birthYear');
const userBirthMonth = getNode('#birthMonth');
const userBirthDay = getNode('#birthDay');
const birthInputs = getNodes('.birthday-input');
const registerBtn = getNode('.register-button');
const requiredInputs = getNodes('.register-input-group[required]');
const requiredCheckboxes = getNodes('.agree-state-checkbox[required]');
const recommenderCheckbox = getNode('#additional-recommender');
const recommenderInputWrapper = getNode('.recommender-input-wrapper');
const recommenderIdInput = getNode('#recommenderIdInput');
const recommenderIdVerifyBtn = getNode('#recommenderid-verify-button');
const eventCheckbox = getNode('#additional-event');
const eventInputWrapper = getNode('.event-input-wrapper');
const verifyNumberInput = getNode('#verifyNumberInput');
const numberVerifyBtn = getNode('#verifyNumberButton');
const verifyNumberWrapper = getNode('.verify-number-wrapper');

initHeader();

// 회원가입 기능

const sendRegisterUserData = async () => {
  if (!checkIdDuplication) {
    alert('아이디 중복 확인을 진행해 주세요.');
    return;
  } else if (!checkEmailDuplication) {
    alert('이메일 중복 확인을 진행해 주세요.');
    return;
  } else if (!verifyNumberIsOk) {
    alert('휴대폰 인증을 진행해 주세요.');
    return;
  } else if (checkIdDuplication && checkEmailDuplication) {
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
  if (userIdInput.value === '') {
    alert('사용하실 아이디를 입력해 주세요.');
    return;
  } else {
    const userData = await pb.collection('users').getList(1, 1, {
      filter: `username = "${userIdInput.value}"`,
    });
    if (userData.totalItems) {
      alert('이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.');
      checkIdDuplication = false;
    } else {
      alert('사용 가능한 아이디입니다.');
      checkIdDuplication = true;
      idVerifyBtn.disabled = true;
    }
  }
};

idVerifyBtn.addEventListener('click', handleCheckIdDuplication);

const handleCheckDuplicationIdInput = () => {
  checkIdDuplication = false;
  idVerifyBtn.disabled = false;
};

userIdInput.addEventListener('input', handleCheckDuplicationIdInput);

// 이메일 중복 확인

let checkEmailDuplication;

const handleCheckEmailDuplication = async () => {
  if (userEmailInput.value === '') {
    alert('사용하실 이메일을 입력해 주세요.');
    return;
  } else {
    const userData = await pb.collection('users').getList(1, 1, {
      filter: `email = "${userEmailInput.value}"`,
    });
    if (userData.totalItems) {
      alert('이미 사용 중인 이메일입니다. 다른 아이디를 입력해주세요.');
      checkEmailDuplication = false;
    } else {
      alert('사용 가능한 이메일입니다.');
      checkEmailDuplication = true;
      emailVerifyBtn.disabled = true;
    }
  }
};

emailVerifyBtn.addEventListener('click', handleCheckEmailDuplication);

const handleCheckDuplicationEmailInput = () => {
  checkEmailDuplication = false;
  emailVerifyBtn.disabled = false;
};

userEmailInput.addEventListener('input', handleCheckDuplicationEmailInput);

// 휴대폰 인증번호 기능

const handleVerifyTelNumber = () => {
  if (userTelInput.value === '') {
    alert('연락처를 입력해 주세요.');
    return;
  } else if (userTelInput.classList.contains('is--invalid')) {
    alert('올바른 연락처를 입력해 주세요.');
    return;
  } else {
    verifyNumberWrapper.style.display = 'flex';
    let verifyNumber = getRandomMinMax(111111, 999999);
    alert(`인증번호는 ${verifyNumber}입니다.`);
    setStorage('verifyNumber', verifyNumber);
  }
};

telVerifyBtn.addEventListener('click', handleVerifyTelNumber);

let verifyNumberIsOk;
numberVerifyBtn.addEventListener('click', () => {
  const storageVerifyNumber = localStorage.getItem('verifyNumber');
  if (verifyNumberInput.value === '') {
    alert('인증번호를 입력해 주세요.');
    return;
  } else if (verifyNumberInput.value === storageVerifyNumber) {
    alert('인증되었습니다.');
    numberVerifyBtn.disabled = true;
    return (verifyNumberIsOk = true);
  } else {
    alert('인증번호가 일치하지 않습니다. 다시 시도해 주세요.');
  }
});

const handleVerifyNumberInput = () => {
  numberVerifyBtn.disabled = false;
  return (verifyNumberIsOk = false);
};

verifyNumberInput.addEventListener('input', handleVerifyNumberInput);

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

// 추가입력 사항

const handleChangeRecommender = () => {
  if (recommenderCheckbox.checked) {
    eventInputWrapper.style.display = 'none';
    recommenderInputWrapper.style.display = 'flex';
  } else {
    recommenderInputWrapper.style.display = 'none';
  }
};

const handleChangeEvent = () => {
  if (eventCheckbox.checked) {
    recommenderInputWrapper.style.display = 'none';
    eventInputWrapper.style.display = 'flex';
  } else {
    eventInputWrapper.style.display = 'none';
  }
};

recommenderCheckbox.addEventListener('change', handleChangeRecommender);
eventCheckbox.addEventListener('change', handleChangeEvent);

let checkRecommenderIdDuplication;

const handleCheckRecommenderIdDuplication = async () => {
  if (recommenderIdInput.value === '') {
    alert('추천인 아이디를 입력해 주세요.');
    return;
  } else {
    const userData = await pb.collection('users').getList(1, 1, {
      filter: `username = "${recommenderIdInput.value}"`,
    });
    if (userData.totalItems) {
      alert('추천인 아이디가 확인되었습니다.');
      checkRecommenderIdDuplication = true;
      recommenderIdVerifyBtn.disabled = true;
    } else {
      alert('입력하신 추천인 아이디가 존재하지 않습니다.');
      checkRecommenderIdDuplication = false;
    }
  }
};

recommenderIdVerifyBtn.addEventListener(
  'click',
  handleCheckRecommenderIdDuplication
);

const handleCheckRecommenderIdInput = () => {
  recommenderIdVerifyBtn.disabled = false;
};

recommenderIdInput.addEventListener('input', handleCheckRecommenderIdInput);
