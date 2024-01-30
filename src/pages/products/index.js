import {
  initHeader,
  insertLast,
  getStorage,
  setStorage,
  hideElementNoExist,
  createCardTemplate,
  createSkeletonCardTemplate,
  getNode,
  openCartModal, addClass, removeClass
} from '/src/lib';
import pb from '/src/lib/api/pocketbase';
import '/src/styles/style.scss';

initHeader();
hideElementNoExist();


const navExpandButton = document.querySelectorAll('div[class^="nav-"] > button');
const resetButton = document.querySelector('.products-navigation__header button');
const paginationArea = getNode('.pagination-area');
const selectedItemList = {};
let needPageNumber;

const handleExpandNavigation = (e) => {
  let menu = e.target.closest('button').nextElementSibling;
  const openStatusImage = e.target.closest('button').querySelector('img');

  while(menu.nodeName != 'UL') {
    menu = menu.nextElementSibling;
  }

  if(!menu.classList.contains('is--open')) {
    addClass(menu, 'is--open')
    openStatusImage.style.transform = 'rotate(180deg)';
  } else {
    removeClass(menu, 'is--open');
    openStatusImage.style.transform = '';
  }

}

const handleReset = (e) => {
  location.href = '/src/pages/products/?sort=1&pages=1';

}

const setSortLink = () => {

  const url = window.location.href;

  getNode('#sort-review').href = `${url.split('?sort=')[0]}?sort=1&pages${url.split('&pages')[1]}`
  getNode('#sort-new').href = `${url.split('?sort=')[0]}?sort=2&pages${url.split('&pages')[1]}`
  getNode('#sort-sale').href = `${url.split('?sort=')[0]}?sort=3&pages${url.split('&pages')[1]}`
  getNode('#sort-discount').href = `${url.split('?sort=')[0]}?sort=4&pages${url.split('&pages')[1]}`
  getNode('#sort-row-price').href = `${url.split('?sort=')[0]}?sort=5&pages${url.split('&pages')[1]}`
  getNode('#sort-high-price').href = `${url.split('?sort=')[0]}?sort=6&pages${url.split('&pages')[1]}`
}
setSortLink();

const handleCheckboxCount = (e) => {

  const filter = window.location.search.split('filters=')[1];

  if(filter) {
    filter.split('|').forEach(item => {
      const [group, checkedItem] = item.split(':');
      const categoryCount = document.querySelector(`.nav-${group}`)
      categoryCount.querySelector('.category-count').textContent = checkedItem.split(',').length;
    });
  }
}


const handleCheckboxSelect = (e) => {

  let valueArray = [];
  const selectedItem = e.target.closest('input');
  const group = e.target.closest('div[class^="nav-"]');
  const checkBoxGroup = group.classList[0].split('nav-')[1];

  if(checkBoxGroup === 'price') {
    selectedItemList[checkBoxGroup] = selectedItem.id;
  } else {

    if(selectedItem.checked) {

      if(!selectedItemList[checkBoxGroup] || selectedItemList[checkBoxGroup] == []) {
        valueArray.push(selectedItem.id);
        selectedItemList[checkBoxGroup] = valueArray;
      } else {
        valueArray = typeof selectedItemList[checkBoxGroup] == 'string' ? new Array(1).fill(selectedItemList[checkBoxGroup]) : selectedItemList[checkBoxGroup];
        valueArray.push(selectedItem.id);
        selectedItemList[checkBoxGroup] = valueArray;
      }

    } else {
      selectedItemList[checkBoxGroup] = selectedItemList[checkBoxGroup].split(',').filter(item => item != selectedItem.id);
    }

  }
  location.href = setCurrentUrl(selectedItemList);
}

const setCurrentUrl = (itemList) => {

  const filter = itemList
  let filters = 'filters=';
  let target = window.location.href;

  for(let key in filter) {

    if(filter[key] == '') continue;
    filters += `${key}:${filter[key]}|`;
  }
  filters = filters.slice(0, -1);

  if(filters === 'filters') filters = '';

  return `${target.split('pages=')[0]}pages=1&${filters}`;

}

