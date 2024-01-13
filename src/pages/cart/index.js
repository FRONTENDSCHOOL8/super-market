import { initHeader, getStorage, setStorage, comma, getPbImageURL, getNode, getNodes, insertLast  } from '/src/lib';
import pb from '/src/lib/api/pocketbase';

import '/src/styles/style.scss';

initHeader();

const expandArrow = document.querySelectorAll('.arrow');
const wholeSelectCheckBox = document.querySelectorAll('input[id^="check-all-"]');
const selectDeleteButton = document.querySelectorAll('.select-delete')
const skeletonCard = document.querySelector('.skeleton-ui')

const {isAuth, user} = await getStorage('auth');
if(!isAuth) {

  alert('로그인 후 이용해 주세요.')
  location.href = '/src/pages/login/';
}

const setAddHandler = (node, type, handler) => {
  Array.from(node).forEach(nodeItem => nodeItem.addEventListener(type, handler));
}

const setCartItem = async () => {

  const cartItem = await getCartItem(user.cart_id);
  let ambientTemplate = ''
  let fridgeTemplate = ''
  let freezerTemplate = ''

  const insertItem = async (cartItem) => {
    for(let key in cartItem) {
      const product = await getProductItem(key);
      const template = createProductCart(product, cartItem[key]);

  
      if(product.packaging_type == "1") {
        ambientTemplate += template;
      }
      else if (product.packaging_type == "2") {
        fridgeTemplate += template;
      }
      else {
        freezerTemplate += template;
      }
    }
    insertAmbientProductList(ambientTemplate);
    insertFridgeProductList(fridgeTemplate);
    insertFreezerProductList(freezerTemplate);
    
    
  }


  new Promise ((resolve, reject) => {
    resolve(insertItem(cartItem));
  })
  .then(
    Array.from(getNodes('label[for^="check-all-"]'))
      .forEach(node => node.textContent = `전체선택(0/${Object.keys(cartItem).length})`)
  ).then(() => {
    const checkBox = getNodes('.cart-product-list input[type="checkbox"]')
    setAddHandler(checkBox, 'change', handleCheckboxOperate)
  }).then(() => {
    const deleteButton = getNodes('.cart-product__delete')
    const plusButton = getNodes('.plus')
    const minusButton = getNodes('.minus')
    setAddHandler(deleteButton, 'click', handleDeleteItem)
    setAddHandler(plusButton, 'click', handleCalculatePrice)
    setAddHandler(minusButton, 'click', handleCalculatePrice)
  }).then(() => {
    if(Object.keys(cartItem).length == 0) {
      Array.from(wholeSelectCheckBox).forEach(item => item.disabled = true);
    }
    setPurchaseButtonActivate();
    calculateTotalPrice()
  }).then(setTimeout(() => {skeletonCard.remove()}, 4000))

  
  


}



const calculateTotalPrice = () => {
  const discountPriceList = getNodes('.cart-product__price__discount')
  const originPriceList = getNodes('.cart-product__price__regular')

  const discountPrice = sumPrice(discountPriceList)
  const originPrice = sumPrice(originPriceList)
  const salePrice = originPrice - discountPrice;

  getNode('.origin-price').textContent = comma(originPrice) + ' 원';
  getNode('.sale-price').textContent = salePrice == 0 ? 
      comma(salePrice) + ' 원' : '-' + comma(salePrice) + ' 원';
  getNode('.delivery-tax').textContent = (discountPrice >= 43000 || discountPrice == 0) ? 
      '0 원' : ' +3,000 원';
  getNode('.payment__result__price b').textContent = (discountPrice >= 43000 || discountPrice == 0) ? 
      `${comma(discountPrice)}` : `${comma(discountPrice + 3000)}`
  getNode('.payment__grade__description').textContent = `최대 ${comma(~~(discountPrice * 0.001))}원 적립 일반 0.1%`;
  
}

const handleCalculatePrice = (e) => {
  const currentItem = e.target.closest('.cart-product')
  const currentMinusButton = currentItem.querySelector('.minus');
  const displayOrigin = currentItem.querySelector('.cart-product__price__regular')
  const displayDiscount = currentItem.querySelector('.cart-product__price__discount')
  const displayNumber = currentItem.querySelector('.cart-product__count__result')

  let [origin, discount, number] = getItemPrice(displayOrigin, displayDiscount, displayNumber);
  let [originPerItem, discountPerItem] = [origin / number, discount / number];

  if(e.target.classList.contains('plus')) {
    number++;
    displayNumber.textContent = number;
    displayOrigin.textContent = `${comma(origin + originPerItem)}원`
    displayDiscount.textContent = `${comma(discount + discountPerItem)}원`
    currentMinusButton.classList.add('is--active');
  } else {
    if(number == 1) {
      return;
    }
    number--;
    displayNumber.textContent = number;
    displayOrigin.textContent = `${comma(origin - originPerItem)}원`
    displayDiscount.textContent = `${comma(discount - discountPerItem)}원`

    if(number == 1) {
      currentMinusButton.classList.remove('is--active');
    }
  }

  const data = cartDataUpdateObject(getNodes('.cart-product'))

  pb.collection('cart').update(user.cart_id, data)
  .then(calculateTotalPrice());
}

