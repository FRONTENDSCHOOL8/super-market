import {
  initHeader,
  validationInput,
  getNode,
  getNodes,
  clickBtnMoveToSite,
  getStorage,
  setStorage,
} from '/src/lib';
import pb from '/src/lib/api/pocketbase';
import '/src/styles/style.scss';

initHeader();

clickBtnMoveToSite('#login-register-button', '/src/pages/register/');

validationInput('#loginUserId', /^[A-Za-z0-9]{6,16}$/);
validationInput(
  '#loginUserPw',
  /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s]).{6,16}$/
);

const loginButton = getNode('#login-submit-button');
const userInputs = getNodes('.login-input-group');
const userId = getNode('#loginUserId');
const userPw = getNode('#loginUserPw');

// 로그인 기능

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const userData = await pb
      .collection('users')
      .authWithPassword(userId.value, userPw.value);

    const { model, token } = await getStorage('pocketbase_auth');

    setStorage('auth', {
      isAuth: !!model,
      user: model,
      token: token,
    });

    alert('로그인 완료! 메인페이지로 이동합니다.');
    window.location.href = '/index.html';
  } catch {
    alert('인증된 사용자가 아닙니다.');
  }
};

loginButton.addEventListener('click', handleLogin);

// 로그인 버튼 활성화 기능

function handleLoginBtn() {
  if (
    userId.value !== '' &&
    !userId.classList.contains('is--invalid') &&
    userPw.value !== '' &&
    !userPw.classList.contains('is--invalid')
  ) {
    loginButton.removeAttribute('disabled');
  } else {
    loginButton.setAttribute('disabled', '');
  }
}

userInputs.forEach((input) => input.addEventListener('input', handleLoginBtn));
