import { initHeader, getStorage, comma, getPbImageURL, getNode, getNodes, insertLast } from '/src/lib';
import pb from '/src/lib/api/pocketbase';
import '/src/styles/style.scss';

initHeader();

const expandArrow = document.querySelectorAll('.arrow');
const wholeSelectCheckBox = document.querySelectorAll('input[id^="check-all-"]');


const handleSetCartItem = async () => {

  const {isAuth, user} = await getStorage('auth');
  const cartItem = await getCartItem(user.cart_id);
  const productObject = cartItem.product;

  const insertItem = async (productObject) => {
    for(let key in productObject) {
      const product = await getProductItem(key);
      const template = createProductCart(product, productObject[key]);
  
      if(product.packaging_type == "1") {
        insertAmbientProductList(template);
        setActive('.ambient');
      }
      else if (product.packaging_type == "2") {
        insertFridgeProductList(template);
        setActive('.fridge');
      }
      else {
        insertFreezerProductList(template);
        setActive('.freezer');
      }
    }
    
  }

  new Promise ((resolve, reject) => {
    resolve(insertItem(productObject));
  }).then(
    Array.from(getNodes('label[for^="check-all-"'))
      .forEach(node => node.textContent = `전체선택(0/${Object.keys(productObject).length})`)
  ).then(() => {
    const checkBox = getNodes('.cart-product-list input[type="checkbox"]')
    Array.from(checkBox).forEach(item => item.addEventListener('change', handleCheckboxOperate));
  }).then(() => {
    if(Object.keys(productObject).length == 0) {
      Array.from(wholeSelectCheckBox).forEach(item => item.disabled = true);
    }
  })

}

const handleCheckboxOperate = (e) => {
  setSelectedCount();
  setWholeCheckbox();

}

const setWholeCheckbox = () => {
  const wholeCount = +(getNode('label[for^="check-all-"').textContent.split('/')[1].split(')')[0]);
  const count = getNodes('.cart-product-list input[type="checkbox"]:checked').length;

  if(count === wholeCount) {
    getNode('#check-all-top').checked = true;
    getNode('#check-all-under').checked = true;
  } else {
    getNode('#check-all-top').checked = false;
    getNode('#check-all-under').checked = false;
  }
}

const setSelectedCount = () => {
  const currentText = getNode('label[for^="check-all-"').textContent;
  const count = getNodes('.cart-product-list input[type="checkbox"]:checked').length;
  let countText = `전체선택(${count}${currentText.slice(currentText.indexOf('/'))}`;

  Array.from(getNodes('label[for^="check-all-"'))
  .forEach(node => node.textContent = countText);
}

const setActive = (node) => {
  getNode(`${node}`).closest('.product__list').classList.add('is--active');
  getNode(`${node} > .arrow`).style.transform = 'rotate(90deg)'
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
  const realPrice = Math.floor((price * (1 - 0.01 * discount)) / 10) * 10

  const template = /* html */ `
  <div class="cart-product">
    <input type="checkbox" name="${id}" id="${id}" />
    <label for="${id}"></label>
    <img src="${getPbImageURL(product, 'product_img')}" class="thumbnail" alt="${product_name}" />
    <p class="cart-product__content">
      <span class="cart-product__content__title">${product_name}</span>
    </p>
    <div class="cart-product__count">
      <button class="cart-product__count__change minus ${id}">-</button>
      <span class="cart-product__count__result ${id}">${number}</span>
      <button class="cart-product__count__change plus ${id} is--active">+</button>
    </div>
    <p class="cart-product__price">
      <span class="cart-product__price__discount">${comma(realPrice*number)}원</span>
      <span class="cart-product__price__regular">${comma(price*number)}</span>
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

const handleExpandArea = (e) => {

  const currentArea = e.target.closest('.product__list')

  if(!currentArea.classList.contains('is--active')) {
    currentArea.classList.add('is--active')
    e.target.style.transform = 'rotate(90deg)';
  } else {
    currentArea.classList.remove('is--active');
    e.target.style.transform = 'rotate(-90deg)';
  }
}

const handleWholeCheck = (e) => {
  const checkbox = document.querySelectorAll('input[type="checkbox"]')

  if(e.target.checked) {
    Array.from(checkbox).forEach(item => item.checked = true);
  } else {
    Array.from(checkbox).forEach(item => item.checked = false);
  }
  setSelectedCount();
}


Array.from(expandArrow).forEach(node => {
  node.addEventListener('click', handleExpandArea);
})

Array.from(wholeSelectCheckBox).forEach(node => {
  node.addEventListener('change', handleWholeCheck);
})

handleSetCartItem();

