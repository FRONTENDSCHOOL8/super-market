import { insertLast, getNode, getStorage } from '/src/lib';

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

const handleSetAddress = () => {
  const width = 502;
  const height = 547;
  const popupX = (screen.width / 2) - (width / 2);
  const popupY = (screen.height / 2) - (height / 2);
  window.open('/src/pages/address/', '_blank', `width=${width},height=${height},left=${popupX},top=${popupY}`);
  isShowAddressBox = !isShowAddressBox;
  menuLink.removeChild(getNode('.menu_link__address-box'))
}

const promiseInsertLast = (target, template) => {

  return new Promise((resolve, reject) => {
    resolve(insertLast(target, template))
  });
}

const setSearchAddressEvent = (target) => {
  target.addEventListener('click', handleSetAddress)
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
    isShowAddressBox = !isShowAddressBox;
    promiseInsertLast(menuLink, template)
    .then(setSearchAddressEvent(getNode('.address-box-search')))
  } else {
    isShowAddressBox = !isShowAddressBox;
    menuLink.removeChild(getNode('.menu_link__address-box'));
  }


}





const fixHeader = () => document.addEventListener('scroll', handleScrollHeader);
const showAddressBox = () => addressButton.addEventListener('click', handleAddressBox);

export const initHeader = () => {
  fixHeader();
  showAddressBox();
}