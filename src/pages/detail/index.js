import '/src/styles/style.scss';
import { getNode } from '/src/lib';

const zzimButton = getNode('.zzim');
const notifyButton = getNode('.notify');

const handleLike = () => {
  let isLiked = !zzimButton.classList.contains('is-active');
  zzimButton.classList.toggle('is-active');
  console.log(`찜: ${isLiked}`);
};

const handleNotify = () => {
  let isNotified = !notifyButton.classList.contains('is-active');
  notifyButton.classList.toggle('is-active');
  console.log(`알림: ${isNotified}`);
};

zzimButton.addEventListener('click', handleLike);
notifyButton.addEventListener('click', handleNotify);
