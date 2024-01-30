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
    // TODO: 아하.. 여기에서 시간이 모자랐군요.
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
/**
 * TODO: 이 이벤트 핸들러는 버튼의 click 이벤트에 붙이는 것이 아니라 폼의 submit 이벤트에 붙여야 합니다.
 * 폼 관련 설명을 할 필요가 있겠네요.
 */
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
