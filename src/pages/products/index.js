import { initHeader } from '/src/lib';
import '/src/styles/style.scss';

initHeader();

const navExpandButton = document.querySelectorAll('div[class^="nav-"] > button');
const navCheckBox = document.querySelectorAll('div[class^="nav-"] input');
const navCheckCount = {};

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

const handleReset = (e) => {
  const currentUrl = window.location.href;
  console.log(currentUrl);

  location.href = currentUrl.split('filters=')[0];

}




Array.from(navExpandButton).forEach(button => {
  button.addEventListener('click', handleExpandNavigation);
})

Array.from(navCheckBox).forEach(checkbox => {
  checkbox.addEventListener('change', handleCheckboxCount);
})

resetButton.addEventListener('click', handleReset);









