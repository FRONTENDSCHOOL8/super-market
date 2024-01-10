import { initHeader } from '/src/lib';
import '/src/styles/style.scss';

initHeader();

const navExpandButton = document.querySelectorAll('div[class^="nav-"] > button');
const navCheckBox = document.querySelectorAll('div[class^="nav-"] input[type^="checkbox"]');


const handleExpandNavigation = (e) => {
  let menu = e.target.closest('button').nextElementSibling;

  while(menu.nodeName != 'UL') {
    menu = menu.nextElementSibling;
  }

  if(!menu.classList.contains('is--open')) {
    menu.classList.add('is--open');
    e.target.querySelector('img').style.transform = 'rotate(180deg)';
  } else {
    menu.classList.remove('is--open');
    e.target.querySelector('img').style.transform = '';
  }

}







Array.from(navExpandButton).forEach(button => {
  button.addEventListener('click', handleExpandNavigation);
})

Array.from(navCheckBox).forEach(checkbox => {
  
})