import pb from '/src/lib/api/pocketbase';
import {
  getNode,
  insertLast,
  handleProduct,
  updateRecentlyViewedProducts,
  getStorage,
} from '/src/lib';

const body = getNode('body');
const findDataObj = {
  thumbnail: {
    dom: '.product__images__thumbnail',
    find: 'src',
    result: '',
  },
  description: {
    dom: '.product__images__thumbnail',
    find: 'alt',
    result: '',
  },
  title: {
    dom: '.product__title',
    find: 'textContent',
    result: '',
  },
  price: {
    dom: '.product__price',
    find: 'textContent',
    result: '',
  },
  id: {
    dom: '.product',
    find: 'href',
    result: '',
  },
};

const getPriceNumber = (string) => Number(string.replace(/[원,]/g, ''));
const getPriceString = (number) => `${number.toLocaleString()}원`;
const switchPrice = (string, point) => {
  if (!point) return getPriceString(getPriceNumber(string));
  else {
    const addCount = Math.round(getPriceNumber(string) * point);
    return getPriceString(addCount);
  }
};

const fillDataObj = (target) => {
  for (const key in findDataObj) {
    const domTarget = target.querySelector(findDataObj[key].dom);
    const findTarget = domTarget ? domTarget[findDataObj[key].find] : null;
    findDataObj[key].result = findTarget !== null ? findTarget.trim() : '';
    if (key === 'id') {
      console.log('key.id', key.id);
      findDataObj.id.result = target.href.split('#')[1] || '';
    }
  }
  return { findDataObj };
};

const extractCartData = (product) => {
  fillDataObj(product);

  return {
    id: findDataObj.id.result,
    title: findDataObj.title.result,
    price: switchPrice(findDataObj.price.result),
    thumbnail: findDataObj.thumbnail.result,
    description: findDataObj.description.result,
    count: 1,
    sum: switchPrice(findDataObj.price.result),
    point: switchPrice(findDataObj.price.result, 0.01),
  };
};
const generateTemplate = (
  target,
  { id, title, price, thumbnail, description, count, sum, point }
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
    <div class="basket-product">
      <div class="basket-product__wrapper">
        <span class="basket-product__title">${title}</span>
        <div class="basket-product__price">
          <span class="basket-product__price__discount">${price}</span>
          <div class="basket-product__count">
            <button class="basket-product__count__change minus">-</button>
            <span class="basket-product__count__result">${count}</span>
            <button class="basket-product__count__change plus is--active">
              +
            </button>
          </div>
        </div>
        <div class="basket-product__total">
          <span class="basket-product__total__description">합계</span>
          <span class="basket-product__total__price">${sum}</span>
          <p class="basket-product__grade">
            <span class="basket-product__grade__type">적립</span>
            <span class="basket-product__grade__description"
              >구매 시 <b>${point}</b> 적립</span
            >
          </p>
        </div>
        <div class="basket-product__button__wrapper">
          <button class="basket-product__button close">취소</button>
          <button class="basket-product__button add">장바구니 담기</button>
        </div>
      </div>
    </div>
  `;

  return target === 'cartModal' ? cartModalTemplate : headerPopupTemplate;
};

const updatePrice = (element, count) => {
  const target = element.closest('.basket-product__wrapper');
  const regularPrice = target.querySelector(
    '.basket-product__price__discount'
  ).textContent;
  const totalPrice = target.querySelector('.basket-product__total__price');
  const totalPoint = target.querySelector(
    '.basket-product__grade__description b'
  );
  const price = getPriceNumber(regularPrice) * count;
  totalPrice.innerText = getPriceString(price);
  totalPoint.innerText = getPriceString(price * 0.01);
};

export const closeCartModal = () => {
  const cartProduct = getNode('.basket-product');
  body.style.overflow = 'auto';
  body.removeChild(cartProduct);
};
const handleProductCount = (countElement, target) => {
  let count = parseInt(countElement.innerText);
  const updateCount = (operation) => {
    if (operation === 'increment') count += 1;
    else count -= 1;

    if (count <= 0) {
      alert('물건은 1개 이상 담아주세요.');
      return false;
    }

    countElement.innerText = count;
    updatePrice(countElement, count);
    return true;
  };

  return updateCount;
};

export const openCartModal = async (e) => {
  e.preventDefault();
  const cartIcon = e.target.closest('.cart');
  const product = e.target.closest('.product');
  const cartData = extractCartData(product);
  const template = generateTemplate('cartModal', cartData);
  if (cartIcon) insertLast('body', template);
  else if (product) {
    handleProduct(product);
    updateRecentlyViewedProducts();
    return;
  } else return;

  const countElement = getNode('.basket-product__count__result');
  const updateCount = handleProductCount(countElement, product);

  console.log('product', product);
  body.style.overflow = 'hidden';

  getNode('.basket-product__count__change.minus').addEventListener(
    'click',
    () => updateCount('decrement')
  );
  getNode('.basket-product__count__change.plus').addEventListener('click', () =>
    updateCount('increment')
  );

  getNode('.basket-product .close').addEventListener('click', closeCartModal);
  getNode('.basket-product .add').addEventListener('click', () =>
    handleAddCart(e, product, countElement)
  );
};

export const handleAddCart = (e, target, countElement) => {
  const menuLink = getNode('.menu_link');
  const cartData = extractCartData(target);
  cartData.count = parseInt(countElement.innerText);
  // setProductCount();

  closeCartModal();
  const template = generateTemplate('cartPopup', cartData);
  insertLast(menuLink, template);
  setTimeout(() => {
    const cartPopup = getNode('.cart-popup');
    if (cartPopup) cartPopup.remove();
  }, 3000);
};
