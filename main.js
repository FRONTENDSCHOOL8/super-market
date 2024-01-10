import './src/styles/style.scss';
import { initHeader, getNode, addClass, removeClass, isString } from '/src/lib';

initHeader();

const createSwiper = (target, optionList) => {
  if (isString(target)) getNode(target);
  return new Swiper(target, {
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

getNode('.popup .close').addEventListener('click', closePopup);
getNode('.popup .watch-today').addEventListener(
  'click',
  handleWatchTodayButton
);

isHidePopup();
