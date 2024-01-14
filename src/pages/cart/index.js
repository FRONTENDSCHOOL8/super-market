import { initHeader, getStorage, setStorage, comma, getPbImageURL, getNode, getNodes, insertLast, setSearchAddressEvent  } from '/src/lib';
import pb from '/src/lib/api/pocketbase';

import '/src/styles/style.scss';

initHeader();

const expandArrow = document.querySelectorAll('.arrow');
const wholeSelectCheckBox = document.querySelectorAll('input[id^="check-all-"]');
const selectDeleteButton = document.querySelectorAll('.select-delete')
const skeletonCard = document.querySelector('.skeleton-ui')
const shipArea = document.querySelector('.shipping');
const orderButton = document.querySelector('.order-button');

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
  }).then(setTimeout(() => {skeletonCard.remove()}, 2000))
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
    <input type="checkbox" name="id_${id}" id="id_${id}" />
    <label for="id_${id}"></label>
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
    updateCartItem[item.id.split('_')[1]] = getNode(`.cart-product__count__result.${item.id}`).textContent;
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


// 배송지

const setShipInfo = async () => {
  const address = JSON.parse(await getStorage('address'));
  let template = '';

  Array.from(shipArea.childNodes).forEach(node => node.remove());

  const setShipArea = () => {
    if(address) {
      template = /* html */ `
        <p class="shipping__title">
          <img src="/images/menu/map.svg" alt="" />
          <span>배송지</span>
        </p>
        <span class="shipping__address">
          ${address["address"]} ${address["detail-address"]}
        </span>
        <span class="shipping__address-type">샛별배송</span>
        <button class="shipping__address-change">배송지 변경</button>
      `

      insertLast(shipArea, template);
    } else if(user.address) {
      template = /* html */ `
        <p class="shipping__title">
          <img src="/images/menu/map.svg" alt="" />
          <span>배송지</span>
        </p>
        <span class="shipping__address">
          ${user.address} ${user["detail_address"] ? user["detail_address"] : ''}
        </span>
        <span class="shipping__address-type">샛별배송</span>
        <button class="shipping__address-change">배송지 변경</button>
      `

      insertLast(shipArea, template);
    } else {
      insertLast(shipArea, `<button class="shipping__address-register">배송지 등록</button>`)
    }
  }

  new Promise((resolve, reject) => {
    resolve(setShipArea())
  }).then(() => {
    if(address || user.address) {
      setSearchAddressEvent(getNode('.shipping__address-change'), (popup) => {
        popup.addEventListener('beforeunload', setShipInfo);
      })
    } else {
      setSearchAddressEvent(getNode('.shipping__address-register'), (popup) => {
        popup.addEventListener('beforeunload', setShipInfo);
      })
    }
  })
}

setShipInfo();


// 주문하기
const handleOrderProduct = (e) => {
  const cartList = getCartIdList('.cart-product-list', 'input[type="checkbox"]');
  const selectedProductList = getCartIdList('.cart-product-list', 'input[type="checkbox"]:checked')

  const remainProductList = cartList.filter(
    item => !selectedProductList.includes(item)
  )
  
  const orderList = {};
  const remainList = {};

  selectedProductList.forEach(id => {
    orderList[id] = {
      number: getNode(`span.id_${id}`).textContent, 
      price: getNode(`#id_${id}`).closest('.cart-product')
                              .querySelector('.cart-product__price__discount')
                              .textContent
    };

  })
  remainProductList.forEach(id => {
    remainList[id] = getNode(`span.id_${id}`).textContent;
  })

  const orderData = {
    user_id: user.id,
    address: getNode('.shipping__address').textContent,
    product: JSON.stringify(orderList)
  }
  const remainData = {
    product: JSON.stringify(remainList)
  }

  

  if(!confirm('주문하시겠습니까?')) return;
  else {
    pb.collection('order_list').create(orderData)
    .then(pb.collection('cart').update(user.cart_id, remainData))
    .then(() => {
      displayOrderComplete();
    })
  }
}

// 주문완료 화면 띄우기
const displayOrderComplete = () => {

  const paidPrice = getNode('.payment__result__price b').textContent;
  const paidPriceToNumber = parseInt(paidPrice.split(',').join(''));
  const accumulate = paidPriceToNumber >= 43000 ? 
    comma(Math.round(paidPriceToNumber * 0.001)) : 
    comma(Math.round((paidPriceToNumber - 3000) * 0.001));

  const template = /* html */ `
  <section class="order__wrapper">
    <div class="receipt">
      <div class="receipt__complete">
        <img src="/images/product/order-complete-check.svg" alt="주문 완료" />
        <p>${user.name}님의 주문이 완료되었습니다.</p>
        <p><em>내일 아침</em>에 만나요!</p>
      </div>
      <div class="receipt__info">
        <p>결제금액</p>
        <div class="receipt__info--price">
          <span>${paidPrice} 원</span>
          <span><em>${accumulate} 원 적립*</em> (일반 배송비 제외 금액의 0.1%)</span>
        </div>
        <p><sup>*</sup> 적립금은 배송당일에 적립됩니다.</p>
        <a href="/">홈으로 이동</a>
        <a href="/src/pages/products/">더 둘러보기</a>
      </div>

    </div>

    <div class="collect-info">
      <p class="collect-info__title">포장재 수거 안내</p>
      <p class="collect-info__desc">다음 주문완료시 마켓컬리가 포장재를 회수합니다.</p>
      <div class="box-info">
        <div class="styrofoam">
          <div class="box-img">
            <img src="/images/product/styrofoam-box.png" alt="스티로폼박스" />
            <img src="/images/product/styrofoam-box.png" alt="스티로폼박스" />
          </div>
          <p>스티로폼 박스 (최대 <em>2</em>개)</p>
        </div>
        <div class="icepack">
          <div class="box-img">
            <img src="/images/product/ice-pack.png" alt="아이스팩" />
          </div>
          <p>아이스팩 (최대 <em>5</em>개)</p>
        </div>
      </div>
    </div>

    <div class="cs-info">
      <img src="/images/product/cs-info.png" alt="주문문의" />
      <p>주문/배송 및 기타 문의가 있을 경우, 1:1문의에 남겨주시면 신속히 해결해드리겠습니다.</p>
    </div>
    
  </section>
  `

  insertLast(getNode('.cart-main'), template);
}

const getCartIdList = (node, target) => {
  return Array.from(getNode(node).querySelectorAll(target)).map(item => item.id.split('_')[1]);
}

orderButton.addEventListener('click', handleOrderProduct);


