import { getNode, insertFirst } from '/src/lib';

export const hideElementNoExist = () => {
  updateRecentlyViewedProducts();
  const isExist = getNode('.recently__product-list .recently__product');
  const currentBar = getNode('aside.recently');
  currentBar.style.display = !isExist ? 'none' : 'flex';
};

const saveProductList = (key, data) => {
  try {
    const response = JSON.stringify(data);
    localStorage.setItem(key, response);
  } catch (error) {
    console.error('save storage error:', error);
  }
};

const getProductList = (key) => {
  try {
    const response = localStorage.getItem(key);
    return response ? JSON.parse(response) : null;
  } catch (error) {
    console.error('get storage error:', error);
    return null;
  }
};

const createProductTemplate = (url, thumbnailSrc, thumbnailAlt) => {
  return /* HTML */ `
    <li class="recently__product swiper-slide">
      <a href=${url}>
        <img
          src="${thumbnailSrc}"
          alt="${thumbnailAlt}"
          class="recently__product__image"
        />
      </a>
    </li>
  `;
};

const renderProduct = (target, product) => {
  const existingProduct = target.querySelector(
    `.recently__product__image[src="${product.thumbnailSrc}"]`
  );

  if (existingProduct) {
    target.insertBefore(existingProduct.closest('li'), target.firstChild);
  } else {
    const template = createProductTemplate(
      product.url,
      product.thumbnailSrc,
      product.thumbnailAlt
    );
    insertFirst(target, template);
  }
};

export const updateRecentlyViewedProducts = () => {
  const productList = getNode('.recently__product-list.swiper-wrapper');
  const storedData = getProductList('recentlyViewedProducts') || [];
  storedData.forEach((product) => {
    renderProduct(productList, product);
  });
};

export const handleProduct = (product, address) => {
  const current = product;
  if (!current) return;

  const [url, thumbnail] = [current.href, current.querySelector('img')];
  if (!url) return;
  const existImage = document.querySelectorAll('.recently__product img');
  const existIndex = Array.from(existImage).findIndex(
    (isExist) => isExist.src === thumbnail.src
  );

  if (existIndex !== -1)
    existImage[existIndex].closest('.recently__product').remove();

  const template = createProductTemplate(url, thumbnail.src, thumbnail.alt);
  const productCover = getNode('.recently__product-list.swiper-wrapper');
  insertFirst(productCover, template);

  renderProduct(productCover, {
    url,
    thumbnailSrc: thumbnail.src,
    thumbnailAlt: thumbnail.alt,
  });
  hideElementNoExist();

  const storedData = getProductList('recentlyViewedProducts') || [];
  storedData.push({
    url,
    thumbnailSrc: thumbnail.src,
    thumbnailAlt: thumbnail.alt,
  });
  saveProductList('recentlyViewedProducts', storedData);
  window.location.href = url;
};
