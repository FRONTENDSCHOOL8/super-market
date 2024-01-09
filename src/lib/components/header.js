import { insertLast, getNode } from '/src/lib';

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

const handleAddressBox = () => {

  
  const template = /* html */`
    <div class="menu_link__address-box">
      <p><strong>배송지를 등록</strong>하고</p>
      <p>구매 가능한 상품을 확인하세요!</p>
      <div class="menu_link__address-box--container">
        <a href="/src/pages/login/">로그인</a>
        <button type="button" class="address-box-search"><span></span>주소 검색</button>
      </div>
    </div>
  `
  if(!isShowAddressBox) {
    isShowAddressBox = !isShowAddressBox;
    insertLast(menuLink, template);
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