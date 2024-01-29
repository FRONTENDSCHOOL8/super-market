import {
  setSearchAddressEvent,
  getNode,
  getStorage,
  setStorage,
  promiseInsertLast,
  insertLast,
  addClass, removeClass
} from '/src/lib';
import defaultAuthData from '/src/lib/api/defaultAuthData';

const header = document.querySelector('.header');
const headerMenubar = document.querySelector('.menu');
const categoryMenu = document.querySelector('.menu__category--button');

const menuLink = document.querySelector('.menu_link')
const addressButton = document.querySelector('.menu_link__address');
let isShowAddressBox = false;

const handleScrollHeader = e => {

  const currentPosition = window.scrollY;
  const headerPosition = header.getBoundingClientRect().height
  const headerMenubarPosition = headerMenubar.getBoundingClientRect().height;

  if(headerPosition - headerMenubarPosition < currentPosition) {
    addClass(header, 'fixed');
    return;
  }

  removeClass(header, 'fixed');
}





const handleAddressBox = async () => {
  let template;
  const address = JSON.parse(await getStorage('address'));

  if(!address) {
    template = /* html */`
      <div class="menu_link__address-box">
        <p><strong>배송지를 등록</strong>하고</p>
        <p>구매 가능한 상품을 확인하세요!</p>
        <div class="menu_link__address-box--container">
          <a href="/src/pages/login/">로그인</a>
          <button type="button" class="address-box-search">주소 검색</button>
        </div>
      </div>
    `
  } else {
    template = /* html */`
    <div class="menu_link__address-box">
      <p>${address["address"]} ${address["detail-address"]}</p>
      <p class="deliver_type">샛별배송</p>
      <div class="menu_link__address-box--container">
        <button type="button" class="address-box-search research">배송지 변경</button>
      </div>
    </div>
  `
  }

  if(!isShowAddressBox) {
    const closeAddressBox = () => {
      isShowAddressBox = !isShowAddressBox;
      menuLink.removeChild(getNode('.menu_link__address-box'))
    }

    isShowAddressBox = !isShowAddressBox;
    promiseInsertLast(menuLink, template)
    .then(setSearchAddressEvent(getNode('.address-box-search'), closeAddressBox));

  } else {
    isShowAddressBox = !isShowAddressBox;
    menuLink.removeChild(getNode('.menu_link__address-box'));
  }


}

const setDefaultAuth = async () => {
  if(!(await getStorage('auth'))) {
    setStorage('auth', defaultAuthData)
    .then(setLoginStatus())
  } else {
    setLoginStatus();
  }
}

const getLoginTemplate = (isAuth) => {
  /**
   * TODO: 논리식은 긍정적인 어투로 사용하시면 머리가 상쾌해집니다.
   * ex) 안타깝지 아니하다고 아니할 수 없다 -> 안타깝다
  */
  if(isAuth) {
    return /* html */ `
    <li>
      <span class="menu_welcome">😊<em>${user.name}</em>님 환영합니다!</span>
    </li>
    <li>
      <a href="/src/pages/mypage/" class="menu_mypage">
        마이칼리
      </a>
    </li>
    <li>
      <button class="menu_logout">로그아웃</button>
    </li>
    `
  }

  return /* html */ `
      <li>
        <a href="/src/pages/register/" class="menu_join">회원가입</a>
      </li>
      <li>
        <a href="/src/pages/login/" class="menu_login">로그인</a>
      </li>
      <li>
        <a href="/" class="menu_customer">
          고객센터
          <span class="icon_down"></span>
        </a>
      </li>
      `
}

const setLoginStatus = async () => {
  /**
   * TODO: 굉장히 까다로운 비동기 처리를 깔끔하게 처리하셨네요!
   * 하지만 몇가지 아쉬운 점이 있는데..
   * 1. async 가 promise 를 반환하기 때문에 async 함수 안에서 Promise 를 또 사용할 필요는 없습니다.
   * 2. let 을 사용하기 전에 처리를 함수로 바꿔 보세요. 입력값과 출력값만 알고 있으면 그렇게 어렵지 않습니다.
   */
  const { isAuth, user } = await getStorage('auth');
  const userArea = getNode('.sign_menu');
  const template = getLoginTemplate(isAuth, user);

  insertLast(userArea, template);

  if(getNode('.menu_logout')) {
    getNode('.menu_logout').addEventListener('click', handleLogout);
  }
}

const handleLogout = (e) => {
  if(confirm('로그아웃 하시겠습니까?')) {
    setStorage('auth', defaultAuthData);
    location.reload();
  }
}

const handleCategoryMenuDisable = (e) => {
  e.preventDefault();
}


const fixHeader = () => document.addEventListener('scroll', handleScrollHeader);
const showAddressBox = () => addressButton.addEventListener('click', handleAddressBox);
const setCategoryMenuDisable = () => categoryMenu.addEventListener('click', handleCategoryMenuDisable);

export const initHeader = () => {
  fixHeader();
  showAddressBox();
  setDefaultAuth();
  setCategoryMenuDisable();
}
