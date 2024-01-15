import { setSearchAddressEvent, getNode, getStorage, setStorage, promiseInsertLast, insertLast } from '/src/lib';
import defaultAuthData from '/src/lib/api/defaultAuthData';

const header = document.querySelector('.header');
const headerMenubar = document.querySelector('.menu');

const menuLink = document.querySelector('.menu_link')
const addressButton = document.querySelector('.menu_link__address');
let isShowAddressBox = false;

const handleScrollHeader = e => {

  const currentPosition = window.scrollY;
  const headerPosition = header.getBoundingClientRect().height
  const headerMenubarPosition = headerMenubar.getBoundingClientRect().height;

  if(headerPosition - headerMenubarPosition < currentPosition) {
    header.classList.add('fixed')
  }
  else {
    header.classList.remove('fixed')
  }
}





const handleAddressBox = async () => {
  let template;
  const address = JSON.parse(await getStorage('address'));

  // 이 부분에서 로그인 기능 구현 이후 로그인했을 경우 주소를 가져오는 로직도 추가해야 한다.
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

const setLoginStatus = async () => {
  const { isAuth, user } = await getStorage('auth');
  const userArea = getNode('.sign_menu');
  let template;

  if(!isAuth) {
    template = /* html */ `
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
  } else {
    template = /* html */ `
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

  new Promise((resolve, reject) => {
    resolve(insertLast(userArea, template));
  }).then(() => {
    if(getNode('.menu_logout')) {
      getNode('.menu_logout').addEventListener('click', handleLogout);
    }
  })
}

const handleLogout = (e) => {
  if(confirm('로그아웃 하시겠습니까?')) {
    setStorage('auth', defaultAuthData);
    location.reload();
  }
}


const fixHeader = () => document.addEventListener('scroll', handleScrollHeader);
const showAddressBox = () => addressButton.addEventListener('click', handleAddressBox);

export const initHeader = () => {
  fixHeader();
  showAddressBox();
  setDefaultAuth();
  
}