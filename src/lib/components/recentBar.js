import { getNode, insertFirst } from '/src/lib';

export const hideRecentlyProductList = () => {
  const isExist = getNode('.recently__product-list .recently__product');
  const currentBar = getNode('aside.recently');

  if (!isExist) currentBar.style.display = 'none';
  else currentBar.style.display = 'flex';
};

// TODO: imgSrc -> productId & href +productId
export const handleProduct = (e) => {
  e.preventDefault();

  const current = e.target.closest('.product');
  if (!current) return;

  const [url, thumbnail] = [current.href, current.querySelector('img')];
  if (!url) return;

  const existImg = document.querySelectorAll('.recently__product img');
  const existIndex = Array.from(existImg).findIndex(
    (isExist) => isExist.src === thumbnail.src
  );

  if (existIndex !== -1)
    existImg[existIndex].closest('.recently__product').remove();

  const template = /* HTML */ `
    <li class="recently__product swiper-slide">
      <a href=${url}>
        <img
          src="${thumbnail.src}"
          alt="${thumbnail.alt}"
          class="recently__product__image"
        />
      </a>
    </li>
  `;
  const productCover = getNode('.recently__product-list.swiper-wrapper');
  insertFirst(productCover, template);

  hideRecentlyProductList();
  window.location.href = `/src/pages/detail/index.html`;
};
