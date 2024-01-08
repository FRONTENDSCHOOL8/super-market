const header = document.querySelector('.header');
const headerMenubar = document.querySelector('.menu');

const handleHeaderScroll = e => {

  const currentPosition = window.scrollY;
  const headerPosition = header.getBoundingClientRect().height
  const headerMenubarPosition = headerMenubar.getBoundingClientRect().height;

  if(headerPosition - headerMenubarPosition < currentPosition) {
    header.classList.add('fixed')
  }
  else {
    header.classList.remove('fixed')
  }
}


export const headerFix = () => document.addEventListener('scroll', handleHeaderScroll);
