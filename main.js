import './src/styles/style.scss';
import { fixHeader } from '/src/lib';

fixHeader();

const bannerSwiper = new Swiper('.banner__cover.swiper-container', {
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
