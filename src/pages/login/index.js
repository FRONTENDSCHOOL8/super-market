import {
  initHeader,
  validationInput,
  getNode,
  getNodes,
  clickBtnMoveToSite,
} from '/src/lib';
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
