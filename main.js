import './src/styles/style.scss';

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
