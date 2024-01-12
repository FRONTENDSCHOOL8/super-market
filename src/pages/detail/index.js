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
} from '/src/lib';
import pb from '../../lib/api/pocketbase.js';

initHeader();
hideElementNoExist();

const renderDetailData = async () => {
  const hash = window.location.hash.slice(1);
  const detailData = await pb.collection('products').getOne(hash);
  let {
    delivery_type,
    product_name,
    packaging_type,
    price,
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

  const template = {
    mainImage: /*html*/ `
  <figure>
  <img
    class="main-image"
    src="${getPbImageURL(detailData, 'product_img')}"
    alt="${product_name}"
  />
</figure>
  `,
    mainDescription: /*html*/ `
  <p class="delivery">${delivery_type}</p>
  <h1 class="product-name">${product_name}</h1>
  <h2 class="product-explanation">${product_description}</h2>
  <p class="product-price"><span>${comma(price)}</span>원</p>
  `,
    detailDescription: /*html*/ `
  <dt>배송</dt>
            <dd class="product-detail-delivery">
              <p>${delivery_type}</p>
              <p>
                23시 전 주문시 내일 아침 7시 전 도착 <br />
                (대구 부산 울산 샛별배송 운영시간 별도 확인)
              </p>
            </dd>

            <dt>판매자</dt>
            <dd class="product-detail-seller"><p>칼리</p></dd>

            <dt>포장타입</dt>
            <dd class="product-detail-package">
              <p>${packaging_type}</p>
              <p>택배배송은 에코 포장이 스티로폼으로 대체됩니다.</p>
            </dd>



  `,
    productOtion: /*html*/ `
    <p class="product-option-name">${product_name}</p>
                <div class="product-option-count">
                  <input
                    value="-"
                    class="decrease"
                    type="button"
                    aria-label="수량 빼기"
                  />
                  <input type="number" min="1" value="1" class="count" />
                  <input
                    value="+"
                    class="increase"
                    type="button"
                    aria-label="수량 증가"
                  />
                </div>
                <span class="product-option-price">${comma(price)} 원</span>
            `,
    total: /*html*/ `
    <p>총 상품금액: <span class="product-total-price">${comma(
      price
    )}</span>원</p>
    `,
  };

  insertFirst('.detail-main', template.mainImage);
  insertFirst('.main-description', template.mainDescription);
  insertFirst('.product-detail', template.detailDescription);
  for (let key in etc) {
    insertBefore(
      '.product-option-row',
      `
    <dt>${key}</dt>
              <dd><p>${etc[key]}</p></dd>
    `
    );
  }
  insertFirst('.product-option-wrapper', template.productOtion);
  insertFirst('.product-total-wrapper', template.total);
};
await renderDetailData();

const zzimButton = getNode('.zzim');
const notifyButton = getNode('.notify');
const countDecrease = getNode('.decrease');
const countIncrease = getNode('.increase');
const productCount = getNode('.count');
const optionPrice = getNode('.product-option-price');
const totalPrice = getNode('.product-total-price');
const detailNavMenu = getNodes('.detail-navigation-list li');
const navItem = getNodes('.nav-item');

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

console.log(optionPrice);

const handleDetailNav = () => {
  if (!navItem) return;

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

zzimButton.addEventListener('click', handleLike);
notifyButton.addEventListener('click', handleNotify);
countDecrease.addEventListener('click', handleCount);
countIncrease.addEventListener('click', handleCount);
window.addEventListener('scroll', handleDetailNav);
