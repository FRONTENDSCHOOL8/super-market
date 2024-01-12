import { initHeader, insertLast, getStorage, setStorage, hideElementNoExist, createCardTemplate, createSkeletonCardTemplate } from '/src/lib';
import pb from '/src/lib/api/pocketbase';
import '/src/styles/style.scss';

initHeader();
hideElementNoExist();

const navExpandButton = document.querySelectorAll('div[class^="nav-"] > button');
const resetButton = document.querySelector('.products-navigation__header button');
const selectedItemList = {};

const handleExpandNavigation = (e) => {
  let menu = e.target.closest('button').nextElementSibling;
  const openStatusImage = e.target.closest('button').querySelector('img');

  while(menu.nodeName != 'UL') {
    menu = menu.nextElementSibling;
  }

  if(!menu.classList.contains('is--open')) {
    menu.classList.add('is--open');
    openStatusImage.style.transform = 'rotate(180deg)';
  } else {
    menu.classList.remove('is--open');
    openStatusImage.style.transform = '';
  }

}

const handleReset = (e) => {
  const currentUrl = window.location.href;

  location.href = currentUrl.split('filters=')[0];

}

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
  
  if(filters === 'filters') filters = 'filters=';

  return `${target.split('?pages=1')[0]}?pages=1&${filters}`;
  
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
  node.classList.add('is--open')
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
}

const getProductData = () => {

  const filter = new URLSearchParams(window.location.search);
  let filters = '';
  
  const page = filter.get('pages');
  const selectData = findSelectedFilter(filter.get('filters'));
  const {category} = selectData;

  if(category) {
    filters += category.split(',').map(item => `category_id.id ?="${item}"`).join(' || ');
  }

  return pb
    .collection('products')
    .getList(page, 30, {
      filter: filters
    });
}

const findSelectedFilter = (string) => {
  const data = {};

  const split = string.split('|').forEach(item => {
    const [key, value] = item.split(':');
    data[key] = value;
  })

  return data
}

resetButton.addEventListener('click', handleReset);

document.addEventListener('DOMContentLoaded', handleSetCategoryMenu);
document.addEventListener('DOMContentLoaded', displayProductCard);





