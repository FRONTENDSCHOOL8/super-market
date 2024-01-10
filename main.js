import './src/styles/style.scss';
import { fixHeader, getNode, addClass, removeClass } from '/src/lib';

fixHeader();

const bannerSwiper = new Swiper('.banner.swiper-container', {
  loop: true,
  autoplay: {
    delay: 3000,
  },
  speed: 500,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
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
