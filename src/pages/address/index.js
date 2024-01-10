import { setStorage } from '/src/lib';
import '/src/styles/style.scss';

const element_wrap = document.querySelector('.post_wrapper');
const zip_code = document.querySelector('#selected-zipcode')
const address = document.querySelector('#selected-address');
const detailAddress = document.querySelector('#address-detail');

const saveButton = document.querySelector('.address-save');
const researchButton = document.querySelector('.address-research');

const openSearchAddress = () => {
  new daum.Postcode({
      oncomplete: function(data) {
          let addr = '';
          let extraAddr = '';

          if (data.userSelectedType === 'R') { 
              addr = data.roadAddress;
          } else { 
              addr = data.jibunAddress;
          }

          if(data.userSelectedType === 'R'){
              if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                  extraAddr += data.bname;
              }
              if(data.buildingName !== '' && data.apartment === 'Y'){
                  extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
              }
              if(extraAddr !== ''){
                  extraAddr = ' (' + extraAddr + ')';
              }
              address.value = extraAddr;
          
          } else {
            address.value = '';
          }

          zip_code.value = data.zonecode;
          address.value = `${addr} (${data.buildingName})`;
          detailAddress.focus();

          element_wrap.style.display = 'none';

      },
      onresize : function(size) {
          element_wrap.style.height = size.height+'px';
      },
      width : '100%',
      height : '100%'
  }).embed(element_wrap);

  element_wrap.style.display = 'block';
}


const handleSaveAddress = () => {

  setStorage('address', `{"zip_code":"${zip_code.value}","address":"${address.value}","detail-address":"${detailAddress.value}"}`)
  .then(
    self.close()
  );
}

openSearchAddress();

saveButton.addEventListener('click', handleSaveAddress)
researchButton.addEventListener('click', openSearchAddress);