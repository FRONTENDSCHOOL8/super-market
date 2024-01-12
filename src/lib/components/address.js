

export const setSearchAddressEvent = (target, callback) => {
  target.addEventListener('click', handleSetAddress(callback));
}

const handleSetAddress = (callback) => {

  return () => {
    const width = 502;
    const height = 547;
    const popupX = (screen.width / 2) - (width / 2);
    const popupY = (screen.height / 2) - (height / 2);
    window.open('/src/pages/address/', '_blank', `width=${width},height=${height},left=${popupX},top=${popupY}`);
    
    if(callback) callback();

  }


}

