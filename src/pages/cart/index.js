import { initHeader, getStorage, comma, getPbImageURL, getNode, insertLast } from '/src/lib';
import pb from '/src/lib/api/pocketbase';
import '/src/styles/style.scss';

initHeader();






const handleSetCartItem = async () => {

  const {isAuth, user} = await getStorage('auth');
  const cartItem = await getCartItem(user.cart_id);
  const productObject = cartItem.product;

  for(let key in productObject) {
    const product = await getProductItem(key);
    const template = createProductCart(product, productObject[key]);

    if(product.packaging_type == "1") {
      insertAmbientProductList(template);
    }
    else if (product.packaging_type == "2") {
      insertFridgeProductList(template);
    }
    else {
      insertFreezerProductList(template);
    }
  }
}

const temperatureArea = (node) => {
  return node.closest('.cart-product__wrapper__bar');

}

const insertFridgeProductList = (template) => {
  insertLast(temperatureArea(getNode('.fridge')), template);
}
const insertFreezerProductList = (template) => {
  insertLast(temperatureArea(getNode('.freezer')), template);
}
const insertAmbientProductList = (template) => {
  insertLast(temperatureArea(getNode('.ambient')), template);
}

const createProductCart = (product, number) => {
  const {id, product_name, price, discount} = product;
  const realPrice = comma(
    Math.floor((price * (1 - 0.01 * discount)) / 10) * 10
  );

  const template = /* html */ `
  <div class="cart-product">
    <input type="checkbox" name="check-one" id="check-one" />
    <label for="check-one"></label>
    <img src="${getPbImageURL(product, 'product_img')}" class="thumbnail" alt="${product_name}" />
    <p class="cart-product__content">
      <span class="cart-product__content__title">${product_name}</span>
    </p>
    <div class="cart-product__count">
      <button class="cart-product__count__change minus">-</button>
      <span class="cart-product__count__result">${number}</span>
      <button class="cart-product__count__change plus is--active">
        +
      </button>
    </div>
    <p class="cart-product__price">
      <span class="cart-product__price__discount">${realPrice}원</span>
      <span class="cart-product__price__regular">${price}</span>
    </p>
    <img src="/public/images/menu/close.svg" alt="삭제하기" class="cart-product__delete" />
  </div>
  `

  return template

}


const getCartItem = (cart_id) => {

  return pb.collection('cart').getOne(cart_id);
}

const getProductItem = (product_id) => {

  return pb.collection('products').getOne(product_id);
}


document.addEventListener('DOMContentLoaded', handleSetCartItem);

