import '/src/styles/style.scss';
import { getNode, initHeader, comma } from '/src/lib';

initHeader();

const zzimButton = getNode('.zzim');
const notifyButton = getNode('.notify');
const countDecrease = getNode('.decrease');
const countIncrease = getNode('.increase');
const productCount = getNode('.count');
const optionPrice = getNode('.product-option-price');
const totalPrice = getNode('.product-total-price');

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

const handleCount = (e) => {
  let value = e.target.value;
  let count = +productCount.value;
  if (value === '-') {
    count -= 1;
  } else {
    count += 1;
  }
  productCount.value = count;

  if (productCount.value <= 0) {
    alert('최소수량은 1개입니다.');
    productCount.value = 1;
  }

  showTotalPrice();
};

const showTotalPrice = () => {
  let productPrice = +optionPrice.innerText.replace(/\D/g, '');
  return (totalPrice.innerText = comma(productPrice * productCount.value));
};

zzimButton.addEventListener('click', handleLike);
notifyButton.addEventListener('click', handleNotify);
countDecrease.addEventListener('click', handleCount);
countIncrease.addEventListener('click', handleCount);
