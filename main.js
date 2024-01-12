import pb from '/src/lib/api/pocketbase';
import './src/styles/style.scss';
import {
  initHeader,
  getNode,
  addClass,
  removeClass,
  isString,
  insertLast,
  insertAfter,
  insertBefore,
  openCartModal,
  hideElementNoExist,
  updateRecentlyViewedProducts,
  createCardTemplate,
} from '/src/lib';

const popupCloseButton = getNode('.popup .close');
const popupNotToday = getNode('.popup .watch-today');
const recommendProductList = getNode('.recommend-products');
const discountProductList = getNode('.discount-products');

const createSwiper = (target, optionList) => {
  if (isString(target)) getNode(target);
  return new Swiper(target, {
    direction: optionList.direction || 'horizontal',
    speed: optionList.speed || 500,
    loop: optionList.loop || false,
    autoplay: optionList.autoplay || false,
    slidesPerView: optionList.slidesPerView || 1,
    spaceBetween: optionList.spaceBetween || 0,
    slidesPerGroup: optionList.slidesPerGroup || 1,
    navigation: optionList.navigation || {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
};
const bannerSwiper = createSwiper('.banner__cover.swiper-container', {
  loop: true,
  autoplay: {
    delay: 3000,
  },
});

const productSwiper = createSwiper('.product-list.swiper-container', {
  slidesPerView: 4,
  spaceBetween: '18px',
  slidesPerGroup: 4,
});

const recentBarSwiper = createSwiper('.recently__cover.swiper-container', {
  direction: 'vertical',
  slidesPerView: 'auto',
  spaceBetween: '4px',
});

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const setStoragePopup = (today) => {
  localStorage.setItem('popup', JSON.stringify(today));
};

const getStoragePopup = () => {
  return localStorage.getItem('popup');
};

const openPopup = () => {
  addClass('.popup', 'is--active');
};

const closePopup = () => {
  removeClass('.popup', 'is--active');
};

const isHidePopup = () => {
  const today = getToday();
  const storageDay = getStoragePopup();
  if (`"${today}"` === storageDay) closePopup();
  else openPopup();
};

const handleWatchTodayButton = () => {
  const today = getToday();
  setStoragePopup(today);
  isHidePopup();
};

const showProductCard = async (target) => {
  const productData = await pb.collection('products').getFullList({});
  const promises = productData.slice(0, 16).map((product) => {
    const template = createCardTemplate(product);
    return insertLast(target, template);
  });
};

const handleShowProductList = async () => {
  const recommendProduct = getNode(
    '.recommend-products .product-list__wrapper'
  );
  const discountProduct = getNode('.discount-products .product-list__wrapper');

  await showProductCard(recommendProduct);
  await showProductCard(discountProduct);
  recommendProductList.addEventListener('click', openCartModal);
  discountProductList.addEventListener('click', openCartModal);
};

initHeader();
isHidePopup();
hideElementNoExist();

popupCloseButton.addEventListener('click', closePopup);
popupNotToday.addEventListener('click', handleWatchTodayButton);
document.addEventListener('DOMContentLoaded', handleShowProductList());
