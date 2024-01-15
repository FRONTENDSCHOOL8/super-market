import '/src/styles/style.scss';
import {
  getNode,
  getNodes,
  initHeader,
  comma,
  hideElementNoExist,
  getPbImageURL,
  insertFirst,
  insertBefore,
  handleAddCartDetail,
} from '/src/lib';
import pb from '../../lib/api/pocketbase.js';

const zzimButton = getNode('.zzim');
const notifyButton = getNode('.notify');
const countDecrease = getNode('.decrease');
const countIncrease = getNode('.increase');

const productCount = getNode('.count');
const optionPrice = getNode('.product-option-price');
const totalPrice = getNode('.product-total-price');
const detailNavMenu = getNodes('.detail-navigation-list li');
const navItem = getNodes('.nav-item');
const addCart = getNode('.add-cart');
let isClick;

initHeader();
hideElementNoExist();

const fillTagContent = (target, value, element = 'textContent') => {
  getNode(target)[element] = value;
};
const renderDetailData = async () => {
  console.log('renderDetailData start');
  const hash = window.location.hash.slice(1);
  const detailData = await pb.collection('products').getOne(hash);
  let {
    delivery_type,
    product_name,
    packaging_type,
    price,
    discount,
    product_description,
    etc,
  } = detailData;
  switch (packaging_type) {
    case '1':
      packaging_type = '상온';
      break;
    case '2':
      packaging_type = '냉장';
      break;
    case '3':
      packaging_type = '냉동';
      break;
  }
  const realPrice = comma(
    Math.floor((price * (1 - 0.01 * discount)) / 10) * 10
  );
  fillTagContent(
    '.main-image',
    getPbImageURL(detailData, 'product_img'),
    'src'
  );
  fillTagContent('.main-image', product_name, 'alt');
  fillTagContent('.delivery', 'textContent', delivery_type);
  fillTagContent('.product-name', product_name);
  fillTagContent('.product-explanation', product_description);
  fillTagContent('.product__discount-rate', `${discount}%`);
  fillTagContent('.product__price', realPrice);
  fillTagContent('.original-price', `${comma(price)}원`);
  fillTagContent('.product-detail-delivery p:first-child', delivery_type);
  fillTagContent('.product-detail-package p:first-child', packaging_type);
  fillTagContent('.product-option-name', product_name);
  fillTagContent('.product-option-price', `${realPrice}원`);

  fillTagContent('.product-total-price', `${realPrice}`);
  fillTagContent('.product-description.nav-item img', getPbImageURL, 'src');
  fillTagContent('.sr-only h3', `${product_name} 제품설명`);

  for (let key in etc) {
    insertBefore(
      '.product-option-row',
      `
    <dt>${key}</dt>
              <dd><p>${etc[key]}</p></dd>
    `
    );
  }
};

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

const handleCount = async (e) => {
  if (!e) return;
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

const handleDetailNav = () => {
  if (!navItem) return; // Error: navItem이 없는데...?

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let currentItemId = entry.target.id;

        const setLinkById = (element) => {
          element.classList.toggle(
            'is--active',
            element.firstElementChild.getAttribute('href') ===
              `#${currentItemId}`
          );
        };
        detailNavMenu.forEach(setLinkById);
      }
    });
  });

  navItem.forEach((section) => {
    observer.observe(section);
  });
};

window.addEventListener('DOMContentLoaded', async () => {
  await renderDetailData();
});

zzimButton.addEventListener('click', handleLike);
notifyButton.addEventListener('click', handleNotify);
countDecrease.addEventListener('click', handleCount);
countIncrease.addEventListener('click', handleCount);
window.addEventListener('scroll', handleDetailNav);
addCart.addEventListener('click', handleAddCartDetail);
