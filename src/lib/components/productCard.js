
import { getPbImageURL, comma } from '/src/lib';

export const createCardTemplate = (product) => {
  const {id, product_name, brand_id, price, 
      discount, product_description, karly_only, limit} = product;
  
  const realPrice = comma(Math.floor(price * (1 - (0.01 * discount))/10)*10);

  let template = /* html */ `
    <a href="/src/pages/detail/index#${id}" class="product swiper-slide">
      <div class="product__images">
        <img
          src="${getPbImageURL(product, 'product_img')}"
          class="product__images__thumbnail"
          alt="${product_name}"
        />
        <img
          src="/images/menu/cart.svg"
          alt="장바구니에 담기"
          class="cart"
        />
      </div>
    `
  
  if(brand_id) {
    template += /* html */ `
      <span class="product__brand">${product_name}</span>
    `
  }

  template += /* html */ `
      <span class="product__title">${product_name}</span>
      <p class="product__discount">
    `
    if(discount) {
      template += /* html */ `
      <span class="product__discount-rate">${discount}%</span>
      `
    }
    
    template += /* html */ `
        <span class="product__price">${realPrice}원</span>
      </p>
      `
    if(discount) {
      template += /* html */ `
        <span class="product__regular-price">${comma(price)}원</span>
      `
    }
    
    template += /* html */ `
      <span class="product__description">${product_description}</span>
      <p class="product__keyword-list">
    `

    if(karly_only == 1) {
      template += /* html */ `
        <span class="product__keyword only">Karly Only</span>
      `
    } else if (karly_only == 2) {
      template += /* html */ `
        <span class="product__keyword only">희소가치 프로젝트</span>
      `
    }

    if(limit) {
      template += /* html */ `
        <span class="product__keyword">한정수량</span>
      `
    }
    template += /* html */ `
        </p>
      </a>
    `

  return template;
}