const handleSetCheckItem = (e) => {
  const filters = window.location.search.split('filters=')[1];
  const checkedItemList = document.querySelector('.checked-item-list')

  let swallowItemList;
  let needCheckNode;
  let deleteUrl;

  if(!filters) return;

  filters.split('|').map(item => {
    selectedItemList[item.split(':')[0]] = item.split(':')[1];
  });

  for(let key in selectedItemList) {
    selectedItemList[key].split(',').forEach(item => {
      swallowItemList = JSON.parse(JSON.stringify(selectedItemList));
      needCheckNode = document.querySelector(`input[id="${item}"]`)

      needCheckNode.checked = true;

      const needCheckNodeText = document.querySelector(`label[for="${item}"]`).innerHTML.split('<span')[0];

      swallowItemList[key] = selectedItemList[key].split(',').filter(deleteTarget => deleteTarget != item);
      deleteUrl = setCurrentUrl(swallowItemList);

      insertLast(checkedItemList, /*html */ `
        <div class="checked-item">
          <span>${needCheckNodeText}</span>
          <a href="${deleteUrl}"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.55566 5.55566L14.4446 14.4446" stroke="#ccc"></path><path d="M14.4443 5.55566L5.55545 14.4446" stroke="#ccc"></path></svg></a>
        </div>
      `)

      checkedItemList.style.display = 'flex';

    })

    changeImgStyle(needCheckNode.closest('ul'));
  }

}

const changeImgStyle = (node) => {
  addClass(node, 'is--open');
  node.closest('div[class^="nav-"]').querySelector('button img').style.transform = 'rotate(180deg)';

}

const handleSetCategoryMenu = async (e) => {
  const categoryNav = document.querySelector('.nav-category > ul')

  if(!(await getStorage('categoryData'))) {
    const categoryData = await pb
      .collection('category')
      .getFullList({
        sort: '-created'
      });
      setStorage('categoryData', categoryData);
  }

  const category = Array.from(await getStorage('categoryData'));

  let template='';

  category.forEach(item => {
    template += /* html */ `
      <li class="category-list">
        <input type="checkbox" name="${item.id}" id="${item.id}" />
        <label for="${item.id}">${item.category_name}<span class="sub-count">6</span></label>
      </li>
    `;
  })

  new Promise ((resolve, reject) => {
    resolve(insertLast(categoryNav, template))
  }).then(
    setCheckBoxEvent()
  )
}

const setCheckBoxEvent = () => {
  const navCheckBox = document.querySelectorAll('div[class^="nav-"] input');

  Array.from(navCheckBox).forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxSelect);
  })
  handleSetCheckItem();
  handleCheckboxCount();
}

Array.from(navExpandButton).forEach(button => {
  button.addEventListener('click', handleExpandNavigation);
})


const displayProductCard = async () => {
  const productArea = document.querySelector('.product-wrapper');
  const skeletonCardTemplate = createSkeletonCardTemplate();
  const totalCount = document.querySelector('.products-total-count');

  for(let i=0; i<15; i++) {
    insertLast(productArea, skeletonCardTemplate);
  }

  const productData = await getProductData();
  const skeletonCard = document.querySelectorAll('.skeleton_card');

  new Promise((resolve, reject) => {
    resolve(productData.items.forEach(product => {
      const template = createCardTemplate(product);
      insertLast(productArea, template);
    }));
  })
  .then(skeletonCard.forEach(node => node.remove()))
  .then(totalCount.textContent = `총 ${productData.totalItems}건`);

  productArea.addEventListener('click', openCartModal);
  setPaginationButton(productData.totalItems);
}

const setPaginationButton = (number) => {

  const currentPage = +(window.location.href.split('pages=')[1].split('')[0]);
  needPageNumber = number % 30 == 0? number / 30 : parseInt(number / 30)+1;

  let template = /* html */ `
    <button type="button" class="page-first"><img src="/images/pagination/firstpage.svg" alt="첫 페이지로 이동하기" /></button>
    <button type="button" class="page-prev"><img src="/images/pagination/prev.svg" alt="이전 페이지로 이동하기" /></button>
  `;

  for(let i=1; i<=needPageNumber; i++) {
    if(i == currentPage) {
      template += /* html */ `<button class="current-page" type="button">${i}</button>`;
    } else {
      template += /* html */ `<button type="button">${i}</button>`;
    }
  }

  template += /* html */ `
    <button type="button" class="page-next"><img src="/images/pagination/next.svg" alt="다음 페이지로 이동하기" /></button>
    <button type="button" class="page-last"><img src="/images/pagination/lastpage.svg" alt="마지막 페이지로 이동하기" /></button>
  `

  insertLast(paginationArea, template);

}

