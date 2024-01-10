import '/src/styles/style.scss';
import { getNode, initHeader } from '/src/lib';

initHeader();

const zzimButton = getNode('.zzim');
const notifyButton = getNode('.notify');
let isClick;

const handleButton = (target) => {
  isClick = !target.classList.contains('is--active');
  target.classList.toggle('is--active');
};

const handleLike = () => {
  handleButton(zzimButton);
  console.log(`찜 : ${isClick}`);
};

const handleNotify = () => {
  handleButton(notifyButton);
  console.log(`알림 : ${isClick}`);
};

zzimButton.addEventListener('click', handleLike);
notifyButton.addEventListener('click', handleNotify);
