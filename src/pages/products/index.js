import { initHeader, setStorage, getStorage } from '/src/lib';
import '/src/styles/style.scss';

initHeader();

const navExpandButton = document.querySelectorAll('div[class^="nav-"] > button');
const navCheckBox = document.querySelectorAll('div[class^="nav-"] input');
const navCheckCount = {};
const selectedItemList = {};

const resetButton = document.querySelector('.products-navigation__header button');



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
  const group = e.target.closest('div[class^="nav-"]');
  const checkBoxGroup = group.classList[0];
  const checkCount = group.querySelectorAll('input:checked').length;

  const categoryCount = e.target.closest(`.${checkBoxGroup}`).querySelector('.category-count');

  navCheckCount[checkBoxGroup] = checkCount;
  if(navCheckCount[checkBoxGroup] == 0) {
    categoryCount.textContent = '';
  } else {
    categoryCount.textContent = navCheckCount[checkBoxGroup];
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
  setCurrentUrl(selectedItemList)
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

  location.href = `${target.split('?pages=1')[0]}?pages=1&${filters}`;
}

const handleSetCheckItem = (e) => {
  const filters = window.location.search.split('filters=')[1];
  let needCheckNode;
  
  filters.split('|').map(item => {
    selectedItemList[item.split(':')[0]] = item.split(':')[1];
  });
  
  console.log(selectedItemList);

  for(let key in selectedItemList) {
    selectedItemList[key].split(',').forEach(item => {
      needCheckNode = document.querySelector(`input[id=${item}]`)
      needCheckNode.checked = true;
      
    })
    needCheckNode.closest('ul').classList.add('is--open')
    needCheckNode.closest('ul').closest('div[class^="nav-"]').querySelector('button img').style.transform = 'rotate(180deg)';
  }


}

Array.from(navExpandButton).forEach(button => {
  button.addEventListener('click', handleExpandNavigation);
})

Array.from(navCheckBox).forEach(checkbox => {
  checkbox.addEventListener('change', handleCheckboxSelect);
})

resetButton.addEventListener('click', handleReset);
document.addEventListener('DOMContentLoaded', handleSetCheckItem);