const handlePagination = (e) => {
  /**
   * TODO: 어려운 작업을 하셨네요. 수고하셨습니다.
   * 마지막에 처리를 집중하기 보다는 처리를 분산해서 머리를 비우시길 추천합니다.
   * let 을 사용하지 않고 처리를 해 보세요.
   * 중첩 블록은 코드를 유지보수하기 어렵게 만듭니다. early return 을 좀더 적극적으로 사용해 보시길 권합니다.
   */
  const targetPage = e.target.closest('button').textContent;
  const buttonClass = e.target.closest('button').classList.value;
  // TODO: URL 생성자 함수에 location 객체를 넘기면 쿼리스트링을 조금 더 쉽게 가져올 수 있습니다.
  const currentPage = new URL(location).searchParams.get('pages')

  if(currentPage == targetPage) return;

  if (targetPage) {
    location.href=chunk.join(`pages=${targetPage}`);
    return;
  }

  switch(buttonClass) {
    case 'page-first': {
      if(currentPage == 1) return;
      location.href = chunk.join(`pages=1`);
      break;
    };
    case 'page-prev': {
      if(currentPage == 1) return;
      location.href = chunk.join(`pages=${(+currentPage)-1}`);
      break;
    };
    case 'page-next': {
      if(currentPage == needPageNumber) return;
      location.href = chunk.join(`pages=${(+currentPage)+1}`);
      break;
    };
    case 'page-last': {
      if(currentPage == needPageNumber) return;
      location.href = chunk.join(`pages=${needPageNumber}`);
      break;
    };
  }
}



const getProductData = () => {
  /**
   * TODO: 정말 어려운 작업을 하셨네요!
   * DB 사용법을 모르면 손대기 어려운 코드인데, 그 짧은 시간에 공부해 내셨군요.
   * 축하합니다.
   * 필터 조건을 URL에 저장하고 읽어오는 부분이 훌륭합니다.
   * 이것을 자바스크립트 메모리에 저장하면 유지보수 지옥에 빠지게 됩니다.
   * 사람의 욕심은 무한하기 때문입니다.
   */
  const filter = new URLSearchParams(window.location.search);
  let filters = [];

  const page = filter.get('pages');
  /**
   * TODO: 쿼리스트링 filter는 구분자를 | 로 사용하는 비표준 자료구조를 사용하고 있나요?
   * 특별한 상황이 아니라면 이런 부분은 힘을 조금 빼도 좋습니다.
   * 웹 브라우저에 내장된 함수를 이용해서 유지보수 비용을 줄이시길 권합니다.
   */
  const selectData = findSelectedFilter(filter.get('filters'));
  const {category, price, bonus, type } = selectData;

  if(category) {
    category.split(',').forEach(item => filters.push(`category_id.id ?="${item}"`));
  }
  if(bonus) {
    bonus.split(',').forEach(item => {
      if(item == 'for-sale') filters.push('discount != 0');
      if(item == 'limit') filters.push('limit = 1');
    })
  }
  if(type) {
    type.split(',').forEach(item => {
      if(item == 'karly-only') filters.push('karly_only = 1')
      if(item == 'scarcity') filters.push('karly_only = 2')
    })
  }

  if(filters.length) {
    filters = ('('+filters+')').split(',').join(' || ');
  };




  if(price) {
    if(filter.length) filters += ' && '
    switch(price) {
      case 'level-one': filters += `(price < 7000)`; break;
      case 'level-two': filters += `(price >= 7000 && price < 10965)`; break;
      case 'level-three': filters += `(price >= 10965 && price < 15000)`; break;
      case 'level-four': filters += `(price >= 15000)`; break;
    }
  }
  let sort;

  switch(filter.get('sort')) {
    case '1': {
      sort = '-created';
      getNode('#sort-review').style.color='black';
      break;
    };
    case '2': {
      sort = 'created';
      getNode('#sort-new').style.color='black';
      break;
    };
    case '3': {
      sort = 'id';
      getNode('#sort-sale').style.color='black';
      break;
    };
    case '4': {
      sort = '-discount';
      getNode('#sort-discount').style.color='black';
      break;
    };
    case '5': {
      sort = 'price';
      getNode('#sort-row-price').style.color='black';
      break;
    };
    case '6': {
      sort = '-price';
      getNode('#sort-high-price').style.color='black';
      break;
    };

  };

  return pb
    .collection('products')
    .getList(page, 30, {
      filter: filters,
      sort: sort
    });
}

const findSelectedFilter = (string) => {
  const data = {};

  if(string) {
    string.split('|').forEach(item => {
      const [key, value] = item.split(':');
      data[key] = value;
    })
  }

  return data
}

resetButton.addEventListener('click', handleReset);
paginationArea.addEventListener('click', handlePagination);

document.addEventListener('DOMContentLoaded', handleSetCategoryMenu);
document.addEventListener('DOMContentLoaded', displayProductCard);