const cartDataUpdateObject = (nodeList) => {
  const updateCartItem = {};

  Array.from(nodeList).forEach(item => {
    const id = Array.from(item.querySelector('.cart-product__count__result').classList)
      .filter(classItem => classItem != 'cart-product__count__result')[0];
    
    updateCartItem[id.split('_')[1]] = item.querySelector('.cart-product__count__result').textContent;

  })

  return {
    product: JSON.stringify(updateCartItem)
  }
}

const getItemPrice = (origin, discount, number) => {
  const originPrice = parseInt(origin.textContent.split(',').join(''));
  const discountPrice = parseInt(discount.textContent.split(',').join(''));
  const currentNumber = parseInt(number.textContent)

  return [
    originPrice,
    discountPrice,
    currentNumber
  ];
}

const sumPrice = (nodeList) => {
  let sum = 0;
  
  Array.from(nodeList).forEach(node => {

    if(node.closest('.cart-product').querySelector('input[type="checkbox"]:checked'))
      sum += parseInt(node.textContent.split(',').join(''))

  })

  return sum;
}

const handleCheckboxOperate = (e) => {
  setSelectedCount();
  setWholeCheckbox();
  calculateTotalPrice();
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
  const currentText = getNode('label[for^="check-all-"]').textContent;
  const count = getNodes('.cart-product-list input[type="checkbox"]:checked').length;
  let countText = `전체선택(${count}${currentText.slice(currentText.indexOf('/'))}`;

  Array.from(getNodes('label[for^="check-all-"]'))
  .forEach(node => node.textContent = countText);

  setPurchaseButtonActivate();
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
  if(template.length) setActive('.fridge');
}
const insertFreezerProductList = (template) => {
  insertLast(temperatureArea(getNode('.freezer')), template);
  if(template.length) setActive('.freezer');
}
const insertAmbientProductList = (template) => {
  insertLast(temperatureArea(getNode('.ambient')), template);
  if(template.length) setActive('.ambient');
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
      <button class="cart-product__count__change minus id_${id} ${number == 1 ? '' : 'is--active'}" >-</button>
      <span class="cart-product__count__result id_${id}">${number}</span>
      <button class="cart-product__count__change plus id_${id} is--active">+</button>
    </div>
    <p class="cart-product__price">
      <span class="cart-product__price__discount">${comma(realPrice*number)}원</span>
      <span class="cart-product__price__regular">${comma(price*number)}원</span>
    </p>
    <img src="/public/images/menu/close.svg" alt="삭제하기" class="cart-product__delete id_${id}" />
  </div>
  `

  return template
}

const getCartItem = async (cart_id) => {
  
    const cartItem = (await pb.collection('cart').getOne(cart_id)).product;
  return cartItem
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
  calculateTotalPrice();
}

const handleDeleteSelectedItem = (e) => {
  const uncheckedItem = getNodes('.cart-product-list input[type="checkbox"]:not(:checked)');
  const checkedItem = getNodes('.cart-product-list input[type="checkbox"]:checked');
  const updateCartItem = {};

  if(!checkedItem.length) {

    alert('선택한 상품이 없습니다.')
    return;
  }

  Array.from(uncheckedItem).forEach(item => {
    updateCartItem[item.id] = getNode(`.cart-product__count__result.id_${item.id}`).textContent;
  })

  const data = {
    product: JSON.stringify(updateCartItem)
  }

  pb.collection('cart').update(user.cart_id, data)
  .then(Array.from(checkedItem).forEach(node => node.closest('.cart-product').remove()))
  .then(afterDeleteOperate())
}

const handleDeleteItem = (e) => {
  const currentItem = e.target.closest('.cart-product');
  const remainItem = Array.from(getNodes('.cart-product')).filter(node => node != currentItem);

  const data = cartDataUpdateObject(remainItem)

  pb.collection('cart').update(user.cart_id, data)
  .then(currentItem.remove())
  .then(afterDeleteOperate())
}

const afterDeleteOperate = () => {
  setSelectedCount();
  setProductCount();
  calculateTotalPrice();
  setWholeCheckBoxUncheck();
}

const setWholeCheckBoxUncheck = () => {
  if(!Array.from(getNodes('.cart-product')).length) {
    Array.from(wholeSelectCheckBox).forEach(item => {
      item.checked = false;
      item.disabled = true;
    });
  }
}

const setProductCount = () => {
  const cartItem = getNodes('.cart-product');
  const currentText = getNode('label[for^="check-all-"]').textContent;

  const countText = `${currentText.slice(0, currentText.indexOf('/'))}/${cartItem.length})`

  Array.from(getNodes('label[for^="check-all-"]'))
    .forEach(node => node.textContent = countText);
}

const setPurchaseButtonActivate = () => {
  const cartItem = getNodes('.cart-product');
  const checkedItem = getNodes('.cart-product-list input[type="checkbox"]:checked');

  if(!cartItem.length || !checkedItem.length) {
    getNode('.order-button').disabled = true;
  } else {
    getNode('.order-button').disabled = false;
  }
}




Array.from(expandArrow).forEach(node => {
  node.addEventListener('click', handleExpandArea);
})

Array.from(wholeSelectCheckBox).forEach(node => {
  node.addEventListener('change', handleWholeCheck);
})

Array.from(selectDeleteButton).forEach(node => {
  node.addEventListener('click', handleDeleteSelectedItem);
})

setCartItem();


