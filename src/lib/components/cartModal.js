import { getNode, insertLast } from '/src/lib';

const findDataObj = {
  thumbnail: {
    dom: '.product__images__thumbnail',
    findTarget: 'src',
    result: '',
  },
  description: {
    dom: '.product__images__thumbnail',
    findTarget: 'alt',
    result: '',
  },
  title: {
    dom: '.product__title',
    findTarget: 'textContent',
    result: '',
  },
  price: {
    dom: '.product__price',
    findTarget: 'textContent',
    result: '',
  },
};

const getPriceNumber = (string) => Number(string.replace(/[원,]/g, ''));
const getPriceString = (number) => `${number.toLocaleString()}원`;
const switchPrice = (string) => getPriceString(getPriceNumber(string));

const fillDataObj = (target) => {
  for (const key in findDataObj) {
    const domElement = target.querySelector(findDataObj[key].dom);
    if (domElement) {
      const findTargetElement = domElement[findDataObj[key].findTarget];
      findDataObj[key].result =
        findTargetElement !== null ? findTargetElement.trim() : '';
    } else {
      findDataObj[key].result = '';
    }
  }
  return { findDataObj };
};

const extractCartData = (product) => {
  fillDataObj(product);

  return {
    title: findDataObj.title.result,
    price: switchPrice(findDataObj.price.result),
    thumbnail: findDataObj.thumbnail.result,
    description: findDataObj.description.result,
    count: 1,
    sum: switchPrice(findDataObj.price.result),
    point: Math.round(getPriceNumber(findDataObj.price.result) * 0.01),
  };
};

const generateTemplate = (
  target,
  { title, price, thumbnail, description, count, sum, point }
) => {
  const headerPopupTemplate = /* HTML */ `
    <div class="cart-popup is--active">
      <div class="cart-popup__wrapper">
        <div class="cart-popup__triangle"></div>
        <img
          src="${thumbnail}"
          alt="${description}"
          class="cart-popup__thumbnail"
        />
        <p class="cart-popup__description">
          <span class="cart-popup__name">${title}</span>
          <span class="cart-popup__add-cart"
            >장바구니에 상품을 담았습니다.</span
          >
        </p>
      </div>
    </div>
  `;

  const cartModalTemplate = /* HTML */ `
    <div class="cart-product">
      <div class="cart-product__wrapper">
        <span class="cart-product__title">${title}</span>
        <div class="cart-product__price">
          <span class="cart-product__price__discount">${price}</span>
          <div class="cart-product__count">
            <button class="cart-product__count__change minus">-</button>
            <span class="cart-product__count__result">${count}</span>
            <button class="cart-product__count__change plus is--active">
              +
            </button>
          </div>
        </div>
        <div class="cart-product__total">
          <span class="cart-product__total__description">합계</span>
          <span class="cart-product__total__price">${sum}</span>
          <p class="cart-product__grade">
            <span class="cart-product__grade__type">적립</span>
            <span class="cart-product__grade__description"
              >구매 시 ${point}원 적립</span
            >
          </p>
        </div>
        <div class="cart-product__button__wrapper">
          <button class="cart-product__button close">취소</button>
          <button class="cart-product__button add">장바구니 담기</button>
        </div>
      </div>
    </div>
  `;

  return target === 'cartModal' ? cartModalTemplate : headerPopupTemplate;
};

export const closeCartModal = () => {
  const cartProduct = getNode('.cart-product');
  getNode('body').removeChild(cartProduct);
};

const handleProductCount = (countElement, target) => {
  let count = parseInt(countElement.innerText);

  const updateCount = (operation) => {
    if (operation === 'increment') count += 1;
    else if (operation === 'decrement') count -= 1;

    if (count <= 0) {
      alert('물건은 1개 이상 담아주세요.');
      return false;
    }

    countElement.innerText = count;
    return true;
  };

  return updateCount;
};

export const openCartModal = (e) => {
  const currentTarget = e ? e.target.closest('.cart') : null;
  if (currentTarget) e.preventDefault();
  else return;

  const product = e.target.closest('.product');
  const cartData = extractCartData(product);
  const template = generateTemplate('cartModal', cartData);
  insertLast('body', template);

  const countElement = getNode('.cart-product__count__result');
  const updateCount = handleProductCount(countElement, product);

  getNode('.cart-product__count__change.minus').addEventListener('click', () =>
    updateCount('decrement')
  );
  getNode('.cart-product__count__change.plus').addEventListener('click', () =>
    updateCount('increment')
  );

  getNode('.cart-product .close').addEventListener('click', closeCartModal);
  getNode('.cart-product .add').addEventListener('click', () =>
    handleAddCart(e, product, countElement)
  );
};

export const handleAddCart = (e, target, countElement) => {
  const menuLink = getNode('.menu_link');
  console.log('click');
  closeCartModal();
  const cartData = extractCartData(target);
  cartData.count = parseInt(countElement.innerText);

  const template = generateTemplate('cartPopup', cartData);
  insertLast(menuLink, template);

  setTimeout(() => {
    const cartPopup = getNode('.cart-popup');
    if (cartPopup) cartPopup.remove();
  }, 3000);
};
